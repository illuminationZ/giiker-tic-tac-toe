export type Player = 'X' | 'O';
export type Cell = Player | null;
export type Board = Cell[][];
export type Position = { row: number; col: number };

export interface GameMove {
  player: Player;
  position: Position;
  moveNumber: number;
  timestamp: Date;
  removedPosition?: Position; // For infinite mode when a piece is removed
}

export interface GameState {
  board: Board;
  currentPlayer: Player;
  gameMode: 'classic' | 'infinite';
  moves: GameMove[];
  winner: Player | null;
  isDraw: boolean;
  isGameOver: boolean;
  winningLine: Position[] | null;
  maxPiecesPerPlayer: number;
}

// Initialize empty 3x3 board
export function createEmptyBoard(): Board {
  return [
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ];
}

// Create initial game state
export function createInitialGameState(mode: 'classic' | 'infinite' = 'infinite'): GameState {
  return {
    board: createEmptyBoard(),
    currentPlayer: 'X',
    gameMode: mode,
    moves: [],
    winner: null,
    isDraw: false,
    isGameOver: false,
    winningLine: null,
    maxPiecesPerPlayer: mode === 'infinite' ? 3 : 9
  };
}

// Convert position index (0-8) to row/col coordinates
export function indexToPosition(index: number): Position {
  return {
    row: Math.floor(index / 3),
    col: index % 3
  };
}

// Convert row/col coordinates to position index (0-8)
export function positionToIndex(position: Position): number {
  return position.row * 3 + position.col;
}

// Check if a position is valid and empty
export function isValidMove(board: Board, position: Position): boolean {
  const { row, col } = position;
  return row >= 0 && row < 3 && col >= 0 && col < 3 && board[row][col] === null;
}

// Get all positions occupied by a player
export function getPlayerPositions(board: Board, player: Player): Position[] {
  const positions: Position[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (board[row][col] === player) {
        positions.push({ row, col });
      }
    }
  }
  return positions;
}

// Count pieces on board for a player
export function countPlayerPieces(board: Board, player: Player): number {
  return getPlayerPositions(board, player).length;
}

// Get the oldest move position for a player (for infinite mode removal)
export function getOldestMovePosition(moves: GameMove[], player: Player): Position | null {
  // Find the oldest move by this player that hasn't been removed
  const playerMoves = moves.filter(move => move.player === player && !move.removedPosition);
  if (playerMoves.length === 0) return null;

  // Sort by move number to get the oldest
  playerMoves.sort((a, b) => a.moveNumber - b.moveNumber);
  return playerMoves[0].position;
}

// Check for winning combinations
export function checkWinner(board: Board): { winner: Player | null; winningLine: Position[] | null } {
  const lines: Position[][] = [
    // Rows
    [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }],
    [{ row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }],
    [{ row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 }],
    // Columns
    [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }],
    [{ row: 0, col: 1 }, { row: 1, col: 1 }, { row: 2, col: 1 }],
    [{ row: 0, col: 2 }, { row: 1, col: 2 }, { row: 2, col: 2 }],
    // Diagonals
    [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 2 }],
    [{ row: 0, col: 2 }, { row: 1, col: 1 }, { row: 2, col: 0 }],
  ];

  for (const line of lines) {
    const [a, b, c] = line;
    const cellA = board[a.row][a.col];
    const cellB = board[b.row][b.col];
    const cellC = board[c.row][c.col];

    if (cellA && cellA === cellB && cellA === cellC) {
      return { winner: cellA, winningLine: line };
    }
  }

  return { winner: null, winningLine: null };
}

// Check if the board is full (for draw detection in classic mode)
export function isBoardFull(board: Board): boolean {
  return board.every(row => row.every(cell => cell !== null));
}

