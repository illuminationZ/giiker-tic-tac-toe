"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import GameBoard from "@/components/game/GameBoard";
import { Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DemoGamePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [gameState, setGameState] = useState(() => ({
    board: Array(9).fill(null),
    currentPlayer: "X" as "X" | "O" | null,
    status: "playing" as "waiting" | "playing" | "finished",
    winner: null as "X" | "O" | "draw" | null,
    moveHistory: [] as Array<{
      player: "X" | "O";
      position: number;
      timestamp: number;
    }>,
    playerPieces: { X: [], O: [] },
    gameMode: "demo" as const,
    winningLine: null as Array<{ row: number; col: number }> | null,
  }));

  const [currentTurn, setCurrentTurn] = useState("player1");
  const [winner, setWinner] = useState<string | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [player1Name, setPlayer1Name] = useState("Player 1");
  const [player2Name, setPlayer2Name] = useState("Player 2");
  const [showPlayerSetup, setShowPlayerSetup] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<
    "player1" | "player2" | null
  >(null);

  // Redirect if not authenticated
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  const handleMakeMove = (position: number) => {
    if (isGameOver || winner) return;

    const row = Math.floor(position / 3);
    const col = position % 3;

    // Check if the cell is already occupied
    if (gameState.board[row][col] !== null) return;

    // Make the move
    const newBoard = [...gameState.board];
    const currentPlayer = currentTurn === "player1" ? "X" : "O";
    newBoard[position] = currentPlayer;

    // Add to moves history
    const newMoveHistory = [
      ...gameState.moveHistory,
      {
        player: currentPlayer,
        position,
        timestamp: Date.now(),
      },
    ];

    // Update player pieces
    const newPlayerPieces = { ...gameState.playerPieces };
    newPlayerPieces[currentPlayer] = [
      ...newPlayerPieces[currentPlayer],
      position,
    ];

    // Remove oldest piece if more than 3
    if (newPlayerPieces[currentPlayer].length > 3) {
      const oldestPosition = newPlayerPieces[currentPlayer].shift()!;
      newBoard[oldestPosition] = null;
    }

    // Check for win
    const isWin = checkWin(newBoard);
    const isDrawGame = !isWin && newBoard.every((cell) => cell !== null);

    const newGameState = {
      ...gameState,
      board: newBoard,
      currentPlayer: currentPlayer,
      status: isWin || isDrawGame ? "finished" : "playing",
      winner: isWin ? currentPlayer : isDrawGame ? "draw" : null,
      moveHistory: newMoveHistory,
      playerPieces: newPlayerPieces,
      winningLine: null,
    };

    setGameState(newGameState);

    if (isWin) {
      setWinner(currentTurn);
      setIsGameOver(true);
    } else if (isDrawGame) {
      setIsDraw(true);
      setIsGameOver(true);
    } else {
      // Switch turns
      setCurrentTurn(currentTurn === "player1" ? "player2" : "player1");
    }
  };

  const checkWin = (board: (string | null)[]) => {
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
        return true;
      }
    }
    return false;
  };

  const resetGame = () => {
    setGameState({
      board: Array(9).fill(null),
      currentPlayer: "X",
      status: "playing",
      winner: null,
      moveHistory: [],
      playerPieces: { X: [], O: [] },
      gameMode: "demo",
      winningLine: null,
    });
    setCurrentTurn("player1");
    setWinner(null);
    setIsDraw(false);
    setIsGameOver(false);
  };

  const startNewGame = () => {
    setShowPlayerSetup(true);
    setSelectedPlayer(null);
    resetGame();
  };

  const handleStartGame = () => {
    if (!selectedPlayer) {
      alert("Please select which player you want to be!");
      return;
    }
    setShowPlayerSetup(false);
    resetGame();
  };

  const isMyTurn = selectedPlayer === currentTurn;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 shadow-lg border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Zap className="h-8 w-8 text-primary-600" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Demo Game
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Demo Mode - 2 Players Local
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Player Setup */}
        {showPlayerSetup && (
          <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 mb-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Set Up Players
            </h2>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Player 1 (X)
                </label>
                <input
                  type="text"
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter Player 1 name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Player 2 (O)
                </label>
                <input
                  type="text"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter Player 2 name"
                />
              </div>

              {/* Player Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Which player are you?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPlayer("player1")}
                    className={`p-3 border rounded-md text-center transition-colors ${
                      selectedPlayer === "player1"
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300"
                        : "border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600"
                    }`}
                  >
                    <div className="font-semibold">{player1Name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      (X - Goes First)
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlayer("player2")}
                    className={`p-3 border rounded-md text-center transition-colors ${
                      selectedPlayer === "player2"
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300"
                        : "border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600"
                    }`}
                  >
                    <div className="font-semibold">{player2Name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      (O - Goes Second)
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <Button
                  onClick={handleStartGame}
                  className="w-full"
                  disabled={!selectedPlayer}
                >
                  Start Game
                </Button>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Both players will use this device to play. When it's your
                  turn, make your move!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Game Status */}
        {!showPlayerSetup && (
          <div className="mb-8 text-center">
            {isGameOver ? (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200">
                  {winner
                    ? `Game Over! ${winner === "player1" ? player1Name : player2Name} wins!`
                    : "Game ended in a draw!"}
                </h2>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h2 className="text-xl font-bold text-green-800 dark:text-green-200">
                  Current Turn:{" "}
                  {currentTurn === "player1" ? player1Name : player2Name} (
                  {currentTurn === "player1" ? "X" : "O"})
                </h2>
                {selectedPlayer && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                    You are:{" "}
                    {selectedPlayer === "player1" ? player1Name : player2Name} (
                    {selectedPlayer === "player1" ? "X" : "O"})
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Game Board */}
        {!showPlayerSetup && (
          <div className="flex justify-center mb-8">
            <GameBoard
              gameState={JSON.stringify(gameState)}
              currentTurn={currentTurn}
              currentUserId={selectedPlayer || "player1"}
              player1Id="player1"
              player2Id="player2"
              winner={winner}
              isDraw={isDraw}
              isGameOver={isGameOver}
              onMakeMove={handleMakeMove}
              disabled={isGameOver}
            />
          </div>
        )}

        {/* Game Actions */}
        {!showPlayerSetup && (
          <div className="text-center space-x-4">
            <Button onClick={startNewGame} variant="outline">
              New Game
            </Button>
            <Link href="/game/lobby">
              <Button>Play Online</Button>
            </Link>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Demo Mode Instructions
          </h3>
          <ul className="text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>
              • This is a 2-player local demo - two people can play on the same
              device
            </li>
            <li>
              • Enter names for both players and select which player you are
            </li>
            <li>• Players take turns making moves (X goes first)</li>
            <li>
              • The game uses Infinite Mode rules (max 3 pieces per player)
            </li>
            <li>
              • Click "Play Online" to experience the full multiplayer game
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
