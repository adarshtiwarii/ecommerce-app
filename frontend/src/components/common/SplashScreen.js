// src/components/common/SplashScreen.js
import { useEffect, useState } from 'react';

const PARTICLES = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 2.5,
  size: Math.random() * 3 + 1.5,
  duration: Math.random() * 3 + 3,
}));

const SplashScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const start = Date.now();
    const iv = setInterval(() => {
      const p = Math.min(((Date.now() - start) / 2400) * 100, 100);
      setProgress(p);
      if (p >= 100) clearInterval(iv);
    }, 16);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => { if (onFinish) onFinish(); }, 500);
    }, 2800);
    return () => clearTimeout(t);
  }, [onFinish]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: '#060606',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, overflow: 'hidden',
        transition: 'opacity 0.5s ease',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {/* diagonal stripe bg */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.025, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(135deg,#22C55E 0px,#22C55E 1px,transparent 1px,transparent 36px)',
      }} />

      {/* central glow */}
      <div style={{
        position: 'absolute',
        width: 480, height: 480, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,197,94,0.10) 0%, transparent 70%)',
        pointerEvents: 'none', animation: 'pulse 2.5s ease-in-out infinite',
      }} />

      {/* floating particles */}
      {PARTICLES.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.left}%`, bottom: '-10px',
          width: p.size, height: p.size, borderRadius: '50%',
          background: '#22C55E', opacity: 0.35,
          animation: `floatUp ${p.duration}s ${p.delay}s linear infinite`,
        }} />
      ))}

      {/* Logo circle */}
      <div style={{
        width: 110, height: 110, borderRadius: '50%',
        background: '#111827',
        border: '2px solid rgba(34,197,94,0.30)',
        boxShadow: '0 0 50px rgba(34,197,94,0.20), 0 0 100px rgba(34,197,94,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 28, position: 'relative',
        animation: 'fadeScaleIn 0.6s ease forwards',
      }}>
        <img
          src="/logo.png"
          alt="EcoMart"
          style={{ width: '78%', height: '78%', objectFit: 'contain',
            filter: 'drop-shadow(0 0 8px rgba(34,197,94,0.45))' }}
          onError={e => {
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML += '<span style="font-size:48px">🛒</span>';
          }}
        />
        {/* spinning ring */}
        <div style={{
          position: 'absolute', inset: -8, borderRadius: '50%',
          border: '1.5px solid transparent',
          borderTopColor: 'rgba(34,197,94,0.60)',
          borderRightColor: 'rgba(34,197,94,0.20)',
          animation: 'spin 7s linear infinite',
        }} />
      </div>

      {/* Brand name */}
      <div style={{ display: 'flex', overflow: 'hidden', marginBottom: 10 }}>
        {'ecomart'.split('').map((char, i) => (
          <span key={i} style={{
            fontFamily: 'Syne, system-ui',
            fontSize: 52, fontWeight: 800,
            color: i < 3 ? '#22C55E' : '#F3F4F6',
            letterSpacing: '-0.02em', display: 'inline-block',
            animation: `slideUp 0.5s ${0.35 + i * 0.06}s both`,
          }}>{char}</span>
        ))}
      </div>

      {/* Tagline */}
      <p style={{
        fontFamily: 'DM Sans, system-ui',
        fontSize: 12, color: '#4B5563',
        letterSpacing: '0.12em', textTransform: 'uppercase',
        marginBottom: 52,
        animation: 'fadeIn 0.5s 0.9s both',
      }}>
        Sustainable Choices · Delivered Fast
      </p>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 2, background: 'rgba(34,197,94,0.08)',
      }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: 'linear-gradient(90deg,#22C55E,#4ADE80)',
          boxShadow: '0 0 10px rgba(34,197,94,0.80)',
          transition: 'width 0.016s linear', borderRadius: '0 2px 2px 0',
        }} />
      </div>

      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0);    opacity: 0; }
          10%  { opacity: 0.35; }
          90%  { opacity: 0.35; }
          100% { transform: translateY(-110vh); opacity: 0; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes pulse {
          0%,100% { opacity: 0.6; transform: scale(1); }
          50%     { opacity: 1;   transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
