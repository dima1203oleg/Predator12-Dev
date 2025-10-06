import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationManager from './Notifications/NotificationManager';
import { useToast } from './Notifications/ToastProvider';

const Header = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToast();

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleLogout = () => {
        // Placeholder for logout logic
        alert('Logging out...');
        navigate('/');
    };

    const handleSettings = () => {
        // Placeholder for settings logic
        alert('Opening settings...');
    };
    
    const showDemoToast = (severity) => {
        const toastData = {
            title: `${severity.charAt(0).toUpperCase() + severity.slice(1)} сповіщення`,
            message: `Це демонстрація ${severity} сповіщення з автоматичним закриттям.`,
            severity: severity,
        };
        
        // Add action for success toasts
        if (severity === 'success') {
            toastData.action = {
                label: 'Перейти до документації',
                url: '/dashboard'
            };
        }
        
        addToast(toastData);
    };

    return (
        <header className="fixed w-full bg-black bg-opacity-80 backdrop-blur-sm top-0 left-0 right-0 z-20 border-b border-gray-800 pl-64">
            <div className="flex justify-between items-center px-6 py-3">
                <div className="flex items-center">
                    <h1 className="text-xl font-bold text-blue-400 font-orbitron">Predator Analytics</h1>
                    
                    <div className="ml-6 flex space-x-2">
                        <button 
                            onClick={() => showDemoToast('info')}
                            className="px-2 py-1 text-xs bg-blue-900 hover:bg-blue-800 text-white rounded"
                        >
                            Інфо
                        </button>
                        <button 
                            onClick={() => showDemoToast('success')}
                            className="px-2 py-1 text-xs bg-green-900 hover:bg-green-800 text-white rounded"
                        >
                            Успіх
                        </button>
                        <button 
                            onClick={() => showDemoToast('warning')}
                            className="px-2 py-1 text-xs bg-yellow-900 hover:bg-yellow-800 text-white rounded"
                        >
                            Увага
                        </button>
                        <button 
                            onClick={() => showDemoToast('error')}
                            className="px-2 py-1 text-xs bg-red-900 hover:bg-red-800 text-white rounded"
                        >
                            Помилка
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center space-x-4">
                    <NotificationManager />
                    
                    <div className="flex items-center text-gray-300 hover:text-blue-400 cursor-pointer">
                        <span className="mr-2 text-sm">Аналітик</span>
                        <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center text-white">
                            A
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header; 