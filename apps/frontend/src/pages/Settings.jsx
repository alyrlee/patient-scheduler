import React from 'react';
import { Card } from '../components/ui/card';

function Settings() {
  return (
    <div className="mb-8">
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-custom-gray-900 mb-6">Settings</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-custom-gray-800 mb-3">AI Assistant Preferences</h3>
            <p className="text-sm text-custom-gray-600">Customize your AI assistant experience in the chat interface above.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-custom-gray-800 mb-3">Account Information</h3>
            <p className="text-sm text-custom-gray-600">Manage your profile and notification preferences.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-custom-gray-800 mb-3">Privacy & Security</h3>
            <p className="text-sm text-custom-gray-600">Control your data and privacy settings.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Settings;
