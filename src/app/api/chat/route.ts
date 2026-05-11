import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import { chats, messages as _message } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createOpenAI } from "@ai-sdk/openai";
import { NextResponse } from "next/server";
import { generateText } from "ai";

export const runtime = "nodejs";

const ollama = createOpenAI({
  baseURL: "http://127.0.0.1:11434/v1",
  apiKey: "ollama",
});

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();
    const chatIdNumber = Number(chatId);

    console.log("CHAT ID:", chatIdNumber);

    const _chats = await db
      .select()
      .from(chats)
      .where(eq(chats.id, chatIdNumber));

    if (_chats.length !== 1) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const fileKey = _chats[0].fileKey;

    const lastMessage = messages[messages.length - 1];
    const question =
      lastMessage?.parts?.map((p: any) => p.text || "").join("") || "";

    console.log("QUESTION:", question);

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
      .filter((m: any) => m.content.trim() !== "");

    const finalMessages = [
      { role: "system", content: systemPrompt },
      ...formattedMessages,
    ];

    const result = await generateText({
      model: ollama("llama3"),
      messages: finalMessages,
    });

    const answer = result.text || "";

    console.log("ANSWER:", answer);

    // Save user
    const savedUser = await db.insert(_message).values({
      chatId: chatIdNumber,
      content: question,
      role: "user",
    });

    console.log("USER SAVED:", savedUser);

    // Save assistant
    const savedAssistant = await db.insert(_message).values({
      chatId: chatIdNumber,
      content: answer,
      role: "assistant",
    });

    console.log("ASSISTANT SAVED:", savedAssistant);

    return NextResponse.json({
      role: "assistant",
      content: answer,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}