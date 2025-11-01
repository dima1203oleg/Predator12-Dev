#!/bin/bash

echo "🔧 Перебудова фронтенду для діагностики чорного екрану..."

# Перехід до папки фронтенду
cd /Users/dima/Documents/Predator12/predator12-local/frontend

# Створення резервної копії оригінального main.tsx
cp src/main.tsx src/main-original.tsx

# Створення простого тестового main.tsx
cat > src/main.tsx << 'EOF'
// @ts-nocheck
import React from 'react';
import ReactDOM from 'react-dom/client';

const SimpleApp = () => {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      color: '#000000',
      padding: '50px',
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh'
    }}>
      <h1 style={{color: '#0066cc'}}>🚀 Predator Frontend Test</h1>
      <p>✅ Якщо ви бачите цей текст, React працює!</p>
      <p>🕐 Час: {new Date().toLocaleString()}</p>
      <p>🔍 Діагностика: Тестовий компонент завантажений успішно</p>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<SimpleApp />);
EOF

echo "✅ Тестовий main.tsx створено"

# Перебудова
echo "🔨 Перебудова фронтенду..."
npm run build

echo "🐳 Перебудова Docker контейнера..."
cd /Users/dima/Documents/Predator12/predator12-local
docker-compose build --no-cache frontend

echo "🚀 Перезапуск контейнера..."
docker-compose up -d frontend

echo "✅ Готово! Перевірте http://localhost:3000"
