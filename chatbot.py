import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

def get_bot_response(conversation_history):
    """
    conversation_history: list of (sender, message, timestamp) tuples
    """
    try:
        contents = []
        for sender, message, timestamp in conversation_history:
            role = "user" if sender == "user" else "model"
            contents.append({"role": role, "parts": [{"text": message}]})

        response = client.models.generate_content(
            model="gemini-flash-lite-latest",
            contents=contents
        )
        return response.text
    except Exception as e:
        print(f"Gemini API error: {e}")
        return None