import {
  createNotification,
  getNotificationsByUser,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/appwrite/notifications/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { INewNotification } from "@/types";
import { QUERY_KEYS } from "../queryKeys";

export const useGetNotifications = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_NOTIFICATIONS, userId],
    queryFn: () => getNotificationsByUser(userId, 10),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
};

export const useGetUnreadCount = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_UNREAD_COUNT, userId],
    queryFn: () => getUnreadNotificationsCount(userId),
    enabled: !!userId,
    refetchInterval: 30 * 1000,
    staleTime: 15 * 1000,
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notification: INewNotification) => createNotification(notification),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_NOTIFICATIONS, variables.recipientUserId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_UNREAD_COUNT, variables.recipientUserId],
      });
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_NOTIFICATIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_UNREAD_COUNT] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => markAllNotificationsAsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_NOTIFICATIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_UNREAD_COUNT] });
    },
  });
};