import { Toaster as SonnerToaster } from "sonner"

export const Toaster = () => {
    return (
      <SonnerToaster position='top-right' theme='system' 
        duration={6}
        gap={80}
        toastOptions={{
          classNames: {
            toast: "rounded-lg shadow-lg",
            success: "border-none bg-green-500 text-white hover:bg-green-400",
            error: "border-none bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
            warning: "border-none bg-yellow-500 text-yellow-900 hover:bg-yellow-400 text-white",
            info: "border-none bg-blue-500 text-blue-900 hover:bg-blue-400 text-white",
          },
        }}/>
    )
} 