'use client'

import React from 'react'
import { DrizzleChat } from '@/lib/db/schema'
import { PlusCircle, MessageCircle, Trash2 } from "lucide-react";
import Link from 'next/link';
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Props {
  chats: DrizzleChat[],
  chatId: number,
}

const ChatSideBar = ({ chats, chatId }: Props) => {
  const [loading, setLoading] = React.useState(false);

  const handleSubscription = async () => {
    try{
      setLoading(true)
      const response = await axios.get('/api/stripe')
      window.location.href = response.data.url
    }catch(error){
       console.error(error)
    }finally{
      setLoading(false)
    }
  }
  const router = useRouter();

  const handleDelete = async (chatIdToDelete: number) => {
    const ok = window.confirm("Delete this chat?");
    if (!ok) return;

    try {
      await axios.post("/api/delete-chat", { chatId: chatIdToDelete });

      if (chatIdToDelete === chatId) {
        router.push("/");
      }

      router.refresh();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div className='w-full h-screen p-4 text-gray-200 bg-gray-900 relative'>
      <Link href='/'>
        <Button className='w-full border-dashed border-white border'>
          <PlusCircle className='mr-2 w-4 h-4' />
          New Chat
        </Button>
      </Link>

      <div className="flex flex-col gap-2 mt-4">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={cn(
              'rounded-lg p-3 text-slate-300 flex items-center justify-between',
              {
                'bg-blue-600 text-white': chat.id === chatId,
                'hover:text-white': chat.id !== chatId,
              }
            )}
          >
            <Link href={`/chat/${chat.id}`} className="flex items-center w-full min-w-0">
              <MessageCircle className="mr-2 shrink-0" />
              <p className='w-full overflow-hidden text-sm truncate whitespace-nowrap text-ellipsis'>
                {chat.pdfName}
              </p>
            </Link>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDelete(chat.id);
              }}
              className="ml-2 text-red-400 hover:text-red-300 shrink-0"
              title="Delete chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className='absolute bottom-4 left-4'>
        <div className='flex items-center gap-2 text-sm text-slate-500 flex-wrap'>
          <Link href='/'>Home</Link>
          <Link href='/'>Source</Link>
        </div>
        <Button className='mt-2 text-white bg-slate-700' disabled={loading} onClick={handleSubscription}>
          Upgrade To Pro!
        </Button>
      </div>
    </div>
  )
}

export default ChatSideBar;