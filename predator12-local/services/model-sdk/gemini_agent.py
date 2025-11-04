#!/usr/bin/env python3
"""
🤖 GEMINI AGENT - Google Generative AI Integration
Забезпечує підключення до Google Gemini API
"""
import logging
import os
from typing import Dict, List, Optional

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logging.warning("google-generativeai не встановлено. Використовуйте: pip install google-generativeai")

logger = logging.getLogger(__name__)


class GeminiAgent:
    """Агент для роботи з Google Gemini API"""

    def __init__(self, api_key: Optional[str] = None):
        """
        Ініціалізація Gemini агента
        
        Args:
            api_key: API ключ Google Gemini (або використовується з GOOGLE_GEMINI_API_KEY)
        """
        self.api_key = api_key or os.getenv("GOOGLE_GEMINI_API_KEY")
        self.available = False
        self.models = {}
        
        if not GEMINI_AVAILABLE:
            logger.warning("Google Generative AI SDK не встановлено")
            return
            
        if not self.api_key or self.api_key == "gemini_api_key_placeholder":
            logger.warning("GOOGLE_GEMINI_API_KEY не налаштовано. Використовується режим демо.")
            return
        
        try:
            genai.configure(api_key=self.api_key)
            self.available = True
            self._initialize_models()
            logger.info("✅ Gemini Agent успішно підключено")
        except Exception as e:
            logger.error(f"❌ Помилка підключення до Gemini API: {e}")

    def _initialize_models(self):
        """Ініціалізує доступні моделі Gemini"""
        if not self.available:
            return
            
        try:
            # Основні моделі Gemini
            self.models = {
                "gemini-pro": genai.GenerativeModel("gemini-pro"),
                "gemini-1.5-pro": genai.GenerativeModel("gemini-1.5-pro"),
                "gemini-1.5-flash": genai.GenerativeModel("gemini-1.5-flash"),
                # Примітка: gemini-2.0-flash - експериментальна модель, може мати обмеження
                "gemini-2.0-flash": genai.GenerativeModel("gemini-2.0-flash-exp"),
            }
            logger.info(f"✅ Завантажено {len(self.models)} моделей Gemini")
        except Exception as e:
            logger.error(f"Помилка завантаження моделей Gemini: {e}")
            self.models = {}

    async def chat(
        self, 
        model_name: str, 
        messages: List[Dict[str, str]], 
        max_tokens: int = 1000,
        temperature: float = 0.7
    ) -> Dict:
        """
        Відправляє чат-запит до Gemini API
        
        Args:
            model_name: Назва моделі (gemini-pro, gemini-1.5-pro, тощо)
            messages: Список повідомлень [{role: str, content: str}]
            max_tokens: Максимальна кількість токенів у відповіді
            temperature: Температура генерації (0.0-1.0)
            
        Returns:
            Dict з відповіддю
        """
        if not self.available:
            return self._demo_response(messages)
        
        # Нормалізуємо назву моделі
        if "gemini" not in model_name.lower():
            model_name = "gemini-pro"
        
        # Вибираємо найближчу доступну модель
        actual_model = self._select_model(model_name)
        
        if not actual_model:
            return self._demo_response(messages)
        
        try:
            # Збираємо контекст з повідомлень
            context = self._build_context(messages)
            
            # Налаштування генерації
            generation_config = {
                "temperature": temperature,
                "max_output_tokens": max_tokens,
                "top_p": 0.95,
                "top_k": 40,
            }
            
            # Генеруємо відповідь
            response = actual_model.generate_content(
                context,
                generation_config=generation_config
            )
            
            # Повертаємо результат
            if hasattr(response, 'text'):
                content = response.text
            else:
                logger.warning(f"Неочікуваний формат відповіді від Gemini API: {type(response)}")
                content = str(response)
            
            return {
                "role": "assistant",
                "content": content,
                "model": model_name,
                "finish_reason": "stop",
                "usage": {
                    "prompt_tokens": self._estimate_tokens(context),
                    "completion_tokens": self._estimate_tokens(content),
                }
            }
            
        except Exception as e:
            logger.error(f"Помилка виклику Gemini API: {e}")
            return self._demo_response(messages)

    def _select_model(self, requested_model: str):
        """Вибирає найближчу доступну модель"""
        # Пряме співпадіння
        if requested_model in self.models:
            return self.models[requested_model]
        
        # Часткове співпадіння
        for model_key in self.models:
            if requested_model.lower() in model_key.lower():
                return self.models[model_key]
        
        # За замовчуванням - gemini-pro
        return self.models.get("gemini-pro")

    def _build_context(self, messages: List[Dict[str, str]]) -> str:
        """Будує контекст з повідомлень для Gemini"""
        context_parts = []
        
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            
            if role == "system":
                context_parts.append(f"System: {content}")
            elif role == "user":
                context_parts.append(f"User: {content}")
            elif role == "assistant":
                context_parts.append(f"Assistant: {content}")
        
        return "\n\n".join(context_parts)

    def _estimate_tokens(self, text: str) -> int:
        """
        Оцінює кількість токенів у тексті
        
        Примітка: Це приблизна оцінка. Для точного підрахунку токенів
        використовуйте офіційний API Google для підрахунку токенів.
        """
        # Приблизна оцінка: 1 токен ≈ 4 символи (може варіюватися для різних мов)
        # Для української мови це може бути менш точним
        return max(1, len(text) // 4)

    def _demo_response(self, messages: List[Dict[str, str]]) -> Dict:
        """Генерує демо відповідь, якщо API недоступний"""
        user_message = ""
        for msg in messages:
            if msg.get("role") == "user":
                user_message = msg.get("content", "")
        
        demo_content = f"""✨ **Gemini Agent Demo Response**

Ваш запит: "{user_message[:150]}{'...' if len(user_message) > 150 else ''}"

📊 **Статус підключення:**
- API Key: {'✅ Налаштовано' if self.api_key and self.api_key != 'gemini_api_key_placeholder' else '❌ Не налаштовано'}
- SDK: {'✅ Встановлено' if GEMINI_AVAILABLE else '❌ Не встановлено'}
- Доступність: {'✅ Активний' if self.available else '❌ Режим демо'}

🔧 **Для підключення справжнього Gemini API:**
1. Отримайте API ключ: https://makersuite.google.com/app/apikey
2. Додайте до .env: `GOOGLE_GEMINI_API_KEY=your_key_here`
3. Встановіть SDK: `pip install google-generativeai`
4. Перезапустіть сервіс

💡 **Можливості Gemini:**
- Швидка обробка запитів
- Великий контекстний вікно
- Багатомовна підтримка
- Безкоштовний рівень використання

*Це демо відповідь. Налаштуйте API ключ для реальної інтеграції.*"""

        return {
            "role": "assistant",
            "content": demo_content,
            "model": "gemini-demo",
            "finish_reason": "stop",
            "usage": {
                "prompt_tokens": len(user_message.split()),
                "completion_tokens": len(demo_content.split()),
            }
        }

    def get_available_models(self) -> List[str]:
        """Повертає список доступних моделей"""
        if self.available:
            return list(self.models.keys())
        return ["gemini-pro", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash"]

    def is_available(self) -> bool:
        """Перевіряє доступність Gemini API"""
        return self.available

    def get_status(self) -> Dict:
        """Повертає статус агента"""
        return {
            "agent": "Gemini Agent",
            "available": self.available,
            "sdk_installed": GEMINI_AVAILABLE,
            "api_key_configured": bool(self.api_key and self.api_key != "gemini_api_key_placeholder"),
            "models_count": len(self.models),
            "models": self.get_available_models(),
        }
