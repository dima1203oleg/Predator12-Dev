import { useEffect, useRef, useState } from 'react';
import HeroHUD from '../components/Hero/HeroHUD';
import ChatDock from '../components/Hero/ChatDock';
import NetworkMini from '../components/Hero/NetworkMini';
import '../styles/hero.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function Home() {
  const [events, setEvents] = useState<string[]>([]);
  const [sseError, setSseError] = useState<string | null>(null);
  const evtRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Підписка на події агентів (SSE)
    const es = new EventSource(`${API_URL}/api/events`);
    evtRef.current = es;
    
    es.onmessage = (e) => {
      console.log('📡 Подія агента:', e.data);
      setEvents((prev) => [e.data, ...prev].slice(0, 10));
      setSseError(null);
    };
    
    es.onerror = (err) => {
      console.warn('⚠️ SSE помилка:', err);
      setSseError('⚠️ Втрачено звʼязок з сервером подій. Перевірте мережу або перезапустіть бекенд.');
      es.close();
      evtRef.current = null;
      
      // Спроба перепідключення через 5 секунд
      setTimeout(() => {
        if (!evtRef.current) {
          console.log('🔄 Перепідключення до SSE...');
          window.location.reload();
        }
      }, 5000);
    };
    
    return () => {
      if (evtRef.current) {
        evtRef.current.close();
      }
    };
  }, []);

  return (
    <main className="hero-root">
      {/* Банер помилки SSE/network */}
      {sseError && (
        <div className="hero-error-banner">
          {sseError}
        </div>
      )}
      {/* Фоновий шар з градієнтами */}
      <div className="hero-bg" />
      
      {/* Головна сітка */}
      <div className="hero-grid">
        {/* Ліва панель: HUD + AI Face */}
        <HeroHUD events={events} />
        
        {/* Права панель: Чат + Мережа */}
        <section className="hero-panels">
          <ChatDock apiUrl={API_URL} />
          <NetworkMini />
        </section>
      </div>
    </main>
  );
}
