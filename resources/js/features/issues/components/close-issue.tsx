import { Button } from '@/components/ui/button';
import { useGlobalAlertDialogStore } from '@/components/ui/global-alert-dialog';
import { AlertDialog } from '@radix-ui/react-alert-dialog';
import { useClosePublicIssue } from '../api/close-public-issue';
import { DoorClosedIcon } from 'lucide-react';
import useGuestIssuerStore from '@/store/useGuestIssuer';

export const CloseIssue = ({ issueId }: { issueId: string | undefined }) => {
    const openDialog = useGlobalAlertDialogStore((state) => state.openDialog);
    const closeDialog = useGlobalAlertDialogStore((state) => state.closeDialog);
    const { name, email } = useGuestIssuerStore();

    if(!issueId){
        return null
    }
    const closePublicIssue = useClosePublicIssue({ issueId });
    
    const closeIssue = () => {
        openDialog({
            title: "Are you sure?",
            description: "This action is irreversible.",
            onConfirm: () => closePublicIssue.mutate({ issueId, issuer : {  name, email } }),
            onCancel: () => closeDialog(),
        })
    }

    return (
        <div className="w-full">
            <Button variant={'outline'} onClick={closeIssue}>Close this issue </Button>
        </div>  
    );
};
