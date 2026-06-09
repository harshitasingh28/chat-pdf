"use client";
import React, { useState } from "react";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import ChatComponent from "@/components/ChatComponent";

type Chat = {
  id: number;
  pdfName: string;
  pdfUrl: string;
  userId: string;
  fileKey: string;
  createdAt: Date;
};

type Props = {
  chats: Chat[];
  chatId: number;
  pdfUrl: string;
};

export default function ChatLayout({ chats, chatId, pdfUrl }: Props) {
  const [activeTab, setActiveTab] = useState<"chats" | "pdf" | "chat">("chat");

  return (
    <>
      {/* ── DESKTOP layout ── */}
<div className="hidden md:flex w-full h-screen overflow-hidden">

  {/* Sidebar */}
  <div className="flex-[1] max-w-xs min-h-0 overflow-y-auto">
    <ChatSideBar chats={chats} chatId={chatId} />
  </div>

  {/* PDF */}
  <div className="flex-[5] min-h-0 overflow-y-auto p-4">
    <PDFViewer pdf_url={pdfUrl} />
  </div>

  {/* Chat */}
  <div className="flex-[3] border-l border-slate-200 flex flex-col overflow-hidden">
  <ChatComponent chatId={chatId} />
</div>

</div>

      {/* ── MOBILE layout ── */}
      <div className="flex flex-col h-screen md:hidden">
        {/* Tab bar */}
        <div className="flex border-b border-slate-200 bg-white">
          {[
            { key: "chats", label: "📁 Chats" },
            { key: "pdf",   label: "📄 PDF"   },
            { key: "chat",  label: "💬 Chat"  },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-slate-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "chats" && (
            <div className="h-full overflow-y-auto">
              <ChatSideBar chats={chats} chatId={chatId} />
            </div>
          )}
          {activeTab === "pdf" && (
            <div className="h-full overflow-y-auto p-2">
              <PDFViewer pdf_url={pdfUrl} />
            </div>
          )}
          {activeTab === "chat" && (
            <div className="h-full">
              <ChatComponent chatId={chatId} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}