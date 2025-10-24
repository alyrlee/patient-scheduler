import { useState, useRef, useEffect } from "react";
import { createAppointment, cancelAppointment, rescheduleAppointment } from "./api";

// Custom hook for progressive message loading
function useProgressiveText(text, speed = 20) {
  const [displayText, setDisplayText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (text) {
      setIsStreaming(true);
      setDisplayText("");
      let i = 0;
      
      const interval = setInterval(() => {
        setDisplayText(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          setIsStreaming(false);
        }
      }, speed);

      return () => {
        clearInterval(interval);
        setIsStreaming(false);
      };
    } else {
      setDisplayText("");
      setIsStreaming(false);
    }
  }, [text, speed]);

  return { displayText, isStreaming };
}

export default function ChatBox({ onBooked, onCancelled, onRescheduled, initialInput = "" }) {
  const [messages, setMessages] = useState([
    { 
      role: "assistant", 
      text: "👋 Hi there! I'm your AI assistant and I'm here to help make your cardiology appointments seamless. I can help you book, reschedule, or cancel appointments with ease. What would you like to do today? 💙",
      timestamp: new Date()
    },
  ]);
  const [input, setInput] = useState(initialInput);
  const [busy, setBusy] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [personality, setPersonality] = useState("friendly"); // professional, friendly, concise
  const [conversationContext, setConversationContext] = useState({
    activeIntents: [],
    currentBooking: null,
    pendingActions: []
  });
  const lastResponse = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Update input when initialInput prop changes
  useEffect(() => {
    if (initialInput) {
      setInput(initialInput);
      inputRef.current?.focus();
    }
  }, [initialInput]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Enhance AI responses with tone and emotion
  const enhanceResponse = (text, intent = null) => {
    if (!text) return text;
    
    let enhancedText = text;
    
    // Add personality-based enhancements
    switch (personality) {
      case "professional":
        enhancedText = text.replace(/Hi!/g, "Hello.").replace(/Got it!/g, "Understood.").replace(/Let's/g, "I'll help you");
        break;
      case "friendly":
        // Add more emojis and friendly language
        if (intent === "book") {
          enhancedText = enhancedText.replace(/book/g, "book 📅").replace(/appointment/g, "appointment 🩺");
        }
        if (intent === "cancel") {
          enhancedText = enhancedText.replace(/cancel/g, "cancel ❌").replace(/appointment/g, "appointment 📝");
        }
        if (intent === "search") {
          enhancedText = enhancedText.replace(/find/g, "find 🔍").replace(/providers/g, "providers 👨‍⚕️");
        }
        break;
      case "concise":
        // Remove extra words and emojis
        enhancedText = text.replace(/👋|💙|🩺|📅|❌|🔍|👨‍⚕️|📝/g, "").replace(/\s+/g, " ").trim();
        break;
    }
    
    // Add contextual emojis and empathic microcopy
    if (enhancedText.includes("successfully") || enhancedText.includes("booked")) {
      enhancedText = enhancedText.replace(/successfully/g, "✅ Successfully");
      if (!enhancedText.includes("🎉")) enhancedText += " 🎉";
    }
    
    if (enhancedText.includes("sorry") || enhancedText.includes("error")) {
      enhancedText = enhancedText.replace(/sorry/g, "😔 Sorry").replace(/error/g, "❌ Error");
    }
    
    if (enhancedText.includes("available") && enhancedText.includes("providers")) {
      enhancedText = enhancedText.replace(/available/g, "available 🟢").replace(/providers/g, "providers 👨‍⚕️");
    }
    
    if (enhancedText.includes("appointment") && !enhancedText.includes("🩺")) {
      enhancedText = enhancedText.replace(/appointment/g, "appointment 🩺");
    }
    
    return enhancedText;
  };

  // Update conversation context based on response
  const updateConversationContext = (response) => {
    if (response?.intent) {
      setConversationContext(prev => {
        const newIntents = [...prev.activeIntents];
        
        // Add or update intent
        const existingIndex = newIntents.findIndex(intent => intent.type === response.intent);
        if (existingIndex >= 0) {
          newIntents[existingIndex] = {
            type: response.intent,
            data: response.candidates,
            timestamp: new Date()
          };
        } else {
          newIntents.push({
            type: response.intent,
            data: response.candidates,
            timestamp: new Date()
          });
        }

        // Keep only last 3 intents
        if (newIntents.length > 3) {
          newIntents.shift();
        }

        return {
          ...prev,
          activeIntents: newIntents,
          currentBooking: response.intent === 'book' ? response.candidates : prev.currentBooking
        };
      });
    }
  };

  // Clear specific intent
  const clearIntent = (intentType) => {
    setConversationContext(prev => ({
      ...prev,
      activeIntents: prev.activeIntents.filter(intent => intent.type !== intentType),
      currentBooking: intentType === 'book' ? null : prev.currentBooking
    }));
  };

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    
    // Add user message
    const userMessage = { role: "user", text, timestamp: new Date() };
    setMessages((m) => [...m, userMessage]);
    setInput("");
    setBusy(true);
    setIsTyping(true);
    
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      
      if (!r.ok) throw new Error(`Chat API ${r.status}`);
      const data = await r.json();
      lastResponse.current = data;
          
          // Update conversation context
          updateConversationContext(data);
          
          // Add typing delay for better UX
          await new Promise(resolve => setTimeout(resolve, 800));
          
          setMessages((m) => [...m, { 
            role: "assistant", 
            text: enhanceResponse(data.reply ?? "I'm sorry, I couldn't process that request. Please try again.", data.intent),
            timestamp: new Date()
          }]);
    } catch {
      setMessages((m) => [
        ...m,
          { 
            role: "assistant", 
            text: enhanceResponse(`😔 Sorry, I'm having trouble connecting right now. Please try again in a moment.`),
            timestamp: new Date()
          },
      ]);
    } finally {
      setBusy(false);
      setIsTyping(false);
    }
  }

  // Support slots shaped as { start } or { iso }
  const slotStart = (slot) => slot?.start ?? slot?.iso ?? null;

  async function quickAction(action, payload) {
    try {
      if (action === "book") {
        const slot = payload?.slots?.[0];
        const start = slotStart(slot);
        const providerId = payload?.providerId;
        if (!start || !providerId) throw new Error("Missing provider/slot for booking.");
        const created = await createAppointment({
          providerId,
          patientName: "Demo User",
          start, // ISO
        });
        onBooked?.(created);
            clearIntent('book');
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
                text: enhanceResponse(`✅ Successfully booked ${created.doctor} on ${new Date(created.start).toLocaleString()}.`, "book"),
          },
        ]);
      }

      if (action === "cancel") {
        const id = payload?.appointmentId;
        if (!id) throw new Error("Missing appointment ID.");
        await cancelAppointment(id);
        onCancelled?.(id);
            clearIntent('cancel');
            setMessages((m) => [...m, { role: "assistant", text: enhanceResponse("✅ Successfully cancelled your appointment.", "cancel") }]);
      }

      if (action === "reschedule") {
        const id = payload?.appointmentId;
        const slot = payload?.slots?.[0];
        const start = slotStart(slot);
        if (!id || !start) throw new Error("Missing appointment/slot for reschedule.");
        const updated = await rescheduleAppointment(id, start);
        onRescheduled?.(updated);
            clearIntent('reschedule');
        setMessages((m) => [
          ...m,
          { role: "assistant", text: enhanceResponse(`✅ Successfully rescheduled to ${new Date(updated.start).toLocaleString()}.`, "reschedule") },
        ]);
      }
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", text: `Action failed: ${e.message}` }]);
    }
  }

  // Conversation Memory Chips Component
  function ConversationMemoryChips() {
    if (conversationContext.activeIntents.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {conversationContext.activeIntents.map((intent, index) => (
          <div
            key={`${intent.type}-${index}`}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-curious-blue-50 to-curious-blue-100 border border-curious-blue-200 rounded-full shadow-sm"
          >
            <div className="w-2 h-2 bg-curious-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-curious-blue-800">
              {intent.type === 'book' && '📅 Booking'}
              {intent.type === 'cancel' && '❌ Cancelling'}
              {intent.type === 'reschedule' && '🔄 Rescheduling'}
              {intent.type === 'search' && '🔍 Searching'}
            </span>
            <button
              onClick={() => clearIntent(intent.type)}
              className="ml-1 text-curious-blue-400 hover:text-curious-blue-600 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    );
  }

  // Inline Confirmation Component
  function InlineConfirmation({ intent, candidates }) {
    if (!intent || !candidates) return null;

    const hasSlots = Array.isArray(candidates?.slots) && candidates.slots.length > 0;

    if (intent === "book" && hasSlots && candidates?.providerId) {
      const slot = candidates.slots[0];
      const providerName = candidates.doctor || "Provider";
      const time = new Date(slot.start || slot.iso).toLocaleString();
      
      return (
        <div className="mt-3 p-3 bg-gradient-to-r from-fern-50 to-fern-100 border border-fern-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-fern-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📅</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-fern-800">Ready to book with {providerName}?</p>
                <p className="text-xs text-fern-600">{time}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => clearIntent('book')}
                className="px-3 py-1.5 text-xs text-fern-600 hover:text-fern-800 transition-colors"
              >
                Cancel
              </button>
          <button
                onClick={() => quickAction("book", candidates)}
                className="px-4 py-1.5 bg-gradient-to-r from-fern-600 to-fern-700 text-white rounded-lg hover:from-fern-700 hover:to-fern-800 transition-all text-xs font-medium shadow-sm"
          >
                Confirm
          </button>
            </div>
          </div>
        </div>
      );
    }

    if (intent === "cancel" && candidates?.appointmentId) {
      return (
        <div className="mt-3 p-3 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">⚠️</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-red-800">Cancel this appointment?</p>
                <p className="text-xs text-red-600">This action cannot be undone</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => clearIntent('cancel')}
                className="px-3 py-1.5 text-xs text-red-600 hover:text-red-800 transition-colors"
              >
                Keep
              </button>
          <button
                onClick={() => quickAction("cancel", candidates)}
                className="px-4 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-all text-xs font-medium shadow-sm"
          >
                Cancel
          </button>
            </div>
          </div>
        </div>
      );
    }

    if (intent === "reschedule" && hasSlots && candidates?.appointmentId) {
      const slot = candidates.slots[0];
      const time = new Date(slot.start || slot.iso).toLocaleString();
      
      return (
        <div className="mt-3 p-3 bg-gradient-to-r from-curious-blue-50 to-curious-blue-100 border border-curious-blue-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-curious-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🔄</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-curious-blue-800">Reschedule to {time}?</p>
                <p className="text-xs text-curious-blue-600">Confirm the new appointment time</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => clearIntent('reschedule')}
                className="px-3 py-1.5 text-xs text-curious-blue-600 hover:text-curious-blue-800 transition-colors"
              >
                Keep Current
              </button>
          <button
                onClick={() => quickAction("reschedule", candidates)}
                className="px-4 py-1.5 bg-gradient-to-r from-curious-blue-600 to-curious-blue-700 text-white rounded-lg hover:from-curious-blue-700 hover:to-curious-blue-800 transition-all text-xs font-medium shadow-sm"
          >
                Reschedule
          </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  // Adaptive Quick Actions Component
  function AdaptiveQuickActions({ message, _messageIndex }) {
    // Only show for assistant messages
    if (message.role !== "assistant") return null;

    // Determine which actions to show based on message content and context
    const actions = [];

    // Check if message contains appointment-related content
    const hasAppointmentInfo = message.text.toLowerCase().includes('appointment') || 
                              message.text.toLowerCase().includes('booked') ||
                              message.text.toLowerCase().includes('scheduled') ||
                              message.text.toLowerCase().includes('confirmed');

    // Check if message contains booking-related content
    const hasBookingInfo = message.text.toLowerCase().includes('book') ||
                          message.text.toLowerCase().includes('time slot') ||
                          message.text.toLowerCase().includes('provider') ||
                          message.text.toLowerCase().includes('available');

    // Check if message contains provider-related content
    const hasProviderInfo = message.text.toLowerCase().includes('doctor') ||
                           message.text.toLowerCase().includes('cardiologist') ||
                           message.text.toLowerCase().includes('specialist');

    // Check if message contains cancellation content
    const hasCancellationInfo = message.text.toLowerCase().includes('cancel') ||
                               message.text.toLowerCase().includes('cancelled');

    // Check if message contains rescheduling content
    const hasRescheduleInfo = message.text.toLowerCase().includes('reschedule') ||
                             message.text.toLowerCase().includes('change time');

    // Check if there are active intents
    const hasActiveIntents = conversationContext.activeIntents.length > 0;

    // Add contextual actions based on message content and state
    if (hasAppointmentInfo) {
      actions.push({
        label: "View Appointment Details",
        icon: "📋",
        action: () => setInput("Show me my appointment details"),
        color: "curious-blue"
      });
    }

    if (hasBookingInfo || hasActiveIntents) {
      actions.push({
        label: "Edit Booking",
        icon: "✏️",
        action: () => setInput("I want to modify my booking"),
        color: "fern"
      });
    }

    if (hasProviderInfo) {
      actions.push({
        label: "Find Similar Providers",
        icon: "👨‍⚕️",
        action: () => setInput("Show me other cardiologists"),
        color: "curious-blue"
      });
    }

    if (hasCancellationInfo) {
      actions.push({
        label: "Book New Appointment",
        icon: "📅",
        action: () => setInput("I want to book a new appointment"),
        color: "fern"
      });
    }

    if (hasRescheduleInfo) {
      actions.push({
        label: "View All Times",
        icon: "🕐",
        action: () => setInput("Show me all available time slots"),
        color: "curious-blue"
      });
    }

    // Always show "Ask AI Something Else" for assistant messages
    actions.push({
      label: "Ask AI Something Else",
      icon: "💬",
      action: () => setInput(""),
      color: "custom-gray"
    });

    if (actions.length === 0) return null;

  return (
      <div className="mt-3 flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md ${
              action.color === 'curious-blue' 
                ? 'bg-gradient-to-r from-curious-blue-50 to-curious-blue-100 text-curious-blue-700 border border-curious-blue-200/50 hover:from-curious-blue-100 hover:to-curious-blue-200'
                : action.color === 'fern'
                ? 'bg-gradient-to-r from-fern-50 to-fern-100 text-fern-700 border border-fern-200/50 hover:from-fern-100 hover:to-fern-200'
                : 'bg-gradient-to-r from-custom-gray-50 to-custom-gray-100 text-custom-gray-700 border border-custom-gray-200/50 hover:from-custom-gray-100 hover:to-custom-gray-200'
            }`}
            disabled={busy}
          >
            <span className="mr-1.5">{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>
    );
  }

  // Streaming Message Component
  function StreamingMessage({ message, messageIndex }) {
    const { displayText, isStreaming } = useProgressiveText(message.text, 15);
    
    return (
      <div className={`message ${message.role} animate-fadeIn`}>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className={`message-avatar ${message.role === "user" ? "order-2" : "order-1"}`}>
            {message.role === "assistant" ? "🤖" : "👤"}
          </div>
          
          {/* Message content */}
          <div className="message-content">
            <p className="text-sm leading-relaxed">
              {displayText}
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-curious-blue-500 ml-1 animate-pulse"></span>
              )}
            </p>
          </div>
        </div>
        
        {/* Inline Confirmation for assistant messages */}
        {message.role === "assistant" && lastResponse.current && !isStreaming && (
          <InlineConfirmation 
            intent={lastResponse.current.intent} 
            candidates={lastResponse.current.candidates} 
          />
        )}

        {/* Adaptive Quick Actions for assistant messages */}
        {message.role === "assistant" && !isStreaming && (
          <AdaptiveQuickActions message={message} messageIndex={messageIndex} />
        )}
        
        {/* Timestamp */}
        <p className={`timestamp ${message.role}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    );
  }

  // Typing indicator component
  function TypingIndicator() {
    return (
      <div className="message assistant">
        <div className="flex items-start gap-3">
          <div className="message-avatar">
            🤖
          </div>
          <div className="typing-indicator">
            <div className="typing-dots">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
            <span className="text-xs text-custom-gray-500 ml-2">AI is typing...</span>
          </div>
        </div>
      </div>
    );
  }

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

      return (
        <div className="chat-box h-[500px] flex flex-col overflow-hidden">
          {/* Conversation Memory Chips */}
          <div className="px-6 pt-4">
            <ConversationMemoryChips />
          </div>

          {/* Messages Container */}
          <div className="chat-messages">
            {messages.map((m, i) => (
              <StreamingMessage key={i} message={m} messageIndex={i} />
            ))}
            
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-custom-gray-200/50 bg-white/90 backdrop-blur-sm">
            {/* Personality Selector */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-custom-gray-700">AI Tone:</span>
                <div className="flex space-x-1 bg-custom-gray-100 rounded-lg p-1">
                  {["professional", "friendly", "concise"].map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setPersonality(tone)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                        personality === tone
                          ? "bg-white text-curious-blue-700 shadow-sm"
                          : "text-custom-gray-600 hover:text-custom-gray-800"
                      }`}
                    >
                      {tone === "professional" && "🏢 Professional"}
                      {tone === "friendly" && "😊 Friendly"}
                      {tone === "concise" && "⚡ Concise"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Smart Suggestions based on context */}
            <div className="suggestion-chips">
              {conversationContext.activeIntents.length === 0 ? (
                // Default suggestions when no active intents
                <>
                  <button
                    onClick={() => setInput("Book an appointment")}
                    className="suggestion-chip"
                    disabled={busy}
                  >
                    📅 Book appointment
                  </button>
                  <button
                    onClick={() => setInput("Show available providers")}
                    className="suggestion-chip"
                    disabled={busy}
                  >
                    👨‍⚕️ Find providers
                  </button>
                  <button
                    onClick={() => setInput("Cancel my appointment")}
                    className="suggestion-chip"
                    disabled={busy}
                  >
                    ❌ Cancel appointment
                  </button>
                </>
              ) : (
                // Context-aware suggestions
                <>
                  {conversationContext.activeIntents.some(intent => intent.type === 'book') && (
                    <button
                      onClick={() => setInput("Show me more time slots")}
                      className="suggestion-chip"
                      disabled={busy}
                    >
                      🕐 More times
                    </button>
                  )}
                  {conversationContext.activeIntents.some(intent => intent.type === 'search') && (
                    <button
                      onClick={() => setInput("Show me all cardiologists")}
                      className="suggestion-chip"
                      disabled={busy}
                    >
                      👨‍⚕️ All cardiologists
                    </button>
                  )}
                  <button
                    onClick={() => setInput("What are my current appointments?")}
                    className="suggestion-chip"
                    disabled={busy}
                  >
                    📋 My appointments
                  </button>
                  <button
                    onClick={() => {
                      setConversationContext({ activeIntents: [], currentBooking: null, pendingActions: [] });
                      setInput("Start over");
                    }}
                    className="suggestion-chip"
                    disabled={busy}
                  >
                    🔄 Start over
                  </button>
                </>
              )}
            </div>

            {/* Input field */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
        <input
                  ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) send();
          }}
                  placeholder="Type your message here..."
                  className="chat-input"
          disabled={busy}
        />
                {input && (
                  <button
                    onClick={() => setInput("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-custom-gray-400 hover:text-custom-gray-600 transition-colors p-1 rounded-lg hover:bg-custom-gray-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
        <button
          onClick={send}
                className="chat-send-button"
          disabled={!input.trim() || busy}
        >
                {busy ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Send</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                )}
        </button>
            </div>
      </div>
    </div>
  );
}
