import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Bell, User, Building, Menu, PanelLeft } from 'lucide-react';

const Navbar = ({ title, collapsed, onOpenMobileMenu }) => {
  const { user, api } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api?.get('/notifications/unread-count');
        if (res?.data && res.data.unreadCount > 0) {
          setHasUnread(true);
        } else {
          setHasUnread(false);
        }
      } catch {
        setHasUnread(false);
      }
    };

    if (api) {
      fetchUnread();
    }
  }, [api]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = () => {
      setHasUnread(true);
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket]);

  return (
    <header className={`bg-[#F7F7F7] h-14 fixed top-0 right-0 z-30 border-b border-[#E3E3E3] flex items-center justify-between px-6 transition-all duration-300 left-0 md:left-auto ${
      collapsed ? 'md:w-[calc(100%-80px)]' : 'md:w-[calc(100%-256px)]'
    }`}>
      {/* Left side: Page Title */}
      <div className="flex items-center gap-3">
        <button
          aria-label="Open navigation"
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 text-[#65758B] md:hidden border-none bg-transparent"
        >
          <Menu size={18} />
        </button>
        <PanelLeft size={18} className="text-[#878787] hidden md:block" />
        <h1 className="hidden md:block text-[18px] font-semibold text-[#1A1A1A] font-['Inter'] leading-none">
          {title || 'Dashboard'}
        </h1>
      </div>

      {/* Right side: Notifications, User Profile */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Notifications Icon Button */}
        <button
          onClick={() => navigate('/notifications')}
          className="p-2 hover:bg-[#F8FAFC] rounded-full text-[#545454] transition-colors relative border-none bg-transparent cursor-pointer"
          title="Notifications"
        >
          <Bell size={18} />
          {hasUnread && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D90B37] rounded-full"></span>
          )}
        </button>

        <div className="hidden sm:block h-5 w-px bg-[#E3E3E3]"></div>

        {/* User Card */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="block text-sm font-bold text-[#0F1729] leading-tight">{user?.name}</span>
            <span className="block text-[10px] font-semibold text-[#878787] uppercase tracking-wider mt-0.5">
              {user?.role === 'ClientAdmin' ? user?.client?.companyName : user?.role}
            </span>
          </div>

          <div className="w-9 h-9 rounded-full bg-[#FDEDEE] border border-[#E3E3E3] flex items-center justify-center text-[#D90B37] shadow-inner flex-shrink-0">
            {user?.role === 'ClientAdmin' ? <Building size={16} /> : <User size={16} />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
