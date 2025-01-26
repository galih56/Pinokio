import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useComments } from '../api/get-comments';
import {  DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

import { Comment } from "@/types/api"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { getCommentQueryOptions } from "../api/get-comment"
import { Link } from '@/components/ui/link';
import { paths } from '@/apps/dashboard/paths';
import { Skeleton } from '@/components/ui/skeleton';
import { capitalizeFirstChar } from '@/lib/common';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { formatDate } from '@/lib/datetime';
import { useDisclosure } from '@/hooks/use-disclosure';
import DialogOrDrawer from '@/components/layout/dialog-or-drawer';
import { UpdateComment } from './update-comment';


export type CommentsListProps = {
  commentableId: string;
  commentableType: string;
};

export const CommentList = ({
  commentableId,
  commentableType,
}: CommentsListProps) => {
  const [choosenComment, setChoosenComment] = useState<Comment | undefined>();
  const { open, isOpen, close, toggle } = useDisclosure();

  // Use state for pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch comments using the useComments hook
  const commentsQuery = useComments({
    page: currentPage, // Use state for currentPage
    perPage: 15,
    commentableId, // Pass commentable_id
    commentableType, // Pass commentable_type
  });

  const queryClient = useQueryClient();
  const comments = commentsQuery.data?.data;
  const meta = commentsQuery.data?.meta;

  // Define table columns
  const columns: ColumnDef<Comment>[] = [
    {
      id: "actions",
      cell: ({ row }) => {
        const comment = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setChoosenComment(comment);
                  open();
                }}
              >
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
    {
      accessorKey: "comment",
      header: 'Comment',
    },
  ];

  // Handle pagination changes
  const onPageChange = (newPage: number) => {
    setCurrentPage(newPage); // Update the currentPage state
    queryClient.setQueryData(
      ['comments', { page: newPage }],
      commentsQuery.data
    );
    commentsQuery.refetch();
  };

  return (
    <div className="flex flex-col">
      {commentsQuery.isPending ? ( // Show skeleton while loading
        <Skeleton className='w-full min-h-[60vh]' />
      ) : comments && comments.length > 0 ? ( // Show DataTable if comments are found
        <DataTable
          data={comments}
          columns={columns}
          pagination={
            meta && {
              totalPages: meta.totalPages,
              perPage: meta.perPage,
              totalCount: meta.totalCount,
              currentPage: meta.currentPage,
              rootUrl: '',
            }
          }
          onPaginationChange={onPageChange}
        />
      ) : ( // Show "No comments found" message if comments are empty
        <div className="flex items-center justify-center w-full min-h-[60vh]">
          <p className="text-gray-500">No comments found.</p>
        </div>
      )}

      {choosenComment && (
        <DialogOrDrawer
          open={isOpen}
          onOpenChange={toggle}
          title={"Edit Comment"}
          description={"Pastikan data yang anda masukan sudah benar sesuai!"}
        >
          <UpdateComment
            commentId={choosenComment?.id}
            onSuccess={() => {
              setChoosenComment(undefined);
              close();
            }}
          />
        </DialogOrDrawer>
      )}
    </div>
  );
};