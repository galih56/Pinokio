

import { Spinner } from '@/components/ui/spinner';
import { useIssue } from '../api/get-project';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatDateTime } from '@/lib/datetime';
import { StatusBadge } from './status-badge';
import { adjustActiveBreadcrumbs } from '@/components/layout/breadcrumbs/breadcrumbs-store';
import { CommentList } from '@/features/comment/components/comment-list';
import CreateComment from '@/features/comment/components/create-comment';
import { IssueFiles } from './project-files';
import { CloseIssue } from './close-project';

export const IssueView = ({ projectId }: { projectId: string | undefined }) => {
  if(!projectId){
    return <h1>Unrecognized Request</h1>
  }
  
  const projectQuery = useIssue({
    projectId,
  });

  const project = projectQuery?.data?.data;
  adjustActiveBreadcrumbs(`/projects/:id`,`/projects/${projectId}`, project?.title, [ project ]);
  
  if (projectQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }


  if (!project) return null;

  return (
    <div className="mt-6 flex flex-col px-6 space-y-2">
      <div className="grid grid-cols-2 gap-6">
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className='flex flex-row justify-between'> 
              <span>{project.title}</span>  
              <StatusBadge status={project.status}/> 
            </CardTitle>
            <CardDescription>{project.description}</CardDescription>
          </CardHeader>
          <CardContent className='p-4'> 
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Due Date</p>
              <p className="text-sm text-muted-foreground">
                 {project.dueDate ? formatDate(project.dueDate) : '-'}
              </p>
            </div>
          </div>
          </CardContent>
          {project.status != 'closed' &&
            <CardFooter>
              <CloseIssue projectId={projectId} />
            </CardFooter>}
        </Card>
          
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Issuer</CardTitle>
          </CardHeader>
          <CardContent className='p-4'>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2 text-wrap">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Name</p>
                <p className="text-sm text-muted-foreground">
                  {project.projectr?.name}
                </p>
              </div>              
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Email</p>
                <p className="text-sm text-muted-foreground">
                  {project.projectr?.email}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Requested At</p>
                <p className="text-sm text-muted-foreground">
                  {project.createdAt && formatDateTime(project.createdAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <IssueFiles projectId={projectId} />
      <CreateComment commentableId={projectId} commentableType={'project'} commenterType='user'/>
      <CommentList commentableId={projectId} commentableType={'project'} commentable={project}/>
    </div>  
  );
};
