"use client";

import React, { useState } from "react";
import { uploadToS3 } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import { Inbox, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const FileUpload = () => {
  const router = useRouter()
  const [uploading, setUploading] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });
      return response.data;
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large (max 10MB)");
        return;
      }

      try {
        setUploading(true);

        const data = await uploadToS3(file);
        if (!data?.file_key || !data.file_name) {
          toast.error("Something went wrong");
          return;
        }

        mutate(data, {
          onSuccess: (data) => {
          router.push(`/chat/${data.chat_id}`)
          },
          onError: () => {
            toast.error("Error creating chat");
          },
        });
      } catch (error) {
        console.error(error);
        toast.error("Upload failed");
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div className="w-[560px] h-[260px] bg-white rounded-2xl shadow-xl p-6">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 flex justify-center items-center flex-col w-full h-full",
        })}
      >
        <input {...getInputProps()} />

        {uploading || isPending ? (
          <>
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">
              Spilling Tea to GPT..
            </p>
          </>
        ) : (
          <>
            <Inbox className="w-20 h-20 text-blue-500 bg-blue-100 p-4 rounded-full" />
            <p className="mt-4 text-sm text-slate-500">
              Drop your PDF here or click to upload
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
