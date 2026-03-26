
import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { User } from '../types';

interface SyncAccountProps {
  user: User;
  onRestore: (email: string, syncCode: string) => void;
}

const SyncAccount: React.FC<SyncAccountProps> = ({ user, onRestore }) => {
  const [restoreEmail, setRestoreEmail] = useState('');
  const [restoreCode, setRestoreCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [copied, setCopied] = useState(false);
  
  // The sync code is now just the user's referral code for simplicity in this demo
  const syncCode = user.referralCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRestoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!restoreEmail.trim() || !restoreCode.trim()) {
        setError('Please enter both email and sync code.');
        return;
    }

    onRestore(restoreEmail.trim(), restoreCode.trim());
  };

  return (
    <div className="px-4 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Sync Account</h2>
        <p className="text-sm text-gray-500">Move your account to another device or backup your data.</p>
      </div>

      <div className="flex p-1 bg-gray-900 rounded-xl">
        <button 
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'export' ? 'bg-gray-800 shadow-sm text-gold' : 'text-gray-500'}`}
        >
            Copy My Code
        </button>
        <button 
             onClick={() => setActiveTab('import')}
             className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'import' ? 'bg-gray-800 shadow-sm text-gold' : 'text-gray-500'}`}
        >
            Restore Account
        </button>
      </div>

      {activeTab === 'export' ? (
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 space-y-4">
            <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center text-gold">
                    <Icons.Upload size={24} />
                </div>
                <h3 className="font-bold text-white">Your Sync Code</h3>
                <p className="text-xs text-gray-500">
                    Copy this code to restore your balance and data. 
                </p>
            </div>

            <div className="relative">
                <textarea 
                    readOnly 
                    value={syncCode}
                    className="w-full h-32 p-3 bg-black border border-gray-800 rounded-xl text-xs font-mono text-gray-400 resize-none focus:outline-none"
                />
                <button 
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-2 bg-gray-800 rounded-lg shadow-sm hover:bg-gray-700 transition-colors text-gold"
                >
                    {copied ? <Icons.Check size={16} /> : <Icons.Copy size={16} />}
                </button>
            </div>

            <div className="flex items-center justify-center text-[10px] text-gray-500 space-x-1 mb-2">
                <Icons.Clock size={12} />
                <span>Auto-refreshes every 5 minutes</span>
            </div>

            <button 
                onClick={handleCopy}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
            >
                <Icons.Copy size={18} />
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
        </div>
      ) : (
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 space-y-4">
            <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center text-gold">
                    <Icons.Sync size={24} />
                </div>
                <h3 className="font-bold text-white">Restore Account</h3>
                <p className="text-xs text-gray-500">Paste your sync code here. Codes expire after 5 minutes.</p>
            </div>

            {error && (
                <div className="bg-red-900/20 text-red-400 text-xs p-3 rounded-lg text-center border border-red-800">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="bg-green-900/20 text-green-400 text-xs p-3 rounded-lg text-center border border-green-800">
                    {success}
                </div>
            )}

            <form onSubmit={handleRestoreSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Account Email</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                            <Icons.Mail size={16} />
                        </div>
                        <input 
                            type="email"
                            value={restoreEmail}
                            onChange={(e) => setRestoreEmail(e.target.value)}
                            placeholder="Enter your registered email"
                            className="w-full pl-10 pr-4 py-3 bg-black border border-gray-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-gold outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sync Code</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                            <Icons.Lock size={16} />
                        </div>
                        <input 
                            type="text"
                            value={restoreCode}
                            onChange={(e) => setRestoreCode(e.target.value)}
                            placeholder="Paste your sync code here"
                            className="w-full pl-10 pr-4 py-3 bg-black border border-gray-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-gold outline-none"
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
                >
                    <Icons.Sync size={18} />
                    <span>Restore Account</span>
                </button>
            </form>
        </div>
      )}
    </div>
  );
};

export default SyncAccount;
