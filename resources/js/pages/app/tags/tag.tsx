import { QueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { useParams, LoaderFunctionArgs } from 'react-router-dom';

import {
  useTag,
  getTagQueryOptions,
} from '@/features/tags/api/get-tag';
import { TagView } from '@/features/tags/components/tag-view';
import { UpdateTag } from '@/features/tags/components/update-tag';
import { Button } from '@/components/ui/button';
import DialogOrDrawer from '@/components/layout/dialog-or-drawer';
import { Edit } from 'lucide-react';

export const tagLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const tagId = params.id as string;

    const tagQuery = getTagQueryOptions(tagId);
    
    const promises = [
      queryClient.getQueryData(tagQuery.queryKey) ??
        (await queryClient.fetchQuery(tagQuery)),
    ] as const;

    const [tag] = await Promise.all(promises);

    return {
      tag,
    };
};

export const TagRoute = () => {
  const params = useParams();
  const tagId = params.id;

  return (
    <div className='mt-6'>
        <DialogOrDrawer 
          title={"Edit Tag"}
          description={"Pastikan data yang anda masukan sudah benar sesuai!"}
          trigger={ <Button variant="outline"> <Edit/> Edit Tag</Button>}
          >
            <UpdateTag tagId={tagId}/>
        </DialogOrDrawer>
        <TagView tagId={tagId} />
        <div className="mt-8">
          <ErrorBoundary
            fallback={
              <div>Failed to load comments. Try to refresh the page.</div>
            }
          >
          </ErrorBoundary>
        </div>
    </div>
  );
};
