import { ChevronDown, ChevronUp, MessageCircle, Reply, Send, Trash2 } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useCreateComment, useDeleteComment, useGetCommentsByPostId } from '@/lib/react-query/comments';

import ConfirmModal from '@/components/shared/ConfirmModal';
import Loader from './Loader';
import { Models } from 'appwrite';
import { isAdmin } from '@/lib/adventures';
import { timeAgo } from '@/lib/utils';
import { useConfirmModal } from '@/hooks/useConfirmModal';
import { useGetUsers } from '@/lib/react-query/user';
import { useToast } from '@/components/ui/use-toast';
import { useUserContext } from '@/context/AuthContext';

interface CommentsSectionProps {
  postId: string;
  isExpanded: boolean;
  onToggle: () => void;
  isModal?: boolean;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
  postId,
  isExpanded,
  onToggle,
  isModal = false
}) => {
  const confirmModal = useConfirmModal();
  const { user } = useUserContext();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  const { data: commentsData, isLoading: isLoadingComments } = useGetCommentsByPostId(postId);
  const { data: usersData } = useGetUsers();
  const { mutate: createComment, isPending: isCreating } = useCreateComment();
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment();

  const userIsAdmin = isAdmin(user);

  // Organizar comentários (principais e replies)
  const organizedComments = React.useMemo(() => {
    if (!commentsData?.documents) return [];

    const comments = commentsData.documents;
    const mainComments = comments.filter(comment => !comment.parentCommentId);

    return mainComments.map(mainComment => ({
      ...mainComment,
      replies: comments.filter(comment => comment.parentCommentId === mainComment.$id)
        .sort((a, b) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime())
    }));
  }, [commentsData]);

  // Buscar dados do usuário
  const getUserData = (userId: string) => {
    return usersData?.documents.find(u => u.$id === userId);
  };

  const handleCreateComment = () => {
    if (!newComment.trim()) return;

    createComment({
      content: newComment.trim(),
      postId,
      userId: user.id,
    }, {
      onSuccess: () => {
        setNewComment('');
        toast({
          title: "Comentário enviado!",
          description: "Seu comentário foi publicado com sucesso."
        });
      },
      onError: (error: any) => {
        toast({
          title: "Erro ao enviar comentário",
          description: error.message || "Não foi possível enviar o comentário."
        });
      }
    });
  };

  const handleCreateReply = () => {
    const replyContent = replyInputRef.current?.value;
    if (!replyContent?.trim() || !activeReplyId) return;

    createComment({
      content: replyContent.trim(),
      postId,
      userId: user.id,
      parentCommentId: activeReplyId,
    }, {
      onSuccess: () => {
        if (replyInputRef.current) {
          replyInputRef.current.value = '';
        }
        setActiveReplyId(null);
        toast({
          title: "Resposta enviada!",
          description: "Sua resposta foi publicada com sucesso."
        });
      },
      onError: (error: any) => {
        toast({
          title: "Erro ao enviar resposta",
          description: error.message || "Não foi possível enviar a resposta."
        });
      }
    });
  };

  const handleDeleteComment = (commentId: string, isOwner: boolean) => {
    if (!isOwner && !userIsAdmin) return;

    confirmModal.openModal({
      title: 'Deletar Comentário',
      message: 'Tem certeza que deseja deletar este comentário?',
      confirmText: 'Deletar',
      variant: 'danger'
    }, () => {
      deleteComment({ commentId, postId }, {
        onSuccess: () => {
          toast({
            title: "Comentário deletado",
            description: "O comentário foi removido com sucesso."
          });
        },
        onError: (error: any) => {
          toast({
            title: "Erro ao deletar comentário",
            description: error.message || "Não foi possível deletar o comentário."
          });
        }
      });
    });
  };

  const toggleReply = (commentId: string) => {
    if (activeReplyId === commentId) {
      setActiveReplyId(null);
      if (replyInputRef.current) {
        replyInputRef.current.value = '';
      }
    } else {
      setActiveReplyId(commentId);
      // Focar no input após um pequeno delay
      setTimeout(() => {
        replyInputRef.current?.focus();
      }, 100);
    }
  };

  const CommentItem: React.FC<{ comment: Models.Document; isReply?: boolean }> = ({
    comment,
    isReply = false
  }) => {
    const commentUser = getUserData(comment.userId);
    const isOwner = comment.userId === user.id;
    const canDelete = isOwner || userIsAdmin;
    const isShowingReplyForm = activeReplyId === comment.$id;

    if (!commentUser) {
      return (
        <div className={`${isReply ? 'ml-8 pl-4 border-l-2 border-dark-4' : ''} animate-pulse`}>
          <div className="flex gap-3 p-4 bg-dark-3 rounded-lg">
            <div className="w-8 h-8 bg-dark-4 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-dark-4 rounded w-24 mb-2"></div>
              <div className="h-3 bg-dark-4 rounded w-48"></div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`${isReply ? 'ml-8 pl-4 border-l-2 border-dark-4' : ''}`}>
        <div className="flex gap-3 p-4 bg-dark-3 rounded-lg border border-dark-4 hover:border-dark-2 transition-colors">
          <img
            src={commentUser.imageUrl || '/assets/icons/profile-placeholder.svg'}
            alt={commentUser.name}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-medium text-light-1 text-sm">{commentUser.name}</span>
              <span className="text-light-4 text-xs">@{commentUser.username}</span>
              {commentUser.role === 'admin' && (
                <span className="text-xs bg-primary-500/20 text-primary-400 px-1.5 py-0.5 rounded">
                  Admin
                </span>
              )}
              <span className="text-light-4 text-xs">•</span>
              <span className="text-light-4 text-xs">{timeAgo(comment.$createdAt)}</span>
            </div>

            <p className="text-light-1 text-sm leading-relaxed mb-3 break-words">
              {comment.content}
            </p>

            <div className="flex items-center gap-3">
              {!isReply && (
                <button
                  onClick={() => toggleReply(comment.$id)}
                  className={`flex items-center gap-1 text-xs transition-colors ${isShowingReplyForm
                      ? 'text-primary-500'
                      : 'text-light-4 hover:text-primary-500'
                    }`}
                >
                  <Reply className="w-3 h-3" />
                  <span>{isShowingReplyForm ? 'Cancelar' : 'Responder'}</span>
                </button>
              )}

              {canDelete && (
                <button
                  onClick={() => handleDeleteComment(comment.$id, isOwner)}
                  disabled={isDeleting}
                  className="flex items-center gap-1 text-light-4 hover:text-red-400 transition-colors text-xs"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Deletar</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Form de resposta - APENAS UM ATIVO POR VEZ */}
        {!isReply && isShowingReplyForm && (
          <div className="mt-3 ml-8">
            <div className="flex gap-3 p-3 bg-dark-2 rounded-lg border border-dark-4">
              <img
                src={user.imageUrl || '/assets/icons/profile-placeholder.svg'}
                alt="Seu avatar"
                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <textarea
                  ref={replyInputRef}
                  placeholder={`Respondendo para @${commentUser.username}...`}
                  className="w-full bg-dark-4 border border-dark-4 rounded-lg p-3 text-light-1 placeholder-light-4 resize-none focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                  rows={2}
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-light-4">
                    {replyInputRef.current?.value?.length || 0}/500
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleReply(comment.$id)}
                      className="px-3 py-1 text-xs text-light-4 hover:text-light-1 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreateReply}
                      disabled={isCreating}
                      className="px-4 py-1.5 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white text-xs rounded-md transition-colors flex items-center gap-1"
                    >
                      {isCreating ? <Loader size="sm" /> : <Send className="w-3 h-3" />}
                      Responder
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isExpanded) {
    return (
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-light-4 hover:text-primary-500 transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        <span className="text-sm">
          {organizedComments.length > 0 ? `${organizedComments.length} comentários` : 'Comentar'}
        </span>
        <ChevronDown className="w-3 h-3" />
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-primary-500" />
          <span className="font-medium text-light-1">
            Comentários ({organizedComments.length})
          </span>
        </div>
        {!isModal && (
          <button
            onClick={onToggle}
            className="text-light-4 hover:text-light-1 transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Form para novo comentário */}
      <div className="flex gap-3 p-4 bg-dark-2 rounded-lg border border-dark-4">
        <img
          src={user.imageUrl || '/assets/icons/profile-placeholder.svg'}
          alt="Seu avatar"
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escreva um comentário..."
            className="w-full bg-dark-4 border border-dark-4 rounded-lg p-3 text-light-1 placeholder-light-4 resize-none focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
            rows={3}
            maxLength={500}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-light-4">
              {newComment.length}/500
            </span>
            <button
              onClick={handleCreateComment}
              disabled={!newComment.trim() || isCreating}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white text-sm rounded-md transition-colors flex items-center gap-2"
            >
              {isCreating ? <Loader size="sm" /> : <Send className="w-4 h-4" />}
              Comentar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de comentários */}
      <div className="space-y-4">
        {isLoadingComments ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-3 p-4 bg-dark-3 rounded-lg">
                  <div className="w-8 h-8 bg-dark-4 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-dark-4 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-dark-4 rounded w-48"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : organizedComments.length === 0 ? (
          <div className="text-center py-8 text-light-4">
            <MessageCircle className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Seja o primeiro a comentar!</p>
          </div>
        ) : (
          organizedComments.map((comment) => (
            <div key={comment.$id} className="space-y-3">
              <CommentItem comment={comment} />
              {comment.replies?.map((reply: Models.Document) => (
                <CommentItem key={reply.$id} comment={reply} isReply={true} />
              ))}
            </div>
          ))
        )}
      </div>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.closeModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.options.title}
        message={confirmModal.options.message}
        confirmText={confirmModal.options.confirmText}
        variant={confirmModal.options.variant}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CommentsSection;