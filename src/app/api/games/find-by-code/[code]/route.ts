import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gameCode = params.code.toUpperCase();

    if (!gameCode || gameCode.length !== 6) {
      return NextResponse.json(
        { error: "Invalid game code format" },
        { status: 400 }
      );
    }

    // Find game by code
    const game = await prisma.game.findUnique({
      where: {
        gameCode,
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
    });

    if (!game) {
      return NextResponse.json(
        { error: "Game not found with this code" },
        { status: 404 }
      );
    }

    // Check if game is still joinable
    if (game.status !== "WAITING") {
      return NextResponse.json(
        { error: "Game is no longer accepting players" },
        { status: 400 }
      );
    }

    if (game.player2Id) {
      return NextResponse.json(
        { error: "Game is already full" },
        { status: 400 }
      );
    }

    // Check if user is trying to join their own game
    if (game.player1Id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot join your own game" },
        { status: 400 }
      );
    }

    // Return game data
    const gameData = {
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
      status: game.status,
      isPrivate: game.isPrivate,
      gameCode: game.gameCode,
      createdAt: game.createdAt.toISOString(),
      updatedAt: game.updatedAt.toISOString(),
    };

    return NextResponse.json(gameData);
  } catch (error) {
    console.error("Error finding game by code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
