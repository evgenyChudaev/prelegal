import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path

DB_PATH = Path(os.environ.get("PRELEGAL_DB_PATH", "/tmp/prelegal.db"))

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    fields_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
"""


def init_db() -> None:
    """Create a fresh database. Removes any existing file so each container start gets a clean slate."""
    if DB_PATH.exists():
        DB_PATH.unlink()
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.executescript(SCHEMA)
        conn.commit()


@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()
