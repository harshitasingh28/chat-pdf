import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { loadS3IntoPinecone } from "@/lib/pinecone";
import { getS3Url } from "@/lib/s3";
import { NextResponse } from "next/server";

// /api/create-chat
export async function POST(req: Request) {
  try {
    // TEMPORARY USER ID (bypass Clerk)
    const userId = "debug-user";

    const body = await req.json();
    const { file_key, file_name } = body;

    console.log("Received:", file_key, file_name);

    await loadS3IntoPinecone(file_key);

    const chat_id = await db
      .insert(chats)
      .values({
        fileKey: file_key,
        pdfName: file_name,
        pdfUrl: getS3Url(file_key),
        userId,
      })
      .returning({
        insertedId: chats.id,
      });

    return NextResponse.json(
      { chat_id: chat_id[0].insertedId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Create chat error:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
