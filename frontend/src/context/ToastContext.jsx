import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Bell } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-card toast-${toast.type} animate-fade`}>
            <div className="toast-icon">
              {toast.type === 'success' && <CheckCircle2 size={20} className="text-emerald-500" />}
              {toast.type === 'error' && <AlertCircle size={20} className="text-rose-500" />}
              {toast.type === 'info' && <Info size={20} className="text-teal-500" />}
              {toast.type === 'realtime' && <Bell size={20} className="text-amber-500 animate-bounce" />}
            </div>
            <div className="toast-message">{toast.message}</div>
            <button onClick={() => removeToast(toast.id)} className="toast-close">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        .toast-container {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-width: 400px;
          width: calc(100% - 4rem);
          pointer-events: none;
        }
        .toast-card {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1.1rem;
          background: #ffffff;
          border-radius: var(--radius-md);
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.12), 0 8px 10px -6px rgba(0,0,0,0.08);
          border: 1px solid var(--border-light);
          font-size: 0.9rem;
          color: var(--secondary);
        }
        .toast-success { border-left: 4px solid var(--accent-emerald); }
        .toast-error { border-left: 4px solid var(--accent-rose); }
        .toast-info { border-left: 4px solid var(--primary); }
        .toast-realtime { border-left: 4px solid var(--accent-amber); background: #fffbeb; }
        .toast-message { flex: 1; font-weight: 500; }
        .toast-close { background: none; border: none; cursor: pointer; color: var(--secondary-muted); }
        .toast-close:hover { color: var(--secondary); }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
