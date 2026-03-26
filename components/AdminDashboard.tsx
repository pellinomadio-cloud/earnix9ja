
import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { User } from '../types';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedPlans, setSelectedPlans] = useState<Record<string, string>>({});
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    if (isAuthenticated) {
        loadUsers();
        // Update timer every second to refresh pending status
        const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'x-admin-password': password
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const updateUserOnServer = async (email: string, updates: Partial<User>) => {
    try {
      const response = await fetch('/api/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, updates })
      });
      if (response.ok) {
        loadUsers();
      }
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  const handleApprove = (email: string) => {
    const plan = selectedPlans[email] || 'Monthly Plan'; 
    let durationDays = 30; 
    if (plan === 'Weekly Plan') durationDays = 7;
    if (plan === 'Premium User') durationDays = 365;
    
    const expiryTimestamp = Date.now() + (durationDays * 24 * 60 * 60 * 1000);

    updateUserOnServer(email, {
      isSubscribed: true,
      subscriptionPlan: plan,
      subscriptionExpiryDate: expiryTimestamp
    });
    alert(`Subscription approved for ${email} with ${plan}.`);
  };

  const handleRevoke = (email: string) => {
    if (!confirm('Are you sure?')) return;
    updateUserOnServer(email, {
      isSubscribed: false,
      subscriptionPlan: undefined,
      subscriptionExpiryDate: undefined
    });
  };

  const handleToggleVIP = (email: string) => {
    const user = users.find(u => u.email === email);
    if (user) {
      const isNowVIP = !user.isVIP;
      updateUserOnServer(email, {
        isVIP: isNowVIP,
        vipBalance: isNowVIP ? 2000000 : 0
      });
    }
  };

  const handleToggleVMode = (email: string) => {
    const user = users.find(u => u.email === email);
    if (user) {
      const currentVMode = !!user.isVMode;
      updateUserOnServer(email, {
        isVMode: !currentVMode
      });
      alert(`V Mode ${!currentVMode ? 'ACTIVATED' : 'DEACTIVATED'} for ${email}. Subscriptions will now ${!currentVMode ? 'be AUTOMATICALLY VERIFIED' : 'fail verification'}.`);
    }
  };

  const handleTogglePMode = (email: string) => {
    const user = users.find(u => u.email === email);
    if (user) {
      const currentPMode = !!user.isPMode;
      updateUserOnServer(email, {
        isPMode: !currentPMode
      });
      alert(`P Mode ${!currentPMode ? 'ACTIVATED' : 'DEACTIVATED'} for ${email}. Transactions will now ${!currentPMode ? 'show as PENDING' : 'be SUCCESSFUL'}.`);
    }
  };

  const handleToggleDeactivate = (email: string, currentDeactivationDate?: number) => {
    if (currentDeactivationDate) {
      updateUserOnServer(email, { deactivationDate: undefined });
    } else {
      updateUserOnServer(email, { deactivationDate: Date.now() + 1800000 });
    }
  };

  const handleTriggerImminent = (email: string) => {
    const user = users.find(u => u.email === email);
    if (user) {
      if (user.imminentDeactivationExpiry) {
        updateUserOnServer(email, { imminentDeactivationExpiry: undefined });
      } else {
        updateUserOnServer(email, { 
          imminentDeactivationExpiry: Date.now() + 20 * 60 * 1000,
          deactivationDate: undefined 
        });
      }
    }
  };

  const getDeactivationStatus = (user: User) => {
    if (user.imminentDeactivationExpiry && user.imminentDeactivationExpiry > currentTime) {
         const minsLeft = Math.ceil((user.imminentDeactivationExpiry - currentTime) / (1000 * 60));
         return `Imminent (${minsLeft}m)`;
    }
    if (!user.deactivationDate) return 'Active';
    if (currentTime < user.deactivationDate) {
        const secondsLeft = Math.ceil((user.deactivationDate - currentTime) / 1000);
        return `Pending (${secondsLeft}s)`;
    }
    return 'Deactivated';
  };

  if (!isAuthenticated) {
    return (
        <div className="px-4 py-10 flex flex-col items-center justify-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full min-h-[60vh]">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-gold">
                <Icons.Lock size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white">Admin Access</h2>
            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
                <div>
                    <input
                        type="password"
                        placeholder="Enter Admin Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-800 bg-gray-900 text-white focus:ring-2 focus:ring-gold outline-none"
                    />
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button type="submit" className="w-full bg-gold text-black font-bold py-3 rounded-xl">
                    Access Dashboard
                </button>
            </form>
            <button onClick={onBack} className="text-gray-500 text-sm">Cancel</button>
        </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6 animate-in fade-in duration-500 pb-20">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
            <button onClick={() => setIsAuthenticated(false)} className="text-sm text-red-500 font-medium">Logout</button>
        </div>

        <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 overflow-hidden">
            <div className="p-4 bg-black border-b border-gray-800">
                <h3 className="font-bold text-white">Registered Accounts ({users.length})</h3>
            </div>
            
            <div className="divide-y divide-gray-800">
                {users.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No users found.</div>
                ) : (
                    users.map((user, idx) => {
                        const status = getDeactivationStatus(user);
                        const isDeactivated = status === 'Deactivated';
                        const isImminent = status.startsWith('Imminent');

                        return (
                            <div key={idx} className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-white text-sm">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                        <p className="text-xs font-mono mt-1 text-gray-400">Bal: ₦{user.balance.toLocaleString()}</p>
                                    </div>
                                    <div className="flex flex-col items-end space-y-1">
                                        <div className={`px-2 py-1 rounded text-[10px] font-bold ${user.isSubscribed ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                                            {user.isSubscribed ? 'SUBSCRIBED' : 'PENDING'}
                                        </div>
                                        <div className="flex space-x-1">
                                            {user.isVMode && (
                                                <div className="px-2 py-1 rounded text-[10px] font-bold bg-blue-900/50 text-blue-300">
                                                    V MODE
                                                </div>
                                            )}
                                            {user.isPMode && (
                                                <div className="px-2 py-1 rounded text-[10px] font-bold bg-orange-900/50 text-orange-300">
                                                    P MODE
                                                </div>
                                            )}
                                            <div className={`px-2 py-1 rounded text-[10px] font-bold ${user.isVIP ? 'bg-gold/20 text-gold' : 'bg-gray-800 text-gray-400'}`}>
                                                {user.isVIP ? 'VIP' : 'REGULAR'}
                                            </div>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-[10px] font-bold ${isDeactivated ? 'bg-red-900/30 text-red-400' : isImminent ? 'bg-orange-500 text-white animate-pulse' : 'bg-orange-900/30 text-orange-400'}`}>
                                            {status.toUpperCase()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col space-y-2">
                                    {user.isSubscribed ? (
                                        <div className="flex justify-between items-center bg-black/50 p-2 rounded-lg">
                                            <span className="text-xs font-medium text-gray-300">Plan: {user.subscriptionPlan}</span>
                                            <button onClick={() => handleRevoke(user.email)} className="text-xs text-red-500 hover:underline">Revoke</button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <select
                                                className="flex-1 text-xs p-2 rounded-lg border border-gray-800 bg-black text-white outline-none focus:border-gold"
                                                value={selectedPlans[user.email] || 'Monthly Plan'}
                                                onChange={(e) => setSelectedPlans({...selectedPlans, [user.email]: e.target.value})}
                                            >
                                                <option value="Weekly Plan">Weekly Plan</option>
                                                <option value="Monthly Plan">Monthly Plan</option>
                                                <option value="Premium User">Premium User</option>
                                            </select>
                                            <button onClick={() => handleApprove(user.email)} className="bg-gold text-black text-xs font-bold py-2 px-3 rounded-lg hover:bg-gold-dark transition-colors">Approve</button>
                                        </div>
                                    )}
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => handleToggleVIP(user.email)} className={`py-2 text-[10px] font-bold rounded-lg border transition-colors ${user.isVIP ? 'bg-gold/20 text-gold border-gold/30' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                                            {user.isVIP ? 'Revoke VIP' : 'Activate VIP'}
                                        </button>
                                        <button onClick={() => handleToggleVMode(user.email)} className={`py-2 text-[10px] font-bold rounded-lg border transition-colors ${user.isVMode ? 'bg-blue-600 text-white border-blue-700' : 'bg-gray-800 text-blue-400 border-gray-700'}`}>
                                            {user.isVMode ? 'Deactivate V Mode' : 'Activate V Mode'}
                                        </button>
                                        <button onClick={() => handleTogglePMode(user.email)} className={`py-2 text-[10px] font-bold rounded-lg border transition-colors ${user.isPMode ? 'bg-orange-600 text-white border-orange-700' : 'bg-gray-800 text-orange-400 border-gray-700'}`}>
                                            {user.isPMode ? 'Deactivate P Mode' : 'Activate P Mode'}
                                        </button>
                                        <button onClick={() => handleToggleDeactivate(user.email, user.deactivationDate)} className={`py-2 text-[10px] font-bold rounded-lg border transition-colors ${user.deactivationDate ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-red-900/30 text-red-400 border-red-800'}`}>
                                            {user.deactivationDate ? 'Restore Active' : '30-Min Lock'}
                                        </button>
                                        <button onClick={() => handleTriggerImminent(user.email)} className={`py-2 text-[10px] font-bold rounded-lg border col-span-2 transition-colors ${isImminent ? 'bg-red-600 text-white border-red-700' : 'bg-orange-900/30 text-orange-400 border-orange-800'}`}>
                                            {isImminent ? 'Cancel 20m Warning' : 'Trigger 20m Warning'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    </div>
  );
};

export default AdminDashboard;
