import React, { Suspense } from 'react';
import { useProviders } from '@/hooks/useProviders';
import { Card } from '@/components/ui/card';
import Spinner from '@/components/Spinner';

const ProvidersView = React.lazy(() => import('@/views/ProvidersView'));

function Providers() {
  const { data: providers = [], isLoading, error } = useProviders();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

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

  const providerCards = providers.map((provider) => (
    <Card key={provider.id} className="p-6 hover:shadow-lg transition-all duration-300 border-custom-gray-200/50 bg-white/80 backdrop-blur-sm">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-curious-blue-500 to-curious-blue-600 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">👨‍⚕️</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-custom-gray-900">{provider.doctor}</h3>
          <p className="text-sm font-semibold text-curious-blue-600">{provider.specialty}</p>
        </div>
      </div>
      <div className="flex items-center text-sm text-custom-gray-600 mb-4">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {provider.location}
      </div>
      <div className="text-sm text-custom-gray-600">
        <span className="font-medium">Available Slots:</span> {provider.slots?.length || 0}
      </div>
    </Card>
  ));

  return (
    <div className="mb-8">
      <Suspense fallback={<Spinner className="h-6 w-6 mx-auto" />}>
        <ProvidersView providerCards={providerCards} />
      </Suspense>
    </div>
  );
}

export default Providers;
