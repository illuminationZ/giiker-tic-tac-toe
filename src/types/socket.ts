export interface ServerToClientEvents {
  // Game events
  gameCreated: (game: GameData) => void;
  gameJoined: (game: GameData) => void;
  gameStarted: (game: GameData) => void;
  gameEnded: (game: GameData) => void;
  moveMade: (game: GameData, move: MoveData) => void;
  playerDisconnected: (playerId: string) => void;
  playerReconnected: (playerId: string) => void;

  // Friend events
  friendRequestReceived: (friendRequest: FriendRequestData) => void;
  friendRequestAccepted: (friendData: FriendData) => void;
  friendOnline: (friendId: string) => void;
  friendOffline: (friendId: string) => void;

  // Chat events
  messageReceived: (message: ChatMessage) => void;

  // General events
  error: (error: ErrorData) => void;
  notification: (notification: NotificationData) => void;
  userStatusUpdate: (userId: string, status: UserStatus) => void;
}

export interface ClientToServerEvents {
  // Connection events
  authenticate: (authData: { userId: string; username: string }) => void;

  // Game events
  createGame: (gameSettings: CreateGameSettings) => void;
  joinGame: (gameId: string) => void;
  makeMove: (gameId: string, position: number) => void;
  leaveGame: (gameId: string) => void;
  spectateGame: (gameId: string) => void;

  // Friend events
  sendFriendRequest: (username: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  removeFriend: (friendId: string) => void;
  inviteToGame: (friendId: string, gameId?: string) => void;

  // Chat events
  sendMessage: (gameId: string, message: string) => void;

  // Status events
  updateStatus: (status: UserStatus) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  username: string;
  currentGameId?: string;
  status: UserStatus;
}

export interface GameData {
  id: string;
  player1: PlayerInfo;
  player2: PlayerInfo | null;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  gameState: string; // JSON string of board state
  currentTurn: string | null;
  winner: string | null;
  isDraw: boolean;
  isPrivate: boolean;
  gameCode: string | null;
  createdAt: string;
  updatedAt: string;
  spectators?: string[]; // user IDs of spectators
}

export interface PlayerInfo {
  id: string;
  username: string;
  avatar: string | null;
  isOnline: boolean;
  rating?: number;
  gamesWon: number;
  totalGames: number;
}

export interface MoveData {
  playerId: string;
  position: number; // 0-8 for board position
  moveNumber: number;
  removedPosition?: number; // for infinite mode
  timestamp: string;
}

export interface CreateGameSettings {
  isPrivate?: boolean;
  gameCode?: string;
  inviteUserId?: string;
  gameMode?: 'infinite' | 'classic';
}

export interface FriendRequestData {
  id: string;
  senderId: string;
  senderUsername: string;
  senderAvatar: string | null;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface FriendData {
  id: string;
  friendId: string;
  username: string;
  avatar: string | null;
  isOnline: boolean;
  status: 'ACCEPTED';
  lastSeen?: string;
}

export interface ChatMessage {
  id: string;
  gameId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
  type: 'message' | 'system' | 'game_event';
}

export interface ErrorData {
  code: string;
  message: string;
  details?: any;
}

export interface NotificationData {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  action?: {
    label: string;
    url: string;
  };
  timestamp: string;
}

export type UserStatus = 'online' | 'in_game' | 'away' | 'offline';

// Socket event error types
export interface SocketError {
  error: boolean;
  message: string;
  code?: string;
}

export interface GameJoinResponse {
  success: boolean;
  game?: GameData;
  error?: string;
}

export interface MakeMoveResponse {
  success: boolean;
  game?: GameData;
  move?: MoveData;
  error?: string;
}

// Lobby and matchmaking types
export interface LobbyUser {
  id: string;
  username: string;
  avatar: string | null;
  rating: number;
  status: UserStatus;
  isSearching: boolean;
}

export interface MatchmakingSettings {
  gameMode: 'infinite' | 'classic';
  ratingRange?: {
    min: number;
    max: number;
  };
  maxWaitTime?: number; // in seconds
}
