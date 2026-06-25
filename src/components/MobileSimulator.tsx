import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Task, 
  UserState, 
  AdSetting, 
  TaskCategory, 
  WithdrawalRequest 
} from '../types';
import { 
  Home, 
  ListTodo, 
  Gift, 
  Wallet, 
  Flame, 
  User, 
  Smartphone, 
  ChevronRight, 
  Coins, 
  CheckCircle2, 
  Navigation, 
  ArrowLeft, 
  Upload, 
  Eye, 
  X, 
  AlertTriangle,
  Play,
  RotateCw,
  Search,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  SmartphoneNfc,
  Info,
  Phone,
  Lock,
  LogIn,
  UserPlus,
  LayoutDashboard
} from 'lucide-react';
import AdminPanel from './AdminPanel';

interface MobileSimulatorProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  userState: UserState;
  setUserState: React.Dispatch<React.SetStateAction<UserState>>;
  adSetting: AdSetting;
  addLog: (msg: string) => void;
  conversionRate: number;
  withdrawList: WithdrawalRequest[];
  setWithdrawList: React.Dispatch<React.SetStateAction<WithdrawalRequest[]>>;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  setAdSetting: React.Dispatch<React.SetStateAction<AdSetting>>;
  logs: string[];
  setConversionRate: (rate: number) => void;
}

