import pandas as pd
from sqlalchemy import create_engine
import os
import json

# DB config (replace with your actual credentials)
DB_URL = os.getenv("PREDATOR_DB_URL", "postgresql://user:password@localhost/predator_db")
CSV_PATH = os.getenv("CSV_PATH", "../../data/customs_registry_feb.csv")

# Read CSV
print(f"Reading CSV from {CSV_PATH}")
df = pd.read_csv(CSV_PATH, delimiter=';', dtype=str)

# Map columns to schema, fill missing columns
columns = [
    'declaration_number', 'declaration_date', 'importer_name', 'exporter_name',
    'product_description', 'hs_code', 'invoice_value', 'currency', 'country_origin'
]
def extract_json(row):
    return json.dumps({k: row[k] for k in row.index if k not in columns and pd.notna(row[k])})

for col in columns:
    if col not in df.columns:
        df[col] = None

df['other_fields'] = df.apply(extract_json, axis=1)

# Connect to DB
engine = create_engine(DB_URL)

# Create table if not exists
from sqlalchemy import text
with engine.connect() as conn:
    conn.execute(text('''CREATE TABLE IF NOT EXISTS customs_registry (
        id SERIAL PRIMARY KEY,
        declaration_number TEXT,
        declaration_date DATE,
        importer_name TEXT,
        exporter_name TEXT,
        product_description TEXT,
        hs_code TEXT,
        invoice_value NUMERIC,
        currency TEXT,
        country_origin TEXT,
        other_fields JSONB
    );'''))

# Write to DB
print("Writing data to PostgreSQL...")
df[columns + ['other_fields']].to_sql('customs_registry', engine, if_exists='append', index=False)
print("Done.")
