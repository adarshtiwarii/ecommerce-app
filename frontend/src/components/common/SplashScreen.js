import { useEffect, useState } from 'react';

const SplashScreen = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-cinematic-dark flex items-center justify-center z-50">
      <div className="text-center">
        <div className="text-6xl font-bold text-cinematic-accent animate-pulse">EcoMart</div>
        <div className="mt-4 text-cinematic-text-muted">Your destination for sustainable shopping</div>
        <div className="mt-8 w-16 h-1 bg-cinematic-accent mx-auto rounded animate-ping" />
      </div>
    </div>
  );
};

export default SplashScreen;