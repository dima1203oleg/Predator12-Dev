import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

const CustomsSchemesPanel = () => {
    const [query, setQuery] = useState('');
    const [taskId, setTaskId] = useState(null);
    const { analysisResult, setAnalysisResult, isLoading, setLoading, error, setError } = useStore();

    const handleAnalyze = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/analyze-customs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });
            const data = await response.json();
            setTaskId(data.task_id);
            setAnalysisResult(data.message + ' (Task ID: ' + data.task_id + ')');
        } catch (error) {
            console.error('Error fetching customs schemes analysis:', error);
            setAnalysisResult('Error: Failed to connect to the server');
            setError('Failed to connect to the server');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let interval;
        if (taskId) {
            interval = setInterval(async () => {
                try {
                    const response = await fetch(`/api/task-status/${taskId}`);
                    const data = await response.json();
                    if (data.status === 'success') {
                        setAnalysisResult('Task completed: ' + JSON.stringify(data.result));
                        clearInterval(interval);
                    } else if (data.status === 'failure') {
                        setError('Task failed: ' + data.message);
                        clearInterval(interval);
                    } else {
                        setAnalysisResult('Task in progress... (Task ID: ' + taskId + ')');
                    }
                } catch (error) {
                    console.error('Error checking task status:', error);
                    setError('Failed to check task status');
                    clearInterval(interval);
                }
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [taskId, setAnalysisResult, setError]);

    return (
        <div className="p-6 bg-gray-900 text-white rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Customs Schemes Analysis</h2>
            <textarea 
                className="w-full p-2 mb-4 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your query for customs schemes analysis..."
                rows={4}
                disabled={isLoading}
            />
            <button 
                onClick={handleAnalyze}
                className={`w-full py-2 ${isLoading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md transition duration-200`}
                disabled={isLoading}
            >
                {isLoading ? 'Analyzing...' : 'Analyze Customs Schemes'}
            </button>
            {error && (
                <div className="mt-4 p-4 bg-red-800 rounded-md">
                    <h3 className="text-lg font-semibold mb-2">Error:</h3>
                    <p className="text-sm">{error}</p>
                </div>
            )}
            {analysisResult && !error && (
                <div className="mt-4 p-4 bg-gray-800 rounded-md">
                    <h3 className="text-lg font-semibold mb-2">Customs Schemes Analysis Result:</h3>
                    <p className="text-sm">{analysisResult}</p>
                </div>
            )}
        </div>
    );
};

export default CustomsSchemesPanel; 