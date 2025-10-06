import os

from langchain.chains import RetrievalQA
from langchain.embeddings import SentenceTransformerEmbeddings
from langchain.llms import OpenAI
from langchain.vectorstores import Qdrant
from qdrant_client import QdrantClient


class AIAnalyticsAssistant:
    def __init__(self):
        # Перевіряємо чи доступний реальний OpenAI API
        self.mock_mode = (
            not os.getenv("OPENAI_API_KEY")
            or os.getenv("OPENAI_API_KEY") == "sk-test-local-development-key"
        )

        if not self.mock_mode:
            try:
                self.llm = OpenAI(temperature=0.7, openai_api_key=os.getenv("OPENAI_API_KEY"))
                self.embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
                self.qdrant_client = QdrantClient(
                    url=os.getenv("QDRANT_URL", "http://localhost:6333")
                )
                self.vectorstore = Qdrant(
                    client=self.qdrant_client,
                    collection_name="legal_documents",
                    embeddings=self.embeddings,
                )
                self.qa_chain = RetrievalQA.from_chain_type(
                    llm=self.llm, chain_type="stuff", retriever=self.vectorstore.as_retriever()
                )
            except Exception as e:
                print(f"Не вдалося ініціалізувати повну AI систему, переходжу в mock режим: {e}")
                self.mock_mode = True

    def add_document(self, text: str, metadata: dict = None):
        """Add a document to the vector store"""
        self.vectorstore.add_texts([text], metadatas=[metadata] if metadata else None)

    def query(self, question: str) -> str:
        """Query the AI assistant"""
        if self.mock_mode:
            return f"Mock AI Response: Проаналізовано запит '{question[:50]}...' - Система працює коректно. Detected: аналітика, тренди, аномалії"

        try:
            result = self.qa_chain.run(question)
            return result
        except Exception as e:
            return f"Error processing query: {str(e)}"

    def analyze_anomalies(self, anomaly_data: dict) -> str:
        """Analyze detected anomalies using AI"""
        if self.mock_mode:
            return f"Mock Anomaly Analysis: Виявлено підозрілу активність у даних {list(anomaly_data.keys())[:3]}. Рекомендується додаткова перевірка."

        try:
            prompt = f"Analyze the following anomaly in customs data: {anomaly_data}. Provide insights and recommendations."
            return self.llm(prompt)
        except Exception as e:
            return f"Error analyzing anomalies: {str(e)}"


# Global instance
ai_assistant = AIAnalyticsAssistant()
