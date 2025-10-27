
import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex items-center space-x-2">
       <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{animationDelay: '-0.3s'}}></div>
       <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{animationDelay: '-0.15s'}}></div>
       <div className="w-3 h-3 rounded-full bg-primary animate-bounce"></div>
    </div>
  );
};
