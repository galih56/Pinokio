

import { Spinner } from '@/components/ui/spinner';
import { usePublicIssue } from '../api/get-public-issue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatDateTime } from '@/lib/datetime';
import { StatusBadge } from '../../../components/ui/status-badge';
import { CommentList } from '@/features/comment/components/comment-list';
import CreateComment from '@/features/comment/components/create-comment';
import { IssueFiles } from './issue-files';
import clsx from 'clsx';
import DOMPurify from 'dompurify';
import { CloseIssue } from './close-issue';
import ActivityLog from '@/components/layout/activity-log';

export const PublicIssueView = ({ issueId }: { issueId: string | undefined }) => {
  if(!issueId){
    return <h1>Unrecognized Request</h1>
  }
  
  const issueQuery = usePublicIssue({
    issueId,
  });

  const issue = issueQuery?.data?.data;
  
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
        <h6 className='text-sm italic text-gray-500'>Requested At : {issue.createdAt && formatDateTime(issue.createdAt)}</h6>
        <div className="grid grid-cols-2 gap-6">
            <h2 className='text-lg flex flex-row justify-between'> <span>{issue.title}</span>  </h2>
            <div className='text-right space-x-1 space-y-2'>
              <StatusBadge status={issue.status}/>
              {issue.status != 'closed' && <CloseIssue issueId={issueId} />}
            </div>
        </div>
             
        <div className={clsx("text-sm")} dangerouslySetInnerHTML={{__html : DOMPurify.sanitize(issue?.description ?? '')}} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Due Date</p>
            <p className="text-sm text-muted-foreground">
                {issue.dueDate ? formatDate(issue.dueDate) : '-'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 p-2">
          <IssueFiles issueId={issueId} />
          <ActivityLog />
        </div>
        <CreateComment  commentableId={issueId} commentableType={'issue'} commenterType='guest_issuer' />
        <CommentList commentableId={issueId} commentableType={'issue'}/>
      </div>  
  );
};
