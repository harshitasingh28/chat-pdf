import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    if (!body.chatId) {
      return NextResponse.json(
        { error: "chatId is required" },
        { status: 400 }
      );
    }

    const chatIdNumber = Number(body.chatId);

    if (isNaN(chatIdNumber)) {
      return NextResponse.json(
        { error: "Invalid chatId" },
        { status: 400 }
      );
    }

    const _messages = await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatIdNumber))
      .orderBy(asc(messages.id));

    console.log("Fetched messages:", _messages);

    return NextResponse.json(_messages);
  } catch (error) {
    console.error("Fetch messages error:", error);

    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
};