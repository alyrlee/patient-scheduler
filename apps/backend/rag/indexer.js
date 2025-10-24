import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { OpenAIEmbeddings } from "@langchain/openai";

// ==== choose one store ====
import { Client } from "pg";                 // pgvector
// import { Pinecone } from "@pinecone-database/pinecone"; // pinecone

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- config from .env ---
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PG_CONN = process.env.PG_CONN; // e.g. postgres://user:pass@host/db
// const PINECONE_API_KEY = process.env.PINECONE_API_KEY;

const embeddings = new OpenAIEmbeddings({
  apiKey: OPENAI_API_KEY,
  model: "text-embedding-3-small" // 1536 dims; cheap + good for policies
});

// Load raw docs (you can put text/markdown here)
function loadDocs(dir = path.join(__dirname, "docs")) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".txt") || f.endsWith(".md"));
  return files.map(f => {
    const text = fs.readFileSync(path.join(dir, f), "utf8");
    const dept = /cardio|cardiology/i.test(f) ? "cardiology" : "general";
    const title = f.replace(/\.(md|txt)$/i, "");
    return { id: `${dept}:${title}`, dept, title, text };
  });
}

// naive chunker ~1k chars per chunk (tune later or use recursive splitter)
function chunk(text, size = 1000, overlap = 100) {
  const chunks = [];
  for (let i = 0; i < text.length; i += (size - overlap)) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

// ---- PGVECTOR upsert ----
async function upsertPgvector(docs) {
  const client = new Client({ connectionString: PG_CONN, ssl: { rejectUnauthorized: false } });
  await client.connect();

  // ensure schema exists:
  await client.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
  await client.query(`
    CREATE TABLE IF NOT EXISTS policies (
      id TEXT PRIMARY KEY,
      dept TEXT NOT NULL,
      title TEXT NOT NULL,
      text TEXT NOT NULL,
      embedding vector(1536)
    );
  `);

  const insert = `
    INSERT INTO policies (id, dept, title, text, embedding)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (id) DO UPDATE SET dept=EXCLUDED.dept, title=EXCLUDED.title, text=EXCLUDED.text, embedding=EXCLUDED.embedding
  `;

  for (const d of docs) {
    const parts = chunk(d.text);
    for (let i = 0; i < parts.length; i++) {
      const id = `${d.id}#${i}`;
      const emb = await embeddings.embedQuery(parts[i]); // [1536]
      // pg needs vector literal as array → use toSql
      const vec = `[${emb.join(",")}]`;
      await client.query(insert, [id, d.dept, `${d.title} (${i+1})`, parts[i], vec]);
      console.log("upserted:", id);
    }
  }

  await client.end();
}

const CHUNK_SIZE = Number(process.env.RAG_CHUNK_SIZE || 1500);
const CHUNK_OVERLAP = Number(process.env.RAG_CHUNK_OVERLAP || 200);
const BATCH_LIMIT = Number(process.env.RAG_BATCH_LIMIT || 64); // for cross-doc micro-batching


// ---- Pinecone upsert (if you choose Pinecone) ----
// async function upsertPinecone(docs) {
//   const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
//   const index = pc.index("policies"); // create this in console with 1536 dims
//   for (const d of docs) {
//     const parts = chunk(d.text);
//     const vectors = [];
//     for (let i = 0; i < parts.length; i++) {
//       const id = `${d.id}#${i}`;
//       const emb = await embeddings.embedQuery(parts[i]);
//       vectors.push({ id, values: emb, metadata: { dept: d.dept, title: d.title, text: parts[i] } });
//     }
//     await index.upsert(vectors);
//     console.log("upserted:", d.id, vectors.length);
//   }
// }

async function run() {
  const docs = loadDocs(); // put files in server/rag/docs/*.md|*.txt
  if (!docs.length) {
    console.log("No docs found in server/rag/docs");
    return;
  }
  await upsertPgvector(docs);
  // await upsertPinecone(docs);
  console.log("RAG index complete ✓");
}

run().catch(e => { console.error(e); process.exit(1); });

  