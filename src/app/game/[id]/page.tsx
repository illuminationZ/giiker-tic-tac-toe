"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useSocket } from "@/components/providers/SocketProvider";
import { useToast } from "@/components/providers/ToastProvider";
import GameBoard from "@/components/game/GameBoard";
import { Zap, Users, Copy, ArrowLeft, Trophy, Clock } from "lucide-react";
import Link from "next/link";

interface GameData {
  id: string;
  player1: {
    id: string;
    username: string;
    avatar: string | null;
    isOnline: boolean;
  };
  player2: {
    id: string;
    username: string;
    avatar: string | null;
    isOnline: boolean;
  } | null;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  gameState: string;
  currentTurn: string | null;
  winner: string | null;
  isDraw: boolean;
  isPrivate: boolean;
  gameCode: string | null;
  createdAt: string;
}

export default function GameRoomPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { socket, isConnected, makeMove, leaveGame } = useSocket();
  const { addToast } = useToast();

  const [game, setGame] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMakingMove, setIsMakingMove] = useState(false);

  const gameId = params.id as string;

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  // Listen for game events
  useEffect(() => {
    const handleGameStarted = (event: CustomEvent) => {
      const gameData = event.detail;
      if (gameData.id === gameId) {
        setGame(gameData);
        addToast({
          type: "success",
          description: "Game started!",
        });
      }
    };

    const handleMoveMade = (event: CustomEvent) => {
      const { game: gameData, move } = event.detail;
      if (gameData.id === gameId) {
        setGame(gameData);
        setIsMakingMove(false);
      }
    };

    const handleGameEnded = (event: CustomEvent) => {
      const gameData = event.detail;
      if (gameData.id === gameId) {
        setGame(gameData);
        addToast({
          type: "info",
          description: gameData.winner ? "Game ended!" : "It's a draw!",
        });
      }
    };

    const handlePlayerDisconnected = (event: CustomEvent) => {
      const { playerId } = event.detail;
      addToast({
        type: "warning",
        description: "A player has disconnected",
      });
    };

    const handlePlayerReconnected = (event: CustomEvent) => {
      const { playerId } = event.detail;
      addToast({
        type: "success",
        description: "A player has reconnected",
      });
    };

    window.addEventListener("gameStarted", handleGameStarted as EventListener);
    window.addEventListener("moveMade", handleMoveMade as EventListener);
    window.addEventListener("gameEnded", handleGameEnded as EventListener);
    window.addEventListener("playerDisconnected", handlePlayerDisconnected as EventListener);
    window.addEventListener("playerReconnected", handlePlayerReconnected as EventListener);

    return () => {
      window.removeEventListener("gameStarted", handleGameStarted as EventListener);
      window.removeEventListener("moveMade", handleMoveMade as EventListener);
      window.removeEventListener("gameEnded", handleGameEnded as EventListener);
      window.removeEventListener("playerDisconnected", handlePlayerDisconnected as EventListener);
      window.removeEventListener("playerReconnected", handlePlayerReconnected as EventListener);
    };
  }, [gameId, addToast]);

  // Fetch game data
  useEffect(() => {
    if (status === "authenticated" && gameId) {
      fetchGameData();
    }
  }, [status, gameId]);

  const fetchGameData = async () => {
    try {
      // For now, we'll create a mock game state since we don't have a proper API
      const mockGame: GameData = {
        id: gameId,
        player1: {
          id: "player1",
          username: "Player 1",
          avatar: null,
          isOnline: true,
        },
        player2: {
          id: "player2",
          username: "Player 2",
          avatar: null,
          isOnline: true,
        },
        status: "IN_PROGRESS",
        gameState: JSON.stringify({
          board: [
            [null, null, null],
            [null, null, null],
            [null, null, null],
          ],
          moves: [],
          gameMode: "infinite",
          winningLine: null,
        }),
        currentTurn: "player1",
        winner: null,
        isDraw: false,
        isPrivate: false,
        gameCode: "ABC123",
        createdAt: new Date().toISOString(),
      };

      setGame(mockGame);
    } catch (error) {
      console.error("Error fetching game data:", error);
      addToast({
        type: "error",
        description: "Failed to load game",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakeMove = (position: number) => {
    if (!isConnected || !game || isMakingMove) {
      return;
    }

    setIsMakingMove(true);
    makeMove(gameId, position);
  };

  const handleLeaveGame = () => {
    if (isConnected && game) {
      leaveGame(gameId);
    }
    router.push("/game/lobby");
  };

  const copyGameCode = () => {
    if (game?.gameCode) {
      navigator.clipboard.writeText(game.gameCode);
      addToast({
        type: "success",
        description: "Game code copied to clipboard!",
      });
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Game Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The game you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link href="/game/lobby">
            <Button>Back to Lobby</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isMyTurn = game.currentTurn === session.user.id;
  const isGameOver = Boolean(game.status === "COMPLETED" || game.winner || game.isDraw);
  const isWaitingForPlayers = game.status === "WAITING";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 shadow-lg border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/game/lobby">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Lobby
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Zap className="h-8 w-8 text-primary-600" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Game Room
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {/* Game Code */}
              {game.gameCode && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Code:</span>
                  <span className="font-mono font-medium text-primary-600">
                    {game.gameCode}
                  </span>
                  <Button
                    onClick={copyGameCode}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <Button
                onClick={handleLeaveGame}
                variant="outline"
                size="sm"
              >
                Leave Game
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Game Status */}
        <div className="mb-8">
          {isWaitingForPlayers ? (
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-yellow-800 dark:text-yellow-200">
                  Waiting for players to join...
                </span>
              </div>
            </div>
          ) : isGameOver ? (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800 dark:text-blue-200">
                  {game.winner ? `Game Over! ${game.winner === session.user.id ? 'You won!' : 'You lost!'}` : 'Game ended in a draw!'}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isMyTurn ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-green-800 dark:text-green-200">
                  {isMyTurn ? "Your turn!" : "Opponent's turn"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Players Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Player 1 */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {game.player1.username}
                </h3>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${game.player1.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {game.player1.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              {game.currentTurn === game.player1.id && !isGameOver && (
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>

          {/* Player 2 */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6">
            {game.player2 ? (
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {game.player2.username}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${game.player2.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {game.player2.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                {game.currentTurn === game.player2.id && !isGameOver && (
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                    Waiting for player...
                  </h3>
                  <span className="text-sm text-gray-400 dark:text-gray-500">
                    Share the game code to invite someone
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center">
          <GameBoard
            gameState={game.gameState}
            currentTurn={game.currentTurn}
            currentUserId={session.user.id}
            player1Id={game.player1.id}
            player2Id={game.player2?.id || ""}
            winner={game.winner}
            isDraw={game.isDraw}
            isGameOver={isGameOver}
            onMakeMove={handleMakeMove}
            disabled={!isConnected || isMakingMove || !isMyTurn || isGameOver || isWaitingForPlayers}
          />
        </div>

        {/* Game Actions */}
        {isGameOver && (
          <div className="mt-8 text-center">
            <div className="space-x-4">
              <Link href="/game/lobby">
                <Button>
                  Back to Lobby
                </Button>
              </Link>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Play Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
