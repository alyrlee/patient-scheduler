import React, { Suspense } from "react";
const ChatBox = React.lazy(() => import("./ChatBox"));

export default function AssistantSection({ initialInput, onBooked, onCancelled, onRescheduled }) {
  return (
    <div className="card-primary section-secondary overflow-hidden">
      <div className="bg-gradient-to-r from-curious-blue-600 to-curious-blue-700 px-8 py-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Assistant</h2>
            <p className="text-curious-blue-100 text-sm font-medium">Ask me about appointments, providers, or scheduling</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <Suspense fallback={<div className="text-sm text-custom-gray-500">Loading assistant…</div>}>
          <ChatBox
            initialInput={initialInput}
            onBooked={onBooked}
            onCancelled={onCancelled}
            onRescheduled={onRescheduled}
          />
        </Suspense>
      </div>
    </div>
  );
}
