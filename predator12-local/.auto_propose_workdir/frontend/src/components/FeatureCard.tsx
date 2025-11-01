// @ts-nocheck
import React from 'react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        margin: '10px',
        width: '280px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e0e0e0',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 102, 204, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
      }}
    >
      <div style={{ fontSize: '40px', marginBottom: '15px' }}>{icon}</div>
      <h3 style={{ color: '#0066cc', marginBottom: '10px', fontSize: '20px' }}>{title}</h3>
      <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>{description}</p>
    </div>
  );
};
