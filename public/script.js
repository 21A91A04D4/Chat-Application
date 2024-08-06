const ws = new WebSocket(`ws://${window.location.hostname}:3000`);
let username = '';
let usernameEntered = false;

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'chatHistory') {
    displayChatHistory(message.data);
  } else if (message.type === 'userList') {
    updateUserList(message.data);
  } else if (message.type === 'message') {
    displayMessage(message.data);
  }
};

document.getElementById('message-form').addEventListener('submit', (event) => {
  event.preventDefault();
  sendMessage();
});

document.getElementById('message-input').addEventListener('input', (event) => {
  if (!usernameEntered) {
    username = event.target.value.trim();
  }
});

document.getElementById('message-input').addEventListener('change', (event) => {
  if (!usernameEntered && username) {
    usernameEntered = true;
    document.getElementById('message-input').placeholder = 'Type your message...';
    document.getElementById('message-input').value = '';

    const welcomeMessage = document.createElement('div');
    welcomeMessage.id = 'welcome-message';
    welcomeMessage.className = 'welcome-message'; // Add class for styling
    welcomeMessage.innerText = `Welcome, ${username}!`;

    document.getElementById('chat-messages').prepend(welcomeMessage);
  }
});

function sendMessage() {
  const messageInput = document.getElementById('message-input');
  const message = messageInput.value.trim();
  if (message !== '') {
    const formattedMessage = `${username}: ${message}`;
    ws.send(formattedMessage);
    messageInput.value = '';
  }
}

document.getElementById('message-input').addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

function formatMessage(message) {
  if (message.startsWith(username + ':')) {
    return `<strong>${message}</strong>`;
  } else {
    return message;
  }
}

function displayMessage(message) {
  const chatMessages = document.getElementById('chat-messages');
  const messageElement = document.createElement('div');
  messageElement.innerHTML = formatMessage(message);
  messageElement.className = message.startsWith(username + ':') ? 'message sent' : 'message received';
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function displayChatHistory(chatHistory) {
  chatHistory.forEach(displayMessage);
}

function updateUserList(userList) {
  const userListElement = document.getElementById('user-list');
  if (!userListElement) {
    const newUserListElement = document.createElement('div');
    newUserListElement.id = 'user-list';
    newUserListElement.className = 'user-line'; // Add class for styling
    newUserListElement.innerHTML = `<strong>Users: </strong>${userList}`;
    document.getElementById('chat-window').prepend(newUserListElement);
  } else {
    userListElement.innerHTML = `<strong>Users: </strong>${userList}`;
  }
}
