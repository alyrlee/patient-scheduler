import React, { useState } from 'react';

export default function ChatBox({ initialInput, onBooked, onCancelled, onRescheduled }) {
  const [input, setInput] = useState(initialInput || '');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you with appointment scheduling, finding providers, and answering questions about your healthcare needs. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Quick action prompts
  const quickActions = [
    {
      id: 'find-provider',
      label: 'Find a Provider',
      icon: '👨‍⚕️',
      prompt: 'I need to find a healthcare provider'
    },
    {
      id: 'book-appointment',
      label: 'Book Appointment',
      icon: '📅',
      prompt: 'I want to book a new appointment'
    },
    {
      id: 'view-appointments',
      label: 'View Appointments',
      icon: '📋',
      prompt: 'Show me my upcoming appointments'
    },
    {
      id: 'cancel-appointment',
      label: 'Cancel Appointment',
      icon: '❌',
      prompt: 'I need to cancel an appointment'
    },
    {
      id: 'reschedule',
      label: 'Reschedule',
      icon: '🔄',
      prompt: 'I want to reschedule an appointment'
    },
    {
      id: 'insurance',
      label: 'Insurance Help',
      icon: '🏥',
      prompt: 'I have questions about insurance coverage'
    }
  ];

  const handleQuickAction = (prompt) => {
    setInput(prompt);
    // Auto-submit the quick action
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} });
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: 'I understand you\'re looking for help. I can assist you with scheduling appointments, finding providers, or answering questions about your healthcare needs. What specific help do you need?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-4">
      {/* Quick Action Buttons */}
      {messages.length === 1 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">Quick actions:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.prompt)}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-curious-blue-300 transition-colors text-left"
                disabled={isLoading}
              >
                <span className="text-lg">{action.icon}</span>
                <span className="text-gray-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-curious-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me about appointments, providers, or scheduling..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-curious-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-2 bg-curious-blue-600 text-white rounded-lg hover:bg-curious-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
