from flask import Flask, render_template, request, jsonify
from chatbot import get_bot_response
from database import (
    init_db, create_chat, get_all_chats, get_chat_messages,
    save_message, delete_chat, update_chat_title, get_chat_title
)

app = Flask(__name__)
init_db()

@app.route('/')
def home():
    chats = get_all_chats()

    if not chats:
        new_id = create_chat()
        chats = get_all_chats()
        active_chat_id = new_id
    else:
        active_chat_id = chats[0][0]

    messages = get_chat_messages(active_chat_id)
    return render_template('index.html', chats=chats, active_chat_id=active_chat_id, messages=messages)

@app.route('/new_chat', methods=['POST'])
def new_chat():
    chat_id = create_chat()
    return jsonify({"chat_id": chat_id, "title": "New Chat"})

@app.route('/load_chat/<int:chat_id>')
def load_chat(chat_id):
    messages = get_chat_messages(chat_id)
    messages_list = [{"sender": s, "message": m, "timestamp": t} for s, m, t in messages]
    return jsonify({"messages": messages_list})

@app.route('/delete_chat/<int:chat_id>', methods=['POST'])
def remove_chat(chat_id):
    delete_chat(chat_id)
    return jsonify({"success": True})

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid or missing JSON"}), 400

    message = data.get('message', '').strip()
    chat_id = data.get('chat_id')

    if not message:
        return jsonify({"error": "No message provided"}), 400

    if not chat_id:
        return jsonify({"error": "No chat selected"}), 400

    current_title = get_chat_title(chat_id)
    if current_title == "New Chat":
        short_title = message[:30] + ("..." if len(message) > 30 else "")
        update_chat_title(chat_id, short_title)

    save_message(chat_id, 'user', message)

    conversation_history = get_chat_messages(chat_id)
    reply = get_bot_response(conversation_history)

    if reply is None:
        return jsonify({"error": "Sorry, the chatbot is currently unavailable. Please try again later."}), 500

    save_message(chat_id, 'bot', reply)

    return jsonify({"reply": reply})

if __name__ == '__main__':
    app.run(debug=True)