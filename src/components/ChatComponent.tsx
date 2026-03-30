'use client'

import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import MessageList from "./MessageList";

interface Props {
  chatId: number;
}

const ChatComponent = ({ chatId }: Props) => {

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // user message
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      parts: [{ type: "text", text: input }]
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    setInput("");

    try {

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: newMessages,
          chatId
        })
      });

      const text = await res.text();
      console.log("AI RESPONSE:", text);

      const assistantMessage = {
        id: Date.now().toString(),
        role: "assistant",
        parts: [{ type: "text", text }]
      };

      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Chat error:", error);
    }
  };

  // auto scroll
  React.useEffect(() => {
    const container = document.getElementById("message-container");
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  return (
    <div
      id="message-container"
      className="relative max-h-screen overflow-y-auto"
    >

      {/* Header */}
      <div className="sticky top-0 inset-x-0 p-2 bg-white border-b">
        <h3 className="text-xl font-bold">Chat</h3>
      </div>

      {/* Messages */}
      <div className="p-4">
        <MessageList messages={messages} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 inset-x-0 px-2 py-4 bg-white flex border-t"
      >

        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask any question about the PDF..."
          className="w-full"
        />

        <Button type="submit" className="bg-blue-600 ml-2">
          <Send className="h-4 w-4" />
        </Button>

      </form>

    </div>
  );
};

export default ChatComponent;