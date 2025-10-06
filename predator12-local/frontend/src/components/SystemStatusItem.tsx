// @ts-nocheck
import React from 'react';

interface SystemStatusItemProps {
  icon: string;
  label: string;
  status: string;
}

export const SystemStatusItem: React.FC<SystemStatusItemProps> = ({ icon, label, status }) => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      padding: '15px 25px',
      borderRadius: '10px',
      border: '2px solid #0ea5e9',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '16px',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'scale(1.05)';
      e.currentTarget.style.borderColor = '#0066cc';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.borderColor = '#0ea5e9';
    }}>
      <span style={{ fontSize: '24px' }}>{icon}</span>
      <span style={{ fontWeight: '600', color: '#333' }}>{label}:</span>
      <span style={{ color: '#10b981', fontWeight: 'bold' }}>{status}</span>
    </div>
  );
};
