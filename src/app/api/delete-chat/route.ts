import { db } from "@/lib/db";
import { chats, messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const chatId = Number(body.chatId);

    if (!chatId || isNaN(chatId)) {
      return NextResponse.json(
        { error: "Invalid chatId" },
        { status: 400 }
      );
    }

    await db.delete(messages).where(eq(messages.chatId, chatId));
    await db.delete(chats).where(eq(chats.id, chatId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete chat error:", error);
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 }
    );
  }
};