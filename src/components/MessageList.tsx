import React from "react";
import type { UIMessage } from "ai";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface Props {
  isLoading: boolean;
  messages: UIMessage[];
}

const MessageList = ({ messages, isLoading }: Props) => {
  
  if (!messages) return null;

  return (
  <div className="flex flex-col gap-3 px-4">
    {messages.map((message) => {
      let text = "";

      if (message.parts && Array.isArray(message.parts)) {
        text = message.parts
          .map((part: any) => part.text || "")
          .join("");
      }

      return (
        <div
          key={message.id}
          className={cn("flex", {
            "justify-end": message.role === "user",
            "justify-start": message.role === "assistant",
          })}
        >
          <div
            className={cn(
              "max-w-[70%] rounded-lg px-4 py-2 text-sm",
              {
                "bg-blue-600 text-white": message.role === "user",
                "bg-gray-200 text-black": message.role === "assistant",
              }
            )}
          >
            {text}
          </div>
        </div>
      );
    })}

    {isLoading && (
      <div className="flex justify-start">
        <div className="bg-gray-200 rounded-lg px-4 py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      </div>
    )}
  </div>
);
};

export default MessageList;