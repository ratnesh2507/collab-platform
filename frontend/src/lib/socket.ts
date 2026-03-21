import { io, Socket } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(BACKEND_URL, {
      withCredentials: true,
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(userId?: string) {
  const s = getSocket();
  if (!s.connected) s.connect();
  if (userId) {
    s.off("connect"); // remove previous listener first
    s.on("connect", () => s.emit("join-user", userId));
    s.emit("join-user", userId);
  }
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect();
}
