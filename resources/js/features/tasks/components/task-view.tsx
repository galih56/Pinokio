

import { Spinner } from '@/components/ui/spinner';
import { useTask } from '../api/get-task';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatDateTime } from '@/lib/datetime';
import { StatusBadge } from './status-badge';
import { adjustActiveBreadcrumbs } from '@/components/layout/breadcrumbs/breadcrumbs-store';
import { CommentList } from '@/features/comment/components/comment-list';
import CreateComment from '@/features/comment/components/create-comment';
import { TaskFiles } from './task-files';
import { CloseTask } from './close-task';

export const TaskView = ({ taskId }: { taskId: string | undefined }) => {
  if(!taskId){
    return <h1>Unrecognized Request</h1>
  }
  
  const taskQuery = useTask({
    taskId,
  });

  const task = taskQuery?.data?.data;
  adjustActiveBreadcrumbs(`/tasks/:id`,`/tasks/${taskId}`, task?.title, [ task ]);
  
  if (taskQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }


  if (!task) return null;

  return (
    <div className="mt-6 flex flex-col px-6 space-y-2">
      <div className="grid grid-cols-2 gap-6">
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className='flex flex-row justify-between'> 
              <span>{task.title}</span>  
              <StatusBadge status={task.status}/> 
            </CardTitle>
            <CardDescription>{task.description}</CardDescription>
          </CardHeader>
          <CardContent className='p-4'> 
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Due Date</p>
              <p className="text-sm text-muted-foreground">
                 {task.dueDate ? formatDate(task.dueDate) : '-'}
              </p>
            </div>
          </div>
          </CardContent>
          {task.status != 'closed' &&
            <CardFooter>
              <CloseTask taskId={taskId} />
            </CardFooter>}
        </Card>
          
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Taskr</CardTitle>
          </CardHeader>
          <CardContent className='p-4'>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2 text-wrap">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Name</p>
                <p className="text-sm text-muted-foreground">
                  {task.taskr?.name}
                </p>
              </div>              
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Email</p>
                <p className="text-sm text-muted-foreground">
                  {task.taskr?.email}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Requested At</p>
                <p className="text-sm text-muted-foreground">
                  {task.createdAt && formatDateTime(task.createdAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <TaskFiles taskId={taskId} />
      <CreateComment commentableId={taskId} commentableType={'task'} />
      <CommentList commentableId={taskId} commentableType={'task'} commentable={task}/>
    </div>  
  );
};
