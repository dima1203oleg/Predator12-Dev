import AIFace from './AIFace';

interface HeroHUDProps {
  events: string[];
}

export default function HeroHUD({ events }: HeroHUDProps) {
  return (
    <section className="hud">
      {/* Заголовок з брендом */}
      <div className="hud-head">
        <h1 className="brand">
          PREDATOR <span>ANALYTICS</span>
        </h1>
        <AIFace />
      </div>

      {/* Стрічка ризиків */}
      <div className="risk-ticker">
        <span className="risk-label">⚠️ ВИЯВЛЕНО РИЗИК:</span>
        <span className="risk-text">
          контрагент X пов'язаний із санкційною фірмою
        </span>
      </div>

      {/* Події агентів */}
      <aside className="hud-events">
        <h3>🤖 AGENT EVENTS</h3>
        <ul>
          {events.length > 0 ? (
            events.map((e, i) => <li key={i}>{e}</li>)
          ) : (
            <>
              <li>Очікування подій від агентів...</li>
              <li>Router Agent: Готовий до обробки</li>
              <li>Law Agent: Підключено до бази законів</li>
              <li>Court Agent: Моніторинг судових справ</li>
            </>
          )}
        </ul>
      </aside>
    </section>
  );
}
