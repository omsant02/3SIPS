import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
const AGENT_ID = process.env.NEXT_PUBLIC_AGENT_ID;

export async function POST(request: NextRequest) {
  try {
    const { userId, initialMessage } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    if (!AGENT_ID) {
      return NextResponse.json(
        { error: "Agent ID not configured" },
        { status: 500 },
      );
    }

    // Generate a new session ID
    const sessionId = uuidv4();

    console.log(
      `[API] Creating new chat session: ${sessionId} for user: ${userId}`,
    );

    try {
      // Create DM channel for this session using get-or-create with sessionId
      const dmChannelResponse = await fetch(
        `http://localhost:4000/api/dm-channel/get-or-create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            agentId: AGENT_ID,
            sessionId: sessionId, // This ensures it only finds channels with this exact sessionId
            initialMessage: initialMessage, // Pass the initial message to be stored in metadata
          }),
        },
      );

      if (!dmChannelResponse.ok) {
        const errorText = await dmChannelResponse.text();
        console.error(`[API] Failed to create DM channel:`, errorText);
        throw new Error(`Failed to create DM channel: ${errorText}`);
      }

      const dmChannelData = await dmChannelResponse.json();
      const channelId = dmChannelData.channel?.id;

      if (!channelId) {
        throw new Error("No channel ID returned from DM channel creation");
      }

      console.log(
        `[API] Created DM channel: ${channelId} for session: ${sessionId}`,
      );

      return NextResponse.json({
        success: true,
        data: {
          sessionId,
          channelId,
          userId,
          agentId: AGENT_ID,
          initialMessage,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("[API] Error creating DM channel:", error);
      throw error;
    }
  } catch (error) {
    console.error("[API] Error creating chat session:", error);
    return NextResponse.json(
      {
        error: "Failed to create chat session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
