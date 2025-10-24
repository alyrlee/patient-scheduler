import React from "react";

export default function ProvidersView({ providerCards }) {
  return (
    <div className="mb-8">
      <div className="card-primary section-secondary">
        <h2 className="text-2xl font-bold text-custom-gray-900 mb-6">All Providers</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providerCards}
        </div>
      </div>
    </div>
  );
}
