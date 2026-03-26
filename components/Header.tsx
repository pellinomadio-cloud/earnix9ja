
import React from 'react';
import { Icons } from './Icons';

interface HeaderProps {
  userName?: string;
  profileImage?: string;
  onLogout?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  pageTitle?: string;
  onNotificationClick?: () => void;
  hasUnread?: boolean;
  isSubscribed?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  userName = "Guest", 
  profileImage, 
  onLogout,
  showBack = false,
  onBack,
  pageTitle,
  onNotificationClick,
  hasUnread = false,
  isSubscribed = false
}) => {
  // Get initials safely
  const initials = userName.length >= 2 ? userName.substring(0, 2).toUpperCase() : userName.substring(0, 1).toUpperCase();
  const firstName = userName.split(' ')[0];

  return (
    <div className="bg-black px-4 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm transition-colors duration-200 border-b border-gray-800">
      <div className="flex items-center space-x-2">
        {showBack ? (
          <>
            <button 
              onClick={onBack} 
              className="p-2 -ml-2 mr-1 hover:bg-gray-800 rounded-full transition-colors text-white"
            >
              <Icons.ArrowLeft size={24} />
            </button>
            <span className="font-bold text-white text-lg">{pageTitle}</span>
          </>
        ) : (
          <>
            <div className="relative group">
              <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-black font-bold italic text-sm overflow-hidden shadow-gold group-hover:shadow-gold-lg transition-all duration-300">
                  {profileImage ? (
                    <img src={profileImage} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
              </div>
              {isSubscribed && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-black rounded-full shadow-sm animate-pulse"></span>
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1">
                <span className={`font-semibold text-white text-lg truncate max-w-[150px] ${isSubscribed ? 'text-glow-gold' : ''}`}>Hi, {firstName}</span>
                {isSubscribed && (
                  <span className="bg-green-500/10 text-green-500 text-[9px] font-black px-1.5 py-0.5 rounded border border-green-500/20 uppercase tracking-tighter">
                    Active
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="flex items-center space-x-3 text-gray-300">
        <button className="p-1 hover:bg-gray-800 rounded-full transition-colors">
            <Icons.Support size={24} />
        </button>
        <button 
          onClick={onNotificationClick}
          className="p-1 relative hover:bg-gray-800 rounded-full transition-colors"
        >
            <Icons.Notification size={24} />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-black animate-pulse">
                  New
              </span>
            )}
        </button>
      </div>
    </div>
  );
};

export default Header;
