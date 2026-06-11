"""
Migration script: adds user_id and user table to existing aetherio.db
Run once: .\venv\Scripts\python.exe migrate_db.py
"""
import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'instance', 'aetherio.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check existing tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in cursor.fetchall()]
print("Existing tables:", tables)

# Add user table if missing
if 'user' not in tables:
    print("Creating 'user' table...")
    cursor.execute("""
        CREATE TABLE user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name VARCHAR(100) NOT NULL,
            email VARCHAR(120) UNIQUE NOT NULL,
            password_hash VARCHAR(256) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("  'user' table created.")
else:
    print("'user' table already exists.")

# Add user_id column to order table if missing
cursor.execute("PRAGMA table_info('order')")
order_cols = [r[1] for r in cursor.fetchall()]
print("Order columns:", order_cols)

if 'user_id' not in order_cols:
    print("Adding 'user_id' column to 'order' table...")
    cursor.execute("ALTER TABLE 'order' ADD COLUMN user_id INTEGER REFERENCES user(id)")
    print("  'user_id' column added.")
else:
    print("'user_id' column already exists.")

conn.commit()
conn.close()
print("\nMigration complete!")
