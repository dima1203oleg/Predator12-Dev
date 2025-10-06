import React, { useState } from 'react';
import { useToast } from './ToastProvider';

/**
 * Demo component for showcasing toast notifications
 */
const ToastDemo = () => {
  const { addToast, clearToasts } = useToast();
  const [selectedAnimation, setSelectedAnimation] = useState('slide-right');
  
  const showBasicToast = (severity) => {
    addToast({
      title: `${severity.charAt(0).toUpperCase() + severity.slice(1)} сповіщення`,
      message: `Це демонстрація ${severity} сповіщення з автоматичним закриттям.`,
      severity: severity,
      animationStyle: selectedAnimation
    });
  };
  
  const showActionToast = () => {
    addToast({
      title: "Сповіщення з дією",
      message: "Це сповіщення містить кнопку дії, яка переспрямовує користувача.",
      severity: "success",
      animationStyle: selectedAnimation,
      action: {
        label: "Перейти до документації",
        url: "/dashboard"
      }
    });
  };
  
  const showLongToast = () => {
    addToast({
      title: "Довге сповіщення",
      message: "Це сповіщення містить дуже довгий текст, щоб продемонструвати, як компонент обробляє багаторядкові повідомлення. Текст автоматично переноситься на новий рядок, якщо він занадто довгий для відображення в одному рядку.",
      severity: "info",
      animationStyle: selectedAnimation
    });
  };
  
  const showMultipleToasts = () => {
    // Show 3 toasts in quick succession
    ["success", "warning", "error"].forEach((severity, index) => {
      setTimeout(() => {
        addToast({
          title: `Групове сповіщення #${index + 1}`,
          message: `Це частина групи сповіщень, які відображаються одне за одним.`,
          severity: severity,
          animationStyle: selectedAnimation
        });
      }, index * 500);
    });
  };
  
  const showCriticalToast = () => {
    addToast({
      title: "Критична помилка",
      message: "Виявлено критичну помилку в системі. Потрібна негайна увага.",
      severity: "critical",
      animationStyle: selectedAnimation,
      action: {
        label: "Переглянути деталі",
        url: "/admin"
      }
    });
  };
  
  // Demo animation styles
  const showAnimationDemo = () => {
    const animations = [
      { style: 'slide-right', label: 'Slide Right' },
      { style: 'slide-up', label: 'Slide Up' },
      { style: 'fade', label: 'Fade' },
      { style: 'bounce', label: 'Bounce' },
      { style: 'glitch', label: 'Glitch' }
    ];
    
    animations.forEach((anim, index) => {
      setTimeout(() => {
        addToast({
          title: `${anim.label} Animation`,
          message: `This is a demonstration of the ${anim.label} animation style for toast notifications.`,
          severity: "info",
          animationStyle: anim.style
        });
      }, index * 1000);
    });
  };
  
  const animationOptions = [
    { value: 'slide-right', label: 'Slide Right' },
    { value: 'slide-up', label: 'Slide Up' },
    { value: 'fade', label: 'Fade' },
    { value: 'bounce', label: 'Bounce' },
    { value: 'glitch', label: 'Glitch' }
  ];
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
      <h2 className="text-xl font-bold text-blue-400 mb-4">Демонстрація Toast сповіщень</h2>
      
      <div className="mb-5">
        <h3 className="text-white font-semibold mb-2">Стиль анімації:</h3>
        <div className="flex flex-wrap gap-2">
          {animationOptions.map(option => (
            <button 
              key={option.value}
              onClick={() => setSelectedAnimation(option.value)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                selectedAnimation === option.value 
                  ? 'bg-blue-700 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
          <button 
            onClick={showAnimationDemo}
            className="px-3 py-1 text-sm bg-indigo-700 hover:bg-indigo-600 text-white rounded ml-2"
          >
            Показати всі анімації
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Поточна анімація: <span className="text-blue-400">{animationOptions.find(o => o.value === selectedAnimation)?.label}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col space-y-3">
          <h3 className="text-white font-semibold">Базові типи сповіщень:</h3>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => showBasicToast('info')}
              className="px-3 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded"
            >
              Інфо
            </button>
            <button 
              onClick={() => showBasicToast('success')}
              className="px-3 py-1 bg-green-900 hover:bg-green-800 text-white rounded"
            >
              Успіх
            </button>
            <button 
              onClick={() => showBasicToast('warning')}
              className="px-3 py-1 bg-yellow-900 hover:bg-yellow-800 text-white rounded"
            >
              Попередження
            </button>
            <button 
              onClick={() => showBasicToast('error')}
              className="px-3 py-1 bg-red-900 hover:bg-red-800 text-white rounded"
            >
              Помилка
            </button>
            <button 
              onClick={showCriticalToast}
              className="px-3 py-1 bg-red-800 hover:bg-red-700 text-white rounded animate-pulse"
            >
              Критично
            </button>
          </div>
        </div>
        
        <div className="flex flex-col space-y-3">
          <h3 className="text-white font-semibold">Спеціальні сповіщення:</h3>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={showActionToast}
              className="px-3 py-1 bg-indigo-800 hover:bg-indigo-700 text-white rounded"
            >
              З дією
            </button>
            <button 
              onClick={showLongToast}
              className="px-3 py-1 bg-purple-800 hover:bg-purple-700 text-white rounded"
            >
              Довгий текст
            </button>
            <button 
              onClick={showMultipleToasts}
              className="px-3 py-1 bg-teal-800 hover:bg-teal-700 text-white rounded"
            >
              Група сповіщень
            </button>
            <button 
              onClick={clearToasts}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded"
            >
              Очистити всі
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-4 bg-gray-900 p-3 rounded border border-gray-600 text-gray-400 text-sm">
        <p>Сповіщення автоматично закриваються через 5 секунд, але ви можете:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Навести курсор, щоб призупинити закриття</li>
          <li>Клікнути на сповіщення, щоб закрити його</li>
          <li>Натиснути кнопку ✖ для закриття</li>
          <li>Клікнути на кнопку дії, якщо вона є</li>
        </ul>
      </div>
    </div>
  );
};

export default ToastDemo; 