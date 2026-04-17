import React, { useEffect, useState } from 'react';

/**
 * Global toast notification system for FaceToCode
 */
export interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface ToasterProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

export const Toaster: React.FC<ToasterProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-full max-w-xs px-4 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(toast.id), 500); // Wait for fade out
    }, 2500);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div 
      className={`
        bg-pink-500 text-white px-8 py-3 rounded-full shadow-[0_10px_40px_rgba(244,114,182,0.3)]
        font-sans text-[10px] font-black uppercase tracking-[0.3em] text-center
        transition-all duration-500 border border-pink-400
        ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'}
      `}
    >
      {toast.message}
    </div>
  );
};
