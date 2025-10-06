import React from 'react';

const OpenSearchWrapper = () => {
  return (
    <div className="w-full h-full bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center bg-gray-800 bg-opacity-80 z-10 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-blue-400">Аналітична Палуба (OpenSearch Dashboard)</h3>
        <div className="flex space-x-2">
          <select className="bg-gray-700 text-gray-300 rounded p-1 text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Dashboard 1</option>
            <option>Dashboard 2</option>
            <option>Dashboard 3</option>
          </select>
          <button className="text-sm text-gray-300 hover:text-blue-400 transition duration-200">Filters</button>
        </div>
      </div>
      <iframe
        src="/opensearch-dashboards"
        title="OpenSearch Dashboard"
        className="w-full h-full border-none mt-14"
        style={{ backgroundColor: '#05070A' }}
      />
      <div className="absolute bottom-0 left-0 w-full p-2 text-center text-xs text-gray-400 bg-gray-800 bg-opacity-70 border-t border-gray-700">
        Secured by Keycloak SSO Integration
      </div>
    </div>
  );
};

export default OpenSearchWrapper; 