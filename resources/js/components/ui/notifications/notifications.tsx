"use client"

import { Toaster } from "sonner";

export const Notifications = () => {
  return (
      <Toaster position='top-right' theme='system' gap={80}
        toastOptions={{
          classNames: {
            title: "text-white",
            description: "text-white", 
            toast: "rounded-lg",
            success: "border-none bg-green-500 text-white ",
            error: "border-none bg-destructive text-white ",
            warning: "border-none bg-yellow-500 text-white",
            info: "border-none bg-blue-500 text-white",
            actionButton: "bg-white text-black",
          },
          style: {
            color: "white", // Fallback text color
          },
        }}/>
  );
};