// Make a move and return new game state
export function makeMove(
  gameState: GameState,
  position: Position,
  playerId?: string
): GameState | null {
  const { board, currentPlayer, gameMode, moves, maxPiecesPerPlayer } = gameState;

  // Validate move
  if (!isValidMove(board, position)) {
    return null;
  }

  // Create new board
  const newBoard = board.map(row => [...row]);
  const newMoves = [...moves];
  let removedPosition: Position | undefined;

  // In infinite mode, check if we need to remove the oldest piece
  if (gameMode === 'infinite') {
    const currentPlayerPieces = countPlayerPieces(board, currentPlayer);

    if (currentPlayerPieces >= maxPiecesPerPlayer) {
      const oldestPosition = getOldestMovePosition(moves, currentPlayer);
      if (oldestPosition) {
        newBoard[oldestPosition.row][oldestPosition.col] = null;
        removedPosition = oldestPosition;
      }
    }
  }

  // Place the new piece
  newBoard[position.row][position.col] = currentPlayer;

  // Add move to history
  const newMove: GameMove = {
    player: currentPlayer,
    position,
    moveNumber: moves.length + 1,
    timestamp: new Date(),
    removedPosition
  };
  newMoves.push(newMove);

  // Check for winner
  const { winner, winningLine } = checkWinner(newBoard);

  // Check for draw (only in classic mode when board is full)
  const isDraw = gameMode === 'classic' && !winner && isBoardFull(newBoard);

  // Determine if game is over
  const isGameOver = winner !== null || isDraw;

  // Switch to next player
  const nextPlayer: Player = currentPlayer === 'X' ? 'O' : 'X';

  return {
    ...gameState,
    board: newBoard,
    currentPlayer: isGameOver ? currentPlayer : nextPlayer,
    moves: newMoves,
    winner,
    isDraw,
    isGameOver,
    winningLine
  };
}

// Get available moves for AI or move validation
export function getAvailableMoves(board: Board): Position[] {
  const availableMoves: Position[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (board[row][col] === null) {
        availableMoves.push({ row, col });
      }
    }
  }
  return availableMoves;
}

// Simple AI for single player mode (minimax algorithm)
export function getBestMove(gameState: GameState, depth: number = 5): Position | null {
  const { board, currentPlayer } = gameState;
  const availableMoves = getAvailableMoves(board);

  if (availableMoves.length === 0) return null;

  let bestMove: Position = availableMoves[0];
  let bestScore = -Infinity;

  for (const move of availableMoves) {
    const newGameState = makeMove(gameState, move);
    if (newGameState) {
      const score = minimax(newGameState, depth - 1, false, -Infinity, Infinity);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
  }

  return bestMove;
}

// Minimax algorithm with alpha-beta pruning
function minimax(
  gameState: GameState,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number
): number {
  const { winner, isDraw, currentPlayer } = gameState;

  // Terminal states
  if (winner === 'X') return 10 + depth; // AI wins (assuming AI is X)
  if (winner === 'O') return -10 - depth; // Human wins
  if (isDraw || depth === 0) return 0;

  const availableMoves = getAvailableMoves(gameState.board);

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of availableMoves) {
      const newGameState = makeMove(gameState, move);
      if (newGameState) {
        const score = minimax(newGameState, depth - 1, false, alpha, beta);
        maxScore = Math.max(score, maxScore);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (const move of availableMoves) {
      const newGameState = makeMove(gameState, move);
      if (newGameState) {
        const score = minimax(newGameState, depth - 1, true, alpha, beta);
        minScore = Math.min(score, minScore);
        beta = Math.min(beta, score);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
    }
    return minScore;
  }
}

// Serialize game state to JSON string for database storage
export function serializeGameState(gameState: GameState): string {
  return JSON.stringify({
    board: gameState.board,
    currentPlayer: gameState.currentPlayer,
    gameMode: gameState.gameMode,
    moves: gameState.moves.map(move => ({
      ...move,
      timestamp: move.timestamp.toISOString()
    })),
    winner: gameState.winner,
    isDraw: gameState.isDraw,
    isGameOver: gameState.isGameOver,
    winningLine: gameState.winningLine,
    maxPiecesPerPlayer: gameState.maxPiecesPerPlayer
  });
}

// Deserialize game state from JSON string
export function deserializeGameState(jsonString: string): GameState {
  const parsed = JSON.parse(jsonString);
  return {
    ...parsed,
    moves: parsed.moves.map((move: any) => ({
      ...move,
      timestamp: new Date(move.timestamp)
    }))
  };
}

// Get game statistics
export function getGameStats(gameState: GameState) {
  const totalMoves = gameState.moves.length;
  const xMoves = gameState.moves.filter(m => m.player === 'X').length;
  const oMoves = gameState.moves.filter(m => m.player === 'O').length;
  const removedPieces = gameState.moves.filter(m => m.removedPosition).length;

  return {
    totalMoves,
    xMoves,
    oMoves,
    removedPieces,
    gameMode: gameState.gameMode,
    isGameOver: gameState.isGameOver,
    winner: gameState.winner,
    isDraw: gameState.isDraw
  };
}
