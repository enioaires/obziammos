import { Bookmark, Heart, MessageCircle } from "lucide-react";
import {
  useDeleteSavedPost,
  useGetCurrentUser,
  useLikePost,
  useSavePost,
} from "@/lib/react-query/posts";
import { useEffect, useState } from "react";

import CommentsModal from "./CommentsModal";
import { Models } from "appwrite";
import { checkIsLiked } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useGetCommentsCount } from "@/lib/react-query/comments";
import { useLocation } from "react-router-dom";
import ShareButton from './ShareButton';

type PostStatsProps = {
  post: Models.Document;
  userId: string;
  showCommentsInline?: boolean;
  onCommentsToggle?: () => void;
  isCommentsExpanded?: boolean;
};

const PostStats = ({
  post,
  userId,
  onCommentsToggle,
  isCommentsExpanded = false
}: PostStatsProps) => {
  const location = useLocation();
  const likesList = post.likes.map((user: Models.Document) => user.$id);

  const [likes, setLikes] = useState<string[]>(likesList);
  const [isSaved, setIsSaved] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  const { mutate: likePost } = useLikePost();
  const { mutate: savePost } = useSavePost();
  const { mutate: deleteSavePost } = useDeleteSavedPost();

  const { data: currentUser } = useGetCurrentUser();
  const { data: commentsCount } = useGetCommentsCount(post.$id);

  // Determinar se estamos na página de detalhes
  const isDetailPage = location.pathname.startsWith('/posts/');

  const savedPostRecord = currentUser?.save.find(
    (record: Models.Document) => record.post.$id === post.$id
  );

  useEffect(() => {
    setIsSaved(!!savedPostRecord);
  }, [currentUser]);

  const handleLikePost = (e: React.MouseEvent) => {
    e.stopPropagation();

    let likesArray = [...likes];

    if (likesArray.includes(userId)) {
      likesArray = likesArray.filter((Id) => Id !== userId);
    } else {
      likesArray.push(userId);
    }

    setLikes(likesArray);
    likePost({ postId: post.$id, likesArray });
  };

  const handleSavePost = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (savedPostRecord) {
      setIsSaved(false);
      return deleteSavePost(savedPostRecord.$id);
    }

    savePost({ userId: userId, postId: post.$id });
    setIsSaved(true);
  };

  const handleCommentsClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isDetailPage && onCommentsToggle) {
      // Na página de detalhes, toggle inline
      onCommentsToggle();
    } else if (!isDetailPage) {
      // Fora da página de detalhes, abrir modal
      setShowCommentsModal(true);
    }
  };

  const isLiked = checkIsLiked(likes, userId);

  return (
    <>
      <div className="flex items-center justify-between w-full">
        {/* Actions principais */}
        <div className="flex items-center gap-6">
          {/* Likes */}
          <button
            onClick={handleLikePost}
            className="flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <div className={cn(
              "p-2 rounded-full transition-all duration-200",
              isLiked
                ? "bg-red-500/20 text-red-500"
                : "hover:bg-dark-3 text-light-3 hover:text-red-400"
            )}>
              <Heart
                className={cn(
                  "w-5 h-5 transition-all duration-200",
                  isLiked && "fill-current"
                )}
              />
            </div>
            <span className={cn(
              "font-medium transition-colors",
              isLiked ? "text-red-500" : "text-light-1"
            )}>
              {likes.length}
            </span>
          </button>

          {/* Comments */}
          <button
            onClick={handleCommentsClick}
            className="flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <div className={cn(
              "p-2 rounded-full transition-all duration-200",
              isDetailPage && isCommentsExpanded
                ? "bg-primary-500/20 text-primary-500"
                : "hover:bg-dark-3 text-light-3 hover:text-primary-500"
            )}>
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="font-medium text-light-1">
              {commentsCount || 0}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-6">
          <ShareButton
            post={{ $id: post.$id, title: post.title, imageUrl: post.imageUrl }}
            variant="icon"
          />
          {/* Save */}
          <button
            onClick={handleSavePost}
            className="hover:scale-105 transition-transform"
          >
            <div className={cn(
              "p-2 rounded-full transition-all duration-200",
              isSaved
                ? "bg-primary-500/20 text-primary-500"
                : "hover:bg-dark-3 text-light-3 hover:text-primary-500"
            )}>
              <Bookmark
                className={cn(
                  "w-5 h-5 transition-all duration-200",
                  isSaved && "fill-current"
                )}
              />
            </div>
          </button>
        </div>

      </div>

      {/* Modal de comentários para páginas que não são detalhes */}
      {showCommentsModal && !isDetailPage && (
        <CommentsModal
          post={post}
          isOpen={showCommentsModal}
          onClose={() => setShowCommentsModal(false)}
        />
      )}
    </>
  );
};

export default PostStats;