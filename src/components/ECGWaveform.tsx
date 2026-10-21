import React from 'react';

interface ECGWaveformProps {
  heartRate: number;
  isEmergency: boolean;
}

export const ECGWaveform: React.FC<ECGWaveformProps> = ({ heartRate, isEmergency }) => {
  const speed = isEmergency ? '0.8s' : '1.8s';
  const strokeColor = isEmergency ? '#ef4444' : '#10b981';

  return (
    <div className="w-full h-8 overflow-hidden relative flex items-center">
      <svg
        viewBox="0 0 500 40"
        className="w-full h-full preserve-3d"
        preserveAspectRatio="none"
      >
        <path
          d="M0,20 L60,20 L75,20 L80,10 L85,32 L92,2 L98,24 L102,18 L108,20 L180,20 L195,20 L200,10 L205,32 L212,2 L218,24 L222,18 L228,20 L300,20 L315,20 L320,10 L325,32 L332,2 L338,24 L342,18 L348,20 L420,20 L435,20 L440,10 L445,32 L452,2 L458,24 L462,18 L468,20 L500,20"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-colors duration-300"
          style={{
            strokeDasharray: '500',
            strokeDashoffset: '500',
            animation: `ecg-sweep ${speed} linear infinite`
          }}
        />
      </svg>
      <style>{`
        @keyframes ecg-sweep {
          0% { stroke-dashoffset: 500; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};
