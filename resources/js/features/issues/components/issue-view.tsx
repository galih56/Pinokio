

import { Spinner } from '@/components/ui/spinner';
import { useIssue } from '../api/get-issue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatDateTime } from '@/lib/datetime';
import { StatusBadge } from './status-badge';
import { adjustActiveBreadcrumbs } from '@/components/layout/breadcrumbs/breadcrumbs-store';
import { CommentList } from '@/features/comment/components/comment-list';

export const IssueView = ({ issueId }: { issueId: string | undefined }) => {
  if(!issueId){
    return <h1>Unrecognized Request</h1>
  }
  
  const issueQuery = useIssue({
    issueId,
  });

  const issue = issueQuery?.data?.data;
  adjustActiveBreadcrumbs(`/issues/:id`,`/issues/${issueId}`, issue?.title, [ issue ]);
  
  if (issueQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }


  if (!issue) return null;

  return (
    <div className="mt-6 flex flex-col px-6 space-y-2">
      <div className="grid grid-cols-2 gap-6">
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className='flex flex-row justify-between'> <span>{issue.title}</span>  <StatusBadge status={issue.status}/> </CardTitle>
            <CardDescription>{issue.description}</CardDescription>
          </CardHeader>
          <CardContent> 
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Due Date</p>
              <p className="text-sm text-muted-foreground">
                 {issue.dueDate ? formatDate(issue.dueDate) : '-'}
              </p>
            </div>
          </div>
          </CardContent>
          </Card>
          
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Issuer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2 text-wrap">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Name</p>
                <p className="text-sm text-muted-foreground">
                  {issue.issuer?.name}
                </p>
              </div>              
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Email</p>
                <p className="text-sm text-muted-foreground">
                  {issue.issuer?.email}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Requested At</p>
                <p className="text-sm text-muted-foreground">
                  {issue.createdAt && formatDateTime(issue.createdAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <CommentList commentableId={issueId} commentableType={'issue'}/>
    </div>  
  );
};
