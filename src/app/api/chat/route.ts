import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createOpenAI } from "@ai-sdk/openai";
import { NextResponse } from "next/server";
import { streamText } from "ai";

export const runtime = "nodejs";

const ollama = createOpenAI({
  baseURL: "http://127.0.0.1:11434/v1",
  apiKey: "ollama",
});

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();

    const chatIdNumber = parseInt(chatId);

    const _chats = await db
      .select()
      .from(chats)
      .where(eq(chats.id, chatIdNumber));

    if (_chats.length !== 1) {
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }

    const fileKey = _chats[0].fileKey;

    const lastMessage = messages[messages.length - 1];

    const question =
      lastMessage?.parts?.map((p: any) => p.text || "").join("") || "";

    const context = await getContext(question, fileKey);

    const systemPrompt = `
You are a helpful AI assistant that answers questions using the provided context.

START CONTEXT BLOCK
${context}
END CONTEXT BLOCK

If the context does not contain the answer say:
"I don't have enough information from the document."

Do not invent information.
`;

    const formattedMessages = messages
      .map((m: any) => ({
        role: m.role,
        content: m.parts?.map((p: any) => p.text || "").join("") || "",
      }))
      .filter((m: any) => m.content !== "");

    const finalMessages = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...formattedMessages,
    ];

    const result = streamText({
      model: ollama("llama3"),
      messages: finalMessages,
    });

    // ✅ IMPORTANT: return AI SDK stream
    return result.toTextStreamResponse();

  } catch (error) {
    console.error("Chat error:", error);

    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}