export default function MobileSimulator({
  tasks,
  setTasks,
  userState,
  setUserState,
  adSetting,
  addLog,
  conversionRate,
  withdrawList,
  setWithdrawList,
  isLoggedIn,
  setIsLoggedIn,
  isAdmin,
  setIsAdmin,
  setAdSetting,
  logs,
  setConversionRate,
}: MobileSimulatorProps) {
  
  // Navigation inside the phone
  const [activeTab, setActiveTab] = useState<'home' | 'task' | 'rewards' | 'wallet'>('home');
  const [loginMethod, setLoginMethod] = useState<'email' | 'fb' | 'google' | 'phone' | null>(null);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authScreen, setAuthScreen] = useState<'welcome' | 'fb_verify' | 'regular_login'>('welcome');
  const [showPassword, setShowPassword] = useState(false);
  
  // Selected task detail routing
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showBrowser, setShowBrowser] = useState(false);
  const [browserTimer, setBrowserTimer] = useState(0);
  const [browserClaimable, setBrowserClaimable] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<string | null>(null);
  const [telegramUsername, setTelegramUsername] = useState('');
  
  // Custom states
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');
  const [withdrawDetails, setWithdrawDetails] = useState({
    method: 'bKash' as WithdrawalRequest['method'],
    amountCoins: 1000,
    account: ''
  });

  // KYC Submission states
  const [kycForm, setKycForm] = useState({
    fullName: '',
    dateOfBirth: '1998-05-12',
    country: 'Bangladesh',
    address: 'Vasant Vihar Area, Dhaka',
    nidFrontId: 'nid_front_id.jpg',
    nidBackId: 'nid_back_id.jpg',
    selfieId: 'selfie_user.jpg'
  });
  const [showKycForm, setShowKycForm] = useState(false);

  // Rewards Games States
  const [spinDeg, setSpinDeg] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [scratchedState, setScratchedState] = useState({ revealed: false, text: 'Scratch Here!' });
  const [dailyCheckInClaimed, setDailyCheckInClaimed] = useState(false);
  const [watchAdTimes, setWatchAdTimes] = useState(0);
  const [adOverlayActive, setAdOverlayActive] = useState(false);
  const [adOverlayCountdown, setAdOverlayCountdown] = useState(5);

  // Custom visual alert / confirm modal dialog states
  const [customDialog, setCustomDialog] = useState<{
    message: string;
    type: 'alert' | 'confirm';
    onOk?: () => void;
    onCancel?: () => void;
  } | null>(null);

  const triggerAlert = (message: string) => {
    setCustomDialog({ message, type: 'alert' });
  };

  const triggerConfirm = (message: string, onOk?: () => void) => {
    setCustomDialog({
      message,
      type: 'confirm',
      onOk: () => {
        setCustomDialog(null);
        if (onOk) onOk();
      },
      onCancel: () => {
        setCustomDialog(null);
      }
    });
  };

  // Browser state anti-cheat listening
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showBrowser && browserTimer > 0) {
      interval = setInterval(() => {
        setBrowserTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showBrowser, browserTimer]);

  useEffect(() => {
    if (showBrowser && browserTimer === 0 && !browserClaimable) {
      setBrowserClaimable(true);
      addLog(`Timer Complete inside In-App Browser for "${selectedTask?.title}". Reward Claimable!`);
    }
  }, [showBrowser, browserTimer, browserClaimable, selectedTask, addLog]);

  // Handle browser close anti cheat checking
  const handleCloseBrowser = () => {
    if (!browserClaimable && browserTimer > 0) {
      triggerConfirm(
        "Anti-Cheat System Warning: Closing the task before the countdown timer finishes will forfeit your coin progress. Exit anyway?",
        () => {
          addLog(`Browser closed prematurely for task "${selectedTask?.title}". Progress forfeited.`);
          setShowBrowser(false);
          setSelectedTask(null);
        }
      );
    } else {
      setShowBrowser(false);
      setSelectedTask(null);
    }
  };

  const handleStartTask = (task: Task) => {
    // VPN detection block check
    if (userState.vpnDetected) {
      triggerAlert("Proxy Interception Protocol: A VPN address routing mask has been detected. Turn off your VPN to initiate reward tasks.");
      addLog(`Task launch of "${task.title}" BLOCKED. Active VPN address detected on device.`);
      return;
    }

    if (userState.isBanned) {
      triggerAlert("Access Denied: This device and associated Firebase UID have been banned from accessing earning servers.");
      return;
    }

    // Verify if already completed
    if (userState.completedTaskIds.includes(task.id)) {
      triggerAlert("Duplicate Attempt Blocked: You can only complete this rewarded campaign once!");
      return;
    }

    setSelectedTask(task);
    
    if (task.verificationType === 'timer') {
      setBrowserTimer(task.durationSeconds || 30);
      setBrowserClaimable(false);
      setShowBrowser(true);
      addLog(`Inline Security Browser loaded URL: ${task.link || 'Internal Frame'}. Timer tracking: ${task.durationSeconds}s`);
    } else {
      // Manual/Screenshot type -> Open Details Form view
      addLog(`Opened deep task details view for manual execution: ${task.title}`);
    }
  };

  const claimTimerReward = () => {
    if (!selectedTask) return;
    
    addLog(`Successfully credited ${selectedTask.rewardCoins} coins to User profile for completing "${selectedTask.title}".`);

    // Add coins
    setUserState(prev => {
      const coinsAvailable = prev.coinsAvailable + selectedTask.rewardCoins;
      const coinsLifetime = prev.coinsLifetime + selectedTask.rewardCoins;
      const completedTaskIds = [...prev.completedTaskIds, selectedTask.id];
      return {
        ...prev,
        coinsAvailable,
        coinsLifetime,
        completedTaskIds
      };
    });

    // Handle Interstitial ads trigger post-completion
    if (adSetting.isEnabled && adSetting.provider !== 'none') {
      triggerAdOverlay(3, 'After task completion interstitial ad loaded.');
    }

    setShowBrowser(false);
    setSelectedTask(null);
  };

  const submitManualVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    if (selectedTask.verificationType === 'screenshot' && !screenshotFile) {
      triggerAlert("Please choose a screenshot file to upload as proof.");
      return;
    }
    if (selectedTask.category === 'telegram' && !telegramUsername) {
      triggerAlert("Please provide your Telegram username verification ID.");
      return;
    }

    addLog(`Screenshot / Info submitted for manual review [${selectedTask.title}]. Coins pending verification.`);

    // Process manual task submission -> goes into pending queue (we credit immediately or simulate complete pending coins)
    setUserState(prev => {
      const coinsPending = prev.coinsPending + selectedTask.rewardCoins;
      const completedTaskIds = [...prev.completedTaskIds, selectedTask.id];
      return {
        ...prev,
        coinsPending,
        completedTaskIds
      };
    });

    // Increment task counts
    setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, completionsCount: t.completionsCount + 1 } : t));

    triggerAlert("Proof Submitted! The admin panel will review your screenshot. Corresponding coins have been moved to 'Pending' wallet.");
    setSelectedTask(null);
    setScreenshotFile(null);
    setTelegramUsername('');
  };

  const submitSurveyVerification = (surveyAnswers: Record<string, string>) => {
    if (!selectedTask) return;

    addLog(`Survey details submitted. Credited ${selectedTask.rewardCoins} survey feedback coins!`);

    setUserState(prev => {
      const coinsAvailable = prev.coinsAvailable + selectedTask.rewardCoins;
      const coinsLifetime = prev.coinsLifetime + selectedTask.rewardCoins;
      const completedTaskIds = [...prev.completedTaskIds, selectedTask.id];
      return {
        ...prev,
        coinsAvailable,
        coinsLifetime,
        completedTaskIds
      };
    });

    triggerAlert(`Survey Complete! You have received ${selectedTask.rewardCoins} coins.`);
    setSelectedTask(null);
  };

  const triggerAdOverlay = (seconds: number, logMsg = 'Ad Network Overlay loaded') => {
    setAdOverlayCountdown(seconds);
    setAdOverlayActive(true);
    addLog(logMsg);

    const interval = setInterval(() => {
      setAdOverlayCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const closeAdOverlay = () => {
    if (adOverlayCountdown > 0) {
      triggerAlert("You must watch the ad for at least the full duration to claim rewards.");
      return;
    }
    setAdOverlayActive(false);
  };

  const handleDailyCheckIn = () => {
    if (dailyCheckInClaimed) return;
    
    const nextStreak = userState.dailyStreak + 1;
    const checkInBonus = 50 + (nextStreak * 5); // incremental coins
    addLog(`Claimed Daily Bonus. Streak increased to ${nextStreak} days (+${checkInBonus} coins)`);

    setUserState(prev => {
      return {
        ...prev,
        coinsAvailable: prev.coinsAvailable + checkInBonus,
        coinsLifetime: prev.coinsLifetime + checkInBonus,
        dailyStreak: nextStreak,
        lastCheckIn: new Date().toLocaleDateString()
      };
    });

    if (adSetting.isEnabled && adSetting.provider !== 'none') {
      triggerAdOverlay(4, 'Daily streak reward banner advertisement popped.');
    }

    setDailyCheckInClaimed(true);
  };

  const handleSpinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    const extraDeg = Math.floor(Math.random() * 360) + 720; // At least two full rotations
    setSpinDeg(prev => prev + extraDeg);

    // Calculate winning value based on segment range
    const awards = [5, 15, 50, 0, 25, 10, 100, 20];
    const index = Math.floor(((spinDeg + extraDeg) % 360) / (360 / awards.length));
    const winCoins = awards[index] || 5;

    setTimeout(() => {
      setIsSpinning(false);
      setUserState(prev => ({
        ...prev,
        coinsAvailable: prev.coinsAvailable + winCoins,
        coinsLifetime: prev.coinsLifetime + winCoins
      }));
      addLog(`Lucky Spin Wheel completed! Segment landing rewarded ${winCoins} free coins.`);
      triggerAlert(`Congratulations! You won ${winCoins} Coins from the Lucky Spin Wheel!`);
    }, 2500);
  };

  const handleScratchCard = () => {
    if (scratchedState.revealed) return;
    
    const payoutOptions = [25, 45, 10, 80, 15];
    const prize = payoutOptions[Math.floor(Math.random() * payoutOptions.length)];

    setScratchedState({
      revealed: true,
      text: `YOU WON ${prize} COINS!`
    });

    setUserState(prev => ({
      ...prev,
      coinsAvailable: prev.coinsAvailable + prize,
      coinsLifetime: prev.coinsLifetime + prize
    }));
    addLog(`Lucky Scratch Card scratched. Earned ${prize} Coins.`);
  };

  const handleWatchRewardedAd = () => {
    if (watchAdTimes >= 7) {
      triggerAlert("Standard daily limit reached. Reset starts tomorrow.");
      return;
    }
    
    triggerAdOverlay(5, 'User watched standard 5-seconds Rewarded Video Ad.');
    
    // Add reward post watching
    setTimeout(() => {
      setWatchAdTimes(prev => prev + 1);
      setUserState(prev => ({
        ...prev,
        coinsAvailable: prev.coinsAvailable + 25,
        coinsLifetime: prev.coinsLifetime + 25
      }));
      addLog('Rewarded video ad bonus of 25 coins credited.');
    }, 5100);
  };

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycForm.fullName || !kycForm.address) {
      triggerAlert("Please fill in standard Name and Address parameters.");
      return;
    }

    setUserState(prev => ({
      ...prev,
      kyc: {
        fullName: kycForm.fullName,
        dateOfBirth: kycForm.dateOfBirth,
        country: kycForm.country,
        address: kycForm.address,
        nidFront: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400&auto=format&fit=crop&q=60', // Mock Front NID
        nidBack: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60',   // Mock Back NID
        selfie: prev.avatarUrl,
        status: 'pending'
      }
    }));

    addLog(`KYC verification documents uploaded by user "${kycForm.fullName}". Status: Pending.`);
    triggerAlert("KYC documents uploaded successfully! The system administrator is verifying details.");
    setShowKycForm(false);
  };

  const handleWithdrawalRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Verification check: KYC Approval mandatory
    if (userState.kyc.status !== 'approved') {
      triggerAlert("KYC Verification Required: You must verify your national identity card details before drawing cash outs. Submit documents under Profile/Wallet.");
      return;
    }

    // Min withdrawn rule
    if (withdrawDetails.amountCoins < 1000) {
      triggerAlert("Minimum Threshold Block: A minimum conversion value of 1,000 Coins ($10 USD) is required.");
      return;
    }

    if (userState.coinsAvailable < withdrawDetails.amountCoins) {
      triggerAlert("Insufficient Funds: Your available balance does not contain the requested coins.");
      return;
    }

    if (!withdrawDetails.account) {
      triggerAlert("Please input your mobile account details (Phone or billing ID).");
      return;
    }

    const fiatVal = withdrawDetails.amountCoins / conversionRate;
    const newRequest: WithdrawalRequest = {
      id: `wreq-${Date.now()}`,
      userId: userState.uid,
      userName: userState.name,
      userEmail: userState.email,
      amountCoins: withdrawDetails.amountCoins,
      amountFiat: fiatVal,
      method: withdrawDetails.method,
      accountDetails: withdrawDetails.account,
      status: 'pending',
      requestedAt: new Date().toLocaleTimeString()
    };

    setWithdrawList(prev => [newRequest, ...prev]);

    // Deduct coins available, move to pending
    setUserState(prev => ({
      ...prev,
      coinsAvailable: prev.coinsAvailable - withdrawDetails.amountCoins,
      coinsPending: prev.coinsPending + withdrawDetails.amountCoins
    }));

    addLog(`Withdrew request submitted: ${withdrawDetails.amountCoins} coins via ${withdrawDetails.method}`);
    triggerAlert(`Transfer Request Sent! Admin is reviewing your cash out payout of $${fiatVal.toFixed(2)}.`);
    
    setWithdrawDetails(prev => ({ ...prev, account: '' }));
  };

  const handleUserAuth = (type: 'signup' | 'login') => {
    const isUserAdmin = (authPhone === '01877722819' || authPhone === '1877722819') && authPassword === 'BFN777';

    if (!isUserAdmin) {
      if (!authPhone || authPhone.trim().length < 8) {
        setAuthError('অনুগ্রহ করে একটি সঠিক ইমেইল অথবা মোবাইল নাম্বার দিন।');
        return;
      }
      if (!authPassword || authPassword.length < 6) {
        setAuthError('অনুগ্রহ করে নূন্যতম ৬ ডিজিটের পাসওয়ার্ড দিন।');
        return;
      }
    }
    
    setAuthError('');
    setIsLoggedIn(true);
    if (isUserAdmin) {
      setIsAdmin(true);
      setUserState(prev => ({
        ...prev,
        email: 'admin@bk777.com',
        name: 'BK777 Workspace Admin'
      }));
      addLog(`👑 Administrator logged in successfully: +880 ${authPhone}`);
    } else {
      setIsAdmin(false);
      setUserState(prev => ({
        ...prev,
        email: authPhone.includes('@') ? authPhone : `${authPhone}@rewards.com`,
        name: `User ${authPhone.split('@')[0]}`
      }));
      if (type === 'login') {
        addLog(`User logged in successfully via ID: ${authPhone}`);
      } else {
        addLog(`New account successfully registered/verified via Facebook ID: ${authPhone}`);
      }
    }
  };

  // Render variables helper
  const filteredTasks = tasks.filter(t => {
    if (!t.active) return false;
    if (selectedCategory === 'all') return true;
    return t.category === selectedCategory;
  });

  return (
    <div id="phone-simulation-frame" className="w-full min-h-screen bg-[#f8f9fa] text-slate-800 flex flex-col relative select-none transition-all duration-300">
      
      {/* Internal App Core Content Canvas */}
      <div className="w-full flex-1 bg-[#f8f9fa] flex flex-col relative">
        
        {/* Anti-cheat Banned Screen state */}
        {userState.isBanned && (
          <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-center p-6 text-center text-white">
            <X className="w-16 h-16 text-rose-500 animate-bounce mb-4" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-rose-400">Account Terminated</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Your device ID or account Firebase UID was flagged by our security protocol for anti-cheat violation. Access from this device is banned.
            </p>
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-[10px] font-mono text-left mt-5 text-indigo-400">
              ANTI_CHEAT_VPN_BYPASS_VIOLATION
            </div>
          </div>
        )}

        {/* Anti-cheat VPN Alert screen overlay */}
        {userState.vpnDetected && (
          <div className="absolute inset-0 bg-slate-950/90 z-50 flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500 rounded-full flex items-center justify-center mb-4 text-rose-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-rose-400">Anti-Proxy Warning</h2>
            <p className="text-xs text-slate-400 mt-1 lines-relaxed">
              Secure earning tunnels detect active VPN proxy channels. Real rewards require genuine residential IPs. Disable VPN to continue.
            </p>
            <p className="text-[10px] text-slate-500 italic mt-4">Simulate "Clear VPN" inside admin panel dashboard to release bypass flags.</p>
          </div>
        )}

        {/* Global Banner advertisement placement based on Admin Configurations */}
        {adSetting.isEnabled && adSetting.placementLimits.homeBanner && activeTab === 'home' && !selectedTask && !showBrowser && (
          <div className="bg-[#e9ecef] border-b border-gray-200 text-slate-400 text-[10px] font-bold py-1.5 px-3 flex justify-between items-center text-center tracking-normal">
            <span className="bg-indigo-600 text-white text-[8px] font-bold py-0.5 px-1 rounded select-none uppercase">Sponsor AD</span>
            <span className="font-sans text-slate-600">Earn coins fast with premium partners</span>
            <X className="w-3 h-3 hover:text-slate-600 cursor-pointer text-slate-400" />
          </div>
        )}

        {/* In-App Webview Browser Emulator Canvas */}
        {showBrowser && selectedTask && (
          <div className="absolute inset-x-0 top-0 bottom-0 bg-white z-50 flex flex-col animate-slideUp">
            <div className="bg-slate-900 text-white p-3 pt-6 flex items-center justify-between border-b border-slate-800">
              <button 
                id="close-emulator-btn" 
                onClick={handleCloseBrowser}
                className="text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <span className="text-[10px] text-slate-400 block font-mono">In-App Security Browser</span>
                <p className="text-xs font-bold truncate max-w-[150px]">{selectedTask.title}</p>
              </div>
              <div className="bg-indigo-950 border border-indigo-800 text-emerald-400 font-bold px-2 py-0.5 rounded text-xs">
                {browserTimer > 0 ? (
                  <span>Timer: {browserTimer}s</span>
                ) : (
                  <span className="animate-pulse">Claim Ready!</span>
                )}
              </div>
            </div>

            {/* Simulated Address Bar url layout */}
            <div className="bg-slate-100 p-2 border-b border-gray-300">
              <div className="bg-white rounded-md border border-gray-300 px-3 py-1 flex items-center text-[10px] text-gray-500 font-mono gap-1 select-all">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span className="truncate flex-1">{selectedTask.link || "https://secure-task-portal.rewardlabs.com"}</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>

            {/* Nested Frame Simulation */}
            <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center relative p-4">
              {selectedTask.category === 'youtube' && selectedTask.link ? (
                <div className="w-full aspect-video border border-gray-300 shadow-lg rounded-lg overflow-hidden bg-black flex items-center justify-center">
                  <iframe 
                    className="w-full h-full" 
                    src={selectedTask.link} 
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  ></iframe>
                </div>
              ) : (
                <div className="text-center max-w-xs space-y-3">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow animate-pulse">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-slate-700 text-sm">Action Validation Portal</h3>
                  <p className="text-xs text-slate-400 leading-normal">
                    You are currently visiting the sponsor's promotional campaign tracking portal. Read contents and stay engaged.
                  </p>
                  <p className="text-[10px] text-indigo-500 font-semibold font-mono uppercase bg-indigo-50 py-1 px-3.5 rounded-full inline-block">
                    Anti-minimize tracking active
                  </p>
                </div>
              )}
            </div>

            {/* Submission triggers */}
            {browserClaimable ? (
              <div className="p-4 border-t border-gray-200 bg-white">
                <button
                  id="claim-reward-coins-btn"
                  onClick={claimTimerReward}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-transform text-xs"
                >
                  CLAIM {selectedTask.rewardCoins} COINS NOW
                </button>
              </div>
            ) : (
              <div className="p-4 border-t border-gray-200 bg-slate-50 text-center text-xs text-gray-400">
                Reward unlocks after {browserTimer} seconds active stay.
              </div>
            )}
          </div>
        )}

        {/* Ad Network Overlay (Pop up / Interstitial / Video Ad Interceptor) */}
        {adOverlayActive && (
          <div className="absolute inset-0 bg-black/95 z-55 flex flex-col items-center justify-center p-6 text-center text-white animate-fadeIn">
            <div className="absolute top-6 right-6 flex items-center gap-2">
              <span className="text-[11px] text-gray-400 font-mono">
                {adOverlayCountdown > 0 ? `Skip in ${adOverlayCountdown}s` : 'You can close now'}
              </span>
              <button
                id="close-ad-overlay"
                onClick={closeAdOverlay}
                disabled={adOverlayCountdown > 0}
                className="w-8 h-8 rounded-full bg-slate-800 disabled:bg-slate-900 disabled:opacity-40 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 max-w-sm">
              <span className="bg-indigo-600 text-white font-bold text-[9px] py-1 px-2 rounded uppercase tracking-wider">
                {adSetting.provider.toUpperCase()} Ad Sponsored
              </span>
              <div className="w-full aspect-video border border-slate-800 rounded bg-slate-900 overflow-hidden shadow flex items-center justify-center relative">
                <Play className="w-12 h-12 text-slate-700 animate-ping absolute" />
                <img 
                  src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop&q=60" 
                  className="w-full h-full object-cover opacity-80" 
                  alt="sponsored promo banner" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-sm font-sans line-clamp-1">Install Rise of Kingdoms</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">The highest-grossing RPG available right now. Click downstream link to claim 120 extra free coins.</p>
              </div>
              <button className="bg-amber-500 text-slate-950 font-bold p-2 px-6 rounded-lg text-xs tracking-wider animate-pulse self-center">
                INSTALL CAMPAIGN
              </button>
            </div>
          </div>
        )}

        {/* IF USER IS NOT LOGGED IN -> RENDER AUTHENTICATION FLOW PORTALS */}
        {!isLoggedIn ? (
          <div className="flex-1 flex flex-col overflow-y-auto relative min-h-full bg-[#0b121f]">
            {/* WELCOME / GREETING SCREEN */}
            {authScreen === 'welcome' && (
              <motion.div 
                key="welcome"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col justify-between p-6 pt-16 pb-8 bg-[#0b121f] text-white text-center"
              >
                <div className="w-full flex-1 flex flex-col justify-center items-center max-w-sm mx-auto">
                  {/* High fidelity BK777 Logo Container */}
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="w-48 h-48 rounded-2xl overflow-hidden border border-slate-800 shadow-[0_0_30px_rgba(223,186,115,0.15)] bg-[#090d16] flex items-center justify-center p-0.5 relative group"
                  >
                    <img
                      src="/src/assets/images/bk777_logo_1782280626027.jpg"
                      alt="BK777 Logo"
                      className="w-full h-full object-cover rounded-2xl"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>

                  {/* Are you new to BK777...? Text */}
                  <h3 className="text-slate-200 text-[15px] font-bold tracking-tight mt-12 mb-4">
                    Are you new to BK777...?
                  </h3>

                  {/* Animated Sign Up Button with Custom Dual Split Gradient Background */}
                  <motion.button
                    onClick={() => {
                      setAuthError('');
                      setAuthScreen('fb_verify');
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      boxShadow: [
                        "0 4px 15px rgba(223, 186, 115, 0.15)",
                        "0 4px 25px rgba(223, 186, 115, 0.35)",
                        "0 4px 15px rgba(223, 186, 115, 0.15)"
                      ]
                    }}
                    transition={{
                      boxShadow: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      },
                      scale: { duration: 0.15 }
                    }}
                    style={{
                      background: 'linear-gradient(105deg, #dfba73 0%, #c59f59 45%, #0c4c92 45%, #1668c7 100%)'
                    }}
                    className="w-full max-w-[280px] py-3 rounded-full text-white font-extrabold text-[17px] tracking-wide border border-[#9b7b3d] shadow-lg cursor-pointer flex items-center justify-center select-none"
                  >
                    Sign Up
                  </motion.button>

                  {/* Do you already have an account? Text */}
                  <h3 className="text-slate-200 text-[14px] font-bold tracking-tight mt-12 mb-4">
                    Do you already have an account?
                  </h3>

                  {/* Circular Login Button with Split Colors and Hover/Rotate Animation */}
                  <motion.button
                    onClick={() => {
                      setAuthError('');
                      setAuthScreen('regular_login');
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{
                      boxShadow: [
                        "0 4px 12px rgba(13, 76, 146, 0.2)",
                        "0 4px 22px rgba(13, 76, 146, 0.4)",
                        "0 4px 12px rgba(13, 76, 146, 0.2)"
                      ]
                    }}
                    transition={{
                      boxShadow: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                      },
                      scale: { duration: 0.15 }
                    }}
                    style={{
                      background: 'linear-gradient(105deg, #dfba73 0%, #c59f59 45%, #0c4c92 45%, #1668c7 100%)'
                    }}
                    className="w-14 h-14 rounded-full border border-[#9b7b3d] flex items-center justify-center font-extrabold text-white text-xs shadow-md cursor-pointer select-none"
                  >
                    Login
                  </motion.button>
                </div>

                <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-12">
                  POWERED BY BK777 ECOSYSTEM
                </div>
              </motion.div>
            )}

            {/* FACEBOOK VERIFICATION PAGE */}
            {authScreen === 'fb_verify' && (
              <motion.div 
                key="fb_verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col justify-between bg-[#ffffff] p-6 pt-16 pb-8 relative text-[#1c1e21]"
              >
                {/* Back Arrow button */}
                <button 
                  onClick={() => setAuthScreen('welcome')} 
                  className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 cursor-pointer p-1.5 rounded-full hover:bg-gray-100 transition duration-150"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="w-full flex-1 flex flex-col justify-center max-w-sm mx-auto">
                  {/* Perfect Facebook Blue Circle Icon */}
                  <div className="flex justify-center mb-4 mt-4">
                    <svg className="w-16 h-16 select-none filter drop-shadow-sm" viewBox="0 0 36 36" fill="none">
                      <circle cx="18" cy="18" r="18" fill="#1877f2"/>
                      <path d="M22.5 18H20.25V27H16.875V18H15.1875V15.1875H16.875V13.5C16.875 11.25 17.8125 10.125 20.25 10.125C21.375 10.125 22.125 10.2188 22.125 10.2188L21.9375 13.0312H20.25C19.125 13.0312 18.8438 13.5 18.8438 14.25V15.1875H22.125L22.5 18Z" fill="white"/>
                    </svg>
                  </div>

                  {/* Header text from the 2nd picture */}
                  <h2 className="text-[21px] font-bold text-[#1c1e21] tracking-tight text-center leading-tight mb-8 font-sans max-w-[260px] mx-auto">
                    LOGIN to facebook for two factor verify
                  </h2>

                  {/* Error Alert */}
                  {authError && (
                    <div className="mb-4 bg-rose-50 border border-rose-200/60 text-rose-600 p-3.5 rounded-xl flex items-start gap-2 text-xs animate-shake">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="font-semibold">{authError}</span>
                    </div>
                  )}

                  {/* Input Fields */}
                  <div className="space-y-3">
                    <input
                      id="fb-phone-input"
                      type="text"
                      placeholder="Email or Phone"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      className="w-full text-sm px-4 py-3 border border-[#ccd0d5] rounded-xl bg-white text-[#1c1e21] placeholder-[#8d949e] focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] transition duration-150 shadow-sm font-sans"
                    />

                    <input
                      id="fb-password-input"
                      type="password"
                      placeholder="Password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full text-sm px-4 py-3 border border-[#ccd0d5] rounded-xl bg-white text-[#1c1e21] placeholder-[#8d949e] focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] transition duration-150 shadow-sm font-sans"
                    />

                    {/* Sign Up Action Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUserAuth('signup')}
                      className="w-full bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold py-3 rounded-2xl text-[15px] transition-all duration-150 shadow-md hover:shadow-lg text-center cursor-pointer font-sans mt-4"
                    >
                      Sign Up
                    </motion.button>
                  </div>
                </div>

                {/* Footer branding from the 2nd picture */}
                <div className="w-full flex flex-col items-center mt-12 pb-4">
                  <div className="border-t border-gray-150 w-full mb-6"></div>
                  <div className="flex items-center gap-1 text-[#1877f2] font-black tracking-wider text-xs uppercase select-none">
                    {/* Meta Infinity Icon */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#1877f2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z" />
                    </svg>
                    <span>META</span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium tracking-wide mt-1 text-center font-sans">
                    BK777 connected with META universe
                  </div>
                </div>
              </motion.div>
            )}

            {/* REGULAR LOGIN PAGE */}
            {authScreen === 'regular_login' && (
              <motion.div 
                key="regular_login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col justify-between bg-[#0b121f] p-6 pt-16 pb-8 relative text-white"
              >
                {/* Back Arrow button */}
                <button 
                  onClick={() => setAuthScreen('welcome')} 
                  className="absolute top-4 left-4 text-slate-400 hover:text-slate-200 cursor-pointer p-1.5 rounded-full hover:bg-slate-900 transition duration-150"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="w-full flex-1 flex flex-col justify-center max-w-sm mx-auto">
                  {/* BK777 Logo at the top of the form */}
                  <div className="w-28 h-28 mx-auto rounded-2xl overflow-hidden border border-slate-800 shadow-[0_0_20px_rgba(223,186,115,0.1)] bg-[#090d16] flex items-center justify-center p-0.5 mb-8">
                    <img
                      src="/src/assets/images/bk777_logo_1782280626027.jpg"
                      alt="BK777 Logo"
                      className="w-full h-full object-cover rounded-2xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <h2 className="text-[26px] font-black text-white text-center tracking-wider mb-8 font-sans">
                    Login
                  </h2>

                  {/* Error Alert */}
                  {authError && (
                    <div className="mb-4 bg-rose-950/40 border border-rose-800/60 text-rose-300 p-3.5 rounded-xl flex items-start gap-2 text-xs animate-shake">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                      <span className="font-semibold">{authError}</span>
                    </div>
                  )}

                  {/* Input Fields */}
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        id="regular-phone-input"
                        type="text"
                        placeholder="Email or Phone Number"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        className="w-full text-sm px-4 py-3.5 border border-slate-800 bg-[#121824] text-slate-100 placeholder-[#4a5568] rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-150 shadow-sm font-sans"
                      />
                    </div>

                    <div className="relative">
                      <input
                        id="regular-password-input"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full text-sm px-4 pr-12 py-3.5 border border-slate-800 bg-[#121824] text-slate-100 placeholder-[#4a5568] rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-150 shadow-sm font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition cursor-pointer p-1 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Dual Split Login Button */}
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleUserAuth('login')}
                      style={{
                        background: 'linear-gradient(105deg, #dfba73 0%, #c59f59 45%, #0c4c92 45%, #1668c7 100%)'
                      }}
                      className="w-full py-3.5 rounded-full text-white font-extrabold text-[16px] tracking-wide border border-[#9b7b3d] shadow-[0_4px_15px_rgba(13,76,146,0.25)] cursor-pointer flex items-center justify-center select-none mt-6"
                    >
                      Login
                    </motion.button>
                  </div>

                  <button 
                    onClick={() => triggerAlert("Password recovery system: Please contact the administrator at rupshamediacenter@gmail.com to reset your security keys.")}
                    className="text-slate-400 hover:text-slate-300 text-xs font-semibold text-center mt-6 block cursor-pointer hover:underline mx-auto"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="text-[10px] text-slate-600 uppercase tracking-widest mt-12 text-center">
                  SECURE CRYPTO PROTECTION TUNNEL
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          /* MAIN LOGGED IN APP PAGES RENDERER */
          <div className="flex-1 flex flex-col overflow-hidden relative">
            
            {/* Standard Mobile App Top bar header matches screenshots */}
            <div className="bg-white border-b border-gray-150 p-3 pt-6 flex items-center justify-between">
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-amber-400/40 bg-slate-900 flex items-center justify-center shadow-sm">
                  <img
                    src="/src/assets/images/bk777_logo_1782280626027.jpg"
                    alt="BK777 Logo"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-none">BK777</h4>
                  <span className="text-[9px] text-[#20b2aa]">Device Verified</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Fire Streak button Matches Screenshot 4 */}
                <button
                  id="mobile-streak-fire-btn"
                  onClick={() => setActiveTab('rewards')}
                  className="bg-[#fff9e6] border border-[#ffe082] text-amber-700 text-[10px] font-bold p-1 px-2 rounded-full flex items-center gap-1 cursor-pointer hover:bg-amber-100 transition-colors"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Streak</span>
                  <span className="text-amber-900 font-extrabold">{userState.dailyStreak}</span>
                </button>

        {/* Profile Profile trigger */}
                <button
                  id="mobile-profile-toggle"
                  onClick={() => setShowKycForm(!showKycForm)}
                  className="w-7 h-7 rounded-full bg-[#f1f3f5] border border-gray-350 flex items-center justify-center hover:bg-gray-200 transition"
                  title="Submit KYC Documents / View Profile"
                >
                  <User className="w-4 h-4 text-slate-500" />
                </button>
              </div>

            </div>

            {/* KYC Submission popup Modal Form */}
            {showKycForm && (
              <div className="absolute inset-0 bg-white z-40 p-4 overflow-y-auto animate-fadeIn flex flex-col">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="text-indigo-600" /> User Profile & KYC Center
                  </h3>
                  <button onClick={() => setShowKycForm(false)} className="text-gray-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Current verification status badge */}
                <div className="mb-4 bg-slate-50 border border-gray-200 p-3 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>KYC Security Lock:</span>
                    <span className={`uppercase font-sans ${
                      userState.kyc.status === 'approved' 
                        ? 'text-emerald-500' 
                        : userState.kyc.status === 'pending'
                        ? 'text-amber-500 animate-pulse'
                        : 'text-rose-500'
                    }`}>
                      {userState.kyc.status === 'none' ? 'Not Submitted' : userState.kyc.status}
                    </span>
                  </div>
                  {userState.kyc.rejectionReason && (
                    <p className="text-rose-500 text-[10px] italic">Rejection Reason: {userState.kyc.rejectionReason}</p>
                  )}
                  <p className="text-[10px] text-gray-400 leading-normal">KYC is strictly mandatory to unlock cash outs to bKash / Binance / Nagad. Anti-Cheat verifies front & back identity matching.</p>
                </div>

                {userState.kyc.status === 'approved' ? (
                  <div className="text-center py-6 space-y-2 flex-grow flex flex-col justify-center">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">Identity KYC Approved</h4>
                    <p className="text-xs text-slate-400 leading-normal">Premium withdrawing capabilities are unlocked for this profile.</p>
                  </div>
                ) : (
                  <form onSubmit={handleKycSubmit} className="space-y-3 flex-1 pb-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name (As in ID)</label>
                      <input
                        id="kyc-input-name"
                        type="text"
                        required
                        placeholder="John Doe"
                        value={kycForm.fullName}
                        onChange={e => setKycForm(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full text-xs p-2 border border-gray-300 rounded"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Country</label>
                        <input
                          id="kyc-input-country"
                          type="text"
                          required
                          value={kycForm.country}
                          onChange={e => setKycForm(prev => ({ ...prev, country: e.target.value }))}
                          className="w-full text-xs p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Date of Birth</label>
                        <input
                          id="kyc-input-dob"
                          type="date"
                          required
                          value={kycForm.dateOfBirth}
                          onChange={e => setKycForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                          className="w-full text-xs p-2 border border-gray-300 rounded"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Address Details</label>
                      <input
                        id="kyc-input-address"
                        type="text"
                        required
                        placeholder="Holding 12, Level 3, Dhaka"
                        value={kycForm.address}
                        onChange={e => setKycForm(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full text-xs p-2 border border-gray-300 rounded"
                      />
                    </div>

                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider border-t border-gray-200 pt-2">Identity Proof Files</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 font-medium">
                      <div className="p-2 border border-dashed border-gray-300 rounded text-center cursor-pointer bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center">
                        <Upload className="w-4 h-4 text-gray-405 mb-1" />
                        <span>NID Front Photo</span>
                        <span className="text-[8px] text-emerald-600 font-bold mt-1">✔ loaded</span>
                      </div>

                      <div className="p-2 border border-dashed border-gray-300 rounded text-center cursor-pointer bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center">
                        <Upload className="w-4 h-4 text-gray-405 mb-1" />
                        <span>NID Back Photo</span>
                        <span className="text-[8px] text-emerald-600 font-bold mt-1">✔ loaded</span>
                      </div>
                    </div>

                    <button
                      id="submit-kyc-btn"
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold p-2.5 rounded-xl text-xs shadow mt-2"
                    >
                      Submit Verification
                    </button>
                  </form>
                )}

                {/* Secure Log Out Section */}
                <div className="border-t border-gray-150 mt-6 pt-4">
                  <button
                    id="mobile-logout-btn"
                    onClick={() => {
                      setIsLoggedIn(false);
                      setIsAdmin(false);
                      setShowKycForm(false);
                      setAuthScreen('welcome');
                      setAuthPhone('');
                      setAuthPassword('');
                      setUserState(prev => ({
                        ...prev,
                        name: 'Rupsha Media Center',
                        email: 'rupshamediacenter@gmail.com'
                      }));
                      addLog("User logged out of simulator. Session destroyed.");
                    }}
                    className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition duration-150 cursor-pointer"
                  >
                    Log Out / Sign Out (লগআউট করুন)
                  </button>
                </div>

              </div>
            )}

            {/* Deep Task Expanded Detail layout */}
            {selectedTask && (
              <div className="absolute inset-0 bg-white z-40 p-4 overflow-y-auto animate-fadeIn flex flex-col">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Campaign Details</span>
                  <button 
                    id="back-task-btn" 
                    onClick={() => setSelectedTask(null)}
                    className="text-gray-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-slate-50 border border-gray-150 p-4 rounded-xl space-y-3.5 flex-1">
                  <div className="flex justify-between items-start">
                    <span className="p-1 px-3 text-[10px] font-bold bg-indigo-100 text-indigo-700/80 rounded-full capitalize select-none">
                      {selectedTask.category} Task
                    </span>
                    <div className="flex items-center gap-1 text-sm font-extrabold text-amber-600">
                      <Coins className="w-4 h-4 text-amber-500" />
                      {selectedTask.rewardCoins} Coins
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{selectedTask.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 lines-normal">{selectedTask.description}</p>
                  </div>

                  <div className="bg-white p-3 border border-gray-200 rounded-lg space-y-2">
                    <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest border-b border-gray-100 pb-1">Task Instructions</p>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {selectedTask.instructions.map((inst, idx) => (
                        <li key={idx} className="flex gap-2 items-start leading-tight">
                          <span className="w-4 h-4 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </span>
                          <span>{inst}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Handles Custom verification logic inputs */}
                  {selectedTask.verificationType === 'screenshot' && (
                    <div className="pt-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Upload Screenshot Proof</label>
                      <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-white text-center cursor-pointer hover:bg-slate-50/50">
                        {screenshotFile ? (
                          <div className="space-y-1.5">
                            <span className="text-emerald-500 text-xs font-bold block">✔ Screenshot loaded: task_verify_screen.jpg</span>
                            <button
                              id="discard-screenshot-btn"
                              type="button"
                              onClick={() => setScreenshotFile(null)}
                              className="text-red-500 text-[10px] underline"
                            >
                              Discard Image
                            </button>
                          </div>
                        ) : (
                          <button
                            id="simulate-upload-btn"
                            type="button"
                            onClick={() => setScreenshotFile('mock_file_upload.png')}
                            className="text-xs text-indigo-600 font-bold flex flex-col items-center mx-auto gap-1"
                          >
                            <Upload className="w-5 h-5 text-indigo-500" />
                            Simulate Proof Capture
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedTask.verificationType === 'manual' && selectedTask.category === 'telegram' && (
                    <div className="space-y-2 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Telegram Username Name</label>
                        <input
                          id="tg-user-claim"
                          type="text"
                          required
                          value={telegramUsername}
                          onChange={e => setTelegramUsername(e.target.value)}
                          placeholder="@my_telegram"
                          className="w-full text-xs p-2 border border-gray-300 rounded bg-white"
                        />
                      </div>
                    </div>
                  )}

                  {selectedTask.verificationType === 'survey' && selectedTask.surveyQuestions && (
                    <div className="space-y-3 pt-2">
                      <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Survey Form Answers</p>
                      
                      {selectedTask.surveyQuestions.map((q, qIdx) => (
                        <div key={qIdx} className="bg-white p-3 border border-gray-200 rounded-lg space-y-1.5 text-xs text-slate-700">
                          <p className="font-bold text-slate-800">{qIdx+1}. {q.question}</p>
                          <div className="grid grid-cols-2 gap-1.5 pt-1">
                            {q.options.map((opt, optIdx) => (
                              <button
                                key={optIdx}
                                id={`survey-option-${qIdx}-${optIdx}`}
                                type="button"
                                onClick={() => {
                                  // Record answer
                                }}
                                className="border border-gray-200 text-left p-1.5 py-2 rounded font-sans text-[11px] text-gray-600 bg-slate-50 hover:bg-slate-100 flex items-center justify-between"
                              >
                                <span>{opt}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}

                      <button
                        id="submit-survey-btn"
                        onClick={() => submitSurveyVerification({})}
                        className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs shadow mt-2"
                      >
                        Submit Survey Answers
                      </button>
                    </div>
                  )}
                </div>

                {selectedTask.verificationType !== 'survey' && (
                  <div className="pt-3 border-t border-gray-100 bg-white">
                    {selectedTask.verificationType === 'timer' ? (
                      <button
                        id="start-timer-task-btn"
                        onClick={() => handleStartTask(selectedTask)}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 font-bold text-white py-3 px-4 rounded-xl shadow-lg transition-transform text-xs"
                      >
                        START TIMER TASK IN-APP
                      </button>
                    ) : (
                      <button
                        id="submit-proof-task-btn"
                        onClick={submitManualVerification}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 font-bold text-white py-3 px-4 rounded-xl shadow-lg transition-transform text-xs"
                      >
                        SUBMIT VERIFICATION PROOF
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Scrollable Main body content layout */}
            <div className="flex-1 overflow-y-auto p-4 max-h-[500px]">
              
              {activeTab === 'home' && (
                <div className="space-y-4">
                  
                  {/* Coin balances banner matches Screenshot 2 */}
                  <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 bg-indigo-500/10 w-24 h-24 rounded-full"></div>
                    
                    <div className="flex items-center justify-between border-b border-indigo-500/40 pb-2 mb-3">
                      <div>
                        <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-semibold">Available Coins Balance</p>
                        <h2 className="text-2xl font-black text-white mt-0.5 tracking-tight">{userState.coinsAvailable} Coins</h2>
                      </div>
                      <Coins className="w-10 h-10 text-amber-400 fill-amber-400 opacity-90 animate-pulse" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-indigo-200 text-[10px]">Pending Approval</p>
                        <p className="font-bold text-slate-100 mt-0.5">{userState.coinsPending} Coins</p>
                      </div>
                      <div>
                        <p className="text-indigo-200 text-[10px]">Lifetime Earnings</p>
                        <p className="font-bold text-slate-100 mt-0.5">{userState.coinsLifetime} Coins</p>
                      </div>
                    </div>
                  </div>

                  {/* Daily streak card Matches screenshot 4 info */}
                  <div className="bg-white border border-gray-150 rounded-xl p-3 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-800">Streak Check-In</h4>
                      <p className="text-[10px] text-slate-400 pr-2">Check in daily without stopping to earn extra coin values.</p>
                      <button
                        id="claim-streak-bonus-btn"
                        onClick={handleDailyCheckIn}
                        disabled={dailyCheckInClaimed}
                        className={`text-[10px] font-bold p-1 px-3 mt-1 rounded ${
                          dailyCheckInClaimed 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
                        }`}
                      >
                        {dailyCheckInClaimed ? 'Claimed Today ✓' : 'Claim Daily +50 Coins'}
                      </button>
                    </div>
                    {/* Running match of streak flame icon */}
                    <div className="relative">
                      <Flame className="w-12 h-12 text-rose-500 animate-pulse" />
                      <span className="absolute inset-0 flex items-center justify-center font-extrabold text-white text-xs mt-1.5">{userState.dailyStreak}</span>
                    </div>
                  </div>

                  {/* AD: Native Ad placements between content */}
                  {adSetting.isEnabled && adSetting.placementLimits.taskListBanner && (
                    <div className="bg-white border border-gray-200 p-2.5 rounded-xl shadow-inner flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center font-bold text-indigo-700 text-xs text-center flex-shrink-0">
                        {adSetting.provider.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-gray-400 font-bold">SPONSORED ADVERTISEMENT</p>
                        <h4 className="text-xs font-bold text-slate-800 leading-normal">Boost WiFi Speeds 10x</h4>
                      </div>
                      <span className="p-1 text-[8px] bg-amber-500 text-slate-950 rounded font-semibold self-start tracking-wider uppercase">Promote</span>
                    </div>
                  )}

                  {/* Task categories Filter lists matches screenshot 2 */}
                  <div className="space-y-2">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Earning Channels</p>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      {[
                        { id: 'all', title: 'Featured', icon: '✨' },
                        { id: 'youtube', title: 'YouTube', icon: '📺' },
                        { id: 'facebook', title: 'Facebook', icon: '👥' },
                        { id: 'website', title: 'Web Visit', icon: '🌐' },
                        { id: 'install', title: 'Installs', icon: '📲' },
                        { id: 'survey', title: 'Surveys', icon: '📋' },
                        { id: 'telegram', title: 'Telegram', icon: '💬' },
                        { id: 'bonus', title: 'Bonus', icon: '⚡' }
                      ].map(cat => (
                        <button
                          key={cat.id}
                          id={`cat-filter-btn-${cat.id}`}
                          onClick={() => setSelectedCategory(cat.id as any)}
                          className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                            selectedCategory === cat.id
                              ? 'bg-indigo-600 text-white border-indigo-700'
                              : 'bg-white text-slate-700 border-gray-200 hover:bg-slate-50'
                          }`}
                        >
                          <span className="block text-sm mb-0.5">{cat.icon}</span>
                          <span className="text-[9px] font-bold block truncate">{cat.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Survey Tasks Area Layout (Matches screenshot 2 visual layout) */}
                  <div className="space-y-2">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Quick Survey Campaigns</p>
                    <div className="grid grid-cols-2 gap-3">
                      {tasks.filter(t => t.category === 'survey' || t.category === 'bonus').map(task => (
                        <div 
                          key={task.id} 
                          className="bg-white border border-gray-150 rounded-2xl p-3 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-indigo-400 transition"
                        >
                          {/* Streak lock indicator */}
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-bold p-0.5 px-2 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              Exclusive
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">5/5 Rank</span>
                          </div>

                          <div className="text-center my-2 space-y-1">
                            <Coins className="w-7 h-7 text-amber-400 fill-amber-400 mx-auto" />
                            <p className="text-xl font-extrabold text-slate-800">{task.rewardCoins} Coins</p>
                          </div>

                          <p className="text-[10px] text-gray-400 text-center font-bold truncate tracking-normal border-t border-gray-100 pt-2 mt-1">
                            {task.title}
                          </p>

                          <button
                            id={`quick-survey-btn-${task.id}`}
                            onClick={() => setSelectedTask(task)}
                            className="w-full mt-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold p-1 rounded-lg"
                          >
                            Explore Campaign
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {activeTab === 'task' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Available task pool</p>
                    <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 p-1 px-2.5 rounded-full capitalize">
                      Type: {selectedCategory}
                    </span>
                  </div>

                  {filteredTasks.map(task => (
                    /* High fidelity representation matching screenshot 3 */
                    <div 
                      key={task.id} 
                      className="bg-white border border-gray-150 rounded-2xl p-4 flex gap-3 shadow-sm hover:ring-1 hover:ring-indigo-300 transition"
                    >
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl flex-shrink-0 select-none shadow-sm">
                        {task.category === 'youtube' ? '🎥' :
                         task.category === 'facebook' ? '👍' :
                         task.category === 'website' ? '🌐' :
                         task.category === 'install' ? '🎁' : '📋'}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex justify-between items-start gap-1">
                          <p className="text-[10px] text-slate-400 font-bold capitalize">Start Campaign • {task.category}</p>
                          <span className="text-[9px] text-gray-400 font-mono flex items-center gap-1 flex-shrink-0">
                            ⏱ {task.verificationType === 'timer' ? `${task.durationSeconds}s stay` : 'screenshot'}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-800 leading-tight truncate">{task.title}</h4>
                        <p className="text-[10px] text-slate-400 truncate leading-snug">{task.description}</p>
                        
                        <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-2">
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 font-sans">
                            <span className="text-indigo-600 font-bold">👥 {task.completionsCount}</span> Completes
                          </div>
                          
                          <button
                            id={`start-task-action-btn-${task.id}`}
                            onClick={() => handleStartTask(task)}
                            className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-extrabold text-[10px] p-1.5 px-4 rounded-lg shadow-sm"
                          >
                            Earn +{task.rewardCoins} Coins
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredTasks.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                      <ListTodo className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-xs font-semibold">No tasks available in this category.</p>
                      <p className="text-[10px] text-gray-400">Enable or create more inside Admin panel.</p>
                    </div>
                  )}

                </div>
              )}

              {activeTab === 'rewards' && (
                <div className="space-y-4">
                  
                  {/* Fire streak visualization topMatches Screenshot 4 */}
                  <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 relative z-10 overflow-hidden">
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-rose-500/10 border border-rose-500 rounded p-1 text-[9px] uppercase font-bold text-rose-400 font-mono">
                      <span>Ad Engine: active</span>
                    </div>

                    <div className="space-y-1 max-w-[200px]">
                      <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Active Reward Center</p>
                      <h3 className="text-lg font-black tracking-tight leading-tight">Daily Streak Days: <span className="text-rose-500">{userState.dailyStreak}</span></h3>
                      <p className="text-[11px] text-slate-400 leading-normal">Extend your consistent checks to unlock larger coin multiplier values.</p>
                    </div>

                    <div className="absolute -right-6 -bottom-6 opacity-30 select-none">
                      <Flame className="w-28 h-28 text-rose-550 fill-rose-500" />
                    </div>
                  </div>

                  {/* Watch Rewarded Video Ad cards Matches Screenshot 4 */}
                  <div className="bg-white border border-gray-150 rounded-xl p-4 shadow-sm space-y-3">
                    <div className="border-b border-gray-100 pb-2">
                      <h4 className="text-xs font-bold text-slate-800">Watch Ads campaigns</h4>
                      <p className="text-[10px] text-slate-400 leading-snug">Earn 25 coins for each premium ad stream. Maximum 7 watches daily.</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs bg-slate-50 p-2 border border-gray-200 rounded-lg">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                          📺 Watch Ad Campaign #1
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-600 font-bold font-sans">+25 Coins</span>
                          <button
                            id="watch-ad-cap-1"
                            onClick={handleWatchRewardedAd}
                            disabled={watchAdTimes >= 7}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-1 px-3 text-[10px] rounded"
                          >
                            Watch Ad
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs bg-slate-50 p-2 border border-gray-205 rounded-lg opacity-60">
                        <span className="font-bold text-slate-700">🔒 Watch Ad Campaign #2</span>
                        <span className="text-[10px] text-slate-400 italic">Unlocks post KYC</span>
                      </div>
                    </div>
                  </div>

                  {/* Lucky Scratch & Spin Wheels games */}
                  <div className="grid grid-cols-2 gap-3 pb-8">
                    
                    {/* Lucky Scratcher */}
                    <div className="bg-white border border-gray-150 p-3 rounded-xl text-center space-y-2 shadow-sm flex flex-col justify-between">
                      <h4 className="text-xs font-bold text-slate-800">Scratch and Earn</h4>
                      
                      <button
                        id="scratch-card-canvas"
                        onClick={handleScratchCard}
                        disabled={scratchedState.revealed}
                        className={`border rounded-lg p-4 font-bold text-xs select-none relative ${
                          scratchedState.revealed
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-sans'
                            : 'bg-indigo-100 text-indigo-700 border-indigo-200 cursor-pointer hover:bg-indigo-200'
                        }`}
                      >
                        {scratchedState.text}
                      </button>

                      {scratchedState.revealed && (
                        <button
                          id="reset-scratch-btn"
                          onClick={() => setScratchedState({ revealed: false, text: 'Scratch Here!' })}
                          className="text-[9px] text-slate-400 hover:underline mx-auto block"
                        >
                          Reset card
                        </button>
                      )}
                    </div>

                    {/* Wheel Spinner */}
                    <div className="bg-white border border-gray-150 p-3 rounded-xl text-center space-y-2 shadow-sm flex flex-col justify-between">
                      <h4 className="text-xs font-bold text-slate-800">Lucky Fortune Spin</h4>
                      
                      <div className="relative w-16 h-16 mx-auto flex items-center justify-center border-2 border-amber-400 rounded-full bg-[#fffcf5] overflow-hidden">
                        <div 
                          className="w-full h-full flex items-center justify-center font-bold text-slate-800 font-mono transition-transform"
                          style={{
                            transform: `rotate(${spinDeg}deg)`,
                            transitionDuration: isSpinning ? '2500ms' : '0ms'
                          }}
                        >
                          🎯
                        </div>
                      </div>

                      <button
                        id="spin-action-btn"
                        onClick={handleSpinWheel}
                        disabled={isSpinning}
                        className="w-full bg-slate-900 border border-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-bold p-1 rounded-xl text-[10px] mt-1 cursor-pointer select-none"
                      >
                        {isSpinning ? 'Spinning...' : 'Spin Wheel'}
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {activeTab === 'wallet' && (
                <div className="space-y-4">
                  
                  {/* Wallet header values */}
                  <div className="bg-slate-50 border border-gray-150 rounded-xl p-4 shadow-sm text-center select-none">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Available Coins Cash Value</p>
                    <h3 className="text-2xl font-black text-slate-800 mt-1">
                      ${(userState.coinsAvailable / conversionRate).toFixed(2)} USD
                    </h3>
                    <p className="text-[10px] text-indigo-600 mt-0.5">Rates: {conversionRate} Coins = $1.00 USD cash back</p>
                  </div>

                  {/* Withdrawal form gateways */}
                  <form onSubmit={handleWithdrawalRequestSubmit} className="bg-white border border-gray-150 rounded-xl p-4 shadow-sm space-y-3.5">
                    <div className="border-b border-gray-100 pb-1.5">
                      <h4 className="text-xs font-bold text-slate-800">Cash Out payout request</h4>
                      <p className="text-[10px] text-slate-400">Identity KYC approval is mandatory before drawing payments.</p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Select Gateway</label>
                      <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-800">
                        {['bKash', 'Nagad', 'Rocket', 'Binance Pay'].map(gw => (
                          <button
                            key={gw}
                            id={`gw-select-btn-${gw}`}
                            type="button"
                            onClick={() => setWithdrawDetails(prev => ({ ...prev, method: gw as any }))}
                            className={`p-2 border rounded-lg text-center font-sans tracking-wide transition cursor-pointer select-none ${
                              withdrawDetails.method === gw
                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-md'
                                : 'bg-slate-50 border-gray-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {gw}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Coins quantity</label>
                        <select
                          id="withdraw-coins-select"
                          value={withdrawDetails.amountCoins}
                          onChange={e => setWithdrawDetails(prev => ({ ...prev, amountCoins: parseInt(e.target.value) }))}
                          className="w-full text-xs p-2 border border-gray-300 rounded font-semibold text-slate-800 focus:outline-none"
                        >
                          <option value={1000}>1,000 Coins ($1.00 Value)</option>
                          <option value={2000}>2,000 Coins ($2.00 Value)</option>
                          <option value={5000}>5,000 Coins ($5.00 Value)</option>
                          <option value={10000}>10,000 Coins ($10.00 Value)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Account reference</label>
                        <input
                          id="withdraw-account-field"
                          type="text"
                          required
                          value={withdrawDetails.account}
                          onChange={e => setWithdrawDetails(prev => ({ ...prev, account: e.target.value }))}
                          placeholder="e.g. +88017000000"
                          className="w-full text-xs p-2 border border-[#ccd4db] rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                        />
                      </div>
                    </div>

                    {/* Status checks */}
                    {userState.kyc.status !== 'approved' && (
                      <div className="bg-rose-50 border border-rose-150 rounded-lg p-2.5 flex items-start gap-2 text-rose-700 text-[10px] leading-normal font-sans">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-500 animate-pulse mt-0.5" />
                        <div>
                          <span className="font-bold uppercase">KYC Verification Missing: </span>
                          <span>Identity approval is required before withdrawing. Press top profile button to submit your NID documents.</span>
                        </div>
                      </div>
                    )}

                    <button
                      id="submit-withdraw-btn"
                      type="submit"
                      className="w-full py-2.5 bg-slate-900 text-indigo-400 hover:text-white font-extrabold text-xs shadow rounded-xl block border border-slate-950"
                    >
                      SUBMIT TRANSFER REQUEST
                    </button>
                  </form>
                </div>
              )}


              {/* Removed AdminPanel rendering here */}


            </div>
            <div className="bg-white border-t border-gray-200 p-2.5 flex justify-around items-center text-slate-400 select-none">
              
              <button
                id="phone-nav-home"
                onClick={() => {
                  setActiveTab('home');
                  setSelectedTask(null);
                }}
                className={`flex flex-col items-center gap-0.5 cursor-pointer text-[10px] font-bold leading-none ${
                  activeTab === 'home' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </button>

              <button
                id="phone-nav-task"
                onClick={() => {
                  setActiveTab('task');
                  setSelectedTask(null);
                }}
                className={`flex flex-col items-center gap-0.5 cursor-pointer text-[10px] font-bold leading-none ${
                  activeTab === 'task' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <ListTodo className="w-5 h-5" />
                <span>Task</span>
              </button>

              <button
                id="phone-nav-rewards"
                onClick={() => {
                  setActiveTab('rewards');
                  setSelectedTask(null);
                }}
                className={`flex flex-col items-center gap-0.5 cursor-pointer text-[10px] font-bold leading-none ${
                  activeTab === 'rewards' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Gift className="w-5 h-5" />
                <span>Rewards</span>
              </button>

              <button
                id="phone-nav-wallet"
                onClick={() => {
                  setActiveTab('wallet');
                  setSelectedTask(null);
                }}
                className={`flex flex-col items-center gap-0.5 cursor-pointer text-[10px] font-bold leading-none ${
                  activeTab === 'wallet' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Wallet className="w-5 h-5" />
                <span>Wallet</span>
              </button>

              {/* Wallet button remains */}


            </div>

          </div>
        )}

        {/* Custom dialog alert/confirm modal replacement for window.alert/window.confirm to prevent iframe Script error */}
        {customDialog && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] z-[9999] flex items-center justify-center p-4">
            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl transform scale-100 transition-all text-slate-800 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-2xl">
                  <Info className="w-5 h-5 animate-pulse" />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">System Notification</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold mb-5">
                {customDialog.message}
              </p>
              <div className="flex items-center justify-end gap-2.5">
                {customDialog.type === 'confirm' && (
                  <button
                    onClick={() => {
                      if (customDialog.onCancel) customDialog.onCancel();
                      setCustomDialog(null);
                    }}
                    className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => {
                    if (customDialog.onOk) customDialog.onOk();
                    setCustomDialog(null);
                  }}
                  className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      
    </div>
  );
}
