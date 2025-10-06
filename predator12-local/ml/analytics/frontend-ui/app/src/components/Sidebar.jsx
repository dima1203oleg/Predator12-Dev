import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [expanded, setExpanded] = useState(true);

    const toggleSidebar = () => {
        setExpanded(!expanded);
    };

    const navItems = [
        { path: '/dashboard', label: 'Міст Ядра', icon: '🌐' },
        { path: '/ai-supervisor', label: 'Вулик ШІ', icon: '🧠' },
        { path: '/data-ops', label: 'Фабрика Даних', icon: '📊' },
        { path: '/intelligence-feed', label: 'Потік Оракула', icon: '🔔' },
        { path: '/network-intelligence', label: 'Нейронна Карта', icon: '🔗' },
        { path: '/opensearch', label: 'Аналітична Палуба', icon: '🔍' },
        { path: '/chrono-spatial', label: 'Хроно-Простір', icon: '🌍' },
        { path: '/reality-simulator', label: 'Симулятор Реальностей', icon: '🌀' },
        { path: '/notification-demo', label: 'Система Сповіщень', icon: '📢' },
        { path: '/admin', label: 'Святилище Архітектора', icon: '🔒' },
    ];

    return (
        <aside
            className={`fixed top-0 left-0 h-full bg-gray-900 bg-opacity-90 shadow-lg border-r border-gray-700 z-20 transition-all duration-300 ${expanded ? 'w-64' : 'w-16'}`}
        >
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h1 className={`font-bold text-blue-400 transition-opacity ${expanded ? 'opacity-100' : 'opacity-0'}`}>Nexus Core</h1>
                <button onClick={toggleSidebar} className="text-gray-300 hover:text-white transition duration-200">
                    {expanded ? '◀' : '▶'}
                </button>
            </div>
            <nav className="p-2 overflow-y-auto h-[calc(100vh-60px)] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`w-full flex items-center px-4 py-3 mb-2 rounded-lg transition duration-200 text-left border ${expanded ? 'justify-start' : 'justify-center'} ${location.pathname === item.path ? 'bg-blue-800 text-blue-400 border-blue-700' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700'}`}
                    >
                        <span className="text-lg">{item.icon}</span>
                        {expanded && <span className="ml-3 font-medium">{item.label}</span>}
                    </button>
                ))}
                <div className="mt-6 pt-4 border-t border-gray-700">
                    <button
                        onClick={() => navigate('/')}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition duration-200 text-left border ${expanded ? 'justify-start' : 'justify-center'} bg-red-800 text-red-300 hover:bg-red-700 border-red-700`}
                    >
                        <span className="text-lg">🚪</span>
                        {expanded && <span className="ml-3 font-medium">Вихід</span>}
                    </button>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar; 