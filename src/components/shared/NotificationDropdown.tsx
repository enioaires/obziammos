import { Bell, Check } from 'lucide-react';
import { useGetNotifications, useMarkAllAsRead } from '@/lib/react-query/notifications';

import { Button } from '@/components/ui/button';
import Loader from './Loader';
import NotificationItem from './NotificationItem';
import React from 'react';
import { useUserContext } from '@/context/AuthContext';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { user } = useUserContext();
  const { data: notifications, isLoading } = useGetNotifications(user.id);
  const { mutate: markAllAsRead, isPending } = useMarkAllAsRead();

  const recentNotifications = notifications?.documents || [];
  const unreadCount = recentNotifications.filter(n => !n.isRead).length;

  return (
    <div className="w-full max-w-sm sm:w-80 bg-dark-2 border border-dark-4 rounded-xl shadow-xl mx-auto sm:mx-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary-500" />
          <h3 className="font-medium text-light-1">Notificações</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={() => markAllAsRead(user.id)}
            disabled={isPending}
            variant="ghost"
            size="sm"
            className="text-primary-500 hover:text-primary-400 h-auto p-1"
          >
            {isPending ? <Loader size="sm" /> : <Check className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="p-4">
            <Loader />
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="w-8 h-8 text-light-4 mx-auto mb-2" />
            <p className="text-light-4 text-sm">Nenhuma notificação</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-4">
            {recentNotifications.map((notification) => (
              <NotificationItem
                key={notification.$id}
                notification={notification}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;