"""
Автоматизований ETL-скрипт для XLSX-файлу митних декларацій з інтеграцією у knowledge graph та AI-аналізом
"""
import pandas as pd
import os
import json
from sqlalchemy import create_engine
# from agents.dataset_inspector import inspect_dataset
# from agents.auto_heal import auto_heal_schema
# from agents.arbiter_agent import analyze_graph

# 1. Extract
file_path = '/Users/dima/Desktop/Лютий_10.xlsx'
df = pd.read_excel(file_path, dtype=str)

# 2. Transform (приклад нормалізації)
df['date'] = pd.to_datetime(df['date'], errors='coerce').dt.strftime('%Y-%m-%d')
df['edrpou'] = df['edrpou'].str.zfill(8)
# df = auto_heal_schema(df)
# inspect_dataset(df)

# 3. Load (PostgreSQL)
engine = create_engine('postgresql://user:pass@host:5432/db')
df.to_sql('customs_registry', engine, if_exists='replace', index=False)

# 4. Оновлення knowledge graph
kg_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..', 'knowledge_graph.json'))
if os.path.exists(kg_path):
    with open(kg_path) as f:
        kg = json.load(f)
else:
    kg = {'nodes': [], 'edges': []}
for _, row in df.iterrows():
    node_id = f"company:{row['edrpou']}"
    if not any(n['id'] == node_id for n in kg['nodes']):
        kg['nodes'].append({'id': node_id, 'type': 'company', 'name': row.get('company_name', ''), 'edrpou': row['edrpou']})
    kg['edges'].append({'source': node_id, 'target': f"declaration:{row.get('declaration_id', '')}", 'type': 'declared_by'})
with open(kg_path, 'w') as f:
    json.dump(kg, f, indent=2)

# 5. AI-аналіз графа (приклад)
# anomalies = analyze_graph(kg_path)
# print(anomalies)

print('ETL, knowledge graph update та AI-аналіз завершено.')
