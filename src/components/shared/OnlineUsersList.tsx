import React, { useState } from 'react';
import { Users, Wifi, WifiOff } from 'lucide-react';

import { Link } from 'react-router-dom';
import Loader from './Loader';
import { OnlineIndicator } from './OnlineIndicator';
import { UserOnlineStatus } from './UserOnlineStatus';
import { cn } from '@/lib/utils';
import { getOnlineStatus } from '@/lib/utils';
import { useGetUsersWithLastSeen } from '@/lib/react-query/user';

export const OnlineUsersList: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all');
  const { data: users, isLoading } = useGetUsersWithLastSeen();

  const filteredUsers = React.useMemo(() => {
    if (!users?.documents) return [];

    let filtered = users.documents;

    // Filtro por status
    if (filter !== 'all') {
      filtered = filtered.filter(user => {
        if (!user.lastSeen) return filter === 'offline';
        const status = getOnlineStatus(user.lastSeen);
        return filter === 'online' ? status.isOnline : !status.isOnline;
      });
    }

    // Ordenar: online primeiro, depois por lastSeen mais recente
    return [...filtered].sort((a, b) => {
      const aOnline = a.lastSeen ? getOnlineStatus(a.lastSeen).isOnline : false;
      const bOnline = b.lastSeen ? getOnlineStatus(b.lastSeen).isOnline : false;
      
      if (aOnline !== bOnline) {
        return aOnline ? -1 : 1;
      }
      
      // Se ambos online ou offline, ordenar por lastSeen mais recente
      if (a.lastSeen && b.lastSeen) {
        return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
      }
      
      return a.name.localeCompare(b.name);
    });
  }, [users?.documents, filter]);

  const stats = React.useMemo(() => {
    if (!users?.documents) return { total: 0, online: 0 };

    const total = users.documents.length;
    const online = users.documents.filter(user => {
      if (!user.lastSeen) return false;
      return getOnlineStatus(user.lastSeen).isOnline;
    }).length;

    return { total, online };
  }, [users?.documents]);

  if (isLoading) {
    return <Loader text="Carregando usuários..." />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-light-1">Usuários</h3>
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-400">{stats.online}</span>
          </div>
          <span className="text-gray-400">/</span>
          <span className="text-light-4">{stats.total}</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 p-1 bg-dark-3 rounded-lg">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            filter === 'all' ? 'bg-primary-500 text-white' : 'text-light-4 hover:text-light-2'
          )}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter('online')}
          className={cn(
            'flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1',
            filter === 'online' ? 'bg-green-500 text-white' : 'text-light-4 hover:text-light-2'
          )}
        >
          <Wifi className="w-4 h-4" />
          Online
        </button>
        <button
          onClick={() => setFilter('offline')}
          className={cn(
            'flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1',
            filter === 'offline' ? 'bg-gray-500 text-white' : 'text-light-4 hover:text-light-2'
          )}
        >
          <WifiOff className="w-4 h-4" />
          Offline
        </button>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-light-4">Nenhum usuário encontrado</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <Link
              key={user.$id}
              to={`/profile/${user.$id}`}
              className="block"
            >
              <div className="flex items-center gap-3 p-3 bg-dark-3 rounded-lg hover:bg-dark-2 transition-colors border border-dark-4 hover:border-primary-500/50">
                <div className="relative flex-shrink-0">
                  <img
                    src={user.imageUrl || '/assets/icons/profile-placeholder.svg'}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <OnlineIndicator
                    lastSeen={user.lastSeen}
                    size="md"
                    position="bottom-right"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-light-1 truncate">
                    {user.name}
                  </h4>
                  <p className="text-sm text-light-3 mb-1">
                    @{user.username}
                  </p>
                  <UserOnlineStatus
                    lastSeen={user.lastSeen}
                    variant='badge'
                  />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};