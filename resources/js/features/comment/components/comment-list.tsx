import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, useCallback, useLayoutEffect } from "react";
import { useComments } from "../api/get-comments";
import { Comment, Commenter, Issue, Project, Task } from "@/types/api";
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
import { defaultRangeExtractor, observeElementRect, useVirtualizer } from "@tanstack/react-virtual";
import { formatDateTime } from "@/lib/datetime";
import clsx from "clsx";
import DOMPurify from "dompurify";
import { api } from "@/lib/api-client"; // Import API for marking comments as read
import { useMarkCommentAsRead } from "../api/mark-as-read";
import { debounce } from "lodash";

export type CommentsListProps = {
  commentableId: string;
  commentableType: string;
  commenter? : Commenter;
  initialComments?: Comment[];
};

export const CommentList = ({ commentableId, commentableType, initialComments = [] , commenter }: CommentsListProps) => {
  const [choosenComment, setChoosenComment] = useState<Comment | undefined>();
  const { open, isOpen, close, toggle } = useDisclosure();
  
  const [currentPage, setCurrentPage] = useState(1);

  const commentsQuery = useComments({
    page: currentPage,
    perPage: 15,
    commentableId,
    commentableType,
  });

  const queryClient = useQueryClient();
  const fetchedComments = commentsQuery.data?.data || [];
  
  // Merge unread comments with fetched comments, avoiding duplicates
  const comments = [...initialComments, ...fetchedComments].filter(
    (comment, index, self) => index === self.findIndex((c) => c.id === comment.id)
  );

  const meta = commentsQuery.data?.meta;

  const parentRef = useRef<HTMLDivElement>(null);
  const visibleRangeRef = useRef<[number, number]>([0, 0]);
  const rowVirtualizer = useVirtualizer({
    count: comments.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5,
    observeElementRect: (instance, callback) => {
      return observeElementRect(instance, callback);
    },
    rangeExtractor: (range) => {
      visibleRangeRef.current = [range.startIndex, range.endIndex];
      return defaultRangeExtractor(range);
    },
  });

  const commentRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { mutate: markAsRead } = useMarkCommentAsRead();

  const pendingMarkAsRead = useRef<Set<number>>(new Set());
  
  const processMarkAsRead = debounce(() => {
    // ✅ Debounced function to limit API calls
    if (pendingMarkAsRead.current.size === 0) return;
  
    pendingMarkAsRead.current.forEach((commentId) => {
      markAsRead({ commentId });
    });
  
    // Clear the batch after execution
    pendingMarkAsRead.current.clear();
  }, 60000); // Runs every 1 minutes
  
  useEffect(() => {
    const visibleItems = rowVirtualizer.getVirtualItems();
  
    visibleItems.forEach((item) => {
      const comment = comments[item.index];
      if (comment && comment.id && !comment.isRead) {
        pendingMarkAsRead.current.add(comment.id);
      }
    });
  
    // Call debounced function (will execute only every 2 minutes)
    processMarkAsRead();
  }, [rowVirtualizer.getVirtualItems()]);

  const onPageChange = (newPage: number) => {
    setCurrentPage(newPage);
    queryClient.setQueryData(["comments", { page: newPage }], commentsQuery.data);
    commentsQuery.refetch();
  };

  //Scroll to the latest comment
  useEffect(() => {
    if (comments.length > 0) {
      rowVirtualizer.scrollToIndex(comments.length - 1, { align: "end" });
    }
    rowVirtualizer.measure()
  }, [comments.length]);

  if(commentsQuery.isPending && !initialComments){
    return  <Skeleton className="w-full min-h-[60vh]" />;
  } else if(!commentsQuery.isPending && comments.length == 0){
    return (
      <div className="flex items-center justify-center w-full min-h-[60vh]">
        <p className="text-gray-500">No comments found.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {commentsQuery.isPending ? (
        <Skeleton className="w-full min-h-[60vh]" />
      ) : comments.length > 0 ? (
        <div
          ref={parentRef}
          className="rounded-md px-6 min-h-[60vh]"
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow, index) => {
            const comment = comments[virtualRow.index];
            let isIssuer = Boolean(comment.commenter?.type === "guest_issuer");
            const sanitizedContent = DOMPurify.sanitize(comment.comment);

            return (
              <div
                key={virtualRow.key}
                ref={(el) => (commentRefs.current[index] = el)}
                data-comment-id={comment.id}
                className={clsx("w-full flex  overflow-hidden", isIssuer ? "justify-start" : "justify-end")}
              >
                <div
                  className={clsx("max-w-[85%] bg-white p-4 rounded-lg shadow-md my-4 flex flex-col")}
                >
                  <div className={clsx("flex justify-between")}>
                    {isIssuer ? (
                      <>
                        <div className="flex flex-row">
                          <h3 className="justify-end space-x-1">
                            <span className="text-base font-bold">
                              {comment.commenter?.name || "Unknown"}
                            </span>
                            <span className="text-gray-700 text-xs">
                              {formatDateTime(comment.createdAt)}
                            </span>
                          </h3>
                        </div>
                        {/* <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-2 h-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={"start"}>
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
                        </DropdownMenu> */}
                      </>
                    ) : (
                      <>
                        <div></div>
                        <div className="flex flex-row">
                          <h3 className="justify-end space-x-1">
                            <span className="text-gray-700 text-xs">
                              {formatDateTime(comment.createdAt)}
                            </span>
                            <span className="text-base font-bold">
                              {comment.commenter?.name || "Unknown"}
                            </span>
                          </h3>
                        </div>
                      </>
                    )}
                  </div>
                  <div
                    className={clsx("text-sm", isIssuer ? "text-left" : "text-right")}
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                  />
                </div>
              </div>
            );
          })}
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
        </div>
      ) : (
        <div className="flex items-center justify-center w-full min-h-[60vh]">
          <p className="text-gray-500">No comments found.</p>
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
