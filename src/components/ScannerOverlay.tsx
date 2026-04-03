import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';

export const ScannerOverlay: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied", err);
      }
    }
    setupCamera();
  }, []);

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-white/10">
      <video 
        ref={videoRef} 
        autoPlay 
        muted 
        playsInline 
        className="w-full h-full object-cover opacity-60 grayscale"
      />
      
      {/* Scanning UI Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Face Target */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-emerald-500/30 rounded-[40%]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-emerald-500/10" />
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-1 bg-emerald-500/10" />
        </div>

        {/* Scanning Line */}
        <motion.div 
          animate={{ top: ['10%', '90%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[2px] bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)] z-10"
        />

        {/* Data Points Overlay */}
        <div className="absolute top-4 left-4 font-mono text-[10px] text-emerald-400/70 space-y-1">
          <div>ROI_ALPHA: 0.842</div>
          <div>ROI_BETA: 0.129</div>
          <div>SIGNAL_STRENGTH: 94%</div>
        </div>

        <div className="absolute bottom-4 right-4 font-mono text-[10px] text-emerald-400/70">
          rPPG_ENGINE_ACTIVE: TRUE
        </div>
      </div>
    </div>
  );
};
