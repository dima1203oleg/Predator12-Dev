#!/usr/bin/env python3
import argparse
import os
import sys
from typing import Optional

HELP_NOTE = """
This script inspects a Postgres database and prints tables/columns.

Requirements (install locally or in your devcontainer):
  pip install psycopg2-binary tabulate

Example:
  python3 scripts/discover_pg_schema.py --pg postgresql://user:pass@localhost:5432/keycloak
"""

def require(module: str) -> Optional[object]:
    try:
        return __import__(module)
    except ImportError:
        print(f"[WARN] Missing dependency: {module}.\n{HELP_NOTE}")
        return None

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--pg', default=os.environ.get('PG_URI', ''), help='Postgres URI, e.g. postgresql://user:pass@host:5432/db')
    args = parser.parse_args()

    if not args.pg:
        print('[ERROR] Provide --pg or set PG_URI env var')
        sys.exit(1)

    psycopg2 = require('psycopg2')
    tabulate = require('tabulate')
    if not psycopg2:
        sys.exit(1)

    try:
        conn = psycopg2.connect(args.pg)
    except Exception as e:
        print(f"[ERROR] Failed to connect: {e}")
        sys.exit(1)

    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT table_schema, table_name
            FROM information_schema.tables
            WHERE table_type='BASE TABLE' AND table_schema NOT IN ('pg_catalog','information_schema')
            ORDER BY table_schema, table_name;
        """)
        tables = cur.fetchall()
        print(f"[INFO] Found {len(tables)} tables")
        for schema, table in tables:
            cur.execute("""
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_schema=%s AND table_name=%s
                ORDER BY ordinal_position
            """, (schema, table))
            cols = cur.fetchall()
            print(f"\n{schema}.{table}")
            if tabulate:
                from tabulate import tabulate as _tab
                print(_tab(cols, headers=['column','type']))
            else:
                for c in cols:
                    print(f"  - {c[0]}: {c[1]}")
    finally:
        conn.close()

if __name__ == '__main__':
    main()
