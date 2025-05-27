import ImagePreviewer from "@/components/ui/image-previewer/image-previewer"
import GlobalAlertDialog from "@/components/ui/global-alert-dialog/global-alert-dialog"
import PublicFormLayout from "@/components/layout/public-form-layout"
import { useAutoDismissNotifications } from "@/components/ui/notifications";

export const Layout = ({
    children
} : {
    children : React.ReactNode
}) => {
    useAutoDismissNotifications(10 * 1000);
    return (
        <PublicFormLayout>
            {children}
            <ImagePreviewer/>
            <GlobalAlertDialog/>
        </PublicFormLayout>
        
    )
}