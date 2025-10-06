// @ts-nocheck
import React from 'react';

interface StatusCardProps {
  icon: string;
  title: string;
  value: string | number;
  color: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({ icon, title, value, color }) => {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        borderRadius: '15px',
        padding: '25px',
        margin: '10px',
        minWidth: '200px',
        boxShadow: '0 4px 15px rgba(0, 102, 204, 0.1)',
        border: '2px solid #e3f2fd',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 102, 204, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 102, 204, 0.1)';
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: '10px' }}>{icon}</div>
      <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>{title}</div>
      <div style={{ fontSize: '28px', fontWeight: 'bold', color: color }}>{value}</div>
    </div>
  );
};
