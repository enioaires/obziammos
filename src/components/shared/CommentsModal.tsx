import CommentsSection from './CommentsSection';
import { Link } from 'react-router-dom';
import { Models } from 'appwrite';
import React from 'react';
import { X } from 'lucide-react';
import { timeAgo } from '@/lib/utils';

interface CommentsModalProps {
  post: Models.Document;
  isOpen: boolean;
  onClose: () => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({
  post,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  // Fechar modal quando clicar no overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Fechar modal com ESC
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevenir scroll do body
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-dark-2 rounded-2xl border border-dark-4 w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col">
        {/* Header do Modal - FIXO */}
        <div className="flex items-center justify-between p-6 border-b border-dark-4 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <img
              src={post.creator?.imageUrl || '/assets/icons/profile-placeholder.svg'}
              alt={post.creator?.name}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-light-1 truncate">{post.creator?.name}</h2>
                <span className="text-light-4 text-sm">•</span>
                <span className="text-light-4 text-sm">{timeAgo(post.$createdAt)}</span>
              </div>
              <Link
                to={`/posts/${post.$id}`}
                className="text-primary-500 hover:text-primary-400 text-sm transition-colors"
                onClick={onClose}
              >
                Ver post completo
              </Link>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-3 rounded-lg transition-colors text-light-3 hover:text-light-1 flex-shrink-0 ml-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview do Post - FIXO */}
        <div className="p-6 border-b border-dark-4 flex-shrink-0">
          <h3 className="font-semibold text-lg text-light-1 mb-3 line-clamp-2">
            {post.title}
          </h3>

          <div className="flex gap-4">
            {/* Imagem do post */}
            <div className="flex-shrink-0">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
            </div>

            {/* Legenda (preview) */}
            <div className="flex-1 min-w-0">
              <div className="text-light-3 text-sm line-clamp-3 leading-relaxed">
                {/* Renderizar legenda de forma simples no modal */}
                {typeof post.captions === 'string' ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: post.captions }}
                    className="rich-text-content" // ADICIONAR classe
                  />
                ) : (
                  <div className="rich-text-content"> {/* ADICIONAR classe */}
                    {Array.isArray(post.captions) ? post.captions.map((caption, index) => (
                      <div key={index} dangerouslySetInnerHTML={{ __html: caption }} />
                    )) : null}
                  </div>
                )}
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {post.tags.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="text-primary-500 text-xs">
                      #{tag}
                    </span>
                  ))}
                  {post.tags.length > 3 && (
                    <span className="text-light-4 text-xs">
                      +{post.tags.length - 3} mais
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seção de Comentários - SCROLLÁVEL */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="p-6">
              <CommentsSection
                postId={post.$id}
                isExpanded={true}
                onToggle={() => { }} // Não usa toggle no modal
                isModal={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;