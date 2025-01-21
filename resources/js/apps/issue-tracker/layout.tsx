import ImagePreviewer from "@/components/ui/image-previewer/image-previewer"
import GlobalAlertDialog from "@/components/ui/global-alert-dialog/global-alert-dialog"

export const Layout = ({
    children
} : {
    children : React.ReactNode
}) => {
    return (
        <>
            {children}
            <ImagePreviewer/>
            <GlobalAlertDialog/>
        </>
        
    )
}