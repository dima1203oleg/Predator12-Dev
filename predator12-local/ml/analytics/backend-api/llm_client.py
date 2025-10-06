import os
import requests

# Виправлення шляху імпорту для конфігурації віддалених API
try:
    from remote_api_config import (
        REMOTE_API_TYPE, 
        HUGGINGFACE_API_KEY, 
        GROQ_API_KEY, 
        HUGGINGFACE_API_URL, 
        GROQ_API_URL, 
        DEFAULT_MODEL
    )
except ImportError:
    # Якщо модуль не знайдено, використовуємо значення за замовчуванням
    REMOTE_API_TYPE = os.getenv('REMOTE_API_TYPE', 'huggingface')
    HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY', '')
    GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
    HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models'
    GROQ_API_URL = 'https://api.groq.com/openai/v1'
    DEFAULT_MODEL = os.getenv('DEFAULT_MODEL', 'meta-llama/Llama-2-7b-chat-hf')


class LLMClient:
    def __init__(self, api_type=REMOTE_API_TYPE, model=DEFAULT_MODEL):
        self.api_type = api_type
        self.model = model
        self.api_key = (
            HUGGINGFACE_API_KEY if api_type == 'huggingface' else GROQ_API_KEY
        )
        self.base_url = (
            HUGGINGFACE_API_URL if api_type == 'huggingface' else GROQ_API_URL
        )

    def generate(self, prompt, max_tokens=512, temperature=0.7):
        if self.api_type == 'huggingface':
            return self._generate_huggingface(prompt, max_tokens, temperature)
        elif self.api_type == 'groq':
            return self._generate_groq(prompt, max_tokens, temperature)
        else:
            raise ValueError(f"Unsupported API type: {self.api_type}")

    async def get_analysis(self, query):
        """
        Method to get analysis from the remote LLM based on a query.
        """
        prompt = f"Analyze the following data or query: {query}"
        return self.generate(prompt, max_tokens=512, temperature=0.7)

    def _generate_huggingface(self, prompt, max_tokens, temperature):
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": max_tokens,
                "temperature": temperature
            }
        }
        url = f"{self.base_url}/{self.model}"
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 200:
            return response.json()[0]["generated_text"]
        else:
            raise Exception(f"HuggingFace API error: {response.text}")

    def _generate_groq(self, prompt, max_tokens, temperature):
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        url = f"{self.base_url}/chat/completions"
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 200:
            content = response.json()["choices"][0]["message"]["content"]
            return content
        else:
            raise Exception(f"Groq API error: {response.text}")


# Використання
if __name__ == "__main__":
    client = LLMClient()
    try:
        result = client.generate("Explain the concept of tender collusion.")
        print(result)
    except Exception as e:
        print(f"Error: {e}") 