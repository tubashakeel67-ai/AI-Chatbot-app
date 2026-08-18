# AI Chatbot Web Application

A modern, full-stack AI chatbot web application built with Flask and Google's Gemini API. Features a clean, ChatGPT-style interface with persistent chat history, multi-conversation management, dark mode, and Markdown-formatted responses (including syntax-highlighted code blocks).

**Live Demo:** [https://tubashakeel67.pythonanywhere.com](https://tubashakeel67.pythonanywhere.com)

---

## Project Description

This project is an AI-powered chatbot web application where users can have real conversations with an AI assistant powered by Google's Gemini API. The app supports multiple named conversations, each with its own persistent history stored in a database, so conversations survive page refreshes and can be revisited, renamed, or deleted at any time.

Each user gets an isolated, private session — conversations are never shared or mixed between different visitors.

---

## Features

### Core Features
- Attractive, responsive UI that works on both desktop and mobile
- Real-time AI conversations powered by Google's Gemini API
- Context-aware replies — the full conversation history is sent with each request, so the AI remembers what was discussed earlier in the same chat
- Typing indicator while waiting for a response
- Backend built with Python (Flask)

### Chat Management
- Multiple chats — start new conversations at any time
- Persistent chat history stored in a SQLite database
- Rename and delete chats via a dropdown menu on each conversation
- Session-based privacy — each visitor's conversations are private to their own browser session

### UI/UX
- Dark mode toggle, with the preference saved across visits
- Markdown rendering for bot replies, including formatted text, lists, and code blocks
- One-click copy button for code blocks
- One-click copy button for full messages
- Collapsible sidebar with a hamburger menu on mobile screens
- Auto-scroll to the latest message
- Input and send button are disabled while waiting for a reply, preventing duplicate requests

### Error Handling
- Empty or missing message validation (400)
- Invalid JSON request handling (400)
- Gemini API failure or timeout handling (500), with a graceful error message instead of a crash

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask |
| AI Integration | Google Gemini API (google-genai SDK) |
| Database | SQLite |
| Frontend | HTML, CSS, JavaScript (vanilla, no framework) |
| Markdown Rendering | marked.js |
| Deployment | PythonAnywhere |
| Production Server | Gunicorn |

---

## Project Structure

```
chatbot-app/
├── app.py                 # Flask routes and application logic
├── chatbot.py              # Gemini API integration
├── database.py             # SQLite database functions
├── requirements.txt        # Python dependencies
├── .env                     # Environment variables (not committed)
├── .gitignore
├── templates/
│   └── index.html           # Main chat interface
├── static/
│   ├── css/
│   │   └── style.css         # Styling (light/dark themes, responsive layout)
│   └── js/
│       └── script.js          # Frontend logic (DOM manipulation, API calls)
└── screenshots/              # Project screenshots
```

---

## Setup and Installation (Run Locally)

### Prerequisites
- Python 3.10 or later
- A free Google Gemini API key from Google AI Studio

### Steps

1. Clone the repository
   ```bash
   git clone https://github.com/tubashakeel67-ai/AI-Chatbot-app.git
   cd AI-Chatbot-app
   ```

2. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables

   Create a `.env` file in the project root:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   SECRET_KEY=any_random_secret_string
   ```

4. Run the app
   ```bash
   python app.py
   ```

5. Open in browser
   ```
   http://127.0.0.1:5000
   ```

---

## Security Notes

- API keys and secrets are stored in a `.env` file, excluded from version control via `.gitignore`
- SQL queries use parameterized statements to prevent SQL injection
- Each user's chat history is isolated using Flask sessions, preventing cross-user data leakage
- User messages are rendered using `textContent` rather than `innerHTML` to prevent XSS; only trusted, rendered bot output uses `innerHTML`

---

## Screenshots

See the `screenshots/` folder for UI screenshots covering light mode, dark mode, and mobile view.

---

## Future Improvements

- Voice input and output support
- User authentication for cross-device history sync
- Export chat history as PDF or text

---

## Author

**Tuba Shakeel**
GitHub: [tubashakeel67-ai](https://github.com/tubashakeel67-ai)
LinkedIn: [Tuba Shakeel](https://www.linkedin.com/in/tuba-shakeel-459091310)