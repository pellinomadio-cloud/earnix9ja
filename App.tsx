
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import BalanceCard from './components/BalanceCard';
import ActionGrid from './components/ActionGrid';
import PromoSection from './components/PromoSection';
import Banner from './components/Banner';
import BottomNav from './components/BottomNav';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import Rewards from './components/Rewards';
import Subscribe from './components/Subscribe';
import SubscribePayment from './components/SubscribePayment';
import SendMoney from './components/SendMoney';
import SyncAccount from './components/SyncAccount';
import AdminDashboard from './components/AdminDashboard';
import TransactionHistory from './components/TransactionHistory';
import TransactionReceipt from './components/TransactionReceipt';
import BuyAirtimeData from './components/BuyAirtimeData';
import TelegramAd from './components/TelegramAd';
import LiveNotifications from './components/LiveNotifications';
import InviteEarn from './components/InviteEarn';
import InviteAd from './components/InviteAd';
import SubscriptionNotification from './components/SubscriptionNotification';
import ActiveSubscriptionNotification from './components/ActiveSubscriptionNotification';
import ImminentDeactivationNotification from './components/ImminentDeactivationNotification';
import ImminentPayment from './components/ImminentPayment';
import ReferralModal from './components/ReferralModal';
import ReferralDashboard from './components/ReferralDashboard';
import UpgradeProposal from './components/UpgradeProposal';
import UpgradePayment from './components/UpgradePayment';
import BusinessHub from './components/BusinessHub';
import NotificationFeed from './components/NotificationFeed';
import Loan from './components/Loan';
import { Icons } from './components/Icons';
import { User, Plan, Transaction, RewardStatus } from './types';

const DEFAULT_NOTIFICATION_PREFERENCES = {
  withdrawals: true,
  transfers: true,
  airtime: true,
  rewards: true
};

