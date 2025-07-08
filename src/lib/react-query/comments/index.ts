import { INewComment, IUpdateComment } from "@/types";
import {
  createComment,
  deleteComment,
  getCommentById,
  getCommentsByPostId,
  getCommentsCount,
  updateComment
} from "@/lib/appwrite/comments/api";
import { createCommentNotification, createReplyNotification } from "@/lib/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getCurrentUser } from "@/lib/appwrite/auth/api";
import { getPostById } from "@/lib/appwrite/posts/api";

// ==================== QUERY KEYS ====================

export enum COMMENT_QUERY_KEYS {
  GET_COMMENTS_BY_POST = "getCommentsByPost",
  GET_COMMENT_BY_ID = "getCommentById",
  GET_COMMENTS_COUNT = "getCommentsCount",
}

// ==================== QUERY HOOKS ====================

export const useGetCommentsByPostId = (postId: string) => {
  return useQuery({
    queryKey: [COMMENT_QUERY_KEYS.GET_COMMENTS_BY_POST, postId],
    queryFn: () => getCommentsByPostId(postId),
    enabled: !!postId,
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useGetCommentById = (commentId: string) => {
  return useQuery({
    queryKey: [COMMENT_QUERY_KEYS.GET_COMMENT_BY_ID, commentId],
    queryFn: () => getCommentById(commentId),
    enabled: !!commentId,
  });
};

export const useGetCommentsCount = (postId: string) => {
  return useQuery({
    queryKey: [COMMENT_QUERY_KEYS.GET_COMMENTS_COUNT, postId],
    queryFn: () => getCommentsCount(postId),
    enabled: !!postId,
    staleTime: 30 * 1000, // 30 segundos
  });
};

// ==================== MUTATION HOOKS ====================

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comment: INewComment) => createComment(comment),
    onSuccess: async (data, variables) => {
      // Invalidar queries
      queryClient.invalidateQueries({
        queryKey: [COMMENT_QUERY_KEYS.GET_COMMENTS_BY_POST, variables.postId],
      });

      // Notificação simples
      try {
        const currentUser = await getCurrentUser();
        const postData = await getPostById(variables.postId);
        
        if (!currentUser || !postData) return;

        if (variables.parentCommentId) {
          // É uma resposta
          const parentComment = await getCommentById(variables.parentCommentId);
          
          if (parentComment && parentComment.userId !== currentUser.$id) {
            await createReplyNotification(
              parentComment.userId,
              currentUser.$id,
              currentUser.name,
              postData.$id,
              data.$id,
              postData.title
            );
          }
        } else {
          // É um comentário novo
          if (postData.creator.$id !== currentUser.$id) {
            await createCommentNotification(
              postData.creator.$id,
              currentUser.$id,
              currentUser.name,
              postData.$id,
              data.$id,
              postData.title
            );
          }
        }
      } catch (error) {
        console.error('Error creating comment notification:', error);
      }
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comment: IUpdateComment) => updateComment(comment),
    onSuccess: (data) => {
      // Invalidar comentário específico
      queryClient.invalidateQueries({
        queryKey: [COMMENT_QUERY_KEYS.GET_COMMENT_BY_ID, data.$id],
      });

      // Invalidar lista de comentários do post
      queryClient.invalidateQueries({
        queryKey: [COMMENT_QUERY_KEYS.GET_COMMENTS_BY_POST, data.postId],
      });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }: { commentId: string; postId: string }) =>
      deleteComment(commentId),
    onSuccess: (_data, variables) => {
      // Invalidar lista de comentários do post
      queryClient.invalidateQueries({
        queryKey: [COMMENT_QUERY_KEYS.GET_COMMENTS_BY_POST, variables.postId],
      });

      // Invalidar contador de comentários
      queryClient.invalidateQueries({
        queryKey: [COMMENT_QUERY_KEYS.GET_COMMENTS_COUNT, variables.postId],
      });
    },
  });
};