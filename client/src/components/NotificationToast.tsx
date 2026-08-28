import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../api';
import { User } from '../types';
import { Beef, Flame, X, Sparkles, Bell } from 'lucide-react';

interface NotificationToastProps {
  user: User;
}

interface ToastItem {
  id: string;
  productName: string;
  changeType: 'ADD' | 'REMOVE' | 'ADJUST';
  quantityChanged: number;
  newStock: number;
  adjustedBy: string;
  reason: string;
  timestamp: string;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ user }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    // Only connect EventSource if user is logged in
    if (!user) return;

    const streamUrl = notificationsAPI.getStreamUrl();
    const eventSource = new EventSource(streamUrl);

    eventSource.addEventListener('stock_update', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        
        // Add new toast to list
        const newToast: ToastItem = {
          id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          productName: payload.productName,
          changeType: payload.changeType,
          quantityChanged: payload.quantityChanged,
          newStock: payload.newStock,
          adjustedBy: payload.adjustedBy,
          reason: payload.reason,
          timestamp: payload.timestamp
        };

        setToasts((prev) => [newToast, ...prev].slice(0, 3)); // Keep max 3 toasts at a time

        // Set timeout to remove toast
        setTimeout(() => {
          removeToast(newToast.id);
        }, 6000);
      } catch (err) {
        console.error('Failed to parse stock update SSE event:', err);
      }
    });

    eventSource.onerror = (err) => {
      console.error('EventSource connection failed, retrying in 5 seconds...', err);
    };

    return () => {
      eventSource.close();
    };
  }, [user]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const isAdd = toast.changeType === 'ADD';
        const isRemove = toast.changeType === 'REMOVE';
        
        // Dynamic labels and styles
        let badgeText = 'ADJUSTED';
        let badgeColor = 'bg-stone-800 text-stone-300 border-stone-700';
        let titleColor = 'text-white';
        let actionSymbol = '•';

        if (isAdd) {
          badgeText = 'STOCK ADDED';
          badgeColor = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40';
          actionSymbol = '+';
        } else if (isRemove) {
          badgeText = 'STOCK REMOVED';
          badgeColor = 'bg-red-950/60 text-red-400 border-red-800/40';
          actionSymbol = '-';
        }

        return (
          <div
            key={toast.id}
            className="pointer-events-auto w-full glass-panel p-4 rounded-2xl border border-red-900/40 bg-gradient-to-r from-red-950/30 via-stone-900/95 to-stone-950/95 shadow-2xl shadow-red-950/50 transform translate-y-0 transition-all duration-300 animate-slide-in flex gap-3 relative overflow-hidden"
          >
            {/* Ambient side indicator bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
              isAdd ? 'bg-emerald-500' : isRemove ? 'bg-red-500' : 'bg-amber-500'
            }`} />

            {/* Left side Icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isAdd ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}>
              <Beef className="w-5 h-5 animate-pulse" />
            </div>

            {/* Content section */}
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold font-mono tracking-wider border ${badgeColor}`}>
                  {badgeText}
                </span>
                <span className="text-[9px] text-stone-500 font-mono">
                  {new Date(toast.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              <h4 className={`text-xs font-black truncate tracking-tight ${titleColor}`}>
                {toast.productName}
              </h4>

              <p className="text-[11px] text-stone-400 mt-1 leading-snug">
                Adjusted by <span className="font-extrabold text-stone-200">{toast.adjustedBy}</span>: 
                <span className={`font-bold ml-1 ${isAdd ? 'text-emerald-400' : isRemove ? 'text-red-400' : 'text-amber-400'}`}>
                  {actionSymbol}{toast.quantityChanged} units
                </span>
              </p>

              <div className="mt-2 pt-1.5 border-t border-stone-800 flex justify-between items-center text-[10px] font-mono text-stone-500">
                <span>New Stock: <span className="font-bold text-stone-300">{toast.newStock}</span></span>
                <span className="truncate max-w-[150px]" title={toast.reason}>Reason: {toast.reason}</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute top-3 right-3 text-stone-500 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
