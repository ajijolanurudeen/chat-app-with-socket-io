const io = require('socket.io')(3000, {
    cors: {
      origin: '*',
    }
  });
  
  const users = {}; // socket.id => username
  
  io.on('connection', socket => {
    // Handle user joining with a name
    socket.on('new-user', name => {
      users[socket.id] = name;
      socket.broadcast.emit('user-connected', name);
    });
  
    // Handle group messages (with optional room)
    socket.on('send-chat-message', ({ message, room }) => {
      if (room) {
        socket.to(room).emit('chat-message', {
          message,
          name: users[socket.id]
        });
      } else {
        socket.broadcast.emit('chat-message', {
          message,
          name: users[socket.id]
        });
      }
    });
  
    // Joining a room
    socket.on('join-room', room => {
      socket.join(room);
      socket.to(room).emit('chat-message', {
        message: `${users[socket.id]} joined the room.`,
        name: "System"
      });
    });
  
    // Private messages (1-on-1)
    socket.on('private-message', ({ toSocketId, message }) => {
      socket.to(toSocketId).emit('chat-message', {
        message,
        name: `${users[socket.id]} (private)`
      });
    });
  
    // When user disconnects
    socket.on('disconnect', () => {
      socket.broadcast.emit('user-disconnected', users[socket.id]);
      delete users[socket.id];
    });
  });
  