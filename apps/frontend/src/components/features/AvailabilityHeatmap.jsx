import React, { useMemo } from 'react';
import { Card } from './components/ui/card';

function AvailabilityHeatmap({ provider, selectedSlot, onSlotSelect }) {
  const { slots, timezone = 'America/Chicago' } = provider;

  // Group slots by day and hour
  const availabilityGrid = useMemo(() => {
    if (!slots || slots.length === 0) return {};

    const grid = {};
    const now = new Date();
    
    // Generate next 7 days
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date(now);
      date.setDate(date.getDate() + dayOffset);
      const dayKey = date.toISOString().split('T')[0];
      
      grid[dayKey] = {
        date,
        hours: {}
      };
      
      // Initialize hours (9 AM to 5 PM)
      for (let hour = 9; hour < 17; hour++) {
        grid[dayKey].hours[hour] = {
          slots: [],
          available: false
        };
      }
    }

    // Populate with actual slots
    slots.forEach(slot => {
      const slotDate = new Date(slot.start);
      const dayKey = slotDate.toISOString().split('T')[0];
      const hour = slotDate.getHours();
      
      if (grid[dayKey] && grid[dayKey].hours[hour]) {
        grid[dayKey].hours[hour].slots.push(slot);
        grid[dayKey].hours[hour].available = slot.status === 'open';
      }
    });

    return grid;
  }, [slots]);

  const getSlotIntensity = (hourData) => {
    if (!hourData.available) return 'bg-gray-200';
    
    const slotCount = hourData.slots.length;
    if (slotCount === 0) return 'bg-gray-200';
    if (slotCount === 1) return 'bg-green-200 hover:bg-green-300';
    if (slotCount === 2) return 'bg-green-300 hover:bg-green-400';
    if (slotCount >= 3) return 'bg-green-400 hover:bg-green-500';
    
    return 'bg-gray-200';
  };

  const formatTime = (hour) => {
    const time = new Date();
    time.setHours(hour, 0, 0, 0);
    return time.toLocaleTimeString([], { 
      hour: 'numeric', 
      hour12: true,
      timeZone: timezone 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      timeZone: timezone 
    });
  };

  const handleSlotClick = (dayKey, hour, hourData) => {
    if (!hourData.available || hourData.slots.length === 0) return;
    
    // Select the first available slot for this hour
    const slot = hourData.slots.find(s => s.status === 'open');
    if (slot) {
      onSlotSelect(provider, slot);
    }
  };

  const days = Object.entries(availabilityGrid).slice(0, 7);

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Availability Heatmap
        </h3>
        <p className="text-sm text-gray-600">
          Click on green cells to select a time slot. Darker green = more availability.
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Header with times */}
          <div className="flex">
            <div className="w-24 flex-shrink-0"></div>
            {Array.from({ length: 8 }, (_, i) => i + 9).map(hour => (
              <div key={hour} className="w-16 text-center text-xs font-medium text-gray-500 py-2">
                {formatTime(hour)}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="space-y-1">
            {days.map(([dayKey, dayData]) => (
              <div key={dayKey} className="flex items-center">
                <div className="w-24 flex-shrink-0 text-sm font-medium text-gray-700 py-2">
                  {formatDate(dayData.date)}
                </div>
                {Array.from({ length: 8 }, (_, i) => i + 9).map(hour => {
                  const hourData = dayData.hours[hour];
                  const isSelected = selectedSlot && 
                    selectedSlot.provider_id === provider.id && 
                    hourData.slots.some(s => s.id === selectedSlot.id);
                  
                  return (
                    <button
                      key={`${dayKey}-${hour}`}
                      onClick={() => handleSlotClick(dayKey, hour, hourData)}
                      disabled={!hourData.available}
                      className={`
                        w-16 h-8 mx-0.5 rounded text-xs font-medium transition-all duration-200
                        ${getSlotIntensity(hourData)}
                        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                        ${hourData.available ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}
                        disabled:opacity-50
                      `}
                      title={hourData.available ? 
                        `${hourData.slots.length} slot(s) available at ${formatTime(hour)}` : 
                        'No availability'
                      }
                    >
                      {hourData.available && hourData.slots.length > 0 && (
                        <span className="text-xs">
                          {hourData.slots.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-600">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-gray-200 rounded"></div>
          <span>Unavailable</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-200 rounded"></div>
          <span>1 slot</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-300 rounded"></div>
          <span>2 slots</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-400 rounded"></div>
          <span>3+ slots</span>
        </div>
      </div>
    </Card>
  );
}

export default AvailabilityHeatmap;
