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
import { useVirtualizer } from "@tanstack/react-virtual";
import { formatDateTime } from "@/lib/datetime";
import clsx from "clsx";
import DOMPurify from "dompurify";
import { api } from "@/lib/api-client"; // Import API for marking comments as read
import { useMarkCommentAsRead } from "../api/mark-as-read";

export type CommentsListProps = {
  commentableId: string;
  commentableType: string;
  commenter? : Commenter;
};

export const CommentList = ({ commentableId, commentableType, commenter }: CommentsListProps) => {
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
  const comments = commentsQuery.data?.data || [];
  const meta = commentsQuery.data?.meta;

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: comments.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });

  const commentRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { mutate: markAsRead } = useMarkCommentAsRead();

  useLayoutEffect(() => {
    if (!commentRefs.current.length) return; // Ensure refs are populated
  
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          console.log("Entry observed:", entry.target);
          if (entry.isIntersecting) {
            console.log("Entry is visible:", entry.target);
            const commentId = entry.target.getAttribute("data-comment-id");
            if (commentId) {
              console.log("Marking as read:", commentId);
              markAsRead({ commentId });
            }
          }
        });
      },
      { threshold: 0.6 }
    );
  
    // Delay to ensure refs are properly assigned
    setTimeout(() => {
      console.log("Final commentRefs:", commentRefs.current);
      commentRefs.current.forEach((ref) => {
        if (ref) observer.observe(ref);
      });
    }, 0);
  
    return () => observer.disconnect();
  }, [commentsQuery.isPending, comments, markAsRead]);

  const onPageChange = (newPage: number) => {
    setCurrentPage(newPage);
    queryClient.setQueryData(["comments", { page: newPage }], commentsQuery.data);
    commentsQuery.refetch();
  };

  return (
    <div className="flex flex-col">
      {commentsQuery.isPending ? (
        <Skeleton className="w-full min-h-[60vh]" />
      ) : comments.length > 0 ? (
        <div
          ref={parentRef}
          className="relative h-[600px] overflow-auto rounded-md px-6"
        >
          <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow, index) => {
              const comment = comments[virtualRow.index];
              let isIssuer = Boolean(comment.commenter?.type === "guest_issuer");
              const sanitizedContent = DOMPurify.sanitize(comment.comment);

              return (
                <div
                  key={virtualRow.key}
                  ref={(el) => (commentRefs.current[index] = el)}
                  data-comment-id={comment.id}
                  className={clsx("w-full flex", isIssuer ? "justify-start" : "justify-end")}
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
