import DashboardLayout from "@/components/layout/dashboard-layout"
import { useFilteredNavigation } from "@/lib/authorization"
import { navigations } from "./navigations"
import ImagePreviewer from "@/components/ui/image-previewer/image-previewer"
import GlobalAlertDialog from "@/components/ui/global-alert-dialog/global-alert-dialog"

export const Layout = ({
    children
} : {
    children : React.ReactNode
}) => {
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