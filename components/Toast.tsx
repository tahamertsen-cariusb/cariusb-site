'use client';
import { useEffect, useState } from 'react';

type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed top-4 right-4 z-50 glass rounded-xl px-4 py-3 shadow-lg backdrop-blur-md"
      role="alert"
      style={{ animation: 'fadeInSlide 0.3s ease-in-out forwards' }}
    >
      <div className="flex items-center gap-2">
        <span className={type === 'error' ? 'text-red-400' : 'text-green-400'}>
          {type === 'error' ? '✕' : '✓'}
        </span>
        <span className="text-sm text-foreground">{message}</span>
      </div>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  return {
    toast,
    showToast,
    hideToast,
  };
}

