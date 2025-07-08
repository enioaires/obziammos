import { ArrowLeft, Calendar, Edit, Globe, Lock, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useDeletePost,
  useGetPostById,
  useGetUserPosts,
} from "@/lib/react-query/posts";

import AudioPlayer from "@/components/shared/AudioPlayer";
import { Button } from "@/components/ui/button";
import CollapsibleCaption from "@/components/shared/CollapsibleCaption";
import CommentsSection from "@/components/shared/CommentsSection";
import ConfirmModal from '@/components/shared/ConfirmModal';
import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import PostStats from "@/components/shared/PostStats";
import { isAdmin } from "@/lib/adventures";
import { multiFormatDateString } from "@/lib/utils";
import { useConfirmModal } from '@/hooks/useConfirmModal';
import { useGetAdventuresForUser } from "@/lib/react-query/adventures";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/AuthContext";

const PostDetails = () => {
  const navigate = useNavigate();
  const confirmModal = useConfirmModal();
  const { id } = useParams();
  const { user } = useUserContext();
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(true);

  const { data: post, isLoading } = useGetPostById(id);
  const { data: userPosts, isLoading: isUserPostLoading } = useGetUserPosts(
    post?.creator.$id
  );
  const { data: userAdventures } = useGetAdventuresForUser(user.id, user.role);
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();

  const userIsAdmin = isAdmin(user);
  const isCreator = user.id === post?.creator.$id;
  const canEdit = isCreator || userIsAdmin;
  const canDelete = isCreator || userIsAdmin;

  // Posts relacionados (mesmo criador, exceto o atual)
  const relatedPosts = userPosts?.documents.filter(
    (userPost) => userPost.$id !== id
  ).slice(0, 6); // Limitar a 6 posts relacionados

  // Aventuras do post atual
  const postAdventures = userAdventures?.documents.filter(adventure =>
    post?.adventures?.includes(adventure.$id)
  ) || [];

  const handleDeletePost = () => {
    if (!id || !post) return;

    confirmModal.openModal({
      title: 'Deletar Post',
      message: `Tem certeza que deseja deletar o post "${post.title}"?\n\nEsta ação não pode ser desfeita.`,
      confirmText: 'Deletar',
      variant: 'danger'
    }, () => {
      deletePost({ postId: id, imageId: post.imageId }, {
        onSuccess: () => {
          toast({
            title: "Post deletado",
            description: "O post foi removido com sucesso."
          });
          navigate("/");
        },
        onError: (error: any) => {
          toast({
            title: "Erro ao deletar post",
            description: error.message || "Não foi possível deletar o post."
          });
        }
      });
    });
  };

  const handleBackClick = () => {
    // Verificar se veio de alguma página específica
    if (document.referrer && document.referrer.includes(window.location.origin)) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  if (isLoading || !post) {
    return (
      <div className="flex flex-1">
        <div className="common-container">
          <div className="flex-center w-full h-full">
            <Loader text="Carregando post..." />
          </div>
        </div>
      </div>
    );
  }

  const isPublicPost = !post.adventures || post.adventures.length === 0;

  return (
    <div className="flex flex-1 h-full">
      <div className="common-container">
        {/* Header com botão voltar */}
        <div className="w-full max-w-4xl flex items-center justify-between">
          <Button
            onClick={handleBackClick}
            variant="ghost"
            className="shad-button_ghost"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          {/* Actions para desktop */}
          <div className="hidden md:flex items-center gap-2">
            {canEdit && (
              <Link to={`/update-post/${post.$id}`}>
                <Button variant="ghost" size="sm" className="hover:bg-dark-3">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </Link>
            )}

            {canDelete && (
              <Button
                onClick={handleDeletePost}
                disabled={isDeleting}
                variant="ghost"
                size="sm"
                className="hover:bg-red-500/20 hover:text-red-400"
              >
                {isDeleting ? (
                  <Loader size="sm" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Deletar
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Post principal */}
        <div className="w-full max-w-4xl bg-dark-2 rounded-3xl border border-dark-4">
          {/* Header do post */}
          <div className="p-6 border-b border-dark-4">
            <div className="flex items-start justify-between mb-4">
              {/* Info do criador */}
              <Link
                to={`/profile/${post.creator.$id}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <img
                  src={post.creator.imageUrl || "/assets/icons/profile-placeholder.svg"}
                  alt={post.creator.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-light-1">{post.creator.name}</p>
                  <div className="flex items-center gap-2 text-light-3 text-sm">
                    <Calendar className="w-3 h-3" />
                    <span>{multiFormatDateString(post.$createdAt)}</span>
                  </div>
                </div>
              </Link>

              {/* Actions mobile */}
              <div className="md:hidden flex items-center gap-2">
                {canEdit && (
                  <Link to={`/update-post/${post.$id}`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                )}

                {canDelete && (
                  <Button
                    onClick={handleDeletePost}
                    disabled={isDeleting}
                    variant="ghost"
                    size="sm"
                    className="hover:bg-red-500/20 hover:text-red-400"
                  >
                    {isDeleting ? <Loader size="sm" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                )}
              </div>
            </div>

            {/* Título */}
            <h1 className="text-2xl md:text-3xl font-bold text-light-1 mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Aventuras e visibilidade */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {isPublicPost ? (
                <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                  <Globe className="w-3 h-3" />
                  <span>Post Público</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-full text-sm">
                    <Lock className="w-3 h-3" />
                    <span>Post Restrito</span>
                  </div>
                  {postAdventures.slice(0, 2).map(adventure => (
                    <div key={adventure.$id} className="flex items-center gap-2 px-3 py-1.5 bg-dark-3 rounded-full text-sm">
                      <img
                        src={adventure.imageUrl || '/assets/icons/profile-placeholder.svg'}
                        alt={adventure.title}
                        className="w-4 h-4 rounded object-cover"
                      />
                      <span className="text-light-3">{adventure.title}</span>
                    </div>
                  ))}
                  {postAdventures.length > 2 && (
                    <span className="text-light-4 text-sm">
                      +{postAdventures.length - 2} aventuras
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    to={`/tag/${tag}`}
                    className="text-primary-500 hover:text-primary-400 text-sm transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Imagem */}
          <div className="relative">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-auto object-cover"
            />
          </div>
          {post.audioUrl && (
            <div className="px-6 py-4 border-b border-dark-4">
              <AudioPlayer
                audioUrl={post.audioUrl}
                title={post.title}
              />
            </div>
          )}
          {/* Conteúdo */}
          <div className="p-6">
            {/* Legenda */}
            <div className="mb-6">
              <CollapsibleCaption
                captions={post.captions}
                maxLines={15}
                className="text-base leading-relaxed"
              />
            </div>

            {/* Stats */}
            <div className="mb-6">
              <PostStats post={post} userId={user.id} />
            </div>

            {/* Comentários */}
            <div className="border-t border-dark-4 pt-6">
              <CommentsSection
                postId={post.$id}
                isExpanded={showComments}
                onToggle={() => setShowComments(!showComments)}
              />
            </div>
          </div>
        </div>

        {/* Posts relacionados */}
        {relatedPosts && relatedPosts.length > 0 && (
          <div className="w-full max-w-4xl">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-light-1 mb-2">
                Mais posts de {post.creator.name}
              </h3>
              <p className="text-light-4 text-sm">
                Explore outros posts deste criador
              </p>
            </div>

            {isUserPostLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-dark-3 rounded-lg h-64" />
                ))}
              </div>
            ) : (
              <GridPostList posts={relatedPosts} showUser={false} />
            )}
          </div>
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

export default PostDetails;