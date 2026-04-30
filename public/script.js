// script.js - Frontend for Gemini Chatbot Web App

const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

let conversation = [];
let lastLoadingBubble = null;

const themeToggle = document.createElement('button');
themeToggle.id = 'theme-toggle';
themeToggle.type = 'button';
themeToggle.textContent = '🌙';
themeToggle.title = 'Toggle dark/light mode';
const header = document.querySelector('.header');
header.appendChild(themeToggle);

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  themeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});

function addMessage(role, text, extraClass = '') {
  const container = document.createElement('div');
  container.classList.add('message-container', role);

  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', role);
  if (extraClass) messageDiv.classList.add(extraClass);

  if (extraClass === 'loading') {
    messageDiv.innerHTML = '<span class="spinner"></span><span>Please wait...</span>';
    lastLoadingBubble = messageDiv;
  } else {
    messageDiv.textContent = text;
  }

  container.appendChild(messageDiv);
  chatBox.appendChild(container);
  chatBox.scrollTop = chatBox.scrollHeight;
  return messageDiv;
}

function updateLastBotMessage(text) {
  if (lastLoadingBubble) {
    lastLoadingBubble.classList.remove('loading');
    lastLoadingBubble.innerHTML = text;
    lastLoadingBubble = null;
  } else {
    const lastMessage = chatBox.querySelector('.message-container.bot:last-child .message.bot');
    if (lastMessage) {
      lastMessage.textContent = text;
    }
  }
}

async function handleSubmit(event) {
  event.preventDefault();

  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  conversation.push({ role: 'user', text: userMessage });
  addMessage('user', userMessage);
  addMessage('bot', '', 'loading');

  userInput.value = '';
  userInput.focus();

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.result) {
      conversation.push({ role: 'model', text: data.result });
      updateLastBotMessage(data.result);
    } else {
      updateLastBotMessage('Sorry, no response received.');
    }
  } catch (error) {
    console.error('Error:', error);
    updateLastBotMessage('Failed to get response from server.');
  }
}

chatForm.addEventListener('submit', handleSubmit);
userInput.focus();
