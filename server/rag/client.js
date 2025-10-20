import { OpenAIEmbeddings } from "@langchain/openai";
import { Client } from "pg"; // pgvector
// import { Pinecone } from "@pinecone-database/pinecone";
import { TTLCache } from "./cache.js";

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: "text-embedding-3-small"
});

// const cache = new TTLCache({ ttlMs: 60_000, max: 300 }); // 60s, 300 entries
const cache = new TTLCache({ ttlMs: 60_000, max: 300 });

// ---- pgvector similarity search ----
export async function policySearchPg({ query, k = 4, dept = "cardiology" }) {
    const key = `${dept}|${k}|${query}`;
    const hit = cache.get(key);
    if (hit) return hit;
  
    const client = new Client({ connectionString: process.env.PG_CONN, ssl: { rejectUnauthorized: false } });
    await client.connect();
  
    const qEmb = await embeddings.embedQuery(query);
    const vec = `[${qEmb.join(",")}]`;
    const sql = `
      SELECT id, dept, title, text,
        1 - (embedding <=> ${vec}) AS score
      FROM policies
      WHERE dept = $1
      ORDER BY embedding <=> ${vec}
      LIMIT $2
    `;
    const { rows } = await client.query(sql, [dept, k]);
    await client.end();
  
    cache.set(key, rows);
    return rows;
  }

// ---- Pinecone version (if you chose Pinecone) ----
// export async function policySearchPinecone({ query, k = 4, dept = "cardiology" }) {
//   const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
//   const index = pc.index("policies");
//   const qEmb = await embeddings.embedQuery(query);
//   const res = await index.query({
//     topK: k,
//     includeMetadata: true,
//     vector: qEmb,
//     filter: { dept } // optional metadata filter
//   });
//   return res.matches.map(m => ({ id: m.id, score: m.score, ...m.metadata }));
// }
