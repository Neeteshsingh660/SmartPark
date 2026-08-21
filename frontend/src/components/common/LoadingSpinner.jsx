import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ label = 'Loading...', size = 28 }) => {
  return (
    <div className="spinner-wrapper">
      <Loader2 className="spinner-icon" size={size} />
      {label && <span className="spinner-label">{label}</span>}
      <style>{`
        .spinner-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 3rem 1.5rem;
          color: var(--primary);
        }
        .spinner-icon {
          animation: spin 1s linear infinite;
        }
        .spinner-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--secondary-muted);
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
