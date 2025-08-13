const { createServer } = require('http');
const { Server } = require('socket.io');
const { parse } = require('url');

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : '*',
    methods: ['GET', 'POST']
  }
});

// Store connected users
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('authenticate', async (authData) => {
    try {
      const { userId, username } = authData;

      if (!userId || !username) {
        socket.emit('error', { code: 'AUTH_ERROR', message: 'Authentication required' });
        return;
      }

      connectedUsers.set(userId, {
        socketId: socket.id,
        userId,
        username
      });

      socket.data = { userId, username, status: 'online' };
      socket.join(`user:${userId}`);

      console.log(`User ${username} authenticated`);
    } catch (error) {
      console.error('Authentication error:', error);
      socket.emit('error', { code: 'AUTH_ERROR', message: 'Authentication failed' });
    }
  });

  socket.on('createGame', async (gameSettings) => {
    try {
      const gameId = Math.random().toString(36).substring(2, 15);

      socket.join(`game:${gameId}`);

      const gameData = {
        id: gameId,
        player1: {
          id: socket.data.userId,
          username: socket.data.username,
          isOnline: true
        },
        player2: null,
        status: 'WAITING',
        isPrivate: gameSettings?.isPrivate || false,
        createdAt: new Date().toISOString()
      };

      socket.emit('gameCreated', gameData);

      if (!gameSettings?.isPrivate) {
        socket.broadcast.emit('gameCreated', gameData);
      }

      console.log(`Game ${gameId} created by ${socket.data.username}`);
    } catch (error) {
      console.error('Error creating game:', error);
      socket.emit('error', { code: 'CREATE_GAME_ERROR', message: 'Failed to create game' });
    }
  });

  socket.on('joinGame', async (gameId) => {
    try {
      socket.join(`game:${gameId}`);

      const gameData = {
        id: gameId,
        status: 'IN_PROGRESS',
        message: `${socket.data.username} joined the game`
      };

      io.to(`game:${gameId}`).emit('gameJoined', gameData);
      console.log(`${socket.data.username} joined game ${gameId}`);
    } catch (error) {
      console.error('Error joining game:', error);
      socket.emit('error', { code: 'JOIN_GAME_ERROR', message: 'Failed to join game' });
    }
  });

  socket.on('makeMove', async (gameId, position) => {
    try {
      const moveData = {
        playerId: socket.data.userId,
        position,
        timestamp: new Date().toISOString()
      };

      io.to(`game:${gameId}`).emit('moveMade', { gameId }, moveData);
      console.log(`Move made in game ${gameId} at position ${position}`);
    } catch (error) {
      console.error('Error making move:', error);
      socket.emit('error', { code: 'MAKE_MOVE_ERROR', message: 'Failed to make move' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socket.data?.userId) {
      connectedUsers.delete(socket.data.userId);
    }
  });
});

// Start the server
const port = process.env.SOCKET_PORT || 3001;
httpServer.listen(port, () => {
  console.log(`Socket.IO server listening on port ${port}`);
});
