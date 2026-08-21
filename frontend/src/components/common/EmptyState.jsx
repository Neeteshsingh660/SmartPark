import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There is no data available to display right now.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="empty-state-card">
      <div className="empty-icon-circle">
        <Icon size={32} />
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-description">{description}</p>
      {actionLabel && onAction && (
        <button className="btn btn-primary btn-sm" onClick={onAction}>
          {actionLabel}
        </button>
      )}

      <style>{`
        .empty-state-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 3.5rem 2rem;
          background: #ffffff;
          border: 1px dashed var(--border-medium);
          border-radius: var(--radius-lg);
          margin: 1.5rem 0;
        }
        .empty-icon-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--primary-soft);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }
        .empty-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--secondary);
          margin-bottom: 0.4rem;
        }
        .empty-description {
          font-size: 0.92rem;
          color: var(--secondary-muted);
          max-width: 400px;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};
