
import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { NotificationPreferences } from '../types';

interface LiveNotificationsProps {
  preferences: NotificationPreferences;
}

const names = ["Olamide", "Chioma", "Emeka", "Adewale", "Yusuf", "Ngozi", "Tunde", "Fatima", "Samuel", "Zainab", "Musa", "Blessing", "Emmanuel", "Grace", "Sarah J.", "Kelechi O.", "Amina W.", "David E.", "Chidi P.", "Bisi A."];
const locations = ["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan", "Enugu", "Benin City", "Kaduna", "Jos", "Calabar"];

const testimonyTemplates = [
  "Just received my bonus! Earnix9ja is amazing.",
  "The VIP upgrade is totally worth it. Grant processed!",
  "Finally a platform that actually pays daily rewards.",
  "Referral program is legit. My limit increased!",
  "Airtime purchase was instant. Faster than my bank.",
  "Used business funds to restock my shop. Game changer!",
  "Withdrawal to my account was lightning fast. 10/10.",
  "I was skeptical, but my first 50k withdrawal just landed.",
  "The interface is smooth and rewards are real. Best app.",
  "Joined 2 days ago and already earned back my sub."
];

const LiveNotifications: React.FC<LiveNotificationsProps> = ({ preferences }) => {
  const [notification, setNotification] = useState<{name: string, message: string, type: 'event' | 'testimony'} | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showRandomNotification = () => {
      const isTestimony = Math.random() > 0.4; // 60% chance for testimony
      
      if (isTestimony) {
        const name = names[Math.floor(Math.random() * names.length)];
        const message = testimonyTemplates[Math.floor(Math.random() * testimonyTemplates.length)];
        setNotification({ name, message, type: 'testimony' });
      } else {
        const enabledTypes: string[] = [];
        if (preferences.withdrawals) enabledTypes.push('withdrew');
        if (preferences.transfers) enabledTypes.push('transferred');
        if (preferences.airtime) enabledTypes.push('bought airtime');
        if (preferences.rewards) enabledTypes.push('received a bonus of');

        if (enabledTypes.length === 0) {
            // Fallback to testimony if no events enabled
            const name = names[Math.floor(Math.random() * names.length)];
            const message = testimonyTemplates[Math.floor(Math.random() * testimonyTemplates.length)];
            setNotification({ name, message, type: 'testimony' });
        } else {
            const type = enabledTypes[Math.floor(Math.random() * enabledTypes.length)];
            const name = names[Math.floor(Math.random() * names.length)];
            const location = locations[Math.floor(Math.random() * locations.length)];
            
            let amountVal = 0;
            if (type === 'bought airtime') {
                amountVal = Math.floor(Math.random() * (5000 - 100 + 1) + 100);
            } else if (type === 'received a bonus of') {
                amountVal = Math.floor(Math.random() * (50000 - 5000 + 1) + 5000);
            } else {
                amountVal = Math.floor(Math.random() * (900000 - 5000 + 1) + 5000);
            }
            
            const amount = amountVal.toLocaleString();
            const message = `just ${type} ₦${amount} from ${location}.`;
            setNotification({ name, message, type: 'event' });
        }
      }

      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 5000);
    };

    // Initial delay before first notification
    const initialTimeout = setTimeout(showRandomNotification, 3000);

    // Loop interval (every 10-15 seconds)
    const interval = setInterval(() => {
        showRandomNotification();
    }, 12000);

    return () => {
        clearTimeout(initialTimeout);
        clearInterval(interval);
    };
  }, [preferences]);

  if (!notification) return null;

  return (
    <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-[60] w-[92%] max-w-sm transition-all duration-700 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'}`}>
      <div className="bg-green-950/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-3 border border-green-500/30">
        <div className="bg-green-500/20 p-2 rounded-full flex-shrink-0 animate-pulse">
             <Icons.CheckCircle size={16} className="text-green-400" strokeWidth={3} />
        </div>
        <div className="flex-1">
            <p className="text-xs font-medium leading-relaxed">
              <span className="font-bold text-green-400">{notification.name}</span> {notification.message}
            </p>
        </div>
        {/* Progress Bar */}
        {isVisible && (
          <div className="absolute bottom-0 left-0 h-1 bg-green-500/50 rounded-b-2xl animate-progress-bar"></div>
        )}
      </div>
      <style>{`
        @keyframes progress-bar {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress-bar {
          animation: progress-bar 5s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default LiveNotifications;
