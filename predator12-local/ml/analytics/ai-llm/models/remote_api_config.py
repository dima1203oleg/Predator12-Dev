import os

# Конфігурація для віддалених API
REMOTE_API_TYPE = os.getenv('REMOTE_API_TYPE', 'huggingface')  # або 'groq'
HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY', '')
GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')

# URL-адреси API
HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models'
GROQ_API_URL = 'https://api.groq.com/openai/v1'

# Модель за замовчуванням
DEFAULT_MODEL = os.getenv('DEFAULT_MODEL', 'meta-llama/Llama-2-7b-chat-hf') 