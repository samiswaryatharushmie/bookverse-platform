import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../lib/apiClient';
import { Bell, Check, Loader2, Info, Star, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotificationPanel() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      const res = await apiClient.get('/notifications/unread-count');
      return res.data.data;
    },
    refetchInterval: 30000, // poll every 30s
  });

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await apiClient.get('/notifications');
      return res.data.data;
    },
    enabled: isOpen, // only fetch when opened
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.put(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    }
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      await apiClient.put('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    }
  });

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'TICKET_UPDATE': return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'PROMOTION': return <Star className="h-5 w-5 text-yellow-500" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-[var(--color-border)] shadow-2xl z-50 overflow-hidden"
             style={{ background: 'rgba(15,15,20,0.95)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4 bg-black/20">
            <h3 className="font-bold text-[var(--color-text-primary)]">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
                className="text-xs font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-soft)]"
              >
                {markAllAsRead.isPending ? 'Marking...' : 'Mark all read'}
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-[var(--color-accent)]" /></div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-[var(--color-text-muted)] text-sm">
                No notifications yet.
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {notifications.map((notif: any) => (
                  <div key={notif.id} className={`p-4 transition-colors ${notif.read ? 'opacity-75' : 'bg-white/5'}`}>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-sm ${notif.read ? 'font-medium text-[var(--color-text-primary)]' : 'font-bold text-[var(--color-text-primary)]'}`}>
                          {notif.title}
                        </h4>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1 break-words">
                          {notif.message}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          {notif.actionLink ? (
                            <Link 
                              to={notif.actionLink} 
                              onClick={() => {
                                if (!notif.read) markAsRead.mutate(notif.id);
                                setIsOpen(false);
                              }}
                              className="text-xs font-semibold text-[var(--color-accent)] hover:underline"
                            >
                              View Details
                            </Link>
                          ) : <span />}
                          
                          {!notif.read && (
                            <button 
                              onClick={() => markAsRead.mutate(notif.id)}
                              className="text-xs flex items-center gap-1 text-[var(--color-text-muted)] hover:text-green-500"
                              title="Mark as read"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
