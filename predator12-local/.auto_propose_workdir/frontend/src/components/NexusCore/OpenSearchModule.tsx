// @ts-nocheck
import React from 'react';
import OpenSearchWrapper from '../nexus_visuals/OpenSearchWrapper';

export const OpenSearchModule: React.FC = () => {
  const dashboardId = process.env.REACT_APP_OPENSEARCH_DEFAULT_DASHBOARD || 'Overview';
  const jwtToken = localStorage.getItem('jwt') || '';

  return (
    <OpenSearchWrapper dashboardId={dashboardId} jwtToken={jwtToken} />
  );
};
