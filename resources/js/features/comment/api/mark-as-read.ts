import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Comment } from "@/types/api";

export const markAsRead = async (commentId: string, email?: string) => {
  return api.post(`/comments/${commentId}/read`, {
    email, // Only needed for guests
  });
};

export const useMarkCommentAsRead = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: ({ commentId, email }: { commentId: string; email?: string }) =>
        markAsRead(commentId, email),
      onSuccess: (_, { commentId }) => {
        // Invalidate comments for all pages to update read state
        queryClient.invalidateQueries({
          queryKey: ["comments"], // Matches top-level key
          refetchType: "all",
        });
  
        // Optionally, update a single comment
        queryClient.setQueryData(
          ["comments"], 
          (oldData: any) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              data: oldData.data.map((comment: Comment) =>
                comment.id === commentId ? { ...comment, isRead: true } : comment
              ),
            };
          }
        );
      },
    });
  };
  