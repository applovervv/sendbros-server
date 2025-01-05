import { Server as SocketIoServer } from "socket.io";
import { Server as HttpServer } from "http";
import { SocketManager } from ".";

export const configureSocketManager = (httpServer: HttpServer): SocketIoServer => {
    const io = new SocketIoServer(httpServer, {
        cors: {
            origin: process.env.NODE_ENV === 'production' ? process.env.CORS_ORIGIN || process.env.ENDPOINT_URL : '*',
      methods: ["GET", "POST"],
      credentials: true
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 3600000,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['polling', 'websocket'],
    allowEIO3: true,
  });

  SocketManager.initialize(io);
  
  return io;
}