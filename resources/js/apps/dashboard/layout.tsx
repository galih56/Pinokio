import DashboardLayout from "@/components/layout/dashboard-layout"
import { useFilteredNavigation } from "@/lib/authorization"
import { navigations } from "./navigations"
import ImagePreviewer from "@/components/ui/image-previewer/image-previewer"
import GlobalAlertDialog from "@/components/ui/global-alert-dialog/global-alert-dialog"
import { useAutoDismissNotifications } from "@/components/ui/notifications"

export const Layout = ({
    children
} : {
    children : React.ReactNode
}) => {
    useAutoDismissNotifications(10 * 1000); 
    const navigationItems = useFilteredNavigation(navigations);
    return (
        <>
            <DashboardLayout navigations={navigationItems}>
                {children}
            </DashboardLayout>
            <ImagePreviewer/>
            <GlobalAlertDialog/>
        </>
        
    )
}