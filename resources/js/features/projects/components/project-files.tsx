import { FileList } from "@/features/files/components/file-list"
import { useIssueFiles } from "../api/get-issue-files"
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type IssueFilesProps = {
    issueId : string;
}

export const IssueFiles = ({
    issueId
} : IssueFilesProps) => {
    const filesQuery = useIssueFiles({
        issueId : issueId
    });

    if(filesQuery.isPending){
        return  <Skeleton className='w-full min-h-[60vh]'/>;
    }

    const files = filesQuery.data?.data || [];
    return (
        <Card>
            <CardHeader>
                <CardTitle>Attachments</CardTitle>
                <CardDescription>A list of files associated with this issue. Click to view or download attachments.</CardDescription>
            </CardHeader>
            <CardContent>
                {filesQuery.isPending ? 
                <Skeleton className="w-full min-h-[60vh]" />
                : files.length > 0? <FileList data={files}/>
                : (
                    <div className="flex items-center justify-center w-full min-h-[60vh]">
                    <p className="text-gray-500">No files uploaded.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}