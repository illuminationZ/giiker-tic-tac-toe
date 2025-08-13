"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Zap, Play, Users, Trophy } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      console.log("No session, redirecting to signin");
      router.push("/auth/signin");
    }
  }, [session, status, router]);

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
                GiiKER Tic-Tac-Toe
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Welcome, {session.user.username}!
              </span>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Infinite Tic-Tac-Toe!
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Experience the revolutionary game mode where strategy truly matters
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Quick Play
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow">
              <Play className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Game Lobby
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Join or create games
              </p>
              <Link href="/game/lobby">
                <Button className="w-full">
                  Play Now
                </Button>
              </Link>
            </div>

            <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Quick Start
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create a game instantly
              </p>
              <Link href="/game/lobby">
                <Button variant="outline" className="w-full">
                  Create Game
                </Button>
              </Link>
            </div>

            <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow">
              <Trophy className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Try Demo
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Test the game board
              </p>
              <Link href="/game/demo">
                <Button variant="secondary" className="w-full">
                  Play Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* How to Play */}
        <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-6 text-center">
            How Infinite Tic-Tac-Toe Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
                🎯 The Rules
              </h4>
              <ul className="space-y-2 text-blue-700 dark:text-blue-300">
                <li>• Each player can have maximum 3 pieces on the board</li>
                <li>
                  • When you place your 4th piece, your oldest piece disappears
                </li>
                <li>• First player to get 3 in a row wins</li>
                <li>• No more boring draws - every game is dynamic!</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
                🧠 Strategy Tips
              </h4>
              <ul className="space-y-2 text-blue-700 dark:text-blue-300">
                <li>• Plan which piece will disappear next</li>
                <li>• Use older pieces as temporary blockers</li>
                <li>• Think 2-3 moves ahead</li>
                <li>• Control the center when possible</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Authentication Status */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">
              Successfully authenticated as {session.user.email}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
