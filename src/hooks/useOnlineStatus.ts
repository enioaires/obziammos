import { useCallback, useEffect, useRef } from 'react';

import { updateUserLastSeen } from '@/lib/appwrite/auth/api';
import { useUserContext } from '@/context/AuthContext';

export const useOnlineStatus = () => {
  const { user, isAuthenticated } = useUserContext();
  const heartbeatInterval = useRef<NodeJS.Timeout>();
  const lastUpdateRef = useRef<number>(0);
  const isUpdatingRef = useRef<boolean>(false);

  const updateLastSeen = useCallback(async (force = false) => {
    if (!isAuthenticated || !user.id || isUpdatingRef.current) return;

    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    
    // Atualizar apenas se passou 1 minuto ou forçado
    if (!force && timeSinceLastUpdate < 60000) return;

    isUpdatingRef.current = true;
    
    try {
      await updateUserLastSeen(user.id);
      lastUpdateRef.current = now;
    } catch (error) {
      // Silenciar erros
    } finally {
      isUpdatingRef.current = false;
    }
  }, [isAuthenticated, user.id]);

  // Heartbeat a cada 2 minutos
  useEffect(() => {
    if (!isAuthenticated || !user.id) return;

    updateLastSeen(true);

    heartbeatInterval.current = setInterval(() => {
      updateLastSeen();
    }, 120000); // 2 minutos

    return () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
    };
  }, [isAuthenticated, user.id, updateLastSeen]);

  // Atualizar quando a página fica visível
  useEffect(() => {
    if (!isAuthenticated || !user.id) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateLastSeen();
      }
    };

    const handleFocus = () => {
      updateLastSeen();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, user.id, updateLastSeen]);

  // Atualizar antes de sair
  useEffect(() => {
    if (!isAuthenticated || !user.id) return;

    const handleBeforeUnload = () => {
      updateLastSeen(true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAuthenticated, user.id, updateLastSeen]);
};