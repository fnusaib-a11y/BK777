/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Task, UserState, AdSetting, WithdrawalRequest } from './types';
import { initialTasks } from './data/defaultTasks';
import MobileSimulator from './components/MobileSimulator';
import AdminPanel from './components/AdminPanel';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { getFirestoreService } from './lib/firebase';

export default function App() {
  // Authentication states for live simulation
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Master Synced States
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [conversionRate, setConversionRate] = useState<number>(1000); // 1,000 Coins = $1.00 USD
  
  // Simulated Log Console state
  const [logs, setLogs] = useState<string[]>([
    'Secure Device Protection mapping table generated.',
    'Securing connections tracking pipeline linked to firebase core UID.',
    'Earning sandbox environment loaded for: rupshamediacenter@gmail.com',
    'Anti-Cheat system: Multi-Account & VPN Interception active.'
  ]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg].slice(-100)); // Limit to last 100 logs
  };

  // Simulated current active user state in the phone
  const [userState, setUserState] = useState<UserState>({
    uid: 'firebase_auth_uid_rupsha_reward_778',
    name: 'Rupsha Media Center',
    email: 'rupshamediacenter@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60',
    coinsAvailable: 250,
    coinsPending: 150,
    coinsLifetime: 400,
    dailyStreak: 3,
    lastCheckIn: '',
    referralCode: 'REWARDPRO778',
    referralCount: 4,
    isBanned: false,
    isSuspended: false,
    vpnDetected: false,
    kyc: {
      fullName: '',
      dateOfBirth: '',
      country: '',
      address: '',
      nidFront: '',
      nidBack: '',
      selfie: '',
      status: 'none'
    },
    completedTaskIds: ['task-bonus-1']
  });

  // Default ad network configuration settings (Fully controlled by admin!)
  const [adSetting, setAdSetting] = useState<AdSetting>({
    provider: 'startio',
    isEnabled: true,
    appId: 'startio_account_key_77820',
    bannerId: 'banner_unit_302',
    interstitialId: 'interstitial_unit_304',
    rewardedId: 'video_rewarded_unit_306',
    placementLimits: {
      homeBanner: true,
      taskListBanner: false,
      taskDetailsBanner: true,
      walletBanner: true,
      rewardBanner: true
    },
    priority: 'high',
    dailyLimit: 25
  });

  // Seed sample initial cash-out requests in the panel
  const [withdrawList, setWithdrawList] = useState<WithdrawalRequest[]>([
    {
      id: 'wreq-1',
      userId: 'test_user_rahman_990',
      userName: 'Md. Abdur Rahman',
      userEmail: 'rahman.earn@gmail.com',
      amountCoins: 2000,
      amountFiat: 2.00,
      method: 'bKash',
      accountDetails: '+8801712345678',
      status: 'pending',
      requestedAt: '10:45 AM'
    },
    {
      id: 'wreq-2',
      userId: 'test_user_tariq_112',
      userName: 'Tariqul Islam',
      userEmail: 'tariq.pro@outlook.com',
      amountCoins: 5000,
      amountFiat: 5.00,
      method: 'Binance Pay',
      accountDetails: '883920194',
      status: 'approved',
      requestedAt: '09:12 AM',
      processedAt: '10:05 AM'
    }
  ]);

  // Firebase state load and lifecycle management
  const [isFirebaseLoaded, setIsFirebaseLoaded] = useState<boolean>(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  // 1. Load Initial Core State from Firebase Firestore Collections
  useEffect(() => {
    async function initFirebaseSync() {
      const db = getFirestoreService();
      if (!db) {
        setFirebaseError('Firestore service could not be initialized. Please check config.');
        setIsFirebaseConnected(false);
        setIsFirebaseLoaded(true);
        return;
      }
      try {
        addLog('Connecting to cloud database "bk777-aee07"...');
        
        // Synced User Profile Document Setup
        const userDocRef = doc(db, 'users', 'firebase_auth_uid_rupsha_reward_778');
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const userData = userSnap.data() as UserState;
          setUserState(userData);
          // Check for admin role
          if ((userData as any).role === 'admin' || (userData as any).isAdmin === true) {
            setIsAdmin(true);
          }
          addLog('Profile parameters successfully retrieved from Firestore users collection.');
        } else {
          await setDoc(userDocRef, userState);
          addLog('Created default sync profile on Firestore users collection.');
        }

        // Synced Global Remote Ad Network Configuration
        const adConfigRef = doc(db, 'settings', 'ads');
        const adSnap = await getDoc(adConfigRef);
        if (adSnap.exists()) {
          setAdSetting(adSnap.data() as AdSetting);
          addLog('Remote Ad Settings initialized from database rules configuration.');
        } else {
          await setDoc(adConfigRef, adSetting);
          addLog('Ad settings initialized on Firestore settings configurations.');
        }

        // Synced Premium Dynamic Task Inventory Setup
        const tasksSnap = await getDocs(collection(db, 'tasks'));
        if (!tasksSnap.empty) {
          const loadedTasks: Task[] = [];
          tasksSnap.forEach(docSnap => {
            loadedTasks.push(docSnap.data() as Task);
          });
          setTasks(loadedTasks);
          addLog(`Retrieved ${loadedTasks.length} dynamic earning task profiles.`);
        } else {
          for (const taskItem of initialTasks) {
            await setDoc(doc(db, 'tasks', taskItem.id), taskItem);
          }
          addLog('Populated initial seed task schemas on cloud database entries.');
        }

        // Synced Withdrawal & Payout Processing Submissions
        const withdrawalsSnap = await getDocs(collection(db, 'withdrawals'));
        if (!withdrawalsSnap.empty) {
          const loadedWithdrawals: WithdrawalRequest[] = [];
          withdrawalsSnap.forEach(docSnap => {
            loadedWithdrawals.push(docSnap.data() as WithdrawalRequest);
          });
          setWithdrawList(loadedWithdrawals);
          addLog(`Synced ${loadedWithdrawals.length} verification cashout requests.`);
        } else {
          for (const withdrawalItem of withdrawList) {
            await setDoc(doc(db, 'withdrawals', withdrawalItem.id), withdrawalItem);
          }
          addLog('Populated static seed cache on remote Firestore collection withdrawals.');
        }

        setIsFirebaseConnected(true);
        setIsFirebaseLoaded(true);
        addLog('Firebase Firestore Live Authentication Pipeline: ACTIVE.');
      } catch (err: any) {
        console.warn("Unable to load initial cloud datasets:", err);
        addLog(`Firebase live integration status: Connection failed.`);
        setFirebaseError(err?.message || 'Database connection error. Please verify Firestore rules and configurations.');
        setIsFirebaseConnected(false);
        setIsFirebaseLoaded(true);
      }
    }
    initFirebaseSync();
  }, []);

  // 2. Realtime local updates tracking back to cloud firestore
  useEffect(() => {
    if (!isFirebaseLoaded) return;
    const syncUser = async () => {
      const db = getFirestoreService();
      if (!db) return;
      try {
        await setDoc(doc(db, 'users', 'firebase_auth_uid_rupsha_reward_778'), userState);
      } catch (e: any) {
        console.warn("Failed to secure sync userState on Firebase:", e.message);
      }
    };
    syncUser();
  }, [userState, isFirebaseLoaded]);

  useEffect(() => {
    if (!isFirebaseLoaded) return;
    const syncAdSettings = async () => {
      const db = getFirestoreService();
      if (!db) return;
      try {
        await setDoc(doc(db, 'settings', 'ads'), adSetting);
      } catch (e: any) {
        console.warn("Failed to secure sync adSetting on Firebase:", e.message);
      }
    };
    syncAdSettings();
  }, [adSetting, isFirebaseLoaded]);

  useEffect(() => {
    if (!isFirebaseLoaded) return;
    const syncTasks = async () => {
      const db = getFirestoreService();
      if (!db) return;
      try {
        for (const t of tasks) {
          await setDoc(doc(db, 'tasks', t.id), t);
        }
      } catch (e: any) {
        console.warn("Failed to sync individual task collections:", e.message);
      }
    };
    syncTasks();
  }, [tasks, isFirebaseLoaded]);

  useEffect(() => {
    if (!isFirebaseLoaded) return;
    const syncWithdrawList = async () => {
      const db = getFirestoreService();
      if (!db) return;
      try {
        for (const w of withdrawList) {
          await setDoc(doc(db, 'withdrawals', w.id), w);
        }
      } catch (e: any) {
        console.warn("Failed to sync withdrawals collection on cloud Firestore:", e.message);
      }
    };
    syncWithdrawList();
  }, [withdrawList, isFirebaseLoaded]);

  if (!isFirebaseLoaded) {
    return (
      <div id="firebase-loading-container" className="min-h-screen bg-[#f0f2f5] flex flex-col justify-center items-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#1877f2] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-gray-600 font-sans">ডাটাবেইজ কানেকশন লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!isFirebaseConnected) {
    return (
      <div id="firebase-error-container" className="min-h-screen bg-[#f0f2f5] flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md bg-white border border-gray-300 rounded-3xl p-8 shadow-lg text-center font-sans">
          <div className="w-20 h-20 bg-rose-50 border border-rose-200 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-3">ডাটাবেইজ কানেক্টেড নেই!</h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            দুঃখিত, ডাটাবেইজের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি। ডাটাবেইজ কানেক্টেড না হলে এপের মধ্যে প্রবেশ করা যাবে না। অনুগ্রহ করে কনফিগারেশন চেক করে পুনরায় চেষ্টা করুন।
          </p>

          {firebaseError && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-[11px] p-3 rounded-2xl font-mono text-left mb-6 overflow-x-auto max-h-32">
              <strong>Error Details:</strong> {firebaseError}
            </div>
          )}

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold py-3.5 rounded-full text-base transition-all duration-150 shadow-md hover:shadow-lg text-center cursor-pointer font-sans"
          >
            পুনরায় চেষ্টা করুন (Retry)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="pure-application-container" className="min-h-screen bg-[#f8f9fa] flex flex-col relative antialiased text-slate-800">
      {isLoggedIn && isAdmin ? (
        <AdminPanel
          tasks={tasks}
          setTasks={setTasks}
          userState={userState}
          setUserState={setUserState}
          withdrawList={withdrawList}
          setWithdrawList={setWithdrawList}
          adSetting={adSetting}
          setAdSetting={setAdSetting}
          logs={logs}
          addLog={addLog}
          conversionRate={conversionRate}
          setConversionRate={setConversionRate}
          isAdmin={isAdmin}
          setIsAdmin={setIsAdmin}
        />
      ) : (
        <MobileSimulator
          tasks={tasks}
          setTasks={setTasks}
          userState={userState}
          setUserState={setUserState}
          adSetting={adSetting}
          addLog={addLog}
          conversionRate={conversionRate}
          withdrawList={withdrawList}
          setWithdrawList={setWithdrawList}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          isAdmin={isAdmin}
          setIsAdmin={setIsAdmin}
          setAdSetting={setAdSetting}
          logs={logs}
          setConversionRate={setConversionRate}
        />
      )}
    </div>
  );
}


