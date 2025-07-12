import React from 'react';

const SiahLogoNew = ({ size = 200, className = "" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className="bg-white rounded-full p-4 shadow-lg flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <div className="text-center">
          <div className="text-blue-600 font-bold text-4xl mb-2">
            <i className="pi pi-heart-fill text-red-500"></i>
          </div>
          <div className="text-blue-800 font-bold text-xl">SIAH</div>
          <div className="text-blue-600 text-xs">Sistema Hospitalar</div>
        </div>
      </div>
    </div>
  );
};

export default SiahLogoNew;
