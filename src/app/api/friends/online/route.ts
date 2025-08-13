import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all accepted friendships for the current user
    const friendships = await prisma.friend.findMany({
      where: {
        OR: [
          { senderId: session.user.id, status: "ACCEPTED" },
          { receiverId: session.user.id, status: "ACCEPTED" },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
            updatedAt: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            avatar: true,
            updatedAt: true,
          },
        },
      },
    });

    // Consider users online if they've been active in the last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const onlineFriends = friendships.map((friendship) => {
      // Determine which user object to use based on who is the friend
      const friend =
        friendship.senderId === session.user.id
          ? friendship.receiver
          : friendship.sender;

      // Check if the friend is "online" (active in the last 10 minutes)
      const isOnline = friend.updatedAt > tenMinutesAgo;

      return {
        id: friend.id,
        username: friend.username,
        avatar: friend.avatar,
        isOnline,
        lastSeen: friend.updatedAt.toISOString(),
      };
    });

    return NextResponse.json(onlineFriends);
  } catch (error) {
    console.error("Error fetching online friends:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
