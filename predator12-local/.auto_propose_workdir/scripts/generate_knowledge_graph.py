"""
Knowledge Graph Generator (OpenAI Embeddings)

- Скрипт проходить по всіх .py/.js/.ts/.tsx/.md файлах, генерує embeddings для кожного файлу/фрагменту та будує knowledge graph (у форматі JSON/GraphML/Neo4j CSV).
- Потрібен ключ OPENAI_API_KEY у змінних середовища.
"""
import os
import openai
import glob
import json

openai.api_key = os.getenv("OPENAI_API_KEY")

EXTENSIONS = [".py", ".js", ".ts", ".tsx", ".md"]

workspace = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

files = []
for ext in EXTENSIONS:
    files.extend(glob.glob(f"{workspace}/**/*{ext}", recursive=True))

nodes = []
edges = []

for path in files:
    with open(path, encoding="utf-8", errors="ignore") as f:
        content = f.read()
    # Розбити на фрагменти по 2000 символів
    chunks = [content[i:i+2000] for i in range(0, len(content), 2000)]
    for idx, chunk in enumerate(chunks):
        resp = openai.embeddings.create(
            input=chunk,
            model="text-embedding-3-small"
        )
        embedding = resp.data[0].embedding
        node_id = f"{os.path.relpath(path, workspace)}:{idx}"
        nodes.append({
            "id": node_id,
            "file": os.path.relpath(path, workspace),
            "chunk": idx,
            "embedding": embedding
        })
        # (Додатково: можна додати пошук схожих embedding для побудови edges)

with open(os.path.join(workspace, "knowledge_graph.json"), "w") as f:
    json.dump({"nodes": nodes, "edges": edges}, f, indent=2)

print(f"Knowledge graph saved to {os.path.join(workspace, 'knowledge_graph.json')}")
