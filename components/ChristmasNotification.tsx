
import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';

interface ChristmasNotificationProps {
  onSubscribe: () => void;
}

const ChristmasNotification: React.FC<ChristmasNotificationProps> = ({ onSubscribe }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;

    const showNotification = () => {
      setIsVisible(true);
      
      // Hide after 6 seconds
      hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 6000);
    };

    // Initial show after 5 seconds to ensure user sees it once shortly after login
    const initialTimer = setTimeout(showNotification, 5000);

    // Then show every 5 minutes (300,000 ms)
    const interval = setInterval(showNotification, 300000);

    return () => {
      clearInterval(interval);
      clearTimeout(hideTimer);
      clearTimeout(initialTimer);
    };
  }, []);

  return (
    <div 
      className={`fixed top-16 left-1/2 transform -translate-x-1/2 z-[60] w-[90%] max-w-sm transition-all duration-700 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-32 opacity-0 pointer-events-none'
      }`}
    >
      <div 
        onClick={onSubscribe}
        className="relative bg-gradient-to-r from-red-600 to-red-800 rounded-xl p-4 shadow-2xl border-2 border-yellow-400 cursor-pointer overflow-hidden"
      >
        {/* Snow Effect Overlay (CSS approximation) */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, white 2px, transparent 2.5px)', backgroundSize: '24px 24px' }}>
        </div>

        <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-full animate-bounce">
                    <Icons.Snowflake className="text-white" size={24} />
                </div>
                <div>
                    <h3 className="text-white font-extrabold text-sm italic shadow-black drop-shadow-md">
                        🎄 Season's Greetings!
                    </h3>
                    <p className="text-red-100 text-xs font-medium leading-tight mt-0.5">
                        Celebrate with premium perks. <br/>
                        <span className="text-yellow-300 font-bold underline">Subscribe & Unlock Gifts! 🎁</span>
                    </p>
                </div>
            </div>
            <div className="bg-yellow-400 text-red-900 rounded-full p-1.5 shadow-md">
                <Icons.ChevronRight size={20} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChristmasNotification;
