import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useUserContext } from '@/context/AuthContext';

const OnlineStatusTracker = () => {
  const { isAuthenticated, user } = useUserContext();

  if (!isAuthenticated || !user.id) {
    return null;
  }

  // Remover os argumentos
  useOnlineStatus();

  return null;
};

export default OnlineStatusTracker;