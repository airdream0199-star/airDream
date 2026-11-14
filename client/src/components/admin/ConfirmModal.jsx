import React from 'react';

export default function ConfirmModal({ isOpen, title = 'Confirm Action', message, onConfirm, onCancel, confirmText = 'Delete', isDanger = true }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(11, 25, 44, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '440px',
          width: '100%',
          padding: '24px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: isDanger ? '#fee2e2' : '#e0f2fe',
              color: isDanger ? '#dc2626' : '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              flexShrink: 0,
            }}
          >
            <i className={`fa-solid ${isDanger ? 'fa-triangle-exclamation' : 'fa-circle-info'}`}></i>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>{title}</h3>
        </div>

        <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5 }}>
          {message || 'Are you sure you want to proceed with this operation?'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              color: '#475569',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.88rem',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: isDanger ? '#dc2626' : '#0284c7',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.88rem',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
