import { Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useGetUnreadCount } from '@/lib/react-query/notifications';
import { useState } from 'react';
import { useUserContext } from '@/context/AuthContext';

const NotificationBell = () => {
  const { user } = useUserContext();
  const [isOpen, setIsOpen] = useState(false);
  const { data: unreadCount = 0, isLoading } = useGetUnreadCount(user.id);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-dark-3 transition-colors"
      >
        <Bell className="w-5 h-5 text-light-3" />
        
        {!isLoading && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/50 sm:bg-transparent"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-16 left-4 right-4 z-50 sm:absolute sm:right-0 sm:left-auto sm:top-auto sm:mt-2">
            <NotificationDropdown onClose={() => setIsOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;