import { useState, useRef } from 'react';

type Msg = { role: 'user' | 'assistant', text: string };

interface ChatDockProps {
  apiUrl: string;
}

export default function ChatDock({ apiUrl }: ChatDockProps) {
  const [pending, setPending] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'assistant', text: 'Вітаю! Я AI помічник Predator Analytics. Питай мене про контрагентів, судові справи, зв\'язки... Я зв\'яжуся з потрібними агентами! 🎯' }
  ]);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const recRef = useRef<any>(null);
  const chatFeedRef = useRef<HTMLDivElement>(null);

  const send = async (text: string) => {
    if (!text.trim() || pending) return;

    setPending(true);
    setError(null);
    setMsgs(m => [...m, { role: 'user', text }]);
    setInput('');

    // Автоскрол
    setTimeout(() => {
      if (chatFeedRef.current) {
        chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
      }
    }, 100);

    try {
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, trace: true })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const reply = data.reply || data.response || 'Отримано відповідь від системи.';
      
      setMsgs(m => [...m, { role: 'assistant', text: reply }]);

      // TTS, якщо дозволено браузером
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(reply);
        u.lang = 'uk-UA';
        u.rate = 0.95;
        window.speechSynthesis.speak(u);
      }

      // Автоскрол
      setTimeout(() => {
        if (chatFeedRef.current) {
          chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
        }
      }, 100);

    } catch (e) {
      console.error('Помилка чату:', e);
      setError('⚠️ Помилка зʼєднання з бекендом. Перевірте, що сервер запущено на ' + apiUrl);
      setMsgs(m => [...m, { role: 'assistant', text: '⚠️ Помилка зʼєднання з бекендом. Перевірте, що сервер запущено на ' + apiUrl }]);
    } finally {
      setPending(false);
    }
  };

  const startVoice = () => {
    // Web Speech API (Chrome: webkitSpeechRecognition)
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SR) {
      alert('⚠️ Ваш браузер не підтримує розпізнавання мовлення. Спробуйте Chrome або Edge.');
      return;
    }

    const rec = new SR();
    rec.lang = 'uk-UA';
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      console.log('🎤 Розпізнано:', transcript);
      send(transcript);
    };

    rec.onerror = (e: any) => {
      console.error('Помилка розпізнавання:', e.error);
      rec.stop();
    };

    rec.onend = () => {
      console.log('🎤 Розпізнавання завершено');
    };

    recRef.current = rec;
    rec.start();
    console.log('🎤 Розпізнавання розпочато...');
  };

  return (
    <div className="chat-dock">
      <h3>💬 CHAT</h3>
      
      {/* Банер помилки чату */}
      {error && (
        <div className="chat-error-banner">
          {error}
        </div>
      )}

      {/* Лента повідомлень */}
      <div className="chat-feed" ref={chatFeedRef}>
        {msgs.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.text}
          </div>
        ))}
        {pending && <div className="msg assistant">Думаю…</div>}
      </div>

      {/* Контроли */}
      <div className="chat-controls">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Введи запит…"
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
          disabled={pending}
        />
        <button 
          onClick={() => send(input)} 
          disabled={pending || !input.trim()}
          title="Відправити (Enter)"
        >
          📤
        </button>
        <button 
          onClick={startVoice}
          disabled={pending}
          title="Голосове введення"
        >
          🎙️
        </button>
      </div>
    </div>
  );
}
