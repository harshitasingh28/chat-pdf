import React from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import ChatComponent from "@/components/ChatComponent";

interface Props {
  params: Promise<{
    chatId: string;
  }>;
}

export default async function Page({ params }: Props) {

  const { chatId } = await params;

  // TEMPORARY USER
  const userId = "debug-user";

  const _chats = await db
    .select()
    .from(chats)
    .where(eq(chats.userId, userId));

  const currentChat = _chats.find(
    (chat) => chat.id === parseInt(chatId)
  );

  if (!currentChat) {
    return redirect("/");
  }
  console.log(currentChat?.pdfUrl); 
  return (
    <div className="flex max-h-screen overflow-scroll">
      <div className="flex w-full max-h-screen overflow-scroll">

        {/* Sidebar */}
        <div className="flex-[1] max-w-xs">
          <ChatSideBar chats={_chats} chatId={parseInt(chatId)} />
        </div>

        {/* PDF Viewer */}
        <div className="max-h-screen p-4 overflow-scroll flex-[5]">
          
          <PDFViewer pdf_url={currentChat.pdfUrl} />
        </div>

        {/* Chat */}
        <div className="flex-[3] border-l border-slate-200">
          <ChatComponent chatId={parseInt(chatId)}/>
        </div>

      </div>
    </div>
  );
}