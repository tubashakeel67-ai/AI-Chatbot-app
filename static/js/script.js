const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const themeToggle = document.getElementById('theme-toggle');
const newChatBtn = document.getElementById('new-chat-btn');
const chatList = document.getElementById('chat-list');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const menuToggleBtnMobile = document.getElementById('menu-toggle-btn-mobile');

let currentChatId = parseInt(chatBox.getAttribute('data-current-chat-id'));

const emptyStateHTML = `
    <div class="empty-state">
        <div class="empty-state-icon">🤖</div>
        <h2>Ask anything</h2>
        <p>💬 Text-based questions only</p>
        <p>🧠 Coding • Concepts • Explanations</p>
    </div>
`;

function removeEmptyState() {
    const emptyState = chatBox.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }
}

menuToggleBtnMobile.addEventListener('click', function () {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('open');
});

sidebarOverlay.addEventListener('click', function () {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('open');
});

const copyIconSVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
const checkIconSVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addCopyButtons(container) {
    const codeBlocks = container.querySelectorAll('pre');
    codeBlocks.forEach(pre => {
        if (pre.querySelector('.copy-btn')) return;

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

function addMessageCopyButton(messageDiv, rawText) {
    if (messageDiv.querySelector('.message-copy-btn')) return;

    const button = document.createElement('button');
    button.classList.add('message-copy-btn');
    button.innerHTML = copyIconSVG;
    button.title = 'Copy';

    button.addEventListener('click', function () {
        navigator.clipboard.writeText(rawText).then(() => {
            button.innerHTML = checkIconSVG;
            button.classList.add('copied');
            setTimeout(() => {
                button.innerHTML = copyIconSVG;
                button.classList.remove('copied');
            }, 1500);
        });
    });

    messageDiv.appendChild(button);
}

addCopyButtons(chatBox);
scrollToBottom();

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

document.addEventListener('click', function () {
    document.querySelectorAll('.chat-menu-dropdown').forEach(menu => menu.remove());
});

newChatBtn.addEventListener('click', async function () {
    const response = await fetch('/new_chat', { method: 'POST' });
    const data = await response.json();

    currentChatId = data.chat_id;
    chatBox.setAttribute('data-current-chat-id', currentChatId);

    chatBox.innerHTML = emptyStateHTML;

    const chatItem = createChatItemElement(currentChatId, data.title);

    document.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
    chatList.prepend(chatItem);

    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('open');
});

function createChatItemElement(chatId, title) {
    const chatItem = document.createElement('div');
    chatItem.classList.add('chat-item', 'active');
    chatItem.setAttribute('data-chat-id', chatId);

    chatItem.innerHTML = `
        <span class="chat-title" data-chat-id="${chatId}">${title}</span>
        <button class="menu-btn" data-chat-id="${chatId}"><span class="dot"></span><span class="dot"></span><span class="dot"></span></button>
    `;

    attachChatItemListeners(chatItem);
    return chatItem;
}

async function loadChat(chatId) {
    const response = await fetch(`/load_chat/${chatId}`);
    const data = await response.json();

    currentChatId = chatId;
    chatBox.setAttribute('data-current-chat-id', currentChatId);

    chatBox.innerHTML = '';

    if (data.messages.length === 0) {
        chatBox.innerHTML = emptyStateHTML;
    } else {
        data.messages.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('message', item.sender === 'user' ? 'user-message' : 'bot-message');
            div.title = item.timestamp;

            if (item.sender === 'user') {
                div.textContent = item.message;
            } else {
                div.innerHTML = marked.parse(item.message);
                addMessageCopyButton(div, item.message);
            }

            chatBox.appendChild(div);
        });
        addCopyButtons(chatBox);
    }

    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.toggle('active', parseInt(item.getAttribute('data-chat-id')) === chatId);
    });

    scrollToBottom();

    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('open');
}

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

function startRename(chatId, titleSpan) {
    const oldTitle = titleSpan.textContent;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = oldTitle;
    input.classList.add('rename-input');

    titleSpan.replaceWith(input);
    input.focus();
    input.select();

    async function saveRename() {
        const newTitle = input.value.trim();
        const finalTitle = newTitle || oldTitle;

        if (newTitle && newTitle !== oldTitle) {
            await fetch(`/rename_chat/${chatId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle })
            });
        }

        const newSpan = document.createElement('span');
        newSpan.classList.add('chat-title');
        newSpan.setAttribute('data-chat-id', chatId);
        newSpan.textContent = finalTitle;
        newSpan.addEventListener('click', () => loadChat(chatId));
        input.replaceWith(newSpan);
    }

    input.addEventListener('blur', saveRename);
    input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            input.blur();
        }
    });
}

function showChatMenu(e, chatId, chatItem) {
    e.stopPropagation();

    document.querySelectorAll('.chat-menu-dropdown').forEach(menu => menu.remove());

    const menu = document.createElement('div');
    menu.classList.add('chat-menu-dropdown');
    menu.innerHTML = `
        <button class="menu-option rename-option"> Rename</button>
        <button class="menu-option delete-option"> Delete</button>
    `;

    chatItem.appendChild(menu);

    menu.querySelector('.rename-option').addEventListener('click', function (ev) {
        ev.stopPropagation();
        menu.remove();
        const titleSpan = chatItem.querySelector('.chat-title');
        startRename(chatId, titleSpan);
    });

    menu.querySelector('.delete-option').addEventListener('click', function (ev) {
        ev.stopPropagation();
        menu.remove();
        deleteChat(chatId, chatItem);
    });
}

function attachChatItemListeners(chatItem) {
    const chatId = parseInt(chatItem.getAttribute('data-chat-id'));

    chatItem.querySelector('.chat-title').addEventListener('click', function () {
        loadChat(chatId);
    });

    chatItem.querySelector('.menu-btn').addEventListener('click', function (e) {
        showChatMenu(e, chatId, chatItem);
    });
}

document.querySelectorAll('.chat-item').forEach(attachChatItemListeners);

async function sendMessage() {
    const message = userInput.value.trim();

    if (!message) return;

    removeEmptyState();

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
        addMessageCopyButton(botMessageDiv, data.reply);

        const activeTitleSpan = document.querySelector(`.chat-item[data-chat-id="${currentChatId}"] .chat-title`);
        if (activeTitleSpan && activeTitleSpan.textContent === 'New Chat') {
            activeTitleSpan.textContent = message.length > 30 ? message.slice(0, 30) + '...' : message;
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