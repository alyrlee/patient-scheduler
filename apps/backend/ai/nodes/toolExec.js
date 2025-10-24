// tool executor node that executes the chosen tool and attaches result
import {
    toolSearchProviders, toolCreateAppointment,
    toolCancelAppointment, toolRescheduleAppointment
  } from "../tools.js";
  
  const registry = {
    searchProviders: toolSearchProviders,
    createAppointment: toolCreateAppointment,
    cancelAppointment: toolCancelAppointment,
    rescheduleAppointment: toolRescheduleAppointment,
  };
  
  export async function toolExecNode(state) {
    if (!state.toolCall) return state;
    const fn = registry[state.toolCall.name];
    if (!fn) return { ...state, error: `Unknown tool ${state.toolCall.name}` };
    const out = await fn(state.toolCall.args);
    return { ...state, result: out };
  }
  