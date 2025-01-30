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
    console.log(files)
    return (
        <Card>
            <CardHeader>
                <CardTitle>Attachments</CardTitle>
                <CardDescription>A list of files associated with this issue. Click to view or download attachments.</CardDescription>
            </CardHeader>
            <CardContent>
                <FileList data={files}/>
            </CardContent>
        </Card>
    )
}