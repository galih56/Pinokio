import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { LoaderFunctionArgs } from 'react-router-dom';

import { getTagsQueryOptions } from '@/features/tags/api/get-tags';
import { TagsList } from '@/features/tags/components/tag-list';
import { lazy } from 'react';
import DialogOrDrawer from '@/components/layout/dialog-or-drawer';
import { Button } from '@/components/ui/button';
import { useDisclosure } from '@/hooks/use-disclosure';
const CreateTag = lazy(() => import('@/features/tags/components/create-tag'));

export const tagsLoader =
  (queryClient: QueryClient) =>
  async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);

    const page = Number(url.searchParams.get('page') || 1);

    const query = getTagsQueryOptions({ page });

    return (
      queryClient.getQueryData(query.queryKey) ??
      (await queryClient.fetchQuery(query))
    );
  };

export const TagsRoute = () => {
  const { isOpen, open, close, toggle } = useDisclosure();

  return (
    <>
      <div className="mt-4">
        <DialogOrDrawer 
            open={isOpen}
            onOpenChange={toggle}
            title={"Create Tag"}
            trigger={ <Button variant="outline">Create Tag</Button>}
          >
            <div className='p-2'>
              <CreateTag onSuccess={close} onError={close}/>
            </div>
        </DialogOrDrawer>
        <div className='w-full my-2 p4'>
          <TagsList />          
        </div>
      </div>
    </>
  );
};
