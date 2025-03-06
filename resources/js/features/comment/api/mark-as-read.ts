import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Comment } from "@/types/api";

export const markAsRead = async (commentId: string) => {
  return api.post(`/comments/${commentId}/read`);
};

export const useMarkCommentAsRead = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: ({ commentId }: { commentId: string; }) =>
        markAsRead(commentId),
      onSuccess: (_, { commentId }) => {
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
  