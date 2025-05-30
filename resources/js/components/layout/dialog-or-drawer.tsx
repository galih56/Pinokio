import type React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface DialogOrDrawerProps {
  title: React.ReactNode
  description?: React.ReactNode
  trigger?: React.ReactNode
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  scrollAreaClassName?: string
  dialogContentClassName?: string
}

const DialogOrDrawer = ({
  title,
  description,
  trigger,
  children,
  open,
  onOpenChange,
  scrollAreaClassName,
  dialogContentClassName,
}: DialogOrDrawerProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <>
      {isMobile ? (
        <Drawer open={open} onOpenChange={onOpenChange}>
          {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
          <DrawerContent className="flex flex-col max-h-[85vh]" aria-describedby={undefined}>
            <DrawerHeader className="flex-shrink-0">
              <DrawerTitle>{title}</DrawerTitle>
              {description && <DrawerDescription>{description}</DrawerDescription>}
            </DrawerHeader>
            <div className="flex-1 overflow-hidden px-4 pb-8">
              <ScrollArea className={cn("h-[60vh]", scrollAreaClassName)} type="always">
                {children}
              </ScrollArea>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={onOpenChange}>
          {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
          <DialogContent
            className={cn(
              "flex flex-col px-6 pb-6 max-h-[96%] overflow-hidden",
              "w-full sm:max-w-3xl",
              dialogContentClassName,
            )}
            aria-describedby={undefined}
          >
            <DialogHeader className="flex-shrink-0 p-6 pb-2">
              <DialogTitle>{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
            <div className="flex-1 overflow-y-auto overflow-x-auto py-4">
                {children}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export default DialogOrDrawer
