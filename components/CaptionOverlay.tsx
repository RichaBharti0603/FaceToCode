import React, { useEffect, useState } from 'react';

interface CaptionOverlayProps {
  caption: string;
  isVisible: boolean;
}

export const CaptionOverlay: React.FC<CaptionOverlayProps> = ({ caption, isVisible }) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    if (isVisible) {
      // Typewriter effect
      let i = 0;
      setDisplayText('');
      const interval = setInterval(() => {
        setDisplayText(caption.slice(0, i + 1));
        i++;
        if (i >= caption.length) clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [caption, isVisible]);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: '40px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '80%',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      padding: '20px',
      color: 'var(--text-primary)',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '14px',
      lineHeight: '1.6',
      zIndex: 10,
      boxShadow: '0 0 20px rgba(0, 0, 0, 0.2)',
      borderRadius: '4px',
      pointerEvents: 'none',
      animation: 'slideUp 0.3s ease-out'
    }}>
      <div style={{ 
        fontSize: '10px', 
        marginBottom: '8px', 
        opacity: 0.7, 
        letterSpacing: '1px',
        textTransform: 'uppercase'
      }}>
        [ AI Visual Assessment ]
      </div>
      <div>{displayText}</div>
      <div style={{
        marginTop: '10px',
        height: '2px',
        background: 'var(--primary)',
        width: '100%',
        animation: 'pulse 1.5s infinite'
      }} />

      <style>{`
        @keyframes slideUp {
          from { transform: translate(-50%, 20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};
