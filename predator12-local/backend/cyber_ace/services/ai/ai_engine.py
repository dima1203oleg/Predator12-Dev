"""
CYBER-ACE AI Engine
===================

Головний AI движок для обробки запитів користувачів.
Використовує OpenAI GPT-4o для генерації відповідей.

Author: CYBER-ACE Team
Version: 1.0.0
"""

import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime
import openai
from openai import AsyncOpenAI

class CyberAceAI:
    """
    Головний AI движок для CYBER-ACE.
    
    Відповідає за:
    - Класифікацію намірів (intent classification)
    - Витяг сутностей (entity extraction)
    - Генерацію відповідей (response generation)
    - Керування контекстом розмови
    """
    
    def __init__(self, api_key: str):
        """
        Ініціалізація AI Engine.
        
        Args:
            api_key: OpenAI API ключ
        """
        self.client = AsyncOpenAI(api_key=api_key)
        self.memory: List[Dict[str, Any]] = []
        self.context: Dict[str, Any] = {}
        self.system_prompt = self._load_system_prompt()
    
    def _load_system_prompt(self) -> str:
        """Завантажити системний prompt для CYBER-ACE."""
        return """
        You are CYBER-ACE, an advanced AI assistant for the PREDATOR12 system.
        
        Your capabilities:
        - Analyze financial transactions and detect fraud
        - Manage a team of specialized AI agents
        - Provide cyber security insights
        - Communicate in Ukrainian and English
        
        Your personality:
        - Professional yet friendly
        - Clear and concise
        - Proactive in suggesting solutions
        - Adapts tone to user's emotion
        
        Always respond in the user's language (Ukrainian or English).
        """
    
    async def process_query(
        self, 
        query: str, 
        user_id: str,
        language: str = 'uk'
    ) -> Dict[str, Any]:
        """
        Обробити запит користувача.
        
        Args:
            query: Текст запиту
            user_id: ID користувача
            language: Мова ('uk' або 'en')
        
        Returns:
            Dict з результатами обробки
        """
        try:
            # 1. Класифікація наміру
            intent = await self._classify_intent(query)
            
            # 2. Витяг сутностей
            entities = await self._extract_entities(query)
            
            # 3. Генерація відповіді
            response = await self._generate_response(
                query=query,
                intent=intent,
                entities=entities,
                user_id=user_id,
                language=language
            )
            
            # 4. Збереження в пам'ять
            self._add_to_memory(query, response, user_id)
            
            return {
                'intent': intent,
                'entities': entities,
                'response': response,
                'confidence': 0.95,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'fallback_response': self._get_fallback_response(language)
            }
    
    async def _classify_intent(self, query: str) -> str:
        """
        Класифікувати намір користувача.
        
        Можливі наміри:
        - query: загальний запит
        - analyze: аналіз даних
        - search: пошук інформації
        - control: керування системою
        - delegate: делегування завдання агенту
        """
        # TODO: Implement intent classification
        # Можна використати fine-tuned модель або prompt engineering
        return 'query'
    
    async def _extract_entities(self, query: str) -> Dict[str, Any]:
        """
        Витягти сутності з запиту.
        
        Сутності:
        - dates: дати
        - amounts: суми
        - names: імена
        - locations: локації
        - organizations: організації
        """
        # TODO: Implement entity extraction
        return {}
    
    async def _generate_response(
        self,
        query: str,
        intent: str,
        entities: Dict[str, Any],
        user_id: str,
        language: str
    ) -> str:
        """
        Згенерувати відповідь користувачу.
        """
        # Підготовка контексту
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "system", "content": f"Language: {language}"},
        ]
        
        # Додати історію з пам'яті (останні 5 повідомлень)
        recent_memory = self._get_recent_memory(user_id, limit=5)
        for item in recent_memory:
            messages.append({"role": "user", "content": item['query']})
            messages.append({"role": "assistant", "content": item['response']})
        
        # Додати поточний запит
        messages.append({"role": "user", "content": query})
        
        # Запит до OpenAI
        response = await self.client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )
        
        return response.choices[0].message.content
    
    def _add_to_memory(self, query: str, response: str, user_id: str):
        """Додати взаємодію в пам'ять."""
        self.memory.append({
            'query': query,
            'response': response,
            'user_id': user_id,
            'timestamp': datetime.utcnow()
        })
        
        # Обмежити розмір пам'яті (останні 100 взаємодій)
        if len(self.memory) > 100:
            self.memory = self.memory[-100:]
    
    def _get_recent_memory(self, user_id: str, limit: int = 5) -> List[Dict]:
        """Отримати останні взаємодії користувача."""
        user_memory = [
            item for item in self.memory 
            if item['user_id'] == user_id
        ]
        return user_memory[-limit:]
    
    def _get_fallback_response(self, language: str) -> str:
        """Отримати fallback відповідь."""
        if language == 'uk':
            return "Вибачте, я не зміг обробити ваш запит. Спробуйте перефразувати питання."
        else:
            return "Sorry, I couldn't process your request. Please try rephrasing your question."

# Singleton instance
_ai_engine: Optional[CyberAceAI] = None

def get_ai_engine(api_key: str) -> CyberAceAI:
    """Отримати singleton instance AI Engine."""
    global _ai_engine
    if _ai_engine is None:
        _ai_engine = CyberAceAI(api_key)
    return _ai_engine
