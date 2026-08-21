import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = '540px' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content animate-fade" 
        style={{ maxWidth }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          {title && <h3 className="modal-title">{title}</h3>}
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }
        .modal-content {
          background: #ffffff;
          width: 100%;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-light);
          overflow: hidden;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border-light);
        }
        .modal-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--secondary);
        }
        .modal-close-btn {
          background: #f1f5f9;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--secondary-muted);
          transition: all 0.2s;
        }
        .modal-close-btn:hover {
          background: #e2e8f0;
          color: var(--secondary);
        }
        .modal-body {
          padding: 1.5rem;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};
