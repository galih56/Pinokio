import { useGlobalAlertDialogStore } from "./global-alert-dialog-store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createPortal } from "react-dom";

const GlobalAlertDialog = () => {
  const { isOpen, title, description, openDialog, closeDialog, onCancel, onConfirm } = useGlobalAlertDialogStore();

  return createPortal(
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title || "Are you sure?"}</AlertDialogTitle>
          <AlertDialogDescription>
            {description ||
              "This action cannot be undone. This will permanently delete your account and remove your data from our servers."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel || closeDialog}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm || closeDialog}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    ,document.body);
};

export default GlobalAlertDialog;
