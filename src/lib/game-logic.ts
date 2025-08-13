export type Player = "X" | "O" | null;
export type GameMode = "demo" | "online" | "quick-match" | "private";

export interface GameState {
  board: Player[];
  currentPlayer: Player;
  status: "waiting" | "playing" | "finished";
  winner: Player | "draw" | null;
  moveHistory: Array<{ player: Player; position: number; timestamp: number }>;
  playerPieces: { X: number[]; O: number[] };
  gameMode: GameMode;
  winningLine: Array<{ row: number; col: number }> | null;
}

export const deserializeGameState = (jsonState: string): GameState => {
  try {
    const state = JSON.parse(jsonState);
    // Convert 2D board to 1D if needed
    const board = Array.isArray(state.board[0])
      ? state.board.flat()
      : state.board;

    // Convert move history to consistent format
    const moveHistory = (state.moves || state.moveHistory || []).map(
      (move: any) => ({
        player: move.player,
        position:
          typeof move.position === "number"
            ? move.position
            : move.position.row * 3 + move.position.col,
        timestamp:
          typeof move.timestamp === "string"
            ? new Date(move.timestamp).getTime()
            : move.timestamp,
      }),
    );

    return {
      ...state,
      board,
      currentPlayer: state.currentPlayer || "X",
      status: state.status || "playing",
      winner: state.winner || null,
      moveHistory,
      playerPieces: state.playerPieces || { X: [], O: [] },
      gameMode: state.gameMode || "demo",
      winningLine: state.winningLine || null,
    };
  } catch (error) {
    console.error("Error deserializing game state:", error);
    return initialGameState;
  }
};

export const initialGameState: GameState = {
  board: Array(9).fill(null),
  currentPlayer: "X",
  status: "playing",
  winner: null,
  moveHistory: [],
  playerPieces: { X: [], O: [] },
  gameMode: "demo",
  winningLine: null,
};

export const checkWinner = (board: Player[]): Player => {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

// FIXED: This function now handles demo mode properly
export const makeMove = (gameState: GameState, position: number): GameState => {
  // Prevent moves if game is finished or cell is occupied
  if (
    gameState.status === "finished" ||
    gameState.board[position] ||
    gameState.winner
  ) {
    return gameState;
  }

  // CRITICAL FIX: Demo mode allows both players on same device
  if (gameState.gameMode === "demo") {
    const newBoard = [...gameState.board];
    const currentPlayer = gameState.currentPlayer;
    const newMoveHistory = [...gameState.moveHistory];
    const newPlayerPieces = { ...gameState.playerPieces };

    // Place the piece
    newBoard[position] = currentPlayer;
    const timestamp = Date.now();
    newMoveHistory.push({
      player: currentPlayer,
      position,
      timestamp,
    });

    // Update player pieces array
    newPlayerPieces[currentPlayer] = [
      ...newPlayerPieces[currentPlayer],
      position,
    ];

    // Infinite mode: If player has more than 3 pieces, remove the oldest
    if (newPlayerPieces[currentPlayer].length > 3) {
      const oldestPosition = newPlayerPieces[currentPlayer].shift()!;
      newBoard[oldestPosition] = null;
    }

    // Check for winner
    const winner = checkWinner(newBoard);
    const isDraw = !winner && newBoard.every((cell) => cell !== null);

    // Switch players - THIS IS THE KEY FIX
    const nextPlayer =
      winner || isDraw ? currentPlayer : currentPlayer === "X" ? "O" : "X";
    const status = winner || isDraw ? "finished" : "playing";

    return {
      ...gameState,
      board: newBoard,
      currentPlayer: nextPlayer,
      status,
      winner: winner || (isDraw ? "draw" : null),
      moveHistory: newMoveHistory,
      playerPieces: newPlayerPieces,
    };
  }

  // For online modes, return unchanged (socket will handle)
  return gameState;
};

export const resetGame = (gameMode: GameMode = "demo"): GameState => {
  return {
    ...initialGameState,
    gameMode,
    currentPlayer: Math.random() > 0.5 ? "X" : "O", // Random starting player
  };
};
