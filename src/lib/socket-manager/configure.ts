import { Server as SocketIoServer, ServerOptions } from "socket.io";
import { Server as HttpServer } from "http";
import { SocketManager } from ".";
import CorsOptionsBuilder from "../cors-options-builder";
import { CorsOptions } from "cors";

const getSocketCorsConfig = (): CorsOptions =>{
  return CorsOptionsBuilder.fromEnv('SOCKETIO')
}

const getSocketServerOptions = (): Partial<ServerOptions> =>{
  return {
    cors: getSocketCorsConfig(),
    connectionStateRecovery: {
      maxDisconnectionDuration: 3600000,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['polling', 'websocket'],
    allowEIO3: true,
  }
}

export const configureSocketManager = (httpServer: HttpServer): SocketIoServer => {
  const io = new SocketIoServer(httpServer, getSocketServerOptions());
  
//   console.log(runmode.isDevelopment() )
//   console.log(CorsOptionsBuilder.fromOptions({
//     origin: process.env.NODE_ENV === 'production' ? process.env.CORS_ORIGIN || process.env.ENDPOINT_URL : '*',
// methods: ["GET", "POST"],
// credentials: true
// }, 'SOCKETIO').toEnv());


   SocketManager.initialize(io);
  
  return io;
}

