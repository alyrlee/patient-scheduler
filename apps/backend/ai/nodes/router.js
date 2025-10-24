// router/intent node that use the LLM to decide next steps (book/reschedule/cancel/search/faq)
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({ model: "gpt-4o-mini" }); // pick your model

export async function routerNode(state) {
  const lastUser = state.messages.findLast(m => m.role === "user")?.content ?? "";
  const sys = `Classify the user's intent as one of: book, reschedule, cancel, search, faq, none.
  Extract provider last names and any datetime hints (ISO if possible).
  Respond as JSON: {"intent": "...", "entities": {...}}`;
  const res = await llm.invoke([{ role: "system", content: sys }, { role: "user", content: lastUser }]);
  let parsed;
  try { parsed = JSON.parse(res.content); } catch { parsed = { intent: "none" }; }
  return { ...state, intent: parsed.intent, entities: parsed.entities ?? {} };
}
