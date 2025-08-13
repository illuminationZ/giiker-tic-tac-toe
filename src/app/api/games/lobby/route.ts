import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(_: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch active games that are waiting for players
    const activeGames = await prisma.game.findMany({
      where: {
        status: "WAITING",
        player2Id: null,
        // Don't show private games without code
        OR: [
          { isPrivate: false },
          {
            isPrivate: true,
            gameCode: { not: null },
          },
        ],
      },
      include: {
        player1: {
          select: {
            id: true,
            username: true,
            avatar: true,
            gamesWon: true,
            totalGames: true,
          },
        },
        player2: {
          select: {
            id: true,
            username: true,
            avatar: true,
            gamesWon: true,
            totalGames: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit to 50 most recent games
    });

    // Transform the data for client consumption
    const lobbies = activeGames.map((game) => ({
      id: game.id,
      player1: {
        id: game.player1.id,
        username: game.player1.username,
        avatar: game.player1.avatar,
        gamesWon: game.player1.gamesWon,
        totalGames: game.player1.totalGames,
      },
      player2: game.player2
        ? {
            id: game.player2.id,
            username: game.player2.username,
            avatar: game.player2.avatar,
            gamesWon: game.player2.gamesWon,
            totalGames: game.player2.totalGames,
          }
        : null,
      isPrivate: game.isPrivate,
      gameCode: game.gameCode,
      createdAt: game.createdAt.toISOString(),
    }));

    return NextResponse.json(lobbies);
  } catch (error) {
    console.error("Error fetching game lobbies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
