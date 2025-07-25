const socket = io('http://localhost:3000');

const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');

const roomForm = document.getElementById('room-form');
const roomInput = document.getElementById('room-input');

const privateForm = document.getElementById('private-form');
const toIdInput = document.getElementById('to-id');
const privateInput = document.getElementById('private-input');

// Prompt user for a name when they connect
const username = prompt("What's your name?");
socket.emit('new-user', username);

// Show own socket ID (optional)
socket.on('connect', () => {
  console.log('Your Socket ID:', socket.id);
});

// Handle public or room messages
messageForm.addEventListener('submit', e => {
  e.preventDefault();
  const message = messageInput.value;
  if (message.trim() === '') return;

  // Optional: You can set a currentRoom variable if you want room support
  socket.emit('send-chat-message', { message }); 
  appendMessage(`You: ${message}`);
  messageInput.value = '';
});

// Handle room join
roomForm.addEventListener('submit', e => {
  e.preventDefault();
  const room = roomInput.value;
  if (room.trim() === '') return;

  socket.emit('join-room', room);
  appendMessage(`You joined room: ${room}`);
  roomInput.value = '';
});

// Handle private message
privateForm.addEventListener('submit', e => {
  e.preventDefault();
  const to = toIdInput.value;
  const message = privateInput.value;
  if (to && message.trim()) {
    socket.emit('private-message', {
      toSocketId: to,
      message,
    });
    appendMessage(`To [${to}]: ${message}`);
    privateInput.value = '';
  }
});

// Receive messages from others
socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`);
});

// User connection/disconnection notifications
socket.on('user-connected', name => {
  appendMessage(`${name} connected`);
});

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`);
});

// Utility function to append messages
function appendMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.innerText = message;
  messageContainer.append(messageElement);
  messageContainer.scrollTop = messageContainer.scrollHeight; // Auto-scroll
}
