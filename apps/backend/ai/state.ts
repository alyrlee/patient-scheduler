//concversation state that grpah will pass between nodes
export type ChatState = {
    messages: { role: "user" | "assistant" | "tool"; content: string }[];
    intent?: "book" | "reschedule" | "cancel" | "search" | "faq" | "none";
    entities?: { providerId?: string; appointmentId?: string; timeISO?: string; query?: string };
    context?: Record<string, any>;  // provider lists, slots, policies (RAG)
    toolCall?: { name: string; args: any } | null;
    result?: any; // tool results
    error?: string | null;
  };
  