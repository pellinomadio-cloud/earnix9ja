
import React, { useState } from 'react';
import { Icons } from './Icons';
import { User } from '../types';

interface ReferralDashboardProps {
  user: User;
  onBack: () => void;
}

const ReferralDashboard: React.FC<ReferralDashboardProps> = ({ user, onBack }) => {
  const [copied, setCopied] = useState(false);
  const referralCode = user.referralCode || "N/A";
  const shareMessage = `Join Earnix9ja using my referral code: ${referralCode} and get ₦10,000 bonus instantly!`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const freeWithdrawals = user.freeWithdrawals || 0;
  const goal = 50;
  const progress = Math.min((freeWithdrawals / goal) * 100, 100);

  return (
    <div className="px-4 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-gold/10 rounded-full text-gold mb-2">
            <Icons.Users size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white">Referral Program</h2>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Refer your friends and get <span className="font-bold text-gold">FREE withdrawals</span> for every successful referral.
        </p>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-br from-gold to-gold-dark rounded-3xl p-6 text-black shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16"></div>
         <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
         
         <div className="relative z-10 flex flex-col items-center">
            <p className="text-black/60 text-xs font-bold uppercase tracking-widest">Free Withdrawals Earned</p>
            <h3 className="text-4xl font-black my-2">{freeWithdrawals} / {goal}</h3>
            <p className="text-sm text-black/80 mb-4 italic">"Any referral will count!"</p>
            
            {/* Progress Bar */}
            <div className="w-full bg-black/20 rounded-full h-3 mb-2">
                <div 
                    className="bg-black h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p className="text-[10px] text-black/40">Invite friends to earn more free withdrawals</p>
         </div>
      </div>

      {/* Link Card */}
      <div className="bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-800 space-y-4">
        <div className="flex flex-col items-center text-center">
            <p className="text-xs font-bold text-gray-500 uppercase mb-3">Your Referral Code</p>
            <div className="bg-black w-full p-4 rounded-xl border border-dashed border-gold/30 font-mono text-gold text-xl tracking-widest font-bold">
                {referralCode}
            </div>
        </div>

        <div className="space-y-3 pt-2">
            <button 
                onClick={handleCopy}
                className="w-full py-4 bg-gold hover:bg-gold-dark text-black font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-95"
            >
                {copied ? (
                    <>
                        <Icons.Check size={18} />
                        <span>Copied to Clipboard!</span>
                    </>
                ) : (
                    <>
                        <Icons.Copy size={18} />
                        <span>Copy Code & Message</span>
                    </>
                )}
            </button>
            
            <div className="bg-gold/5 p-3 rounded-xl border border-gold/10">
                 <p className="text-[11px] text-gold/70 leading-relaxed font-medium">
                    <span className="font-bold">Instructions:</span> Share your unique referral code with friends. When they use it to create a new account, you'll instantly earn a free withdrawal!
                 </p>
            </div>
        </div>
      </div>

      <button onClick={onBack} className="w-full py-3 text-gray-500 font-medium hover:text-gold text-sm">
        Back to Dashboard
      </button>

    </div>
  );
};

export default ReferralDashboard;
