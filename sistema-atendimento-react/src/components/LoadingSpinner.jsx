import React from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';

const LoadingSpinner = ({ size = "md", text = "Carregando..." }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <ProgressSpinner 
        style={{ width: sizeClasses[size], height: sizeClasses[size] }}
        strokeWidth="4"
        className="text-blue-600"
        pt={{
          root: { className: "text-blue-600" },
          circle: { className: "text-blue-600" }
        }}
      />
      {text && <p className="text-sm font-medium text-gray-600">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
