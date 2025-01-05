import { Server, Socket } from 'socket.io';
import { JWTUtil } from '../jwt-utils';
import { friendRepository } from '../../v1/db/repositories/friend.repo';

interface ConnectData {
    access_token: string;
}

export class SocketManager {
    private static instance: SocketManager;
    private io: Server;
    private userFileMap: Map<string, string> = new Map();
    // username : socketId
    private userSocketMap: Map<string, string[]> = new Map();
    // socketId : username
    private userSocketIdMap: Map<string, string> = new Map();
    // username : userId
    private userIdMap: Map<string, number> = new Map();

    private constructor(io: Server) {
        this.io = io;
        this.initialize();
    }

    public static initialize(io: Server): void {
        if(SocketManager.instance) {
            throw new Error('SocketManager instance already exists');
        }

        this.instance = new SocketManager(io);
    }

    public static getInstance(): SocketManager {
        if(!SocketManager.instance) {
            throw new Error('SocketManager instance is not initialized');
        }

        return SocketManager.instance;
    }

    private initialize(): void {
        this.io.on('connection', (socket: Socket) => {
            console.log('클라이언트 연결됨:', socket.id);

            socket.on('ready', async (data: ConnectData) => {
                console.log("ready");
                const { access_token } = data;

                let username = null;
                let userId = null;

                let isError = false;
                JWTUtil.verifyAccessToken(access_token, (err, decoded) => {
                  if(err) {
                       isError = true;
                       return;
                  }

                  if(!decoded) {
                    isError = true;
                    return;
                  }

                  console.log("decoded: ", decoded);

                  username = decoded?.username;
                  userId = decoded?.userId;
                 }
                );

                if(isError) {
                    socket.emit('connect_response', {
                        success: false,
                        message: "Invalid token"
                    });
                    return;
                }

                console.log("username: ", username);
                console.log("userId: ", userId);

                if(!username || !userId) {
                    socket.emit('connect_response', {
                        success: false,
                        message: "Invalid token"
                    });
                    return;
                }

                const socketIds = this.userSocketMap.get(username) || [];
                socketIds.push(socket.id);

                this.userSocketMap.set(username, socketIds);
                this.userSocketIdMap.set(socket.id, username);
                this.userIdMap.set(username, userId);

                const friends = await friendRepository.getAllFriends(userId);
            
                for(const friend of friends) {
                    const friendSocketId = this.userSocketMap.get(friend.username);
                    if(friendSocketId) {
                        this.io.to(friendSocketId).emit('friend_online', {
                            connected_user_id: userId,
                        });
                    }
                }

                console.log('클라이언트 연결됨:', socket.id);
                console.log('클라이언트 연결됨:', username);

                socket.emit('connect_response', {
                    success: true,
                    message: "Connected",
                    data: {
                        username,
                    }
                });
            })

            socket.on('disconnect', async () => {
                const username = this.userSocketIdMap.get(socket.id);
                if(username) {
                    
                    const socketIds = this.userSocketMap.get(username);

                    if(socketIds && socketIds.length > 0) {//만약 클라이언트갸 여러개인 상태라면
                        socketIds.splice(socketIds.indexOf(socket.id), 1);
                        this.userSocketMap.set(username, socketIds);
                    }else{
                        this.userSocketMap.delete(username); 
                    }

                    this.userSocketIdMap.delete(socket.id);

                    const userId = this.userIdMap.get(username);
                    
                    if(!socketIds || socketIds.length < 1){ //만약 남아있는 클라이언트가 없다면
                        this.userIdMap.delete(username);
                    }

                    if(userId) {
                    const friends = await friendRepository.getAllFriends(userId);
                    for(const friend of friends) {
                        const friendSocketId = this.userSocketMap.get(friend.username);
                        if(friendSocketId && (!socketIds || socketIds.length < 1)) {
                            this.io.to(friendSocketId).emit('friend_offline', {
                                disconnected_user_id: userId,
                            });
                        }
                        }
                    }
                }
                console.log('클라이언트 연결 해제됨:', socket.id);
            });
        });
    }

    // Map 데이터 조회 메서드
    public getUserFileMap(): Map<string, string> {
        return this.userFileMap;
    }

    public getSocketIds(username: string): string[] | undefined {
        return this.userSocketMap.get(username);
    }

    public getUserId(username: string): number | undefined {
        return this.userIdMap.get(username);
    }

    public getIo(): Server {
        return this.io;
    }
}
