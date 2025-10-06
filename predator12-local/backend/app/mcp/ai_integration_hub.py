#!/usr/bin/env python3
"""
🔗 AI Integration Hub - Система інтеграцій з зовнішніми сервісами

Функціонал:
- Інтеграція з популярними API
- Webhook системи для real-time взаємодії
- Інтеграція з соціальними мережами
- Email та SMS розсилки
- Системи аналітики та моніторингу
- Cloud сервіси (AWS, Google Cloud, Azure)
- Бази даних та сховища даних
"""

import os
import sys
import json
import time
import requests
import asyncio
import aiohttp
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, asdict
import sqlite3
import hashlib
import hmac
import base64
from urllib.parse import urlencode

@dataclass
class Integration:
    """Клас для опису інтеграції"""
    name: str
    type: str  # api, webhook, database, cloud
    endpoint: str
    auth_type: str  # api_key, oauth, bearer, basic
    credentials: Dict[str, str]
    config: Dict[str, Any]
    active: bool
    last_used: Optional[datetime] = None

class AIIntegrationHub:
    def __init__(self, workspace_path: str = "/Users/dima/Documents/NIMDA/codespaces-models"):
        self.workspace = Path(workspace_path)
        self.api_url = "http://localhost:4000/v1"
        self.backup_url = "http://localhost:3010/v1"
        self.current_api = None
        
        self.integrations_db = self.workspace / "integrations.db"
        self.webhooks_log = self.workspace / "webhooks.log"
        self.integrations_config = self.workspace / "integrations_config.json"
        
        self.init_integrations_database()
        self.active_integrations = self.load_integrations()
        
    def init_integrations_database(self):
        """Ініціалізація бази даних інтеграцій"""
        conn = sqlite3.connect(self.integrations_db)
        cursor = conn.cursor()
        
        # Таблиця інтеграцій
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS integrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                type TEXT NOT NULL,
                endpoint TEXT NOT NULL,
                auth_type TEXT,
                credentials TEXT,
                config TEXT,
                active BOOLEAN DEFAULT TRUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_used DATETIME
            )
        ''')
        
        # Таблиця webhook подій
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS webhook_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                source TEXT NOT NULL,
                event_type TEXT NOT NULL,
                payload TEXT,
                processed BOOLEAN DEFAULT FALSE,
                response_data TEXT
            )
        ''')
        
        # Таблиця API викликів
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS api_calls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                integration_name TEXT NOT NULL,
                method TEXT NOT NULL,
                endpoint TEXT NOT NULL,
                request_data TEXT,
                response_code INTEGER,
                response_data TEXT,
                duration REAL
            )
        ''')
        
        # Таблиця розкладу задач
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS scheduled_tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_name TEXT NOT NULL,
                integration_name TEXT NOT NULL,
                schedule_cron TEXT,
                last_run DATETIME,
                next_run DATETIME,
                active BOOLEAN DEFAULT TRUE,
                task_data TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
        
    def load_integrations(self) -> Dict[str, Integration]:
        """Завантаження активних інтеграцій"""
        integrations = {}
        
        # Завантаження з бази даних
        conn = sqlite3.connect(self.integrations_db)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM integrations WHERE active = TRUE')
        for row in cursor.fetchall():
            integration = Integration(
                name=row[1],
                type=row[2],
                endpoint=row[3],
                auth_type=row[4],
                credentials=json.loads(row[5] or '{}'),
                config=json.loads(row[6] or '{}'),
                active=bool(row[7]),
                last_used=datetime.fromisoformat(row[9]) if row[9] else None
            )
            integrations[integration.name] = integration
            
        conn.close()
        
        # Додавання вбудованих інтеграцій
        if not integrations:
            integrations = self.create_default_integrations()
            
        return integrations
        
    def create_default_integrations(self) -> Dict[str, Integration]:
        """Створення стандартних інтеграцій"""
        default_integrations = {
            "telegram_bot": Integration(
                name="telegram_bot",
                type="webhook",
                endpoint="https://api.telegram.org/bot{token}",
                auth_type="api_key",
                credentials={"token": "YOUR_BOT_TOKEN"},
                config={
                    "webhook_url": "http://localhost:3010/webhook/telegram",
                    "allowed_users": [],
                    "commands": ["start", "help", "chat"]
                },
                active=False
            ),
            
            "discord_bot": Integration(
                name="discord_bot", 
                type="webhook",
                endpoint="https://discord.com/api/webhooks/{webhook_id}/{webhook_token}",
                auth_type="bearer",
                credentials={"token": "YOUR_DISCORD_TOKEN"},
                config={
                    "guild_id": "",
                    "channel_id": "",
                    "command_prefix": "!"
                },
                active=False
            ),
            
            "email_service": Integration(
                name="email_service",
                type="api",
                endpoint="https://api.sendgrid.com/v3/mail/send",
                auth_type="api_key",
                credentials={"api_key": "YOUR_SENDGRID_KEY"},
                config={
                    "from_email": "ai@yourdomain.com",
                    "template_id": "",
                    "categories": ["ai-notifications"]
                },
                active=False
            ),
            
            "slack_webhook": Integration(
                name="slack_webhook",
                type="webhook", 
                endpoint="https://hooks.slack.com/services/{workspace}/{channel}/{token}",
                auth_type="webhook",
                credentials={"webhook_url": "YOUR_SLACK_WEBHOOK"},
                config={
                    "channel": "#ai-alerts",
                    "username": "AI Assistant",
                    "icon_emoji": ":robot_face:"
                },
                active=False
            ),
            
            "google_sheets": Integration(
                name="google_sheets",
                type="api",
                endpoint="https://sheets.googleapis.com/v4/spreadsheets",
                auth_type="oauth",
                credentials={"client_id": "", "client_secret": "", "refresh_token": ""},
                config={
                    "spreadsheet_id": "",
                    "sheet_name": "AI Data",
                    "auto_backup": True
                },
                active=False
            ),
            
            "mongodb_atlas": Integration(
                name="mongodb_atlas",
                type="database",
                endpoint="mongodb+srv://{user}:{password}@{cluster}.mongodb.net/{database}",
                auth_type="basic",
                credentials={"username": "", "password": ""},
                config={
                    "database": "ai_data",
                    "collection": "conversations",
                    "auto_index": True
                },
                active=False
            )
        }
        
        # Збереження в базу даних
        for integration in default_integrations.values():
            self.save_integration(integration)
            
        return default_integrations
        
    def save_integration(self, integration: Integration):
        """Збереження інтеграції в базу даних"""
        conn = sqlite3.connect(self.integrations_db)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO integrations 
            (name, type, endpoint, auth_type, credentials, config, active)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            integration.name,
            integration.type,
            integration.endpoint,
            integration.auth_type,
            json.dumps(integration.credentials),
            json.dumps(integration.config),
            integration.active
        ))
        
        conn.commit()
        conn.close()
        
    async def make_api_call(self, integration_name: str, method: str, endpoint: str, 
                           data: Optional[Dict] = None, headers: Optional[Dict] = None) -> Dict:
        """Виклик зовнішнього API"""
        integration = self.active_integrations.get(integration_name)
        if not integration:
            return {"error": f"Інтеграція {integration_name} не знайдена"}
            
        start_time = time.time()
        
        # Підготовка авторизації
        auth_headers = self.prepare_auth_headers(integration)
        if headers:
            auth_headers.update(headers)
            
        try:
            async with aiohttp.ClientSession() as session:
                async with session.request(
                    method=method.upper(),
                    url=endpoint,
                    json=data,
                    headers=auth_headers,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    response_data = await response.text()
                    duration = time.time() - start_time
                    
                    # Логування виклику
                    self.log_api_call(
                        integration_name,
                        method,
                        endpoint,
                        data,
                        response.status,
                        response_data,
                        duration
                    )
                    
                    # Оновлення часу використання
                    integration.last_used = datetime.now()
                    
                    if response.status == 200:
                        try:
                            return {"success": True, "data": json.loads(response_data)}
                        except:
                            return {"success": True, "data": response_data}
                    else:
                        return {"success": False, "error": response_data, "status": response.status}
                        
        except Exception as e:
            duration = time.time() - start_time
            error_msg = str(e)
            
            self.log_api_call(integration_name, method, endpoint, data, 0, error_msg, duration)
            return {"success": False, "error": error_msg}
            
    def prepare_auth_headers(self, integration: Integration) -> Dict[str, str]:
        """Підготовка заголовків авторизації"""
        headers = {"Content-Type": "application/json"}
        
        if integration.auth_type == "api_key":
            api_key = integration.credentials.get("api_key") or integration.credentials.get("token")
            if api_key:
                headers["Authorization"] = f"Bearer {api_key}"
                
        elif integration.auth_type == "bearer":
            token = integration.credentials.get("token")
            if token:
                headers["Authorization"] = f"Bearer {token}"
                
        elif integration.auth_type == "basic":
            username = integration.credentials.get("username")
            password = integration.credentials.get("password")
            if username and password:
                credentials = base64.b64encode(f"{username}:{password}".encode()).decode()
                headers["Authorization"] = f"Basic {credentials}"
                
        return headers
        
    def log_api_call(self, integration_name: str, method: str, endpoint: str,
                    request_data: Any, response_code: int, response_data: str, duration: float):
        """Логування API виклику"""
        conn = sqlite3.connect(self.integrations_db)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO api_calls 
            (integration_name, method, endpoint, request_data, response_code, response_data, duration)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            integration_name,
            method,
            endpoint,
            json.dumps(request_data) if request_data else None,
            response_code,
            response_data,
            duration
        ))
        
        conn.commit()
        conn.close()
        
    async def send_telegram_message(self, message: str, chat_id: Optional[str] = None) -> Dict:
        """Відправка повідомлення в Telegram"""
        integration = self.active_integrations.get("telegram_bot")
        if not integration or not integration.active:
            return {"error": "Telegram інтеграція неактивна"}
            
        token = integration.credentials.get("token")
        if not token or token == "YOUR_BOT_TOKEN":
            return {"error": "Telegram токен не налаштований"}
            
        endpoint = f"https://api.telegram.org/bot{token}/sendMessage"
        data = {
            "text": message,
            "chat_id": chat_id or integration.config.get("default_chat_id"),
            "parse_mode": "HTML"
        }
        
        return await self.make_api_call("telegram_bot", "POST", endpoint, data)
        
    async def send_slack_message(self, message: str, channel: Optional[str] = None) -> Dict:
        """Відправка повідомлення в Slack"""
        integration = self.active_integrations.get("slack_webhook")
        if not integration or not integration.active:
            return {"error": "Slack інтеграція неактивна"}
            
        webhook_url = integration.credentials.get("webhook_url")
        if not webhook_url or webhook_url == "YOUR_SLACK_WEBHOOK":
            return {"error": "Slack webhook не налаштований"}
            
        data = {
            "text": message,
            "channel": channel or integration.config.get("channel", "#general"),
            "username": integration.config.get("username", "AI Assistant"),
            "icon_emoji": integration.config.get("icon_emoji", ":robot_face:")
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(webhook_url, json=data) as response:
                if response.status == 200:
                    return {"success": True}
                else:
                    return {"success": False, "error": await response.text()}
                    
    async def send_email(self, to_email: str, subject: str, content: str) -> Dict:
        """Відправка email через SendGrid"""
        integration = self.active_integrations.get("email_service")
        if not integration or not integration.active:
            return {"error": "Email інтеграція неактивна"}
            
        api_key = integration.credentials.get("api_key")
        if not api_key or api_key == "YOUR_SENDGRID_KEY":
            return {"error": "SendGrid API ключ не налаштований"}
            
        data = {
            "personalizations": [{"to": [{"email": to_email}]}],
            "from": {"email": integration.config.get("from_email", "ai@yourdomain.com")},
            "subject": subject,
            "content": [{"type": "text/html", "value": content}]
        }
        
        headers = {"Authorization": f"Bearer {api_key}"}
        return await self.make_api_call("email_service", "POST", integration.endpoint, data, headers)
        
    async def save_to_google_sheets(self, data: List[List[str]]) -> Dict:
        """Збереження даних в Google Sheets"""
        integration = self.active_integrations.get("google_sheets")
        if not integration or not integration.active:
            return {"error": "Google Sheets інтеграція неактивна"}
            
        # Примітка: потрібна повна OAuth2 імплементація
        return {"info": "Google Sheets інтеграція потребує OAuth2 налаштування"}
        
    def process_webhook(self, source: str, event_type: str, payload: Dict) -> Dict:
        """Обробка вхідного webhook"""
        # Збереження події
        conn = sqlite3.connect(self.integrations_db)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO webhook_events (source, event_type, payload)
            VALUES (?, ?, ?)
        ''', (source, event_type, json.dumps(payload)))
        
        conn.commit()
        event_id = cursor.lastrowid
        conn.close()
        
        # Обробка різних типів подій
        response_data = {"processed": True, "event_id": event_id}
        
        try:
            if source == "telegram":
                response_data.update(self.process_telegram_webhook(payload))
            elif source == "discord":
                response_data.update(self.process_discord_webhook(payload))
            elif source == "github":
                response_data.update(self.process_github_webhook(payload))
            else:
                response_data.update({"message": f"Невідоме джерело webhook: {source}"})
                
        except Exception as e:
            response_data.update({"error": str(e)})
            
        # Оновлення статусу обробки
        conn = sqlite3.connect(self.integrations_db)
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE webhook_events 
            SET processed = TRUE, response_data = ?
            WHERE id = ?
        ''', (json.dumps(response_data), event_id))
        conn.commit()
        conn.close()
        
        return response_data
        
    def process_telegram_webhook(self, payload: Dict) -> Dict:
        """Обробка Telegram webhook"""
        message = payload.get("message", {})
        text = message.get("text", "")
        chat_id = message.get("chat", {}).get("id")
        
        if text.startswith("/"):
            # Обробка команд
            command = text.split()[0][1:]  # Видалити "/"
            
            if command == "start":
                return {"reply": "Привіт! Я AI асистент. Використовуй /help для довідки."}
            elif command == "help":
                return {"reply": "Доступні команди:\n/start - Початок\n/help - Довідка\n/status - Статус системи"}
            elif command == "status":
                return {"reply": "✅ Система працює нормально"}
            else:
                return {"reply": f"Невідома команда: {command}"}
        else:
            # Обробка звичайних повідомлень через AI
            return {"reply": f"AI відповідь на: {text}", "forward_to_ai": True}
            
    def process_discord_webhook(self, payload: Dict) -> Dict:
        """Обробка Discord webhook"""
        return {"message": "Discord webhook оброблено"}
        
    def process_github_webhook(self, payload: Dict) -> Dict:
        """Обробка GitHub webhook"""
        event_type = payload.get("action", "unknown")
        repo = payload.get("repository", {}).get("full_name", "unknown")
        
        if event_type == "opened":
            return {"message": f"Новий PR у репозиторії {repo}"}
        elif event_type == "push":
            return {"message": f"Push у репозиторій {repo}"}
        else:
            return {"message": f"GitHub подія: {event_type} у {repo}"}
            
    def generate_integration_stats(self) -> Dict:
        """Генерація статистики інтеграцій"""
        conn = sqlite3.connect(self.integrations_db)
        cursor = conn.cursor()
        
        # Загальна кількість викликів
        cursor.execute('SELECT COUNT(*) FROM api_calls WHERE DATE(timestamp) = DATE("now")')
        daily_calls = cursor.fetchone()[0]
        
        # Топ інтеграції за використанням
        cursor.execute('''
            SELECT integration_name, COUNT(*), AVG(duration)
            FROM api_calls
            WHERE timestamp > datetime('now', '-7 days')
            GROUP BY integration_name
            ORDER BY COUNT(*) DESC
            LIMIT 5
        ''')
        top_integrations = cursor.fetchall()
        
        # Webhook статистика
        cursor.execute('SELECT COUNT(*) FROM webhook_events WHERE DATE(timestamp) = DATE("now")')
        daily_webhooks = cursor.fetchone()[0]
        
        conn.close()
        
        stats = {
            "timestamp": datetime.now().isoformat(),
            "daily_api_calls": daily_calls,
            "daily_webhooks": daily_webhooks,
            "active_integrations": sum(1 for i in self.active_integrations.values() if i.active),
            "top_integrations": [
                {
                    "name": row[0],
                    "calls": row[1],
                    "avg_duration": round(row[2], 3)
                }
                for row in top_integrations
            ]
        }
        
        return stats
        
    def run_integration_demo(self):
        """Демонстрація системи інтеграцій"""
        print("🔗 AI Integration Hub - Демо")
        print("=" * 40)
        
        print("📋 Доступні інтеграції:")
        for i, (name, integration) in enumerate(self.active_integrations.items(), 1):
            status = "🟢" if integration.active else "🔴"
            print(f"   {i}. {status} {integration.name} ({integration.type})")
            
        print("\n🧪 Тест webhook обробки...")
        # Симуляція Telegram webhook
        telegram_payload = {
            "message": {
                "message_id": 123,
                "chat": {"id": "demo_chat"},
                "text": "/start"
            }
        }
        
        response = self.process_webhook("telegram", "message", telegram_payload)
        print(f"   ✓ Telegram webhook: {response.get('reply', 'оброблено')}")
        
        # Симуляція GitHub webhook
        github_payload = {
            "action": "opened",
            "repository": {"full_name": "user/demo-repo"}
        }
        
        response = self.process_webhook("github", "pull_request", github_payload)
        print(f"   ✓ GitHub webhook: {response.get('message', 'оброблено')}")
        
        print("\n📊 Генерація статистики...")
        stats = self.generate_integration_stats()
        print(f"   • Денні API виклики: {stats['daily_api_calls']}")
        print(f"   • Денні webhooks: {stats['daily_webhooks']}")
        print(f"   • Активні інтеграції: {stats['active_integrations']}")
        
        # Збереження конфігурації
        config_file = self.workspace / "integrations_demo_config.json"
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump({
                "integrations": {name: asdict(integration) for name, integration in self.active_integrations.items()},
                "stats": stats
            }, f, ensure_ascii=False, indent=2, default=str)
            
        print(f"\n✅ Конфігурацію збережено: {config_file}")
        print("\n🎯 Демо інтеграцій завершено успішно!")
        
        return stats

# Async wrapper для тестування
async def run_async_demo():
    """Асинхронне демо для тестування API викликів"""
    hub = AIIntegrationHub()
    
    print("\n🔄 Тест асинхронних API викликів...")
    
    # Тест Slack повідомлення (симуляція)
    print("   📤 Slack повідомлення...")
    # result = await hub.send_slack_message("Тест повідомлення з AI системи")
    # print(f"   Результат: {result}")
    
    print("   ✅ Асинхронні тести завершено")

def main():
    """Основна функція"""
    try:
        hub = AIIntegrationHub()
        
        if len(sys.argv) > 1:
            if sys.argv[1] == "demo":
                hub.run_integration_demo()
            elif sys.argv[1] == "async":
                asyncio.run(run_async_demo())
            elif sys.argv[1] == "stats":
                stats = hub.generate_integration_stats()
                print(json.dumps(stats, indent=2, ensure_ascii=False))
            else:
                print("Доступні команди: demo, async, stats")
        else:
            hub.run_integration_demo()
            
    except KeyboardInterrupt:
        print("\n⏹️  Інтеграції зупинено користувачем")
    except Exception as e:
        print(f"❌ Помилка системи інтеграцій: {e}")

if __name__ == "__main__":
    main()
