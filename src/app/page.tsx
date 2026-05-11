import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Heading1, LogIn } from "lucide-react";
import Link from "next/link";
import FileUpload from "@/components/FileUpload";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;
  let firstChat = null;

if (userId) {
  const userChats = await db
    .select()
    .from(chats)
    .where(eq(chats.userId, userId));

  if (userChats.length > 0) {
    firstChat = userChats[0];
  }
}
  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-rose-200 to-teal-200">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-4">
        <div className="flex flex-col items-center text-center">
          {/* Heading */}
          <div className="flex items-center gap-3">
            <h1 className="text-5xl font-semibold">Chat with any pdf</h1>
            <UserButton afterSignOutUrl="/" />
          </div>

          {/* Go to Chats */}
          {isAuth && firstChat && (
            <div className="mt-3">
              <Link href={`/chat/${firstChat.id}`}>
                <Button>Go to Chats</Button>
              </Link>
            </div>
          )}

          {/* Subtitle */}
          <p className="max-w-xl mt-4 text-slate-600">
            Join millions of students, researchers and professionals to instantly
            answer questions and understand research with AI
          </p>

          {/* Upload or Login */}
          <div className="w-full mt-6 flex justify-center">
            {isAuth ? (
              <FileUpload />
            ) : (
              <Link href="/sign-in">
                <Button>
                  Login to get Started!
                  <LogIn className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
