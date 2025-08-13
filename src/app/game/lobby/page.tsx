"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSocket } from "@/components/providers/SocketProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Zap, Users, Plus, Search, Clock, User } from "lucide-react";
import Link from "next/link";

interface GameLobby {
  id: string;
  player1: {
    id: string;
    username: string;
    avatar: string | null;
    gamesWon: number;
    totalGames: number;
  };
  player2: {
    id: string;
    username: string;
    avatar: string | null;
    gamesWon: number;
    totalGames: number;
  } | null;
  isPrivate: boolean;
  gameCode: string | null;
  createdAt: string;
}

export default function GameLobbyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { socket, isConnected, createGame } = useSocket();
  const { addToast } = useToast();

  const [lobbies, setLobbies] = useState<GameLobby[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [gameCode, setGameCode] = useState("");
  const [isJoiningByCode, setIsJoiningByCode] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  // Fetch available lobbies
  useEffect(() => {
    if (status === "authenticated") {
      fetchLobbies();
    }
  }, [status]);

  // Listen for game events
  useEffect(() => {
    const handleGameCreated = (event: CustomEvent) => {
      const game = event.detail;
      addToast({
        type: "success",
        description: `Game created! Code: ${game.gameCode || "Public"}`,
      });
      router.push(`/game/${game.id}`);
    };

    const handleGameJoined = (event: CustomEvent) => {
      const game = event.detail;
      addToast({
        type: "success",
        description: "Joined game successfully!",
      });
      router.push(`/game/${game.id}`);
    };

    window.addEventListener("gameCreated", handleGameCreated as EventListener);
    window.addEventListener("gameJoined", handleGameJoined as EventListener);

    return () => {
      window.removeEventListener("gameCreated", handleGameCreated as EventListener);
      window.removeEventListener("gameJoined", handleGameJoined as EventListener);
    };
  }, [router, addToast]);

  const fetchLobbies = async () => {
    try {
      const response = await fetch("/api/games/lobby");
      if (response.ok) {
        const data = await response.json();
        setLobbies(data);
      } else {
        addToast({
          type: "error",
          description: "Failed to fetch game lobbies",
        });
      }
    } catch (error) {
      console.error("Error fetching lobbies:", error);
      addToast({
        type: "error",
        description: "Failed to fetch game lobbies",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGame = async (isPrivate: boolean = false) => {
    if (!isConnected) {
      addToast({
        type: "error",
        description: "Not connected to game server",
      });
      return;
    }

    setIsCreatingGame(true);
    try {
      createGame({ isPrivate });
    } catch (error) {
      console.error("Error creating game:", error);
      addToast({
        type: "error",
        description: "Failed to create game",
      });
    } finally {
      setIsCreatingGame(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!gameCode.trim()) {
      addToast({
        type: "error",
        description: "Please enter a game code",
      });
      return;
    }

    setIsJoiningByCode(true);
    try {
      const response = await fetch(`/api/games/find-by-code/${gameCode.trim()}`);
      if (response.ok) {
        const game = await response.json();
        if (socket && isConnected) {
          socket.emit("joinGame", game.id);
        } else {
          router.push(`/game/${game.id}`);
        }
      } else {
        const error = await response.json();
        addToast({
          type: "error",
          description: error.error || "Failed to join game",
        });
      }
    } catch (error) {
      console.error("Error joining game:", error);
      addToast({
        type: "error",
        description: "Failed to join game",
      });
    } finally {
      setIsJoiningByCode(false);
    }
  };

  const handleJoinGame = (gameId: string) => {
    if (!isConnected) {
      addToast({
        type: "error",
        description: "Not connected to game server",
      });
      return;
    }

    socket?.emit("joinGame", gameId);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 shadow-lg border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Game Lobby
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <Link href="/">
                <Button variant="outline" size="sm">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Connection Status */}
        {!isConnected && (
          <div className="mb-6 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-red-800 dark:text-red-200">
                Not connected to game server. Please wait...
              </span>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Create Public Game */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6">
            <div className="text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Create Public Game
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start a public game that anyone can join
              </p>
              <Button
                onClick={() => handleCreateGame(false)}
                loading={isCreatingGame}
                disabled={!isConnected}
                className="w-full"
              >
                Create Game
              </Button>
            </div>
          </div>

          {/* Create Private Game */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6">
            <div className="text-center">
              <Plus className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Create Private Game
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create a private room with a game code
              </p>
              <Button
                onClick={() => handleCreateGame(true)}
                loading={isCreatingGame}
                disabled={!isConnected}
                variant="outline"
                className="w-full"
              >
                Create Private
              </Button>
            </div>
          </div>

          {/* Join by Code */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6">
            <div className="text-center">
              <Search className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Join by Code
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Enter a 6-digit game code to join
              </p>
              <div className="space-y-3">
                <Input
                  placeholder="Enter game code"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="text-center text-lg font-mono"
                />
                <Button
                  onClick={handleJoinByCode}
                  loading={isJoiningByCode}
                  disabled={!isConnected || !gameCode.trim()}
                  className="w-full"
                >
                  Join Game
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Available Games */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Available Games
            </h2>
            <Button
              onClick={fetchLobbies}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : lobbies.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No games available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Be the first to create a game!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lobbies.map((lobby) => (
                <div
                  key={lobby.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {lobby.player1.username}
                      </span>
                    </div>
                    {lobby.isPrivate && (
                      <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                        Private
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Games Won:</span>
                      <span className="font-medium">{lobby.player1.gamesWon}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Total Games:</span>
                      <span className="font-medium">{lobby.player1.totalGames}</span>
                    </div>
                    {lobby.gameCode && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Code:</span>
                        <span className="font-mono font-medium text-primary-600">
                          {lobby.gameCode}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleJoinGame(lobby.id)}
                    disabled={!isConnected || lobby.player1.id === session.user.id}
                    className="w-full"
                    size="sm"
                  >
                    {lobby.player1.id === session.user.id ? "Your Game" : "Join Game"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
