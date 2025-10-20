//decision/tool node (sscheduler agent) that choses the tools and arguments
export async function deciderNode(state) {
    const { intent, entities, context } = state;
  
    if (intent === "book") {
      const providerId = entities?.providerId ?? context.providers?.[0]?.id;
      const timeISO = entities?.timeISO ?? context?.slots?.[0]?.start;
      if (providerId && timeISO) {
        return { ...state, toolCall: { name: "createAppointment", args: { providerId, patientName: "Demo User", start: timeISO } } };
      }
      return { ...state, toolCall: null }; // ask user to pick
    }
  
    if (intent === "reschedule") {
      const apptId = entities?.appointmentId ?? context.latestAppointment?.id;
      const timeISO = entities?.timeISO ?? context?.slots?.[0]?.start;
      if (apptId && timeISO) {
        return { ...state, toolCall: { name: "rescheduleAppointment", args: { appointmentId: apptId, start: timeISO } } };
      }
      return { ...state, toolCall: null };
    }
  
    if (intent === "cancel") {
      const apptId = entities?.appointmentId ?? context.latestAppointment?.id;
      if (apptId) {
        return { ...state, toolCall: { name: "cancelAppointment", args: { appointmentId: apptId } } };
      }
      return { ...state, toolCall: null };
    }
  
    if (intent === "search") {
      const q = entities?.query ?? "";
      return { ...state, toolCall: { name: "searchProviders", args: { q } } };
    }
  
    return { ...state, toolCall: null };
  }
  