const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

const PORT = 3000;
const clients = [];
const chatHistory = [];
const usernames = new Set();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

wss.on('connection', (ws) => {
  clients.push(ws);

  // Send chat history to the new client
  ws.send(JSON.stringify({ type: 'chatHistory', data: chatHistory }));

  ws.on('message', (data) => {
    const message = data.toString().trim();
    const colonIndex = message.indexOf(':');
    if (colonIndex !== -1) {
      const username = message.substring(0, colonIndex).trim();
      usernames.add(username);
      const userMessage = message.substring(colonIndex + 1).trim();
      const formattedMessage = `${username}: ${userMessage}`;
      chatHistory.push(formattedMessage);
      broadcastMessage(formattedMessage);
      broadcastUserList();
    }
  });

  ws.on('close', () => {
    const index = clients.indexOf(ws);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
});

function broadcastMessage(message) {
  clients.forEach((client) => {
    client.send(JSON.stringify({ type: 'message', data: message }));
  });
}

function broadcastUserList() {
  const userList = Array.from(usernames).join(', ');
  clients.forEach((client) => {
    client.send(JSON.stringify({ type: 'userList', data: userList }));
  });
}

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});