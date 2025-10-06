import os
from sqlalchemy import create_engine, text
from qdrant_client import QdrantClient, models
import openai  # або інший embedding-інструмент
import numpy as np

DB_URL = os.getenv("PREDATOR_DB_URL", "postgresql://user:password@localhost/predator_db")
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
COLLECTION = "customs_registry_embeddings"

engine = create_engine(DB_URL)
qdrant = QdrantClient(QDRANT_URL)

# Вибірка даних з PostgreSQL
with engine.connect() as conn:
    results = conn.execute(text("SELECT id, product_description, importer_name, exporter_name FROM customs_registry")).fetchall()

# Функція для генерації embedding (замініть на свою модель)
def generate_embedding(text):
    # Тут можна використати Ollama, HuggingFace або OpenAI
    resp = openai.Embedding.create(
        input=text,
        model="text-embedding-3-small"
    )
    return resp['data'][0]['embedding']

# Формування векторів для Qdrant
vectors = []
for row in results:
    combined_text = f"{row.product_description or ''} {row.importer_name or ''} {row.exporter_name or ''}"
    embedding = generate_embedding(combined_text)
    vectors.append(models.PointStruct(id=row.id, vector=embedding, payload={
        "description": row.product_description,
        "importer": row.importer_name,
        "exporter": row.exporter_name
    }))

# Створення колекції, якщо не існує
if COLLECTION not in [c.name for c in qdrant.get_collections().collections]:
    qdrant.recreate_collection(
        collection_name=COLLECTION,
        vectors_config=models.VectorParams(size=len(vectors[0].vector), distance="Cosine")
    )

# Завантаження в Qdrant
qdrant.upsert(collection_name=COLLECTION, points=vectors)
print("Embeddings uploaded to Qdrant.")
