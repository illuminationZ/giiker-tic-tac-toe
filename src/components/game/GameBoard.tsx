"use client";

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { deserializeGameState, GameState } from "@/lib/game-logic";
import { X, Circle, Zap, Clock, Trophy } from "lucide-react";

interface GameBoardProps {
  gameState: string; // JSON string of the game state
  currentTurn: string | null;
  currentUserId: string;
  player1Id: string;
  player2Id: string;
  winner: string | null;
  isDraw: boolean;
  isGameOver: boolean;
  onMakeMove: (position: number) => void;
  disabled?: boolean;
}

interface CellProps {
  value: "X" | "O" | null;
  position: number;
  isWinningCell: boolean;
  isGhostPiece: boolean;
  isClickable: boolean;
  onClick: () => void;
  playerSymbol: "X" | "O" | null;
  moveAge?: number; // For showing piece age in infinite mode
}

function GameCell({
  value,
  position,
  isWinningCell,
  isGhostPiece,
  isClickable,
  onClick,
  playerSymbol,
  moveAge,
}: CellProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showGhost, setShowGhost] = useState(false);

  useEffect(() => {
    if (value && !isAnimating) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [value, isAnimating]);

  const handleClick = () => {
    if (isClickable && !value) {
      onClick();
    }
  };

  const handleMouseEnter = () => {
    if (isClickable && !value && playerSymbol) {
      setShowGhost(true);
    }
  };

  const handleMouseLeave = () => {
    setShowGhost(false);
  };

  const getCellClasses = () => {
    return cn(
      "relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32",
      "bg-game-cell border-2 border-slate-300 dark:border-slate-600",
      "rounded-lg shadow-cell transition-all duration-200",
      "flex items-center justify-center cursor-pointer",
      isClickable &&
        !value &&
        "hover:bg-game-cellHover hover:border-primary-400 hover:shadow-lg",
      isWinningCell && "winning-line bg-game-winning border-game-winning",
      !isClickable && "cursor-not-allowed opacity-75",
    );
  };

  const getPieceClasses = (piece: "X" | "O") => {
    const baseClasses =
      "w-16 h-16 sm:w-20 sm:h-20 drop-shadow-piece transition-all duration-200";

    if (piece === "X") {
      return cn(
        baseClasses,
        "text-game-x stroke-2",
        isAnimating && "game-piece-enter",
        isGhostPiece && "ghost-piece",
        moveAge !== undefined && moveAge > 0 && "opacity-80",
      );
    } else {
      return cn(
        baseClasses,
        "text-game-o stroke-2",
        isAnimating && "game-piece-enter",
        isGhostPiece && "ghost-piece",
        moveAge !== undefined && moveAge > 0 && "opacity-80",
      );
    }
  };

  return (
    <div
      className={getCellClasses()}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Actual piece */}
      {value && (
        <div className="relative">
          {value === "X" ? (
            <X className={getPieceClasses("X")} />
          ) : (
            <Circle className={getPieceClasses("O")} />
          )}
          {/* Move age indicator for infinite mode */}
          {moveAge !== undefined && moveAge > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-500 text-white text-xs rounded-full flex items-center justify-center">
              {moveAge}
            </div>
          )}
        </div>
      )}

      {/* Ghost piece on hover */}
      {showGhost && playerSymbol && !value && (
        <div className="ghost-piece">
          {playerSymbol === "X" ? (
            <X className={getPieceClasses("X")} />
          ) : (
            <Circle className={getPieceClasses("O")} />
          )}
        </div>
      )}

      {/* Position indicator (for debugging) */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute bottom-0 right-0 text-xs text-gray-400 bg-black bg-opacity-50 px-1 rounded">
          {position}
        </div>
      )}
    </div>
  );
}

