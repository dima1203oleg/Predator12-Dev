import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ToastDemo from '../components/Notifications/ToastDemo';

/**
 * Demo page for showcasing the toast notification system
 */
const ToastDemoPage = () => {
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden relative">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 relative z-10 overflow-auto">
        <Header />
        <main className="flex-1 p-6 mt-16 bg-gray-900 bg-opacity-80 rounded-tl-lg shadow-lg border-t border-l border-gray-700 overflow-auto">
          <h2 className="text-2xl font-bold text-blue-400 mb-6">Демонстрація системи сповіщень</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Toast demo component */}
            <ToastDemo />
            
            {/* Documentation section */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
              <h2 className="text-xl font-bold text-blue-400 mb-4">Документація</h2>
              
              <div className="prose prose-invert prose-sm max-w-none">
                <p>
                  Система сповіщень Predator Analytics підтримує два типи сповіщень:
                </p>
                
                <ul>
                  <li>
                    <strong>Panel notifications</strong> - постійні сповіщення, які зберігаються в панелі сповіщень
                  </li>
                  <li>
                    <strong>Toast notifications</strong> - тимчасові спливаючі сповіщення, які автоматично зникають
                  </li>
                </ul>
                
                <h3>Стилі анімації</h3>
                <p>Система підтримує різні стилі анімації для сповіщень:</p>
                
                <table className="min-w-full divide-y divide-gray-700 mt-2 mb-4">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase">Стиль</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase">Опис</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-900 divide-y divide-gray-800">
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-white">slide-right</td>
                      <td className="px-3 py-2 text-xs text-gray-300">Поява справа, стандартна анімація</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-white">slide-up</td>
                      <td className="px-3 py-2 text-xs text-gray-300">Поява знизу вгору</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-white">fade</td>
                      <td className="px-3 py-2 text-xs text-gray-300">Плавна поява з ефектом масштабування</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-white">bounce</td>
                      <td className="px-3 py-2 text-xs text-gray-300">Поява з ефектом пружини</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-white">glitch</td>
                      <td className="px-3 py-2 text-xs text-gray-300">Кіберпанк-ефект з глітчем</td>
                    </tr>
                  </tbody>
                </table>
                
                <h3>Як використовувати у компонентах:</h3>
                
                <pre className="bg-gray-900 p-3 rounded text-xs">
                  <code>{`
// Імпортуйте хук useToast
import { useToast } from '../components/Notifications/ToastProvider';

const YourComponent = () => {
  // Викличте хук у своєму компоненті
  const { addToast } = useToast();
  
  // Функція для показу сповіщення
  const showNotification = () => {
    addToast({
      title: "Заголовок сповіщення",
      message: "Текст повідомлення",
      severity: "success", // info, success, warning, error, critical
      animationStyle: "bounce", // slide-right, slide-up, fade, bounce, glitch
      action: {  // Опціонально
        label: "Текст кнопки",
        url: "/path/to/page"
      }
    });
  };
  
  return (
    <button onClick={showNotification}>
      Показати сповіщення
    </button>
  );
}`}
                  </code>
                </pre>
                
                <h3>Глобальне налаштування:</h3>
                <p>Для налаштування всіх сповіщень, модифікуйте провайдер:</p>
                
                <pre className="bg-gray-900 p-3 rounded text-xs">
                  <code>{`
<ToastProvider 
  position="top-right"
  autoCloseDelay={5000}
  animationStyle="bounce"
  theme="cyberpunk"
>
  <App />
</ToastProvider>
`}
                  </code>
                </pre>
                
                <h3>Підтримувані властивості:</h3>
                
                <table className="min-w-full divide-y divide-gray-700 mt-2">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase">Властивість</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase">Тип</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase">Опис</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-900 divide-y divide-gray-800">
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-white">title</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs">string</td>
                      <td className="px-3 py-2 text-xs text-gray-300">Заголовок сповіщення</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-white">message</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs">string</td>
                      <td className="px-3 py-2 text-xs text-gray-300">Текст повідомлення</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-white">severity</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs">string</td>
                      <td className="px-3 py-2 text-xs text-gray-300">Тип сповіщення (info, success, warning, error, critical)</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-white">animationStyle</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs">string</td>
                      <td className="px-3 py-2 text-xs text-gray-300">Стиль анімації (slide-right, slide-up, fade, bounce, glitch)</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-white">action</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs">object</td>
                      <td className="px-3 py-2 text-xs text-gray-300">Опціональна дія: {"{label, url, target}"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ToastDemoPage; 