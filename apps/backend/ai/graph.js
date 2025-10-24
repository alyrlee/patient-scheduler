// wires the nodes into a graph
import { StateGraph } from "@langchain/langgraph";
import { routerNode } from "./nodes/router.js";
import { contextNode } from "./nodes/context.js";
import { deciderNode } from "./nodes/decider.js";
import { toolExecNode } from "./nodes/toolExec.js";
import { respondNode } from "./nodes/respond.js";

export function buildGraph() {
  const graph = new StateGraph()
    .addNode("router", routerNode)
    .addNode("context", contextNode)
    .addNode("decider", deciderNode)
    .addNode("tool", toolExecNode)
    .addNode("respond", respondNode)
    .addEdge("__start__", "router")
    .addEdge("router", "context")
    .addEdge("context", "decider")
    .addEdge("decider", "tool")
    .addEdge("tool", "respond")
    .addEdge("respond", "__end__");

  return graph.compile();
}
