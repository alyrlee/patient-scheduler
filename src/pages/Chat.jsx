import React from 'react';
import AssistantSection from '@/components/AssistantSection';

function Chat() {
  return (
    <div className="mb-8">
      <AssistantSection
        onBooked={() => {}}
        onCancelled={() => {}}
        onRescheduled={() => {}}
      />
    </div>
  );
}

export default Chat;
