function buildPolicyNote(context, max = 2) {
    if (!context?.policy?.length) return "";
    const src = context.policy.slice(0, max).map(p =>
      `${p.title} [${p.id}]`
    ).join("; ");
    return `\n\nSources: ${src}`;
  }
  
  export async function respondNode(state) {
    const { intent, result, context, toolCall } = state;
    const sources = buildPolicyNote(context, 3);
  
    if (intent === "book" && result) {
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            role: "assistant",
            content: `Booked ${result.doctor} on ${new Date(result.start).toLocaleString()} in ${result.location}.${sources}`
          }
        ]
      };
    }
  
    if (intent === "search" && result) {
      const names = result.map(p => p.doctor).slice(0,3).join(", ");
      return {
        ...state,
        messages: [
          ...state.messages,
          { role: "assistant", content: `Found ${result.length} providers. Top: ${names}.${sources}` }
        ]
      };
    }
  
    if (!toolCall) {
      if (intent === "book" && context?.providers?.length) {
        const top = (context.providers || []).slice(0,3).map(p => p.doctor).join(", ");
        return {
          ...state,
          messages: [
            ...state.messages,
            { role: "assistant", content: `I can book you with ${top}. Any preferences?${sources}` }
          ]
        };
      }
      // FAQ reply using policy
      if (context?.policy?.length && !["book","reschedule","cancel"].includes(intent)) {
        const excerpt = context.policy[0].text.slice(0, 600);
        return {
          ...state,
          messages: [
            ...state.messages,
            { role: "assistant", content: `Here’s what I found:\n\n${excerpt}${sources}` }
          ]
        };
      }
    }
  
    return { ...state, messages: [...state.messages, { role: "assistant", content: `Okay.${sources}` }] };
  }
