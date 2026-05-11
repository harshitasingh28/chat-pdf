'use client'

import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import MessageList from "./MessageList";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { UIMessage } from "ai";

interface Props {
  chatId: number;
}

const ChatComponent = ({ chatId }: Props) => {
  const { data, refetch } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post("/api/get-messages", { chatId });
      return response.data;
    }
  });

  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (data && data.length > 0) {
      const formatted = data.map((msg: any) => ({
        id: msg.id.toString(),
        role: msg.role,
        parts: [{ type: "text", text: msg.content }],
      }));

      setMessages(formatted);
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage: UIMessage = {
      id: Date.now().toString(),
      role: "user",
      parts: [{ type: "text", text: input }],
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

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

      const data = await res.json();

      const assistantMessage: UIMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        parts: [{ type: "text", text: data.content }],
      };

      setMessages((prev) => [...prev, assistantMessage]);
      await refetch();
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="sticky top-0 inset-x-0 p-2 bg-white border-b">
        <h3 className="text-xl font-bold">Chat</h3>
      </div>

      <div className="p-4">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

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