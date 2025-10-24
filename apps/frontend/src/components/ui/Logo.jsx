import React from 'react';

export default function Logo({ className = "h-8 w-8" }) {
  return (
    <div className={`${className} bg-curious-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
      PS
    </div>
  );
}
