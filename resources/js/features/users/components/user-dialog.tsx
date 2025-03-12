import { useState } from "react";
import DialogOrDrawer from "@/components/layout/dialog-or-drawer";
import { UserView } from "./user-view";
import { UpdateUser } from "./update-user";
import { User } from "@/types/api";
import { Button } from "@/components/ui/button";
import { EditIcon, Undo2Icon } from "lucide-react";

interface UserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function UserDialog({ user, open, onOpenChange }: UserDialogProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (!user) return null;

  return (
    <DialogOrDrawer 
        open={open} onOpenChange={onOpenChange} title={isEditing ? "Edit User" : "User Details"}>

        <div className="flex flex-col">
            {!isEditing ? (
            <UserView userId={user.id} />
            ) : (
            <UpdateUser userId={user.id} />
            )}
        </div>
        <div className="flex justify-end gap-2">
            <Button className="h-8 w-8"  onClick={() => setIsEditing(!isEditing)} variant={'ghost'}>
                {isEditing ? 
                <Undo2Icon className="h-8 w-8"/> : <EditIcon className="h-8 w-8"/>}
            </Button>
        </div>
    </DialogOrDrawer>
  );
}
