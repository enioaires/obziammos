import { appwriteConfig, database } from "../config";

import { INewNotification } from "@/types";
import { Query } from "appwrite";
import { v4 } from "uuid";

export async function createNotification(notification: INewNotification) {
  try {
    // Não notificar a si mesmo
    if (notification.recipientUserId === notification.triggerUserId) {
      return null;
    }

    // Verificar se já existe notificação similar recente (evitar spam)
    const existingNotifications = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [
        Query.equal("recipientUserId", notification.recipientUserId),
        Query.equal("triggerUserId", notification.triggerUserId),
        Query.equal("type", notification.type),
        Query.equal("postId", notification.postId || ""),
        Query.greaterThan("$createdAt", new Date(Date.now() - 60000).toISOString()), // 1 minuto
        Query.limit(1)
      ]
    );

    if (existingNotifications.documents.length > 0) {
      console.log("Notification already exists recently, skipping");
      return null;
    }

    const newNotification = await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      v4(),
      {
        type: notification.type,
        recipientUserId: notification.recipientUserId,
        triggerUserId: notification.triggerUserId,
        postId: notification.postId || null,
        commentId: notification.commentId || null,
        message: notification.message,
        isRead: false,
      }
    );

    return newNotification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null; // Falha silenciosa para não quebrar o fluxo
  }
}

export async function getNotificationsByUser(userId: string, limit: number = 10) {
  try {
    const notifications = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [
        Query.equal("recipientUserId", userId),
        Query.orderDesc("$createdAt"),
        Query.limit(limit)
      ]
    );

    return notifications;
  } catch (error) {
    console.error("Error getting notifications:", error);
    return { documents: [], total: 0 };
  }
}

export async function getUnreadNotificationsCount(userId: string) {
  try {
    const notifications = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [
        Query.equal("recipientUserId", userId),
        Query.equal("isRead", false),
        Query.limit(50)
      ]
    );

    return notifications.total || notifications.documents.length;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const updatedNotification = await database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      notificationId,
      { isRead: true }
    );

    return updatedNotification;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    // Buscar notificações não lidas
    const unreadNotifications = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [
        Query.equal("recipientUserId", userId),
        Query.equal("isRead", false),
        Query.limit(50)
      ]
    );

    if (unreadNotifications.documents.length === 0) {
      return { success: true, count: 0 };
    }

    // Marcar todas como lidas
    const updatePromises = unreadNotifications.documents.map(notification =>
      database.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.notificationsCollectionId,
        notification.$id,
        { isRead: true }
      )
    );

    await Promise.all(updatePromises);
    
    return { success: true, count: unreadNotifications.documents.length };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
}

// Helper para criar mensagens
export const buildNotificationMessage = (
  type: 'like' | 'comment' | 'reply',
  triggerUserName: string,
  postTitle?: string
): string => {
  const title = postTitle ? `"${postTitle}"` : 'seu post';
  
  switch (type) {
    case 'like':
      return `${triggerUserName} curtiu ${title}`;
    case 'comment':
      return `${triggerUserName} comentou em ${title}`;
    case 'reply':
      return `${triggerUserName} respondeu seu comentário`;
    default:
      return `${triggerUserName} interagiu com seu conteúdo`;
  }
};