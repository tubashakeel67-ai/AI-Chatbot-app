import sqlite3

DB_NAME = "chat_history.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            title TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_id INTEGER NOT NULL,
            sender TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (chat_id) REFERENCES chats (id)
        )
    """)
    conn.commit()
    conn.close()

def create_chat(session_id, title="New Chat"):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO chats (session_id, title) VALUES (?, ?)", (session_id, title))
    chat_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return chat_id

def get_all_chats(session_id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, title FROM chats WHERE session_id = ? ORDER BY id DESC",
        (session_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return rows

def chat_belongs_to_session(chat_id, session_id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM chats WHERE id = ? AND session_id = ?", (chat_id, session_id))
    row = cursor.fetchone()
    conn.close()
    return row is not None

def get_chat_messages(chat_id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT sender, message, timestamp FROM messages WHERE chat_id = ? ORDER BY id ASC",
        (chat_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return rows

def save_message(chat_id, sender, message):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO messages (chat_id, sender, message) VALUES (?, ?, ?)",
        (chat_id, sender, message)
    )
    conn.commit()
    conn.close()

def delete_chat(chat_id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM messages WHERE chat_id = ?", (chat_id,))
    cursor.execute("DELETE FROM chats WHERE id = ?", (chat_id,))
    conn.commit()
    conn.close()

def update_chat_title(chat_id, title):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("UPDATE chats SET title = ? WHERE id = ?", (title, chat_id))
    conn.commit()
    conn.close()

def get_chat_title(chat_id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT title FROM chats WHERE id = ?", (chat_id,))
    row = cursor.fetchone()
    conn.close()
    return row[0] if row else None