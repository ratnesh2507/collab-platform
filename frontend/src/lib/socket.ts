import { io, Socket } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

let socket: Socket | null = null;

// Named handler reference so we can remove it cleanly
let joinUserHandler: (() => void) | null = null;

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
    // Remove previous join-user handler before adding a new one
    // to prevent duplicate room joins on re-connect
    if (joinUserHandler) {
      s.off("connect", joinUserHandler);
    }

    joinUserHandler = () => s.emit("join-user", userId);

    // Re-join personal room on reconnect
    s.on("connect", joinUserHandler);

    // Also emit immediately if already connected
    if (s.connected) {
      s.emit("join-user", userId);
    }

    // Known limitation: project rooms (join-project) are not
    // automatically re-joined on reconnect. Board.tsx would need
    // to handle the socket "connect" event to re-emit join-project.
  }

  return s;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
  // Clear the handler reference on disconnect
  joinUserHandler = null;
}
