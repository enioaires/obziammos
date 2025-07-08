import { buildNotificationMessage, createNotification } from '@/lib/appwrite/notifications/api';

import { INewNotification } from '@/types';

export const createNotificationSafe = async (
  type: 'like' | 'comment' | 'reply',
  recipientUserId: string,
  triggerUserId: string,
  triggerUserName: string,
  postId: string,
  postTitle?: string,
  commentId?: string,
  maxRetries = 2
): Promise<void> => {
  // Não notificar a si mesmo
  if (recipientUserId === triggerUserId) {
    return;
  }

  const message = buildNotificationMessage(type, triggerUserName, postTitle);
  
  const notificationData: INewNotification = {
    type,
    recipientUserId,
    triggerUserId,
    postId,
    commentId,
    message,
  };

  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      const result = await createNotification(notificationData);
      
      if (result) {
        console.log(`✅ Notification created: ${type} for user ${recipientUserId}`);
        return;
      }
      
      // Se retornou null (duplicada ou erro), não retry
      break;
    } catch (error) {
      attempts++;
      console.warn(`⚠️ Notification attempt ${attempts} failed:`, error);
      
      if (attempts >= maxRetries) {
        console.error(`❌ Failed to create notification after ${maxRetries} attempts`);
        break;
      }
      
      // Aguardar antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
    }
  }
};

// Helper específico para likes
export const createLikeNotification = async (
  postOwnerId: string,
  likerId: string,
  likerName: string,
  postId: string,
  postTitle?: string
) => {
  await createNotificationSafe(
    'like',
    postOwnerId,
    likerId,
    likerName,
    postId,
    postTitle
  );
};

// Helper específico para comentários
export const createCommentNotification = async (
  postOwnerId: string,
  commenterId: string,
  commenterName: string,
  postId: string,
  commentId: string,
  postTitle?: string
) => {
  await createNotificationSafe(
    'comment',
    postOwnerId,
    commenterId,
    commenterName,
    postId,
    postTitle,
    commentId
  );
};

// Helper específico para respostas
export const createReplyNotification = async (
  parentCommentOwnerId: string,
  replierId: string,
  replierName: string,
  postId: string,
  replyId: string,
  postTitle?: string
) => {
  await createNotificationSafe(
    'reply',
    parentCommentOwnerId,
    replierId,
    replierName,
    postId,
    postTitle,
    replyId
  );
};