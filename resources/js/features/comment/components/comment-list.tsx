import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useComments } from "../api/get-comments";
import { Comment } from "@/types/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDisclosure } from "@/hooks/use-disclosure";
import DialogOrDrawer from "@/components/layout/dialog-or-drawer";
import { UpdateComment } from "./update-comment";
import { useVirtualizer } from "@tanstack/react-virtual";

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

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch comments using the useComments hook
  const commentsQuery = useComments({
    page: currentPage,
    perPage: 15,
    commentableId,
    commentableType,
  });

  const queryClient = useQueryClient();
  const comments = commentsQuery.data?.data || [];
  const meta = commentsQuery.data?.meta;

  // Virtualization setup with useVirtualizer
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: comments.length, // Total number of items
    getScrollElement: () => parentRef.current, // Parent scrollable container
    estimateSize: () => 80, // Approximate row height
    overscan: 5, // Preload rows beyond the viewport
  });

  // Handle pagination changes
  const onPageChange = (newPage: number) => {
    setCurrentPage(newPage);
    queryClient.setQueryData(["comments", { page: newPage }], commentsQuery.data);
    commentsQuery.refetch();
  };

  return (
    <div className="flex flex-col">
      {commentsQuery.isPending ? (
        // Show skeleton while loading
        <Skeleton className="w-full min-h-[60vh]" />
      ) : comments.length > 0 ? (
        // Virtualized comment list
        <div
          ref={parentRef}
          className="relative h-[600px] overflow-auto rounded-md shadow-sm w-full"
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const comment = comments[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  className="w-ful bg-white p-4 rounded-lg shadow-md my-4"
                >
                  <h3 className="text-lg font-bold">John Doe</h3>
                  <p className="text-gray-700 text-sm mb-2">Posted on April 17, 2023</p>
                  <div className="flex justify-between items-center">
                    <p>{comment.comment}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full min-h-[60vh]">
          <p className="text-gray-500">No comments found.</p>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-end space-x-2 py-4">
          {Array.from({ length: meta.totalPages }).map((_, index) => (
            <Button
              key={index}
              variant={currentPage === index + 1 ? "primary" : "ghost"}
              onClick={() => onPageChange(index + 1)}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      )}

      {/* Edit Comment Dialog */}
      {choosenComment && (
        <DialogOrDrawer
          open={isOpen}
          onOpenChange={toggle}
          title={"Edit Comment"}
          description={"Ensure the data entered is correct!"}
        >
          <UpdateComment
            commentId={choosenComment.id}
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
