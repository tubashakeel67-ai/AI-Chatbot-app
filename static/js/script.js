const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const themeToggle = document.getElementById('theme-toggle');
const newChatBtn = document.getElementById('new-chat-btn');
const chatList = document.getElementById('chat-list');

let currentChatId = parseInt(chatBox.getAttribute('data-current-chat-id'));

sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// ---- Auto-scroll helper ----
function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

// ---- Add copy buttons to any code blocks inside an element ----
function addCopyButtons(container) {
    const codeBlocks = container.querySelectorAll('pre');
    codeBlocks.forEach(pre => {
        if (pre.querySelector('.copy-btn')) return; // already has one

        const button = document.createElement('button');
        button.textContent = 'Copy';
        button.classList.add('copy-btn');

        button.addEventListener('click', function () {
            const code = pre.querySelector('code');
            const textToCopy = code ? code.textContent : pre.textContent;
            navigator.clipboard.writeText(textToCopy).then(() => {
                button.textContent = 'Copied';
                button.classList.add('copied');
                setTimeout(() => {
                    button.textContent = 'Copy';
                    button.classList.remove('copied');
                }, 1500);
            });
        });

        pre.style.position = 'relative';
        pre.appendChild(button);
    });
}

// Add copy buttons to any code already rendered on page load
addCopyButtons(chatBox);
scrollToBottom();

// ---- Theme toggle ----
themeToggle.addEventListener('click', function () {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.body.removeAttribute('data-theme');
        themeToggle.textContent = '🌙 Dark';
        localStorage.setItem('theme', 'light');
    } else {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️ Light';
        localStorage.setItem('theme', 'dark');
    }
});

window.addEventListener('DOMContentLoaded', function () {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️ Light';
    }
});

// ---- New Chat ----
newChatBtn.addEventListener('click', async function () {
    const response = await fetch('/new_chat', { method: 'POST' });
    const data = await response.json();

    currentChatId = data.chat_id;
    chatBox.setAttribute('data-current-chat-id', currentChatId);

    chatBox.innerHTML = '<div class="message bot-message">Hi! How can I help you today?</div>';

    const chatItem = document.createElement('div');
    chatItem.classList.add('chat-item', 'active');
    chatItem.setAttribute('data-chat-id', currentChatId);
    chatItem.innerHTML = `<span class="chat-title">${data.title}</span><button class="delete-chat-btn" data-chat-id="${currentChatId}">🗑️</button>`;

    document.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
    chatList.prepend(chatItem);

    attachChatItemListeners(chatItem);
});

// ---- Load a chat when clicked ----
async function loadChat(chatId) {
    const response = await fetch(`/load_chat/${chatId}`);
    const data = await response.json();

    currentChatId = chatId;
    chatBox.setAttribute('data-current-chat-id', currentChatId);

    chatBox.innerHTML = '';

    if (data.messages.length === 0) {
        chatBox.innerHTML = '<div class="message bot-message">Hi! How can I help you today?</div>';
    } else {
        data.messages.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('message', item.sender === 'user' ? 'user-message' : 'bot-message');
            div.title = item.timestamp;

            if (item.sender === 'user') {
                div.textContent = item.message;
            } else {
                div.innerHTML = marked.parse(item.message);
            }

            chatBox.appendChild(div);
        });
        addCopyButtons(chatBox);
    }

    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.toggle('active', parseInt(item.getAttribute('data-chat-id')) === chatId);
    });

    scrollToBottom();
}

// ---- Delete a chat ----
async function deleteChat(chatId, chatItemElement) {
    await fetch(`/delete_chat/${chatId}`, { method: 'POST' });
    chatItemElement.remove();

    if (chatId === currentChatId) {
        const remaining = document.querySelector('.chat-item');
        if (remaining) {
            loadChat(parseInt(remaining.getAttribute('data-chat-id')));
        } else {
            newChatBtn.click();
        }
    }
}

// ---- Attach listeners to a chat item ----
function attachChatItemListeners(chatItem) {
    const chatId = parseInt(chatItem.getAttribute('data-chat-id'));

    chatItem.querySelector('.chat-title').addEventListener('click', function () {
        loadChat(chatId);
    });

    chatItem.querySelector('.delete-chat-btn').addEventListener('click', function (e) {
        e.stopPropagation();
        deleteChat(chatId, chatItem);
    });
}

document.querySelectorAll('.chat-item').forEach(attachChatItemListeners);

// ---- Send message ----
async function sendMessage() {
    const message = userInput.value.trim();

    if (!message) return;

    const userMessageDiv = document.createElement('div');
    userMessageDiv.classList.add('message', 'user-message');
    userMessageDiv.textContent = message;
    chatBox.appendChild(userMessageDiv);

    userInput.value = '';
    scrollToBottom();

    sendBtn.disabled = true;
    userInput.disabled = true;
    sendBtn.textContent = '...';

    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'bot-message');
    typingDiv.textContent = 'Bot is typing...';
    chatBox.appendChild(typingDiv);
    scrollToBottom();

    const response = await fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: message, chat_id: currentChatId })
    });

    const data = await response.json();

    typingDiv.remove();

    const botMessageDiv = document.createElement('div');
    botMessageDiv.classList.add('message', 'bot-message');

    if (response.ok) {
        botMessageDiv.innerHTML = marked.parse(data.reply);
        addCopyButtons(botMessageDiv);

        const activeItem = document.querySelector(`.chat-item[data-chat-id="${currentChatId}"] .chat-title`);
        if (activeItem && activeItem.textContent === 'New Chat') {
            activeItem.textContent = message.length > 30 ? message.slice(0, 30) + '...' : message;
        }
    } else {
        botMessageDiv.textContent = data.error;
    }

    chatBox.appendChild(botMessageDiv);
    scrollToBottom();

    sendBtn.disabled = false;
    userInput.disabled = false;
    sendBtn.textContent = 'Send';
    userInput.focus();
}