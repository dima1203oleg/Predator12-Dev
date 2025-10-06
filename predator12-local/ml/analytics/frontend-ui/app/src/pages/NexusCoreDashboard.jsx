import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import HolographicDataSphere from '../components/HolographicDataSphere';
import QuantumParticleStream from '../components/QuantumParticleStream';

const NexusCoreDashboard = () => {
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden relative">
      <QuantumParticleStream />
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 relative z-10 overflow-auto">
        <Header />
        <main className="flex-1 p-6 mt-16 bg-gray-900 bg-opacity-80 rounded-tl-lg shadow-lg border-t border-l border-gray-700 overflow-auto">
          <h2 className="text-2xl font-bold text-blue-400 mb-6">Міст Управління Ядром</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-4 rounded-lg shadow-inner border border-gray-700">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">Квантові Події</h3>
              <div className="text-3xl text-white">127</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow-inner border border-gray-700">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">Галактичні Ризики</h3>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow-inner border border-gray-700 col-span-1 md:col-span-2 lg:col-span-3">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">Сфера Системи</h3>
              <HolographicDataSphere />
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow-inner border border-gray-700">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">Телепортація Даних</h3>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '67%' }}></div>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow-inner border border-gray-700 col-span-1 md:col-span-2 lg:col-span-2 row-span-2">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">Хроніка Аномалій</h3>
              <div className="space-y-2 text-gray-300 text-sm overflow-auto h-32 md:h-auto">
                <p>[14:32:05] Аномалія виявлена в секторі 7G</p>
                <p>[14:30:12] Підвищена активність у вузлі 23</p>
                <p>[14:28:45] Попередження: нестабільність ядра</p>
                <p>[14:25:10] Сканування завершено, 3 загрози</p>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow-inner border border-gray-700">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">Нейронна Мережа</h3>
              <div className="text-gray-300">Активність: 87%</div>
            </div>
          </div>
          <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-inner border border-gray-700">
            <h3 className="text-lg font-semibold text-emerald-400 mb-4">Швидкі Дії</h3>
            <div className="flex flex-wrap gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded border border-blue-800 transition duration-200">Запустити Агентів</button>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded border border-emerald-800 transition duration-200">Аналітика</button>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded border border-red-800 transition duration-200">Протоколи Безпеки</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NexusCoreDashboard; 