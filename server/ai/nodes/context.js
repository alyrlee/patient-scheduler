// server/ai/nodes/context.js
import { policySearchPg /* or policySearchPinecone */ } from "../../rag/client.js";
import { toolSearchProviders, toolGetOpenSlots } from "../tools.js";

export async function contextNode(state) {
  const ctx = state.context ? { ...state.context } : {};
  const userText = state.messages.findLast(m => m.role === "user")?.content ?? "";

  // Provider context as before (for book/search)
  if (state.intent === "book" || state.intent === "search") {
    const q = state.entities?.query || userText || "";
    ctx.providers = await toolSearchProviders({ q });
    const pid = state.entities?.providerId ?? ctx.providers?.[0]?.id;
    if (pid) ctx.slots = await toolGetOpenSlots({ providerId: pid });
  }

  // RAG: attach relevant policy snippets given the user question
  // (dept can be inferred from session; for demo, 'cardiology')
  const policyHits = await policySearchPg({ query: userText, k: 4, dept: "cardiology" });
  ctx.policy = policyHits.map(h => ({
    id: h.id,
    title: h.title,
    text: h.text,
    score: Number(h.score).toFixed(3)
  }));

  return { ...state, context: ctx };
}
