import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogout } from "@/lib/auth";
import { useGlobalAlertDialogStore } from "../ui/global-alert-dialog";

const UserProfileDropdown = () => {
    const openDialog = useGlobalAlertDialogStore((state) => state.openDialog);
    const closeDialog = useGlobalAlertDialogStore((state) => state.closeDialog);
    const logout = useLogout({
        onSuccess: closeDialog, // Close the dialog after logout
    });

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn("h-7 w-7")}>
                    <UserCircle />
                    <span className="sr-only">User Profile</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() =>
                        openDialog({
                            title: "Are you sure?",
                            description: "This action is irreversible.",
                            onConfirm: () => logout.mutate({}),
                            onCancel: () => closeDialog(),
                        })
                    }
                >
                    <LogOut /> Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserProfileDropdown;
