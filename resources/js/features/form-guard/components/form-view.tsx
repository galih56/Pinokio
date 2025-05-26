

import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatDateTime } from '@/lib/datetime';
import { adjustActiveBreadcrumbs } from '@/components/layout/breadcrumbs/breadcrumbs-store';
import { CommentList } from '@/features/comment/components/comment-list';
import CreateComment from '@/features/comment/components/create-comment';
import DOMPurify from 'dompurify';
import { useFormDetail } from '../api/get-form';

export const FormView = ({ formId }: { formId: string }) => {
  
  const formQuery = useFormDetail({
    formId,
  });

  const form = formQuery?.data?.data;
  adjustActiveBreadcrumbs(`/forms/:id`,`/forms/${formId}`, form?.title, [ form ]);
  
  if(!formId){
    return <h1>Unrecognized Request</h1>
  }

  if (formQuery.isPending) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }


  if (!form) return null;

  return (
    <div className="mt-6 flex flex-col px-6 space-y-2">
      <div className="grid grid-cols-2 gap-6">
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className='flex flex-row justify-between'> 
              <span>{form.title}</span>  
            </CardTitle>
            <CardDescription dangerouslySetInnerHTML={{__html : DOMPurify.sanitize(form?.description ?? '')}} />
          </CardHeader>
          <CardContent className='p-4'> 
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Due Date</p>
              <p className="text-sm text-muted-foreground">
                 {form.dueDate ? formatDate(form.dueDate) : '-'}
              </p>
            </div>
          </div>
          </CardContent>
          {form.status != 'closed' &&
            <CardFooter>
              <CloseForm formId={formId} />
            </CardFooter>}
        </Card>
          
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Formr</CardTitle>
          </CardHeader>
          <CardContent className='p-4'>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2 text-wrap">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Name</p>
                <p className="text-sm text-muted-foreground">
                  {form.formr?.name}
                </p>
              </div>              
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Email</p>
                <p className="text-sm text-muted-foreground">
                  {form.formr?.email}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Requested At</p>
                <p className="text-sm text-muted-foreground">
                  {form.createdAt && formatDateTime(form.createdAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <FormFiles formId={formId} />
      <CreateComment commentableId={formId} commentableType={'form'}/>
      <CommentList commentableId={formId} commentableType={'form'}/>
    </div>  
  );
};
