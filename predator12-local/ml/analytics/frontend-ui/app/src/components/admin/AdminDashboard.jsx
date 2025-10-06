import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [query, setQuery] = useState('');
    const [sessionId, setSessionId] = useState('default_session');
    const { analysisResult, setAnalysisResult, isLoading, setLoading, error, setError } = useStore();

    const handleSystemAnalysis = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/orchestrated-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query, session_id: sessionId }),
            });
            const data = await response.json();
            setSessionId(data.session_id);
            setAnalysisResult(data.message + ' (Session ID: ' + data.session_id + ')');
        } catch (error) {
            console.error('Error fetching orchestrated analysis:', error);
            setAnalysisResult('Error: Failed to connect to the server');
            setError('Failed to connect to the server');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let interval;
        if (sessionId && sessionId !== 'default_session') {
            interval = setInterval(async () => {
                try {
                    const response = await fetch(`/api/task-status/${sessionId}`);
                    const data = await response.json();
                    if (data.status === 'success') {
                        setAnalysisResult('Task completed: ' + JSON.stringify(data.result));
                        clearInterval(interval);
                    } else if (data.status === 'failure') {
                        setError('Task failed: ' + data.message);
                        clearInterval(interval);
                    } else {
                        setAnalysisResult('Task in progress... (Session ID: ' + sessionId + ')');
                    }
                } catch (error) {
                    console.error('Error checking task status:', error);
                    setError('Failed to check task status');
                    clearInterval(interval);
                }
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [sessionId, setAnalysisResult, setError]);

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden relative">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64 relative z-10 overflow-auto">
                <Header />
                <main className="flex-1 p-6 mt-16 bg-gray-900 bg-opacity-80 rounded-tl-lg shadow-lg border-t border-l border-gray-700 overflow-auto">
                    <h2 className="text-2xl font-bold text-blue-400 mb-6">Панель адміністратора</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* System Status Card */}
                        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-5">
                            <h3 className="text-lg font-semibold text-blue-300 mb-4">Статус системи</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Сервер API:</span>
                                    <span className="text-green-400 font-semibold">Активний</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">База даних:</span>
                                    <span className="text-green-400 font-semibold">Активна</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Модуль аналітики:</span>
                                    <span className="text-green-400 font-semibold">Активний</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Обробка черги:</span>
                                    <span className="text-yellow-400 font-semibold">Завантаження (76%)</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Admin Tools Card */}
                        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-5">
                            <h3 className="text-lg font-semibold text-blue-300 mb-4">Інструменти моніторингу</h3>
                            <div className="space-y-3">
                                <Link 
                                    to="/admin/websocket-monitor" 
                                    className="block w-full bg-blue-900 hover:bg-blue-800 text-white py-2 px-4 rounded text-center transition duration-300"
                                >
                                    <span className="flex items-center justify-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                        </svg>
                                        Моніторинг WebSocket з'єднань
                                    </span>
                                </Link>
                                <button className="block w-full bg-blue-900 hover:bg-blue-800 text-white py-2 px-4 rounded text-center transition duration-300">
                                    <span className="flex items-center justify-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                        </svg>
                                        Графіки продуктивності
                                    </span>
                                </button>
                                <button className="block w-full bg-blue-900 hover:bg-blue-800 text-white py-2 px-4 rounded text-center transition duration-300">
                                    <span className="flex items-center justify-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                        </svg>
                                        Управління користувачами
                                    </span>
                                </button>
                            </div>
                        </div>
                        
                        {/* ... existing cards ... */}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard; 