import { Button } from '@/components/ui/button';
import { useGlobalAlertDialogStore } from '@/components/ui/global-alert-dialog';
import { useCloseTask } from '../api/close-task';
import useGuestIssuerStore from '@/store/useGuestIssuer';

export const CloseTask = ({ taskId }: { taskId: string | undefined }) => {
    const openDialog = useGlobalAlertDialogStore((state) => state.openDialog);
    const closeDialog = useGlobalAlertDialogStore((state) => state.closeDialog);
    const { name, email } = useGuestIssuerStore();

    if(!taskId){
        return null
    }
    const closeTask = useCloseTask({ taskId });
    
    const closeIssue = () => {
        openDialog({
            title: "Are you sure?",
            description: "This action is irreversible.",
            onConfirm: () => closeTask.mutate({ taskId, task : {  name, email } }),
            onCancel: () => closeDialog(),
        })
    }

    return (
        <div className="w-full">
            <Button variant={'success'} onClick={closeIssue}>Close this task </Button>
        </div>  
    );
};
