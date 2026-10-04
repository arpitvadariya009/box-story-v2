import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Bell, Trash2, Check } from 'lucide-react';

const calculateTimeAgo = (dateStr) => {
  if (!dateStr) return 'Just now';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
};

const mapNotificationType = (type, title = '') => {
  const t = (type || '').toLowerCase();
  const titleLower = title.toLowerCase();
  if (t.includes('order') || titleLower.includes('order')) return 'order';
  if (t.includes('stock') || t.includes('inventory') || titleLower.includes('stock')) return 'stock-alert';
  if (t.includes('dispatch') || titleLower.includes('dispatch') || titleLower.includes('delay')) return 'delay';
  if (t.includes('client') || titleLower.includes('client')) return 'client';
  if (t.includes('payment') || titleLower.includes('payment') || titleLower.includes('paid')) return 'payment';
  if (t.includes('catalogue') || titleLower.includes('catalogue')) return 'catalogue';
  return 'system';
};

const Notifications = () => {
  const { api } = useAuth();
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Listen to Socket.IO real-time notification events
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (newNotif) => {
      console.log('[Socket.IO] Real-time notification received:', newNotif);
      setNotifications((prev) => [
        {
          id: newNotif._id || `s_${Date.now()}`,
          title: newNotif.title || 'New Notification',
          message: newNotif.message || newNotif.description || '',
          time: calculateTimeAgo(newNotif.createdAt),
          unread: true,
          type: mapNotificationType(newNotif.type, newNotif.title),
        },
        ...prev,
      ]);
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data && Array.isArray(res.data)) {
        const mapped = res.data.map((n) => ({
          id: n._id,
          title: n.title || 'System Notification',
          message: n.message || n.description,
          time: calculateTimeAgo(n.createdAt),
          unread: !n.isRead,
          type: mapNotificationType(n.type, n.title),
        }));
        setNotifications(mapped);
      }
    } catch (error) {
      console.warn('Backend notification fetch error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
    } catch (e) {
      console.warn('Mark all read API error:', e.message);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleDeleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
    } catch (e) {
      console.warn('Notification delete API error:', e.message);
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => n.unread).length;
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'Unread') return n.unread;
    return true;
  });

  const getIconAndColorConfig = (type) => {
    switch (type) {
      case 'order':
      case 'delay':
      case 'payment':
        return {
          bg: 'bg-[#FDEDEE]',
          text: 'text-[#D90B37]',
          borderColor: 'bg-[#D90B37]',
        };
      case 'stock-alert':
      case 'stock-update':
        return {
          bg: 'bg-[#FEF3C7]',
          text: 'text-[#D97706]',
          borderColor: 'bg-[#F59E0B]',
        };
      case 'client':
      case 'catalogue':
        return {
          bg: 'bg-[#E0F2FE]',
          text: 'text-[#0284C7]',
          borderColor: 'bg-[#0284C7]',
        };
      default:
        return {
          bg: 'bg-[#F1F5F9]',
          text: 'text-[#64748B]',
          borderColor: 'bg-[#64748B]',
        };
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D90B37]"></div>
      </div>
    );
  }

  return (
    <div className="pb-12 font-['Inter'] space-y-5">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Left side: Pill Tabs */}
        <div className="inline-flex p-1 bg-[#F1F5F9] rounded-xl gap-1">
          <button
            onClick={() => setActiveTab('All')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer border-none ${
              activeTab === 'All'
                ? 'bg-white text-[#0F1729] shadow-sm font-bold'
                : 'text-[#878787] hover:text-[#0F1729] bg-transparent'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('Unread')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer border-none ${
              activeTab === 'Unread'
                ? 'bg-white text-[#0F1729] shadow-sm font-bold'
                : 'text-[#878787] hover:text-[#0F1729] bg-transparent'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Right side: Mark All Read button */}
        <button
          onClick={handleMarkAllRead}
          className="h-10 px-4 bg-[#D90B37] hover:bg-[#AE032C] text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 cursor-pointer border-none shadow-sm transition-all"
        >
          <Check size={16} />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* List of Notification Cards */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E3E3E3] p-12 text-center text-sm text-[#878787] shadow-sm">
            No notifications found in "{activeTab}".
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const config = getIconAndColorConfig(notif.type);

            return (
              <div
                key={notif.id}
                className="bg-white rounded-2xl border border-[#E3E3E3] p-4.5 flex items-center justify-between shadow-sm relative overflow-hidden transition-all hover:shadow-md"
              >
                {/* Unread Left Border Highlight Bar */}
                {notif.unread && (
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${config.borderColor} rounded-l-2xl`}
                  ></div>
                )}

                <div className="flex items-center gap-4 flex-grow pr-4 pl-1">
                  {/* Circular/Rounded Icon Badge */}
                  <div
                    className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center ${config.text} flex-shrink-0`}
                  >
                    <Bell size={18} />
                  </div>

                  {/* Text Content */}
                  <div className="flex-grow">
                    <h4 className="text-[15px] font-bold text-[#0F1729] leading-tight">
                      {notif.title}
                    </h4>
                    <p className="text-sm text-[#878787] mt-0.5 leading-snug">
                      {notif.message}
                    </p>
                  </div>
                </div>

                {/* Right Side Actions & Time */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs font-medium text-[#878787] whitespace-nowrap">
                    {notif.time}
                  </span>
                  <button
                    onClick={() => handleDeleteNotification(notif.id)}
                    className="p-1.5 text-[#878787] hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
                    title="Delete Notification"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;
