/** 
 * Summary
 * Handles Server-side 
*/

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

const users = new Map();

// Initialize users with initial data
const initialUsers = [
  { id: 1, username: "Joy", avatar: "./images/user1-avatar.png", lastMessage: "Hello there!" },
  { id: 2, username: "Riya", avatar: "./images/user2-avatar.png", lastMessage: "How are you?" }
];

initialUsers.forEach((user) => {
  users.set(user.id, { username: user.username, avatar: user.avatar, lastMessage: user.lastMessage });
});

app.use(express.static(__dirname)); // This line serves static files from the current directory

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on("get initial users", () => {
    const initialUserList = Array.from(users.values());
    socket.emit("add initial user list", initialUserList);
  });

  socket.on('user joined', (username) => {
    const userId = socket.id; // Use socket.id as the key
    users.set(userId, { username, avatar: './images/default-avatar.png', lastMessage: "Welcome to the chat!" });
    io.emit('user connected', Array.from(users.values())); // Send updated user list to all clients
  });

  socket.on('chat message', (msg) => {
    const user = users.get(socket.id);
    const sender = user ? user.username : "Unknown";
    io.emit('chat message', { message: msg, sender: sender }); // Broadcast the message to all connected clients
  });

  socket.on('disconnect', () => {
      console.log('A user disconnected');
      users.delete(socket.id);
      io.emit('user connected', Array.from(users.values())); // Send updated user list to all clients
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
