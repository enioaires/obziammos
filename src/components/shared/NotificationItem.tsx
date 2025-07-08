import { Heart, MessageCircle } from 'lucide-react';

import { Models } from 'appwrite';
import React from 'react';
import { useGetUserById } from '@/lib/react-query/user';
import { useMarkAsRead } from '@/lib/react-query/notifications';
import { useNavigate } from 'react-router-dom';

interface NotificationItemProps {
  notification: Models.Document;
  onClose: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose }) => {
  const { data: triggerUser } = useGetUserById(notification.triggerUserId);
  const { mutate: markAsRead } = useMarkAsRead();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead(notification.$id);
    }
    
    // Navegar para o post
    if (notification.postId) {
      navigate(`/posts/${notification.postId}`);
    }
    
    onClose();
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" fill="currentColor" />;
      case 'comment':
      case 'reply':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <MessageCircle className="w-4 h-4 text-primary-500" />;
    }
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  if (!triggerUser) {
    return (
      <div className="p-3 animate-pulse">
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-dark-3 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-dark-3 rounded w-3/4" />
            <div className="h-2 bg-dark-3 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`p-3 cursor-pointer hover:bg-dark-3/50 transition-colors ${
        !notification.isRead ? 'bg-dark-3/30 border-l-4 border-primary-500' : ''
      }`}
    >
      <div className="flex gap-3">
        <div className="relative">
          <img
            src={triggerUser.imageUrl || '/assets/icons/profile-placeholder.svg'}
            alt={triggerUser.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="absolute -bottom-1 -right-1 p-1 bg-dark-2 rounded-full">
            {getIcon()}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm text-light-1 ${!notification.isRead ? 'font-medium' : ''}`}>
            <span className="font-semibold text-primary-500">{triggerUser.name}</span>
            {' '}
            {notification.message.replace(triggerUser.name, '').trim()}
          </p>
          
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-light-4">{timeAgo(notification.$createdAt)}</span>
            {!notification.isRead && (
              <div className="w-2 h-2 bg-primary-500 rounded-full" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;