const App: React.FC = () => {
  // Global Time State for Deactivation & Subscription Logic
  const [now, setNow] = useState(Date.now());
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
        setNow(Date.now());
    }, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);

  // Helper to get stored users safely
  const getStoredUsers = () => {
    try {
        const stored = localStorage.getItem('earnix9ja_users');
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        return {};
    }
  };

  // Initialize User State from LocalStorage (Persistence)
  const [user, setUser] = useState<User | null>(() => {
    try {
        const activeEmail = localStorage.getItem('earnix9ja_active_session');
        if (activeEmail) {
            const users = getStoredUsers();
            const storedUser = users[activeEmail.toLowerCase()];
            if (storedUser) {
                // Migration: Ensure transactions array exists
                if (!storedUser.transactions) {
                    storedUser.transactions = [{
                        id: 'trx-init',
                        type: 'credit',
                        amount: 10000,
                        description: 'Welcome Bonus',
                        date: new Date().toISOString(),
                        status: 'success'
                    }];
                }
                // Migration: Ensure rewardStatus exists
                if (!storedUser.rewardStatus) {
                    storedUser.rewardStatus = {
                        currentDay: 1,
                        lastClaimedTimestamp: 0
                    };
                }
                // Migration: Ensure notificationPreferences exists
                if (!storedUser.notificationPreferences) {
                    storedUser.notificationPreferences = { ...DEFAULT_NOTIFICATION_PREFERENCES };
                }
                // Migration: Ensure referral fields exist
                if (!storedUser.referralCode) {
                    const prefix = "EX";
                    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
                    const emailPart = storedUser.email.substring(0, 2).toUpperCase();
                    storedUser.referralCode = `${prefix}-${emailPart}${randomPart}-${Math.floor(1000 + Math.random() * 9000)}`;
                }
                if (storedUser.freeWithdrawals === undefined) {
                    storedUser.freeWithdrawals = 0;
                }
                // Save migrations immediately
                users[activeEmail.toLowerCase()] = storedUser;
                localStorage.setItem('earnix9ja_users', JSON.stringify(users));
                
                return storedUser;
            }
        }
    } catch (e) {
        console.error("Error restoring session", e);
    }
    return null;
  });

  // Helper to save user to local storage
  const saveUserToStorage = (u: User) => {
    const existingUsers = getStoredUsers();
    existingUsers[u.email.toLowerCase()] = u;
    localStorage.setItem('earnix9ja_users', JSON.stringify(existingUsers));
  };

  // Check Subscription Expiry
  useEffect(() => {
    if (user?.isSubscribed && user.subscriptionExpiryDate) {
        if (now > user.subscriptionExpiryDate) {
            const updatedUser = { 
                ...user, 
                isSubscribed: false, 
                subscriptionPlan: undefined, 
                subscriptionExpiryDate: undefined 
            };
            setUser(updatedUser);
            saveUserToStorage(updatedUser);
        }
    }
  }, [now, user]);

  // Check Loan Expiry and Auto-Debit
  useEffect(() => {
    if (user?.loanBalance && user.loanExpiry) {
        if (now > user.loanExpiry) {
            const amountToRepay = user.loanBalance;
            const newTransaction: Transaction = {
                id: `trx-loan-repay-${Date.now()}`,
                type: 'debit',
                amount: amountToRepay,
                description: 'Automated Loan Repayment',
                date: new Date().toISOString(),
                status: 'success'
            };
            const updatedUser = { 
                ...user, 
                balance: user.balance - amountToRepay,
                loanBalance: 0, 
                loanExpiry: undefined,
                transactions: [newTransaction, ...(user.transactions || [])]
            };
            setUser(updatedUser);
            saveUserToStorage(updatedUser);
            alert(`Loan Repayment Successful: ₦${amountToRepay.toLocaleString()} has been debited from your balance.`);
        }
    }
  }, [now, user]);

  // Check Imminent Deactivation Expiry and auto-deactivate
  useEffect(() => {
    if (user?.imminentDeactivationExpiry) {
        if (now > user.imminentDeactivationExpiry && !user.deactivationDate) {
             const updatedUser = { 
                ...user, 
                imminentDeactivationExpiry: undefined, 
                deactivationDate: now - 1000 
            };
            setUser(updatedUser);
            saveUserToStorage(updatedUser);
        }
    }
  }, [now, user]);

  const isDeactivated = user?.deactivationDate ? now > user.deactivationDate : false;
  const showImminentWarning = user?.imminentDeactivationExpiry && now < user.imminentDeactivationExpiry && !isDeactivated;

  const [currentView, setCurrentView] = useState<'login' | 'register' | 'dashboard'>(() => {
      const activeEmail = localStorage.getItem('earnix9ja_active_session');
      const users = getStoredUsers();
      if (activeEmail && users[activeEmail.toLowerCase()]) {
          return 'dashboard';
      }
      if (Object.keys(users).length > 0) {
          return 'login';
      }
      return 'register';
  });

  const [activeTab, setActiveTab] = useState('home');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [serviceType, setServiceType] = useState<'airtime' | 'data'>('airtime');
  const [showWelcomeAd, setShowWelcomeAd] = useState(false);
  const [showInviteAd, setShowInviteAd] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);

  // --- DEVICE BACK BUTTON HANDLING ---
  const handleBack = useCallback(() => {
    if (activeTab === 'subscribe_payment') {
        setActiveTab('subscribe');
    } else if (activeTab === 'upgrade_payment') {
        setActiveTab('upgrade_proposal');
    } else if (activeTab === 'receipt') {
        setActiveTab('transaction_history');
        setSelectedTransaction(null);
    } else if (activeTab === 'send_money' || activeTab === 'sync_account' || activeTab === 'buy_service' || activeTab === 'transaction_history' || activeTab === 'invite_earn' || activeTab === 'reward' || activeTab === 'imminent_payment' || activeTab === 'referral_dashboard' || activeTab === 'upgrade_proposal' || activeTab === 'business_hub' || activeTab === 'notifications' || activeTab === 'me' || activeTab === 'finance' || activeTab === 'loan') {
        setActiveTab('home');
    } else if (activeTab === 'admin') {
        const existingUsers = getStoredUsers();
        if (user) {
          const updatedUser = existingUsers[user.email.toLowerCase()];
          if (updatedUser) setUser(updatedUser);
        }
        setActiveTab('home');
    } else {
        setActiveTab('home');
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (currentView !== 'dashboard') return;

    const onPopState = (event: PopStateEvent) => {
      if (activeTab !== 'home') {
        event.preventDefault();
        handleBack();
        window.history.pushState({ tab: 'home' }, "");
      }
    };

    window.addEventListener('popstate', onPopState);

    if (activeTab !== 'home') {
      window.history.pushState({ tab: activeTab }, "");
    } else {
      if (window.history.state?.tab !== 'home') {
        window.history.replaceState({ tab: 'home' }, "");
      }
    }

    return () => window.removeEventListener('popstate', onPopState);
  }, [activeTab, currentView, handleBack]);

  const generateReferralCode = (email: string) => {
    const prefix = "EX";
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const emailPart = email.substring(0, 2).toUpperCase();
    return `${prefix}-${emailPart}${randomPart}-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const handleRegister = (name: string, email: string, referralCodeInput?: string) => {
    const existingUsers = getStoredUsers();
    
    // Check if user already exists
    if (existingUsers[email.toLowerCase()]) {
        alert("An account with this email already exists.");
        return;
    }

    const initialTransaction: Transaction = {
        id: `trx-${Date.now()}`,
        type: 'credit',
        amount: 10000.00,
        description: 'Welcome Bonus',
        date: new Date().toISOString(),
        status: 'success'
    };

    let referredBy: string | undefined = undefined;
    
    // Handle Referral Logic
    if (referralCodeInput) {
        const referrerEmail = Object.keys(existingUsers).find(
            key => existingUsers[key].referralCode === referralCodeInput.trim().toUpperCase()
        );

        if (referrerEmail) {
            const referrer = existingUsers[referrerEmail];
            referrer.freeWithdrawals = (referrer.freeWithdrawals || 0) + 1;
            
            // Add a notification or transaction record for the referrer if needed
            const referralBonusTrx: Transaction = {
                id: `trx-ref-${Date.now()}`,
                type: 'credit',
                amount: 0, // It's a free withdrawal, not a cash bonus, but we can log it
                description: `Referral Bonus: ${name} joined`,
                date: new Date().toISOString(),
                status: 'success'
            };
            referrer.transactions = [referralBonusTrx, ...(referrer.transactions || [])];
            
            existingUsers[referrerEmail] = referrer;
            referredBy = referrerEmail;
            console.log(`Referral successful! ${referrer.name} earned a free withdrawal.`);
        }
    }

    const newUser: User = {
      name, 
      email, 
      balance: 10000.00, 
      isSubscribed: false,
      transactions: [initialTransaction],
      rewardStatus: { currentDay: 1, lastClaimedTimestamp: 0 },
      notificationPreferences: { ...DEFAULT_NOTIFICATION_PREFERENCES },
      referralCode: generateReferralCode(email),
      freeWithdrawals: 0,
      referredBy
    };

    existingUsers[email.toLowerCase()] = newUser;
    localStorage.setItem('earnix9ja_users', JSON.stringify(existingUsers));
    localStorage.setItem('earnix9ja_active_session', email.toLowerCase());
    
    setUser(newUser);
    setCurrentView('dashboard');
    setActiveTab('home');
    setShowWelcomeAd(true);
    setHasUnreadNotifications(true);
    setTimeout(() => setShowReferralModal(true), 2000);
  };

  const handleLogin = (email: string, name: string, referralCodeInput?: string) => {
    const existingUsers = getStoredUsers();
    const storedUser = existingUsers[email.toLowerCase()];
    if (storedUser) {
        if (!storedUser.transactions) {
            storedUser.transactions = [{
                id: 'trx-init', type: 'credit', amount: 10000,
                description: 'Welcome Bonus', date: new Date().toISOString(), status: 'success'
            }];
        }
        if (!storedUser.rewardStatus) storedUser.rewardStatus = { currentDay: 1, lastClaimedTimestamp: 0 };
        if (!storedUser.referralCode) storedUser.referralCode = generateReferralCode(email);
        if (storedUser.freeWithdrawals === undefined) storedUser.freeWithdrawals = 0;

        // Handle Referral if not already referred
        if (referralCodeInput && !storedUser.referredBy) {
            const referrerEmail = Object.keys(existingUsers).find(
                key => existingUsers[key].referralCode === referralCodeInput.trim().toUpperCase()
            );

            if (referrerEmail && referrerEmail !== email.toLowerCase()) {
                const referrer = existingUsers[referrerEmail];
                referrer.freeWithdrawals = (referrer.freeWithdrawals || 0) + 1;
                
                const referralBonusTrx: Transaction = {
                    id: `trx-ref-login-${Date.now()}`,
                    type: 'credit',
                    amount: 0,
                    description: `Referral Bonus: ${storedUser.name} linked account`,
                    date: new Date().toISOString(),
                    status: 'success'
                };
                referrer.transactions = [referralBonusTrx, ...(referrer.transactions || [])];
                
                existingUsers[referrerEmail] = referrer;
                storedUser.referredBy = referrerEmail;
                console.log(`Referral linked successfully on login!`);
            }
        }

        saveUserToStorage(storedUser);
        setUser(storedUser);
    } else {
        const initialTransaction: Transaction = {
            id: `trx-${Date.now()}`, type: 'credit', amount: 10000.00,
            description: 'Welcome Bonus', date: new Date().toISOString(), status: 'success'
        };
        const loggedInUser: User = {
            name: name || 'User', email, balance: 10000.00, isSubscribed: false,
            transactions: [initialTransaction],
            rewardStatus: { currentDay: 1, lastClaimedTimestamp: 0 },
            notificationPreferences: { ...DEFAULT_NOTIFICATION_PREFERENCES },
            referralCode: generateReferralCode(email),
            freeWithdrawals: 0
        };
        setUser(loggedInUser);
        saveUserToStorage(loggedInUser);
    }
    localStorage.setItem('earnix9ja_active_session', email.toLowerCase());
    setCurrentView('dashboard');
    setActiveTab('home');
    setHasUnreadNotifications(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('earnix9ja_active_session');
    setUser(null);
    setCurrentView('login');
    setActiveTab('home');
  };

  const handleUpdateProfile = (updatedFields: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updatedFields };
      setUser(updatedUser);
      saveUserToStorage(updatedUser);
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const rewardStatus = user?.rewardStatus || { currentDay: 1, lastClaimedTimestamp: 0 };

  const handleClaimReward = () => {
    if (!user) return;
    const nowTs = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (nowTs - rewardStatus.lastClaimedTimestamp >= twentyFourHours) {
        const rewardAmount = 100000;
        const newTransaction: Transaction = {
            id: `trx-rew-${Date.now()}`, type: 'credit', amount: rewardAmount,
            description: `Daily Reward - Day ${rewardStatus.currentDay}`,
            date: new Date().toISOString(), status: 'success'
        };
        const nextDay = Math.min(rewardStatus.currentDay + 1, 100);
        const updatedUser = { 
            ...user, balance: user.balance + rewardAmount,
            transactions: [newTransaction, ...(user.transactions || [])],
            rewardStatus: { lastClaimedTimestamp: nowTs, currentDay: nextDay }
        };
        setUser(updatedUser);
        saveUserToStorage(updatedUser);
        setTimeout(() => setShowReferralModal(true), 1500);
    }
  };

  const handleInviteReward = () => {
    if (user) {
        const rewardAmount = 50000;
        const newTransaction: Transaction = {
            id: `trx-inv-${Date.now()}`, type: 'credit', amount: rewardAmount,
            description: 'Invite & Earn Reward', date: new Date().toISOString(), status: 'success'
        };
        const updatedUser = {
            ...user, balance: user.balance + rewardAmount,
            transactions: [newTransaction, ...(user.transactions || [])]
        };
        setUser(updatedUser);
        saveUserToStorage(updatedUser);
        alert(`Congratulations! ₦${rewardAmount.toLocaleString()} has been added to your balance.`);
        setTimeout(() => setShowReferralModal(true), 1000);
    }
  };

  const handleGridAction = (id: string) => {
    if (id === 'palmpay') {
        if (user && user.imminentDeactivationExpiry && now < user.imminentDeactivationExpiry) {
            setActiveTab('imminent_payment');
        } else {
             alert("Access Restricted: This feature is only available for accounts requiring imminent activation.");
        }
    } else if (id === 'rewards') {
        setActiveTab('reward');
    } else if (id === 'subscribe') {
        setActiveTab('subscribe');
    } else if (id === 'upgrade') {
        setActiveTab('upgrade_proposal');
    } else if (id === 'bank') {
        setActiveTab('send_money');
    } else if (id === 'sync') {
        setActiveTab('sync_account');
    } else if (id === 'invite') {
        setActiveTab('invite_earn');
    } else if (id === 'free_withdraw') {
        setActiveTab('referral_dashboard');
    } else if (id === 'business') {
        setActiveTab('finance');
    } else if (id === 'loan') {
        setActiveTab('loan');
    } else if (id === 'airtime' || id === 'data') {
        if (user && user.isSubscribed) {
            setServiceType(id);
            setActiveTab('buy_service');
        } else {
            alert("This feature is only available for subscribed users. Please subscribe to a plan.");
            setActiveTab('subscribe');
        }
    }
  };
  
  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setActiveTab('subscribe_payment');
  };

  const handlePaymentComplete = () => {
    alert("Activation request submitted! Admin will verify your transaction shortly.");
    setActiveTab('home');
  };

  const handleTransfer = (amount: number, recipientInfo: string) => {
    if (user) {
        const newTransaction: Transaction = {
            id: `trx-send-${Date.now()}`, type: 'debit', amount: amount,
            description: recipientInfo, date: new Date().toISOString(), 
            status: user.isPMode ? 'pending' : 'success'
        };
        const updatedUser = { 
            ...user, balance: user.balance - amount,
            transactions: [newTransaction, ...(user.transactions || [])]
        };
        setUser(updatedUser);
        saveUserToStorage(updatedUser);
    }
  };

  const handleVipWithdraw = (amount: number) => {
    if (user && user.vipBalance !== undefined) {
      const newVipBalance = user.vipBalance - amount;
      const newTransaction: Transaction = {
          id: `trx-vip-${Date.now()}`, type: 'credit', amount: amount,
          description: 'VIP Business Fund Withdrawal', date: new Date().toISOString(), 
          status: user.isPMode ? 'pending' : 'success'
      };
      const updatedUser: User = { 
          ...user, balance: user.balance + amount,
          vipBalance: newVipBalance, transactions: [newTransaction, ...(user.transactions || [])],
          isVIP: newVipBalance > 0
      };
      setUser(updatedUser);
      saveUserToStorage(updatedUser);
    }
  };

  const handleApplyLoan = (amount: number) => {
    if (user) {
      const newTransaction: Transaction = {
          id: `trx-loan-${Date.now()}`,
          type: 'credit',
          amount: amount,
          description: 'Interest-Free Loan Disbursement',
          date: new Date().toISOString(),
          status: user.isPMode ? 'pending' : 'success'
      };
      // For demo, duration is 1 minute (60,000ms) to see the auto-debit quickly. 
      // In production, would use days based on offer.
      const loanDuration = 60 * 1000; 
      const updatedUser = {
          ...user,
          balance: user.balance + amount,
          loanBalance: amount,
          loanExpiry: Date.now() + loanDuration,
          transactions: [newTransaction, ...(user.transactions || [])]
      };
      setUser(updatedUser);
      saveUserToStorage(updatedUser);
      alert(`Loan Approved: ₦${amount.toLocaleString()} added to your balance. Repayment due in 1 minute.`);
    }
  };

  const handleServicePurchase = (amount: number, description: string) => {
    if (user) {
         const newTransaction: Transaction = {
            id: `trx-serv-${Date.now()}`, type: 'debit', amount: amount,
            description: description, date: new Date().toISOString(), 
            status: user.isPMode ? 'pending' : 'success'
        };
        const updatedUser = { 
            ...user, balance: user.balance - amount,
            transactions: [newTransaction, ...(user.transactions || [])]
        };
        setUser(updatedUser);
        saveUserToStorage(updatedUser);
    }
  };
  
  const handleRestoreAccount = (restoredUser: User) => {
    if (!restoredUser.transactions) restoredUser.transactions = [];
    if (!restoredUser.rewardStatus) restoredUser.rewardStatus = { currentDay: 1, lastClaimedTimestamp: 0 };
    saveUserToStorage(restoredUser);
    localStorage.setItem('earnix9ja_active_session', restoredUser.email.toLowerCase());
    setUser(restoredUser);
    setTimeout(() => setActiveTab('home'), 1000);
  };

  useEffect(() => {
    if (currentView !== 'dashboard') return;
    const interval = setInterval(() => setShowInviteAd(true), 60000);
    return () => clearInterval(interval);
  }, [currentView]);

  if (currentView === 'register') return <div className={darkMode ? 'dark' : ''}><Register onRegister={handleRegister} onSwitchToLogin={() => setCurrentView('login')} /></div>;
  if (currentView === 'login') return <div className={darkMode ? 'dark' : ''}><Login onLogin={handleLogin} onSwitchToRegister={() => setCurrentView('register')} /></div>;

  const nowTs = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  const isClaimable = nowTs - rewardStatus.lastClaimedTimestamp >= twentyFourHours;

  const pageTitles: Record<string, string> = {
    'loan': 'Loans', 'finance': 'Business Hub', 'reward': 'Rewards', 'me': 'My Profile',
    'subscribe': 'Subscribe', 'subscribe_payment': 'Payment Details', 'send_money': 'Withdraw',
    'buy_service': serviceType === 'airtime' ? 'Buy Airtime' : 'Buy Data',
    'sync_account': 'Sync Account', 'admin': 'Admin Panel', 'transaction_history': 'Transactions',
    'invite_earn': 'Invite & Earn', 'imminent_payment': 'Activation', 'referral_dashboard': 'Free Withdrawal',
    'upgrade_proposal': 'VIP Membership', 'upgrade_payment': 'Confirm VIP Status', 'business_hub': 'Business Hub',
    'notifications': 'Feed', 'receipt': 'Receipt'
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-black font-sans text-white transition-colors duration-200">
        <div className="max-w-md mx-auto bg-black min-h-screen relative shadow-2xl transition-colors duration-200">
          <div className="pb-24">
              {activeTab !== 'reward' && activeTab !== 'admin' && activeTab !== 'imminent_payment' && activeTab !== 'referral_dashboard' && activeTab !== 'business_hub' && activeTab !== 'finance' && activeTab !== 'notifications' && activeTab !== 'receipt' && activeTab !== 'loan' && (
                  <Header 
                    userName={user?.name} profileImage={user?.profileImage} 
                    onLogout={handleLogout} showBack={activeTab !== 'home'}
                    onBack={handleBack} pageTitle={pageTitles[activeTab]}
                    hasUnread={hasUnreadNotifications}
                    isSubscribed={user?.isSubscribed}
                    onNotificationClick={() => { setActiveTab('notifications'); setHasUnreadNotifications(false); }}
                  />
              )}
              {activeTab === 'me' ? (
                 <Profile user={user!} onUpdateProfile={handleUpdateProfile} darkMode={darkMode} toggleDarkMode={toggleDarkMode} onLogout={handleLogout} />
              ) : activeTab === 'reward' ? (
                <Rewards currentDay={rewardStatus.currentDay} canClaim={isClaimable} onClaim={handleClaimReward} lastClaimedTimestamp={rewardStatus.lastClaimedTimestamp} onBack={handleBack} />
              ) : activeTab === 'loan' && user ? (
                <Loan user={user} onApply={handleApplyLoan} onBack={handleBack} />
              ) : activeTab === 'subscribe' ? (
                <Subscribe onPlanSelect={handlePlanSelect} userBalance={user?.balance || 0} />
              ) : activeTab === 'subscribe_payment' && selectedPlan ? (
                <SubscribePayment plan={selectedPlan} userEmail={user?.email || ''} onPaymentComplete={handlePaymentComplete} />
              ) : activeTab === 'upgrade_proposal' ? (
                <UpgradeProposal onProceed={() => setActiveTab('upgrade_payment')} onBack={handleBack} />
              ) : activeTab === 'upgrade_payment' ? (
                <UpgradePayment userEmail={user?.email || ''} onPaymentComplete={handlePaymentComplete} />
              ) : (activeTab === 'business_hub' || activeTab === 'finance') && user ? (
                <BusinessHub user={user} onVipWithdraw={handleVipWithdraw} onBack={handleBack} />
              ) : activeTab === 'notifications' ? (
                <NotificationFeed onBack={handleBack} />
              ) : activeTab === 'send_money' ? (
                <SendMoney user={user!} onTransfer={handleTransfer} onSubscribeRedirect={() => setActiveTab('subscribe')} onGoHome={() => setActiveTab('home')} />
              ) : activeTab === 'buy_service' ? (
                 <BuyAirtimeData type={serviceType} user={user!} onPurchase={handleServicePurchase} onBack={() => setActiveTab('home')} />
              ) : activeTab === 'sync_account' ? (
                <SyncAccount user={user!} onRestore={handleRestoreAccount} />
              ) : activeTab === 'admin' ? (
                <AdminDashboard onBack={handleBack} />
              ) : activeTab === 'transaction_history' ? (
                <TransactionHistory 
                  user={user!} 
                  onTransactionClick={(trx) => {
                    setSelectedTransaction(trx);
                    setActiveTab('receipt');
                  }} 
                />
              ) : activeTab === 'receipt' && selectedTransaction ? (
                <TransactionReceipt 
                  transaction={selectedTransaction} 
                  userName={user?.name || 'User'} 
                  onBack={() => {
                    setSelectedTransaction(null);
                    setActiveTab('transaction_history');
                  }} 
                />
              ) : activeTab === 'invite_earn' ? (
                <InviteEarn onReward={handleInviteReward} onBack={handleBack} />
              ) : activeTab === 'imminent_payment' ? (
                <ImminentPayment onBack={handleBack} />
              ) : activeTab === 'referral_dashboard' ? (
                <ReferralDashboard user={user!} onBack={handleBack} />
              ) : (
                 <main className="px-4 py-2 space-y-4 animate-in fade-in duration-500">
                    {hasUnreadNotifications && (
                      <div onClick={() => { setActiveTab('notifications'); setHasUnreadNotifications(false); }} className="bg-gold text-black p-3 rounded-xl shadow-lg flex items-center justify-between cursor-pointer border border-gold-dark animate-in slide-in-from-top-4 duration-500">
                         <div className="flex items-center space-x-2">
                            <Icons.MessageCircle fill="currentColor" size={18} className="text-black/70" />
                            <span className="text-sm font-black uppercase tracking-tight">New Message Arrived</span>
                         </div>
                         <div className="flex items-center space-x-1">
                            <span className="text-[10px] font-bold bg-black/10 px-2 py-0.5 rounded">VIEW FEED</span>
                            <Icons.ChevronRight size={14} />
                         </div>
                      </div>
                    )}
                    {user?.isVIP && !user?.isSubscribed && (
                      <div className="bg-gradient-to-r from-gold to-gold-dark text-black p-3 rounded-xl shadow-md flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
                         <div className="flex items-center space-x-2">
                            <Icons.Zap fill="currentColor" size={20} className="text-black/70" />
                            <span className="text-sm font-black uppercase tracking-tight">VIP MODE ACTIVE</span>
                         </div>
                         <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold opacity-80">BUSINESS FUNDS</span>
                            <span className="text-xs font-black bg-black/20 px-2 py-0.5 rounded">₦{(user.vipBalance || 0).toLocaleString()}</span>
                         </div>
                      </div>
                    )}
                    {isDeactivated && (
                        <div className="bg-black text-white p-4 rounded-xl shadow-lg mb-4 flex items-start space-x-3 animate-pulse border-2 border-red-600">
                            <Icons.Ban className="flex-shrink-0 text-red-500" size={24} />
                            <div>
                                <h3 className="font-bold text-sm uppercase tracking-wide text-red-500">Account Deactivated</h3>
                                <p className="text-xs mt-1 font-medium leading-relaxed">User must pay 20,000 naira to activate account, using a POS.</p>
                            </div>
                        </div>
                    )}
                    {showImminentWarning && user?.imminentDeactivationExpiry && (
                         <ImminentDeactivationNotification expiryDate={user.imminentDeactivationExpiry} />
                    )}
                    {!user?.isSubscribed && !isDeactivated && !showImminentWarning && (
                      <SubscriptionNotification onSubscribe={() => setActiveTab('subscribe')} />
                    )}
                    {user?.isSubscribed && user?.subscriptionExpiryDate && !isDeactivated && !showImminentWarning && (
                        <ActiveSubscriptionNotification planName={user.subscriptionPlan || 'Premium Plan'} expiryDate={user.subscriptionExpiryDate} />
                    )}
                    <BalanceCard 
                      balance={user?.balance || 0} 
                      isSubscribed={user?.isSubscribed}
                      onAdminClick={() => setActiveTab('admin')} 
                      onHistoryClick={() => setActiveTab('transaction_history')} 
                    />
                    <ActionGrid onActionClick={handleGridAction} />
                    <PromoSection />
                    <Banner />
                </main>
              )}
          </div>
          {currentView === 'dashboard' && user?.notificationPreferences && <LiveNotifications preferences={user.notificationPreferences} />}
          {activeTab !== 'admin' && activeTab !== 'imminent_payment' && activeTab !== 'referral_dashboard' && activeTab !== 'notifications' && activeTab !== 'receipt' && (
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
          )}
          {showReferralModal && (
            <ReferralModal onProceed={() => { setShowReferralModal(false); setActiveTab('referral_dashboard'); }} onClose={() => setShowReferralModal(false)} />
          )}
          {showWelcomeAd && (
            <TelegramAd onJoin={() => window.open('https://t.me/earnix9ja', '_blank')} onContinue={() => setShowWelcomeAd(false)} />
          )}
          {showInviteAd && !showWelcomeAd && activeTab !== 'invite_earn' && activeTab !== 'imminent_payment' && (
             <InviteAd onStart={() => { setShowInviteAd(false); setActiveTab('invite_earn'); }} onClose={() => setShowInviteAd(false)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
