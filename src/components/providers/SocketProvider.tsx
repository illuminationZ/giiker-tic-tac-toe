/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  GameData,
  MoveData,
  FriendRequestData,
  FriendData,
  ChatMessage,
  NotificationData,
  UserStatus,
} from "@/types/socket";

interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
  connectionError: string | null;

  // Game methods
  createGame: (settings?: { isPrivate?: boolean; gameCode?: string }) => void;
  joinGame: (gameId: string) => void;
  makeMove: (gameId: string, position: number) => void;
  leaveGame: (gameId: string) => void;

  // Friend methods
  sendFriendRequest: (username: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  removeFriend: (friendId: string) => void;

  // Chat methods
  sendMessage: (gameId: string, message: string) => void;

  // Status methods
  updateStatus: (status: UserStatus) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Only connect if user is authenticated
    if (status === "authenticated" && session?.user && !socket) {
      const newSocket = io(
        process.env.NODE_ENV === "production" ? "" : "http://localhost:3001",
        {
          path: "/socket.io",
          addTrailingSlash: false,
          transports: ["websocket", "polling"],
          timeout: 20000,
        },
      );

      // Connection event handlers
      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
        setIsConnected(true);
        setConnectionError(null);

        // Send authentication data after connection
        newSocket.emit("authenticate", {
          userId: session.user.id,
          username: session.user.username,
        });
      });

      newSocket.on("connect_timeout", () => {
        console.error("Socket connection timeout");
        setConnectionError("Connection timeout");
        setIsConnected(false);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        setIsConnected(false);
        if (reason === "io server disconnect") {
          // Server disconnected, try to reconnect
          newSocket.connect();
        }
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setConnectionError(error.message);
        setIsConnected(false);
        
        // Try to reconnect after a delay
        setTimeout(() => {
          if (newSocket.disconnected) {
            console.log("Attempting to reconnect...");
            newSocket.connect();
          }
        }, 5000);
      });

      // Game event handlers
      newSocket.on("gameCreated", (game: GameData) => {
        console.log("Game created:", game);
        // Handle game creation (e.g., redirect to game page)
        window.dispatchEvent(new CustomEvent("gameCreated", { detail: game }));
      });

      newSocket.on("gameJoined", (game: GameData) => {
        console.log("Game joined:", game);
        window.dispatchEvent(new CustomEvent("gameJoined", { detail: game }));
      });

      newSocket.on("gameStarted", (game: GameData) => {
        console.log("Game started:", game);
        window.dispatchEvent(new CustomEvent("gameStarted", { detail: game }));
      });

      newSocket.on("moveMade", (game: GameData, move: MoveData) => {
        console.log("Move made:", move);
        window.dispatchEvent(
          new CustomEvent("moveMade", { detail: { game, move } }),
        );
      });

      newSocket.on("gameEnded", (game: GameData) => {
        console.log("Game ended:", game);
        window.dispatchEvent(new CustomEvent("gameEnded", { detail: game }));
      });

      newSocket.on("playerDisconnected", (playerId: string) => {
        console.log("Player disconnected:", playerId);
        window.dispatchEvent(
          new CustomEvent("playerDisconnected", { detail: { playerId } }),
        );
      });

      newSocket.on("playerReconnected", (playerId: string) => {
        console.log("Player reconnected:", playerId);
        window.dispatchEvent(
          new CustomEvent("playerReconnected", { detail: { playerId } }),
        );
      });

      // Friend event handlers
      newSocket.on(
        "friendRequestReceived",
        (friendRequest: FriendRequestData) => {
          console.log("Friend request received:", friendRequest);
          window.dispatchEvent(
            new CustomEvent("friendRequestReceived", { detail: friendRequest }),
          );
        },
      );

      newSocket.on("friendRequestAccepted", (friendData: FriendData) => {
        console.log("Friend request accepted:", friendData);
        window.dispatchEvent(
          new CustomEvent("friendRequestAccepted", { detail: friendData }),
        );
      });

      newSocket.on("friendOnline", (friendId: string) => {
        console.log("Friend online:", friendId);
        window.dispatchEvent(
          new CustomEvent("friendOnline", { detail: { friendId } }),
        );
      });

      newSocket.on("friendOffline", (friendId: string) => {
        console.log("Friend offline:", friendId);
        window.dispatchEvent(
          new CustomEvent("friendOffline", { detail: { friendId } }),
        );
      });

      // Chat event handlers
      newSocket.on("messageReceived", (message: ChatMessage) => {
        console.log("Message received:", message);
        window.dispatchEvent(
          new CustomEvent("messageReceived", { detail: message }),
        );
      });

      // Notification handlers
      newSocket.on("notification", (notification: NotificationData) => {
        console.log("Notification received:", notification);
        window.dispatchEvent(
          new CustomEvent("notification", { detail: notification }),
        );
      });

      newSocket.on("error", (error) => {
        console.error("Socket error:", error);
        setConnectionError(error.message);
      });

      setSocket(newSocket);

      return () => {
        console.log("Cleaning up socket connection");
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [session, status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Game methods
  const createGame = (settings?: {
    isPrivate?: boolean;
    gameCode?: string;
  }) => {
    if (socket && isConnected) {
      socket.emit("createGame", settings || {});
    }
  };

  const joinGame = (gameId: string) => {
    if (socket && isConnected) {
      socket.emit("joinGame", gameId);
    }
  };

  const makeMove = (gameId: string, position: number) => {
    if (socket && isConnected) {
      socket.emit("makeMove", gameId, position);
    }
  };

  const leaveGame = (gameId: string) => {
    if (socket && isConnected) {
      socket.emit("leaveGame", gameId);
    }
  };

  // Friend methods
  const sendFriendRequest = (username: string) => {
    if (socket && isConnected) {
      socket.emit("sendFriendRequest", username);
    }
  };

  const acceptFriendRequest = (requestId: string) => {
    if (socket && isConnected) {
      socket.emit("acceptFriendRequest", requestId);
    }
  };

  const rejectFriendRequest = (requestId: string) => {
    if (socket && isConnected) {
      socket.emit("rejectFriendRequest", requestId);
    }
  };

  const removeFriend = (friendId: string) => {
    if (socket && isConnected) {
      socket.emit("removeFriend", friendId);
    }
  };

  // Chat methods
  const sendMessage = (gameId: string, message: string) => {
    if (socket && isConnected) {
      socket.emit("sendMessage", gameId, message);
    }
  };

  // Status methods
  const updateStatus = (status: UserStatus) => {
    if (socket && isConnected) {
      socket.emit("updateStatus", status);
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    connectionError,
    createGame,
    joinGame,
    makeMove,
    leaveGame,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    sendMessage,
    updateStatus,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
