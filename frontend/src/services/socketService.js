import io from 'socket.io-client';

let socket = null;

const initializeSocket = () => {
  if (socket) return socket;
  
  const token = localStorage.getItem('token');
  socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
    auth: {
      token: token
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });

  return socket;
};

const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Alert event listeners
const onNewAlert = (callback) => {
  const s = getSocket();
  s.on('newAlert', callback);
  return () => s.off('newAlert', callback);
};

const onUpdateAlert = (callback) => {
  const s = getSocket();
  s.on('updateAlert', callback);
  return () => s.off('updateAlert', callback);
};

const onDeleteAlert = (callback) => {
  const s = getSocket();
  s.on('deleteAlert', callback);
  return () => s.off('deleteAlert', callback);
};

// Alert event emitters
const emitNewAlert = (alert) => {
  const s = getSocket();
  s.emit('newAlert', alert);
};

const emitUpdateAlert = (alert) => {
  const s = getSocket();
  s.emit('updateAlert', alert);
};

const emitDeleteAlert = (alertId) => {
  const s = getSocket();
  s.emit('deleteAlert', { id: alertId });
};

// Chat event emitters
const emitChatMessage = (message) => {
  const s = getSocket();
  s.emit('chatMessage', message);
};

// Chat event listeners
const onChatMessage = (callback) => {
  const s = getSocket();
  s.on('chatMessage', callback);
  return () => s.off('chatMessage', callback);
};

// Export as object for easier access
export const socketService = {
  initializeSocket,
  getSocket,
  disconnectSocket,
  onNewAlert,
  onUpdateAlert,
  onDeleteAlert,
  emitNewAlert,
  emitUpdateAlert,
  emitDeleteAlert,
  onChatMessage,
  emitChatMessage
};

// Also export individual functions for backwards compatibility
export {
  initializeSocket,
  getSocket,
  disconnectSocket,
  onNewAlert,
  onUpdateAlert,
  onDeleteAlert,
  emitNewAlert,
  emitUpdateAlert,
  emitDeleteAlert,
  onChatMessage,
  emitChatMessage
};
