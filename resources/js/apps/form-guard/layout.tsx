import ImagePreviewer from "@/components/ui/image-previewer/image-previewer"
import GlobalAlertDialog from "@/components/ui/global-alert-dialog/global-alert-dialog"
import PublicFormLayout from "@/components/layout/public-form-layout"

export const Layout = ({
    children
} : {
    children : React.ReactNode
}) => {
    return (
        <PublicFormLayout>
            {children}
            <ImagePreviewer/>
            <GlobalAlertDialog/>
        </PublicFormLayout>
        
    )
}