export default function GameBoard({
  gameState,
  currentTurn,
  currentUserId,
  player1Id,
  player2Id,
  winner,
  isDraw,
  isGameOver,
  onMakeMove,
  disabled = false,
}: GameBoardProps) {
  const [parsedGameState, setParsedGameState] = useState<GameState | null>(
    null,
  );
  const [winningPositions, setWinningPositions] = useState<number[]>([]);

  // Parse game state
  useEffect(() => {
    try {
      const state = deserializeGameState(gameState);
      setParsedGameState(state);

      // Calculate winning positions from winning line if available
      if (state.winningLine) {
        const positions = state.winningLine.map((pos) => pos.row * 3 + pos.col);
        setWinningPositions(positions);
      } else {
        // Try to detect winning positions from the board state
        const board = Array.isArray(state.board[0])
          ? state.board.flat()
          : state.board;
        const winLines = [
          [0, 1, 2],
          [3, 4, 5],
          [6, 7, 8], // rows
          [0, 3, 6],
          [1, 4, 7],
          [2, 5, 8], // columns
          [0, 4, 8],
          [2, 4, 6], // diagonals
        ];

        for (const line of winLines) {
          const [a, b, c] = line;
          if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            setWinningPositions(line);
            return;
          }
        }
        setWinningPositions([]);
      }
    } catch (error) {
      console.error("Error parsing game state:", error);
    }
  }, [gameState]);

  // Determine current player's symbol
  const getCurrentPlayerSymbol = (): "X" | "O" | null => {
    if (currentTurn === player1Id) return "X";
    if (currentTurn === player2Id) return "O";
    return null;
  };

  // Check if current user can make a move
  const canMakeMove = useCallback(() => {
    return (
      !disabled &&
      !isGameOver &&
      currentTurn === currentUserId &&
      parsedGameState !== null
    );
  }, [disabled, isGameOver, currentTurn, currentUserId, parsedGameState]);

  // Get move age for a position (for infinite mode visualization)
  const getMoveAge = (position: number): number | undefined => {
    if (!parsedGameState) return undefined;

    const moves = parsedGameState.moveHistory;
    if (!moves || moves.length === 0) return undefined;

    // Filter moves for this position
    const positionMoves = moves.filter((move) => {
      if (typeof move.position === "number") {
        return move.position === position;
      }
      return move.position.row * 3 + move.position.col === position;
    });

    if (positionMoves.length === 0) return undefined;

    const latestMove = positionMoves[positionMoves.length - 1];
    const playerMoves = moves.filter(
      (move) => move.player === latestMove.player,
    );
    const moveIndex = playerMoves.findIndex((move) => move === latestMove);

    return playerMoves.length - moveIndex - 1;
  };

  if (!parsedGameState) {
    return (
      <div className="flex items-center justify-center w-full h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const playerSymbol = getCurrentPlayerSymbol();
  const isMyTurn = canMakeMove();

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Game Status */}
      <div className="text-center">
        {isGameOver ? (
          <div className="space-y-2">
            {winner ? (
              <div className="flex items-center justify-center space-x-2 text-2xl font-bold">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <span
                  className={cn(
                    winner === currentUserId
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400",
                  )}
                >
                  {winner === currentUserId
                    ? "You Won!"
                    : winner === player1Id
                      ? "Player 1 Wins!"
                      : "Player 2 Wins!"}
                </span>
              </div>
            ) : isDraw ? (
              <div className="flex items-center justify-center space-x-2 text-2xl font-bold text-gray-600 dark:text-gray-400">
                <span>It's a Draw!</span>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2 text-lg font-medium">
              <Clock className="h-5 w-5 text-primary-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {isMyTurn
                  ? "Your Turn"
                  : currentTurn === player1Id
                    ? "Player 1's Turn"
                    : "Player 2's Turn"}
              </span>
            </div>
            {isMyTurn && (
              <div className="text-sm text-primary-600 dark:text-primary-400 animate-pulse">
                Click on an empty cell to make your move
              </div>
            )}
          </div>
        )}
      </div>

      {/* Game Mode Info */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <div className="flex items-center space-x-2 text-sm text-blue-800 dark:text-blue-200">
          <Zap className="h-4 w-4" />
          <span className="font-medium">Infinite Mode:</span>
          <span>
            Max 3 pieces per player • Oldest piece disappears when placing 4th
          </span>
        </div>
      </div>

      {/* Game Board */}
      <div className="relative">
        <div className="grid grid-cols-3 gap-2 sm:gap-3 p-6 bg-game-board rounded-xl shadow-game">
          {(Array.isArray(parsedGameState.board[0])
            ? parsedGameState.board.flat()
            : parsedGameState.board
          ).map((cell, position) => {
            const isWinningCell = winningPositions.includes(position);
            const moveAge = getMoveAge(position);

            return (
              <GameCell
                key={position}
                value={cell}
                position={position}
                isWinningCell={isWinningCell}
                isGhostPiece={false}
                isClickable={isMyTurn}
                onClick={() => onMakeMove(position)}
                playerSymbol={playerSymbol}
                moveAge={moveAge}
              />
            );
          })}
        </div>

        {/* Loading overlay */}
        {disabled && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Game Statistics */}
      {parsedGameState.gameMode === "infinite" && (
        <div className="grid grid-cols-2 gap-4 w-full max-w-md text-center">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow">
            <div className="text-2xl font-bold text-game-x">
              {
                parsedGameState.moveHistory.filter((m) => m.player === "X")
                  .length
              }
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Player 1 Moves
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow">
            <div className="text-2xl font-bold text-game-o">
              {
                parsedGameState.moveHistory.filter((m) => m.player === "O")
                  .length
              }
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Player 2 Moves
            </div>
          </div>
        </div>
      )}

      {/* Move History (for debugging) */}
      {process.env.NODE_ENV === "development" &&
        parsedGameState.moveHistory.length > 0 && (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 max-w-md w-full">
            <h4 className="font-medium mb-2">Move History:</h4>
            <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
              {parsedGameState.moveHistory.slice(-10).map((move, index) => (
                <div key={index} className="flex justify-between">
                  <span>
                    {move.player}:{" "}
                    {typeof move.position === "number"
                      ? move.position
                      : `(${move.position.row}, ${move.position.col})`}
                  </span>
                  <span className="text-gray-500">
                    #{(move as any).moveNumber || index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
