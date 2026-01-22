import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectWebSocket(): Socket {
  if (socket && socket.connected) {
    return socket;
  }

  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

  socket = io(WS_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ WebSocket disconnected:', reason);
  });

  socket.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  return socket;
}

export function disconnectWebSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}

// Subscribe to order updates
export function subscribeToOrder(orderId: string, callback: (data: any) => void) {
  const ws = connectWebSocket();
  
  ws.emit('order:subscribe', orderId);
  
  ws.on('driver:location:update', (data) => {
    if (data.orderId === orderId) {
      callback(data);
    }
  });

  return () => {
    ws.emit('order:unsubscribe', orderId);
    ws.off('driver:location:update');
  };
}

// Send driver location (for drivers)
export function sendDriverLocation(driverId: string, latitude: number, longitude: number) {
  const ws = connectWebSocket();
  ws.emit('driver:location', { driverId, latitude, longitude });
}
