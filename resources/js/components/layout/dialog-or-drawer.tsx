import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import clsx from "clsx";

interface DialogOrDrawerProps {
  title: React.ReactNode;
  description: React.ReactNode;
  trigger? : React.ReactNode; // Trigger element
  children: React.ReactNode; // Content inside the dialog or drawer
  open?: boolean; // Control open state
  onOpenChange?: (open: boolean) => void; // Handle state changes
  scrollAreaClassName?: string;
}

const DialogOrDrawer = ({ title, description, trigger, children, open, onOpenChange , scrollAreaClassName}: DialogOrDrawerProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)"); // Adjust breakpoint for mobile as needed

  return (
    <>
      {isMobile ? (
        // Drawer for mobile screens
        <Drawer open={open} onOpenChange={onOpenChange}>
          {trigger &&
            <DrawerTrigger asChild>
              {trigger}
            </DrawerTrigger>}
          <DrawerContent className="flex flex-col" aria-describedby={undefined}>
            <ScrollArea className={clsx(scrollAreaClassName ?? "h-[60vh] p-2")}>
              <DrawerHeader>
                <DrawerTitle>{title}</DrawerTitle>
                <DrawerDescription>{description}</DrawerDescription>
              </DrawerHeader>
              {children}
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      ) : (
        // Dialog for larger screens
        <Dialog open={open} onOpenChange={onOpenChange}>
          {trigger && 
          <DialogTrigger asChild>
            {trigger}
          </DialogTrigger>}
          <DialogContent className="max-w-2xl w-full"aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            {children}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default DialogOrDrawer;
