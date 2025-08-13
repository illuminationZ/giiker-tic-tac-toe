import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user with current stats
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        username: true,
        gamesWon: true,
        gamesLost: true,
        gamesDrawn: true,
        totalGames: true,
        winStreak: true,
        bestStreak: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate additional statistics
    const winRate = user.totalGames > 0 ? (user.gamesWon / user.totalGames) * 100 : 0;
    const lossRate = user.totalGames > 0 ? (user.gamesLost / user.totalGames) * 100 : 0;
    const drawRate = user.totalGames > 0 ? (user.gamesDrawn / user.totalGames) * 100 : 0;

    // Get recent games for additional insights
    const recentGames = await prisma.game.findMany({
      where: {
        OR: [
          { player1Id: session.user.id },
          { player2Id: session.user.id },
        ],
        status: "COMPLETED",
      },
      orderBy: {
        endedAt: "desc",
      },
      take: 10,
      select: {
        id: true,
        winner: true,
        isDraw: true,
        endedAt: true,
        player1Id: true,
        player2Id: true,
      },
    });

    // Calculate recent performance (last 10 games)
    const recentWins = recentGames.filter(game => game.winner === session.user.id).length;
    const recentLosses = recentGames.filter(game => game.winner && game.winner !== session.user.id).length;
    const recentDraws = recentGames.filter(game => game.isDraw).length;
    const recentWinRate = recentGames.length > 0 ? (recentWins / recentGames.length) * 100 : 0;

    // Get game activity by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const gameActivity = await prisma.game.findMany({
      where: {
        OR: [
          { player1Id: session.user.id },
          { player2Id: session.user.id },
        ],
        status: "COMPLETED",
        endedAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        endedAt: true,
      },
    });

    // Group games by date
    const activityByDate: { [key: string]: number } = {};
    gameActivity.forEach(game => {
      if (game.endedAt) {
        const date = game.endedAt.toISOString().split('T')[0];
        activityByDate[date] = (activityByDate[date] || 0) + 1;
      }
    });

    // Get rank/position (simplified ranking by wins)
    const usersWithMoreWins = await prisma.user.count({
      where: {
        gamesWon: {
          gt: user.gamesWon,
        },
      },
    });
    const rank = usersWithMoreWins + 1;

    const stats = {
      // Basic stats
      gamesWon: user.gamesWon,
      gamesLost: user.gamesLost,
      gamesDrawn: user.gamesDrawn,
      totalGames: user.totalGames,
      winStreak: user.winStreak,
      bestStreak: user.bestStreak,

      // Calculated percentages
      winRate: Math.round(winRate * 100) / 100,
      lossRate: Math.round(lossRate * 100) / 100,
      drawRate: Math.round(drawRate * 100) / 100,

      // Recent performance
      recentGames: {
        total: recentGames.length,
        wins: recentWins,
        losses: recentLosses,
        draws: recentDraws,
        winRate: Math.round(recentWinRate * 100) / 100,
      },

      // Activity data
      gameActivity: activityByDate,
      totalGamesLast30Days: gameActivity.length,

      // Ranking
      rank,

      // Profile info
      username: user.username,
      memberSince: user.createdAt.toISOString(),

      // Achievement progress (you can expand this)
      achievements: {
        firstWin: user.gamesWon >= 1,
        winStreak5: user.bestStreak >= 5,
        winStreak10: user.bestStreak >= 10,
        veteran: user.totalGames >= 100,
        master: user.gamesWon >= 50,
        perfectRecord: user.totalGames >= 10 && user.gamesLost === 0 && user.gamesDrawn === 0,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    // Reset stats (admin function or user preference)
    if (action === "reset") {
      await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          gamesWon: 0,
          gamesLost: 0,
          gamesDrawn: 0,
          totalGames: 0,
          winStreak: 0,
          bestStreak: 0,
        },
      });

      return NextResponse.json({ message: "Stats reset successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating user stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
