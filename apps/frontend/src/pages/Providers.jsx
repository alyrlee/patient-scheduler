import React from 'react';
import { useProviders } from '../hooks/useProviders';
import ProvidersComponent, { DEMO_PROVIDERS } from '../components/features/Providers';

function Providers() {
  const { data: providers = [], isLoading, error } = useProviders();
  
  console.log('Providers component rendering with:', { providers, isLoading, error });

  // Transform API data to match Option5Providers format
  const transformedProviders = providers.map(provider => ({
    id: provider.id,
    name: provider.doctor,
    specialty: provider.specialty,
    location: provider.location,
    nextSlots: [
      { id: `${provider.id}-s1`, timeLabel: "9:30 AM", iso: "2025-10-24T09:30:00-05:00" },
      { id: `${provider.id}-s2`, timeLabel: "1:00 PM", iso: "2025-10-24T13:00:00-05:00" },
      { id: `${provider.id}-s3`, timeLabel: "3:45 PM", iso: "2025-10-24T15:45:00-05:00" },
    ],
  }));

  // Use demo data if API data is not available or empty
  const displayProviders = transformedProviders.length > 0 ? transformedProviders : DEMO_PROVIDERS;

  const handleSelectSlot = (provider, slot) => {
    console.log("Book", provider.name, "at", slot.timeLabel, slot.iso);
    // TODO: Navigate to booking page or open modal
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-red-600 font-medium">Failed to load providers</p>
        <p className="text-sm text-gray-500 mt-1">Please try again later</p>
      </div>
    );
  }

  return (
    <ProvidersComponent
      providers={displayProviders}
      heading="Available Providers"
      loading={isLoading}
      onSelectSlot={handleSelectSlot}
    />
  );
}

export default Providers;
