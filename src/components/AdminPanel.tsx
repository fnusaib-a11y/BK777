import React, { useState } from 'react';
import { 
  Task, 
  AdSetting, 
  WithdrawalRequest, 
  UserState, 
  TaskCategory, 
  VerificationType 
} from '../types';
import bkLogo from '../assets/images/bk777_logo_1782280626027.jpg';
import { 
  LayoutDashboard, 
  PlusCircle, 
  UserCheck, 
  Wallet, 
  Megaphone, 
  Eye, 
  Check, 
  X, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  ShieldAlert, 
  Clock, 
  Coins, 
  FileText,
  BadgeAlert,
  Save
} from 'lucide-react';

interface AdminPanelProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  userState: UserState;
  setUserState: React.Dispatch<React.SetStateAction<UserState>>;
  withdrawList: WithdrawalRequest[];
  setWithdrawList: React.Dispatch<React.SetStateAction<WithdrawalRequest[]>>;
  adSetting: AdSetting;
  setAdSetting: React.Dispatch<React.SetStateAction<AdSetting>>;
  logs: string[];
  addLog: (msg: string) => void;
  conversionRate: number; // Coins per 1 USD/BDT
  setConversionRate: (rate: number) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

export default function AdminPanel({
  tasks,
  setTasks,
  userState,
  setUserState,
  withdrawList,
  setWithdrawList,
  adSetting,
  setAdSetting,
  logs,
  addLog,
  conversionRate,
  setConversionRate,
  isAdmin,
  setIsAdmin
}: AdminPanelProps) {
  if (!isAdmin) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900 text-rose-500 font-bold p-6 text-center border-4 border-rose-500 rounded-2xl shadow-2xl">
        <div>
          <ShieldAlert className="w-16 h-16 mx-auto mb-4" />
          <p className="text-xl">ACCESS DENIED: ADMIN ONLY</p>
          <p className="text-sm text-rose-400 mt-2">You do not have authorization to view this panel.</p>
        </div>
      </div>
    );
  }
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'withdrawals' | 'kyc' | 'ads'>('dashboard');
  const [adSaveSuccess, setAdSaveSuccess] = useState(false);

  // Task Creation states
  const [isCreating, setIsCreating] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  
  const [taskForm, setTaskForm] = useState<Omit<Task, 'id' | 'completionsCount'>>({
    title: '',
    description: '',
    category: 'youtube',
    rewardCoins: 50,
    durationSeconds: 30,
    link: '',
    instructions: ['Click Start Task.', 'Complete action.', 'Claim reward.'],
    verificationType: 'timer',
    active: true,
    dailyLimit: 200,
    globalLimit: 5000,
    surveyQuestions: []
  });

  const [newInstruction, setNewInstruction] = useState('');

  // Handle task submission
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title) return;

    if (editingTaskId) {
      setTasks(prev => prev.map(t => t.id === editingTaskId ? { ...t, ...taskForm } : t));
      addLog(`Updated task "${taskForm.title}" of category "${taskForm.category}"`);
      setEditingTaskId(null);
    } else {
      const newId = `task-custom-${Date.now()}`;
      const newTask: Task = {
        ...taskForm,
        id: newId,
        completionsCount: 0
      };
      setTasks(prev => [newTask, ...prev]);
      addLog(`Created new task "${taskForm.title}" [Reward: ${taskForm.rewardCoins} coins]`);
    }
    setIsCreating(false);
    resetTaskForm();
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      category: 'youtube',
      rewardCoins: 50,
      durationSeconds: 30,
      link: '',
      instructions: ['Open task.', 'Follow target instructions.', 'Earn reward.'],
      verificationType: 'timer',
      active: true,
      dailyLimit: 200,
      globalLimit: 5000,
      surveyQuestions: []
    });
    setNewInstruction('');
  };

  const handleEditTaskClick = (task: Task) => {
    setEditingTaskId(task.id);
    setTaskForm({
      title: task.title,
      description: task.description,
      category: task.category,
      rewardCoins: task.rewardCoins,
      durationSeconds: task.durationSeconds,
      link: task.link,
      instructions: task.instructions,
      verificationType: task.verificationType,
      active: task.active,
      dailyLimit: task.dailyLimit,
      globalLimit: task.globalLimit,
      surveyQuestions: task.surveyQuestions || []
    });
    setIsCreating(true);
  };

  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    addLog(`Deleted task item "${taskToDelete?.title || id}"`);
  };

  const handleToggleTaskActive = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.active;
        addLog(`Task "${t.title}" toggled ${nextState ? 'ACTIVE' : 'INACTIVE'}`);
        return { ...t, active: nextState };
      }
      return t;
    }));
  };

  // Withdraw requests action handler
  const handleProcessWithdrawal = (id: string, status: 'approved' | 'rejected') => {
    const request = withdrawList.find(r => r.id === id);
    if (!request) return;

    // Update status in withdrawals list
    setWithdrawList(prev => prev.map(r => r.id === id ? { ...r, status, processedAt: new Date().toLocaleTimeString() } : r));

    if (status === 'approved') {
      // Coins are already removed from userState coinsAvailable during simulation withdrawal request submission, but let's confirm
      addLog(`APPROVED Withdrawal Request of ${request.amountCoins} coins (${request.method}) for user ${request.userName}`);
    } else if (status === 'rejected') {
      // Refund user coins
      setUserState(prev => ({
        ...prev,
        coinsAvailable: prev.coinsAvailable + request.amountCoins,
        coinsPending: Math.max(0, prev.coinsPending - request.amountCoins)
      }));
      addLog(`REJECTED Withdrawal Request of ${request.amountCoins} coins for ${request.userName}. Coins refunded.`);
    }
  };

  // KYC review actions
  const handleProcessKYC = (status: 'approved' | 'rejected', reason?: string) => {
    setUserState(prev => ({
      ...prev,
      kyc: {
        ...prev.kyc,
        status,
        rejectionReason: reason || ''
      }
    }));
    addLog(`KYC verification request for "${userState.name}" processed: ${status.toUpperCase()} ${reason ? `(Reason: ${reason})` : ''}`);
  };

  // Ad Networks settings handlings
  const handleToggleAdProvider = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provider = e.target.value as AdSetting['provider'];
    setAdSetting(prev => ({ ...prev, provider, isEnabled: provider !== 'none' }));
    addLog(`Changed target active Ad Network to: ${provider.toUpperCase()}`);
  };

  const handleToggleAdLocation = (location: keyof AdSetting['placementLimits']) => {
    setAdSetting(prev => {
      const nextPlacements = { ...prev.placementLimits, [location]: !prev.placementLimits[location] };
      addLog(`Ad Location toggle modified: ${location} is now ${nextPlacements[location] ? 'ENABLED' : 'DISABLED'}`);
      return { ...prev, placementLimits: nextPlacements };
    });
  };

  // Helper calculation definitions
  const totalApprovedPaymentsValue = withdrawList
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + r.amountFiat, 0);

  const pendingPaymentsCount = withdrawList.filter(r => r.status === 'pending').length;

  return (
    <div id="admin-panel-viewport" className="flex flex-col h-full text-gray-800">
      
      {/* Dynamic Header */}
      <div className="bg-slate-50 border-b border-gray-150 py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
        <button 
          onClick={() => setIsAdmin(false)}
          className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-sm font-semibold"
        >
          Exit Admin
        </button>
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 text-[11px] font-bold bg-indigo-100 text-indigo-700/90 rounded-full select-none">
              Control Panel
            </span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md overflow-hidden border border-amber-400/40 bg-slate-900 flex items-center justify-center shadow-sm">
                <img
                  src={bkLogo}
                  alt="BK777 Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">BK777 Admin Portal</h1>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Configure advertisement monetization, verify user security logs, approve KYC, and manage active tasks.</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-2 px-3 shadow-inner self-start sm:self-auto">
          <Coins className="text-amber-500 w-4 h-4" />
          <span className="text-xs font-semibold text-slate-700">Rates:</span>
          <div className="flex items-center gap-1">
            <input 
              id="admin-conversion-rate"
              type="number" 
              value={conversionRate} 
              onChange={e => setConversionRate(Math.max(1, parseInt(e.target.value) || 100))}
              className="w-14 text-center border-b border-gray-300 text-xs font-bold text-slate-800 focus:outline-none"
            />
            <span className="text-xs text-slate-500 font-medium">Coins = $1 USD</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="bg-white border-b border-gray-200 flex overflow-x-auto gap-2 p-2">
        <button
          id="admin-tab-dashboard"
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 p-2 px-4 rounded-lg text-xs font-semibold select-none cursor-pointer transition-all ${
            activeTab === 'dashboard' 
              ? 'bg-indigo-50 text-indigo-700' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>
        <button
          id="admin-tab-tasks"
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 p-2 px-4 rounded-lg text-xs font-semibold select-none cursor-pointer transition-all ${
            activeTab === 'tasks' 
              ? 'bg-indigo-50 text-indigo-700' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-slate-900'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          Tasks Management {tasks.length > 0 && <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-[10px] ml-1">{tasks.length}</span>}
        </button>
        <button
          id="admin-tab-withdrawals"
          onClick={() => setActiveTab('withdrawals')}
          className={`relative flex items-center gap-2 p-2 px-4 rounded-lg text-xs font-semibold select-none cursor-pointer transition-all ${
            activeTab === 'withdrawals' 
              ? 'bg-indigo-50 text-indigo-700' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-slate-900'
          }`}
        >
          <Wallet className="w-4 h-4" />
          Withdrawal Requests {pendingPaymentsCount > 0 && (
            <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded-full text-[10px] absolute -top-1 -right-1 font-bold animate-pulse">
              {pendingPaymentsCount}
            </span>
          )}
        </button>
        <button
          id="admin-tab-kyc"
          onClick={() => setActiveTab('kyc')}
          className={`flex items-center gap-2 p-2 px-4 rounded-lg text-xs font-semibold select-none cursor-pointer transition-all ${
            activeTab === 'kyc' 
              ? 'bg-indigo-50 text-indigo-700' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          KYC Review {userState.kyc.status === 'pending' && <span className="bg-amber-500 text-white px-1.5 py-0.5 rounded-full text-[10px] ml-1">1</span>}
        </button>
        <button
          id="admin-tab-ads"
          onClick={() => setActiveTab('ads')}
          className={`flex items-center gap-2 p-2 px-4 rounded-lg text-xs font-semibold select-none cursor-pointer transition-all ${
            activeTab === 'ads' 
              ? 'bg-indigo-50 text-indigo-700' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-slate-900'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Ad Configurations
        </button>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 overflow-y-auto p-6 max-h-[550px]">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Bento Grid Analytics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-gray-150 p-4 rounded-xl flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Total Users Base</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">1,248</p>
                  <span className="text-[10px] text-emerald-600 font-medium">● 32 Active Device Links</span>
                </div>
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-50 border border-gray-150 p-4 rounded-xl flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Total Core Tasks</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{tasks.length}</p>
                  <span className="text-[10px] text-slate-500 font-medium">{tasks.filter(t=>t.active).length} Campaigns Online</span>
                </div>
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <PlusCircle className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-50 border border-gray-150 p-4 rounded-xl flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Withdrawn Paid</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">${totalApprovedPaymentsValue.toFixed(2)}</p>
                  <span className="text-[10px] text-emerald-600 font-medium">Converted via conversion rate</span>
                </div>
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-50 border border-gray-150 p-4 rounded-xl flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Est. Ad Revenue</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    ${(adSetting.isEnabled ? 24.35 : 0.00).toFixed(2)}
                  </p>
                  <span className="text-[10px] text-indigo-600 font-medium">Via active network ad keys</span>
                </div>
                <div className="p-2.5 bg-yellow-50 text-amber-600 rounded-lg">
                  <Megaphone className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Simulated Live Devices & Anti-Cheat Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* User Account / Sync Panel Info */}
              <div className="bg-slate-50 border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2 border-b border-gray-200 pb-2">
                  <UserCheck className="w-4 h-4 text-slate-500" />
                  Currently Connected User
                </h3>
                
                <div className="flex items-center gap-3">
                  <img 
                    src={userState.avatarUrl} 
                    alt="avatar" 
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full border border-gray-300 shadow-sm"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{userState.name}</h4>
                    <p className="text-xs text-slate-500">{userState.email}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">UID: {userState.uid.slice(0, 15)}...</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-white p-3 border border-gray-200 rounded-lg text-xs">
                  <div>
                    <p className="text-gray-400">Coins Balance</p>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{userState.coinsAvailable} Coins</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Withdraw Limit Status</p>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">
                      {userState.kyc.status === 'approved' ? (
                        <span className="text-emerald-500">KYC APPROVED</span>
                      ) : (
                        <span className="text-amber-500">{userState.kyc.status.toUpperCase() || 'NOT SUBMITTED'}</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Account controls */}
                <div className="flex gap-2">
                  <button
                    id="admin-ban-user-btn"
                    onClick={() => {
                      setUserState(prev => {
                        const nextBan = !prev.isBanned;
                        addLog(`${nextBan ? 'BANNED' : 'UNBANNED'} user ${prev.name} for suspicious activities.`);
                        return { ...prev, isBanned: nextBan };
                      });
                    }}
                    className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold cursor-pointer transition ${
                      userState.isBanned 
                        ? 'bg-rose-100 hover:bg-rose-200 text-rose-700' 
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'
                    }`}
                  >
                    {userState.isBanned ? 'Unban User' : 'Ban User Account'}
                  </button>
                  <button
                    id="admin-vpn-simulate-btn"
                    onClick={() => {
                      setUserState(prev => {
                        const nextVpn = !prev.vpnDetected;
                        addLog(`Simulated IP Geo routing. VPN state for ${prev.name}: ${nextVpn ? 'DETECTED' : 'CLEARED'}`);
                        return { ...prev, vpnDetected: nextVpn };
                      });
                    }}
                    className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold cursor-pointer border transition ${
                      userState.vpnDetected 
                        ? 'bg-red-500 text-white border-red-600' 
                        : 'bg-slate-100 hover:bg-gray-200 text-slate-700 border-gray-300'
                    }`}
                  >
                    {userState.vpnDetected ? 'Clear VPN Check' : 'Simulate VPN Bypass'}
                  </button>
                </div>
              </div>

              {/* Anti-Cheat & Event Logs */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col h-full overflow-hidden shadow-sm shadow-indigo-950/20">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert className="text-indigo-400 w-4 h-4" />
                    Security Logs & System Broadcast
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="text-[10px] text-slate-400 font-mono">Live Sync</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 max-h-[160px] pr-2 text-xs font-mono scrollbar-thin">
                  {logs.slice().reverse().map((log, index) => {
                    let logColor = "text-slate-300";
                    if (log.includes("BANNED") || log.includes("REJECTED") || log.includes("cheating") || log.includes("cheat") || log.includes("detected") || log.includes("VPN")) {
                      logColor = "text-rose-400 font-semibold";
                    } else if (log.includes("APPROVED") || log.includes("CLAIMED") || log.includes("Completed")) {
                      logColor = "text-emerald-400";
                    } else if (log.includes("KYC")) {
                      logColor = "text-amber-300";
                    }

                    return (
                      <div key={index} className="flex gap-2 items-start py-1 border-b border-slate-800/50">
                        <span className="text-slate-500 text-[10px] select-none flex-shrink-0">
                          [{new Date().toLocaleTimeString()}]
                        </span>
                        <p className={logColor}>{log}</p>
                      </div>
                    );
                  })}
                  {logs.length === 0 && (
                    <p className="text-slate-500 text-center italic py-8">No security actions recorded in this session.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                {isCreating ? (editingTaskId ? 'Edit Task Campaign' : 'Create Task Campaign') : 'Active Tasks Campaigns'}
              </h2>
              <button
                id="admin-create-task-toggle"
                onClick={() => {
                  if (isCreating) {
                    resetTaskForm();
                    setEditingTaskId(null);
                  }
                  setIsCreating(!isCreating);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-1.5 px-3.5 rounded-lg text-xs cursor-pointer transition shadow-sm"
              >
                {isCreating ? 'View Task List' : 'Create New Campaign'}
              </button>
            </div>

            {isCreating ? (
              <form onSubmit={handleSaveTask} className="bg-slate-50 border border-gray-150 rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Title *</label>
                    <input
                      id="form-title"
                      type="text"
                      required
                      placeholder="e.g. Subscribe to our YouTube channel"
                      value={taskForm.title}
                      onChange={e => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full text-xs p-2.5 border border-gray-305 rounded-lg bg-white bg-opacity-95 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Task Category *</label>
                    <select
                      id="form-category"
                      value={taskForm.category}
                      onChange={e => setTaskForm(prev => ({ ...prev, category: e.target.value as TaskCategory }))}
                      className="w-full text-xs p-2.5 border border-gray-305 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="youtube">YouTube Tasks</option>
                      <option value="facebook">Facebook Tasks</option>
                      <option value="website">Website Visit Tasks</option>
                      <option value="install">App Install Tasks</option>
                      <option value="survey">Survey Tasks</option>
                      <option value="telegram">Telegram Tasks</option>
                      <option value="daily">Daily Tasks</option>
                      <option value="bonus">Bonus Tasks</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Short Description *</label>
                  <textarea
                    id="form-desc"
                    required
                    rows={2}
                    placeholder="Short summary displayed on list page banner"
                    value={taskForm.description}
                    onChange={e => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-gray-305 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Coin Rewards amount *</label>
                    <input
                      id="form-reward"
                      type="number"
                      required
                      min={1}
                      value={taskForm.rewardCoins}
                      onChange={e => setTaskForm(prev => ({ ...prev, rewardCoins: parseInt(e.target.value) || 0 }))}
                      className="w-full text-xs p-2.5 border border-gray-305 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-705 mb-1">Verification Method *</label>
                    <select
                      id="form-verif-type"
                      value={taskForm.verificationType}
                      onChange={e => setTaskForm(prev => ({ ...prev, verificationType: e.target.value as VerificationType }))}
                      className="w-full text-xs p-2.5 border border-gray-305 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="timer">Timer Countdown (Inline Browser)</option>
                      <option value="screenshot">Upload Screenshot Proof</option>
                      <option value="survey">Answer Survey Form</option>
                      <option value="manual">Manual Admin verification</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Stay Duration (Seconds)</label>
                    <input
                      id="form-duration"
                      type="number"
                      disabled={taskForm.verificationType !== 'timer'}
                      value={taskForm.durationSeconds}
                      onChange={e => setTaskForm(prev => ({ ...prev, durationSeconds: parseInt(e.target.value) || 0 }))}
                      className="w-full text-xs p-2.5 border border-gray-305 rounded-lg bg-white disabled:bg-gray-150 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-707 mb-1">Task Destination URL / Asset Link</label>
                  <input
                    id="form-link"
                    type="text"
                    required={taskForm.category !== 'survey'}
                    placeholder="e.g. YouTube video URL or Website link"
                    value={taskForm.link}
                    onChange={e => setTaskForm(prev => ({ ...prev, link: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-gray-305 rounded-lg bg-white focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Leave empty only for nested Survey type campaigns.</p>
                </div>

                {/* Instructions Lists builder */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Action instructions *</label>
                  <div className="space-y-1.5 mb-2">
                    {taskForm.instructions.map((inst, index) => (
                      <div key={index} className="flex items-center justify-between text-xs bg-slate-100 p-2 rounded border border-gray-200">
                        <span className="font-medium text-slate-700">{index + 1}. {inst}</span>
                        <button
                          id={`remove-inst-${index}`}
                          type="button"
                          onClick={() => setTaskForm(prev => ({
                            ...prev,
                            instructions: prev.instructions.filter((_, i) => i !== index)
                          }))}
                          className="text-gray-400 hover:text-red-500 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      id="new-instruction-input"
                      type="text"
                      placeholder="Add another step instruction..."
                      value={newInstruction}
                      onChange={e => setNewInstruction(e.target.value)}
                      className="flex-1 text-xs p-2 border border-gray-305 rounded-lg"
                    />
                    <button
                      id="add-instruction-btn"
                      type="button"
                      onClick={() => {
                        if (newInstruction.trim()) {
                          setTaskForm(prev => ({
                            ...prev,
                            instructions: [...prev.instructions, newInstruction.trim()]
                          }));
                          setNewInstruction('');
                        }
                      }}
                      className="bg-slate-700 text-white rounded-lg p-2 text-xs font-semibold hover:bg-slate-800"
                    >
                      Add Step
                    </button>
                  </div>
                </div>

                {/* Survey fields integration */}
                {taskForm.verificationType === 'survey' && (
                  <div className="border border-indigo-150 rounded-lg p-4 bg-indigo-50/20 space-y-3">
                    <h4 className="text-xs font-bold text-indigo-700 flex items-center justify-between">
                      <span>Survey Questionnaire (Requires 3 simple choices Qs)</span>
                      <button
                        id="add-survey-q-btn"
                        type="button"
                        onClick={() => {
                          const defaultQuestion = {
                            question: 'Do you enjoy completing inline reward tasks?',
                            options: ['Yes, definitely', 'Sometimes', 'Rarely', 'No'],
                            answerIndex: 0
                          };
                          setTaskForm(prev => ({
                            ...prev,
                            surveyQuestions: [...(prev.surveyQuestions || []), defaultQuestion]
                          }));
                        }}
                        className="text-[10px] bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold p-1 px-2.5 rounded"
                      >
                        + Add Choice Question
                      </button>
                    </h4>

                    {taskForm.surveyQuestions && taskForm.surveyQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="bg-white p-3 border border-gray-200 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-700">Question {qIdx + 1}</p>
                          <button
                            id={`remove-survey-q-${qIdx}`}
                            type="button"
                            onClick={() => setTaskForm(prev => ({
                              ...prev,
                              surveyQuestions: prev.surveyQuestions?.filter((_, i) => i !== qIdx)
                            }))}
                            className="text-red-500 hover:text-red-700 text-[10px] font-bold"
                          >
                            Remove
                          </button>
                        </div>

                        <input
                          id={`survey-q-title-${qIdx}`}
                          type="text"
                          value={q.question}
                          onChange={e => {
                            const updated = [...(taskForm.surveyQuestions || [])];
                            updated[qIdx].question = e.target.value;
                            setTaskForm(prev => ({ ...prev, surveyQuestions: updated }));
                          }}
                          className="w-full text-xs p-1.5 border border-gray-300 rounded"
                          placeholder="Your Question Text..."
                        />

                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-1.5">
                              <span className="text-[10px] text-gray-400 font-bold">{optIdx + 1}:</span>
                              <input
                                id={`survey-q-option-${qIdx}-${optIdx}`}
                                type="text"
                                value={opt}
                                onChange={e => {
                                  const updated = [...(taskForm.surveyQuestions || [])];
                                  updated[qIdx].options[optIdx] = e.target.value;
                                  setTaskForm(prev => ({ ...prev, surveyQuestions: updated }));
                                }}
                                className="w-full text-[11px] p-1 border border-gray-300 rounded"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end gap-2 text-xs pt-2">
                  <button
                    id="admin-task-form-cancel"
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingTaskId(null);
                      resetTaskForm();
                    }}
                    className="border border-gray-300 hover:bg-gray-100 font-semibold p-2 px-4 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="admin-task-form-save"
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 font-semibold text-white p-2 px-5 rounded-lg cursor-pointer transition shadow"
                  >
                    Save Campaign
                  </button>
                </div>
              </form>
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-gray-200 grid grid-cols-12 gap-2 text-slate-500 text-xs font-bold">
                  <div className="col-span-4">Campaign</div>
                  <div className="col-span-2">Category</div>
                  <div className="col-span-2">Reward</div>
                  <div className="col-span-2">Method</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                <div className="divide-y divide-gray-200">
                  {tasks.map(task => (
                    <div key={task.id} className="p-4 grid grid-cols-12 gap-2 text-slate-700 text-xs items-center hover:bg-slate-50/50">
                      <div className="col-span-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${task.active ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                          <span className="font-bold text-slate-800 text-sm truncate">{task.title}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 truncate ml-4 mt-0.5">{task.description}</p>
                      </div>
                      <div className="col-span-2 capitalize text-slate-500 font-medium">
                        {task.category}
                      </div>
                      <div className="col-span-2 text-amber-600 font-bold flex items-center gap-1 text-sm">
                        <Coins className="w-4 h-4 text-amber-500" />
                        {task.rewardCoins}
                      </div>
                      <div className="col-span-2 capitalize text-slate-500">
                        {task.verificationType} {task.verificationType === 'timer' && `(${task.durationSeconds}s)`}
                      </div>
                      <div className="col-span-2 flex justify-end gap-1.5">
                        <button
                          id={`toggle-active-btn-${task.id}`}
                          onClick={() => handleToggleTaskActive(task.id)}
                          title={task.active ? 'Disable task' : 'Enable task'}
                          className="p-1 px-1.5 border border-gray-200 rounded-md hover:bg-gray-100 select-none cursor-pointer text-slate-600"
                        >
                          {task.active ? (
                            <ToggleRight className="w-5 h-5 text-indigo-500" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <button
                          id={`edit-task-btn-${task.id}`}
                          onClick={() => handleEditTaskClick(task)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 border border-transparent hover:border-gray-200 rounded-md select-none cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          id={`delete-task-btn-${task.id}`}
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 select-none cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <p className="text-gray-400 text-center py-10">No tasks created. Click Create New Campaign to add one.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Wallet className="text-indigo-500" />
              Cash Out Redemption Logs
            </h2>

            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-gray-200 grid grid-cols-12 gap-2 text-slate-500 text-xs font-bold">
                <div className="col-span-4">User Information</div>
                <div className="col-span-2">Gateway</div>
                <div className="col-span-2">Account Details</div>
                <div className="col-span-2">Slashes (Coins)</div>
                <div className="col-span-2 text-right">Review / Status</div>
              </div>

              <div className="divide-y divide-gray-200">
                {withdrawList.map(req => (
                  <div key={req.id} className="p-4 grid grid-cols-12 gap-2 text-xs text-slate-700 items-center hover:bg-slate-50/30">
                    <div className="col-span-4 select-all">
                      <p className="font-bold text-slate-800 leading-tight">{req.userName}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{req.userEmail}</p>
                      <span className="text-[10px] text-gray-500 font-medium">Req Date: {req.requestedAt}</span>
                    </div>

                    <div className="col-span-2">
                      <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 font-semibold border border-slate-200 self-start text-[10px] select-none">
                        {req.method}
                      </span>
                    </div>

                    <div className="col-span-2 select-all font-mono font-bold text-indigo-700 tracking-wider">
                      {req.accountDetails}
                    </div>

                    <div className="col-span-2">
                      <p className="font-bold text-amber-600 text-sm">{req.amountCoins} coins</p>
                      <p className="text-[10px] text-slate-500">${req.amountFiat.toFixed(2)} USD value</p>
                    </div>

                    <div className="col-span-2 flex justify-end gap-1.5">
                      {req.status === 'pending' ? (
                        <>
                          <button
                            id={`approve-withdraw-${req.id}`}
                            onClick={() => handleProcessWithdrawal(req.id, 'approved')}
                            className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 p-1 px-2 text-white h-7 shadow rounded text-xs font-semibold cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            id={`reject-withdraw-${req.id}`}
                            onClick={() => handleProcessWithdrawal(req.id, 'rejected')}
                            className="bg-rose-50 hover:bg-rose-100 p-1 px-2 border border-rose-200 text-rose-600 h-7 rounded text-xs font-semibold cursor-pointer flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      ) : (
                        <span className={`p-1 px-2.5 rounded font-bold text-[10px] ${
                          req.status === 'approved' 
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-100 text-rose-700 border border-rose-200'
                        }`}>
                          {req.status.toUpperCase()} {req.processedAt && `@ ${req.processedAt}`}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {withdrawList.length === 0 && (
                  <p className="text-gray-400 text-center py-10">No withdrawal requests submitted in this session.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'kyc' && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="text-indigo-500" />
              KYC Identity Verification Center
            </h2>

            {userState.kyc.status === 'none' ? (
              <div className="bg-slate-50 border border-gray-150 p-6 rounded-xl text-center space-y-2">
                <p className="text-sm font-semibold text-slate-600">No active KYC submits waiting in the review pool.</p>
                <p className="text-xs text-gray-500">Submit a simulated KYC inside the Mobile Device Simulator to view identity cards and face verification credentials here.</p>
              </div>
            ) : (
              <div className="bg-slate-50 border border-gray-150 rounded-xl p-5 space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-200 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{userState.kyc.fullName}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">DOB: {userState.kyc.dateOfBirth} • Country: {userState.kyc.country}</p>
                    <p className="text-xs text-gray-500">Residential Address: {userState.kyc.address}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-[11px] font-bold border rounded-full ${
                    userState.kyc.status === 'pending'
                      ? 'bg-amber-100 text-amber-700 border-amber-200 animate-pulse'
                      : userState.kyc.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      : 'bg-rose-100 text-rose-700 border-rose-200'
                  }`}>
                    Status: {userState.kyc.status.toUpperCase()}
                  </span>
                </div>

                {/* Verification Document Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">NID FRONT PHOTO</p>
                    <div className="h-40 border border-gray-300 rounded-lg flex flex-col items-center justify-center bg-white shadow-inner p-2">
                      {userState.kyc.nidFront ? (
                        <img src={userState.kyc.nidFront} className="h-full w-full object-contain rounded" alt="nid front" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="text-center text-gray-400">
                          <FileText className="w-8 h-8 mx-auto text-gray-300" />
                          <p className="text-[10px] mt-1 font-mono">NID_FRONT_IMAGE_PLACEHOLDER</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">NID BACK PHOTO</p>
                    <div className="h-40 border border-gray-300 rounded-lg flex flex-col items-center justify-center bg-white shadow-inner p-2">
                      {userState.kyc.nidBack ? (
                        <img src={userState.kyc.nidBack} className="h-full w-full object-contain rounded" alt="nid back" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="text-center text-gray-400">
                          <FileText className="w-8 h-8 mx-auto text-gray-300" />
                          <p className="text-[10px] mt-1 font-mono">NID_BACK_IMAGE_PLACEHOLDER</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">LIVE PASSIVE SELFIE</p>
                    <div className="h-40 border border-gray-300 rounded-lg flex flex-col items-center justify-center bg-white shadow-inner p-2">
                      {userState.kyc.selfie ? (
                        <img src={userState.kyc.selfie} className="h-full w-full object-contain rounded" alt="selfie" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="text-center text-gray-400">
                          <UserCheck className="w-8 h-8 mx-auto text-gray-300" />
                          <p className="text-[10px] mt-1 font-mono">FACE_SELFIE_IMAGE_PLACEHOLDER</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {userState.kyc.status === 'pending' && (
                  <div className="flex justify-end gap-2 text-xs border-t border-gray-200 pt-3 flex-wrap">
                    <button
                      id="kyc-reject-btn"
                      onClick={() => {
                        const reason = prompt("Enter rejection reason:", "NID Image blurry or photo mismatch.") || "NID Verification image blurry.";
                        handleProcessKYC('rejected', reason);
                      }}
                      className="bg-rose-50 border border-rose-200 text-rose-600 font-semibold py-2 px-4 rounded-lg cursor-pointer hover:bg-rose-100 flex items-center gap-1.5 shadow-sm"
                    >
                      <X className="w-3.5 h-3.5" /> Reject KYC
                    </button>
                    <button
                      id="kyc-approve-btn"
                      onClick={() => handleProcessKYC('approved')}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-5 rounded-lg cursor-pointer flex items-center gap-1.5 shadow"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve Document
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ads' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Megaphone className="text-indigo-500" />
                Advertisement networks integration dashboard
              </h2>
              <span className={`p-1 px-3 rounded-full text-xs font-bold leading-none ${
                adSetting.isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
              }`}>
                Ads {adSetting.isEnabled ? 'LIVE' : 'OFF'}
              </span>
            </div>

            {/* Active Switch & Main Global settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 border border-gray-150 rounded-xl p-5">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">ACTIVE AD SOURCE PROVIDER</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Select Network Platform</label>
                  <select
                    id="ad-provider-select"
                    value={adSetting.provider}
                    onChange={(e) => {
                      const provider = e.target.value as AdSetting['provider'];
                      setAdSetting(prev => ({ 
                        ...prev, 
                        provider, 
                        isEnabled: provider !== 'none',
                        // Map core fields for backwards compatibility with legacy code
                        appId: provider === 'startio' ? (prev.startioAppId || prev.appId) : provider === 'monetag' ? (prev.monetagZoneId || prev.appId) : (prev.adsterraDirectLink || prev.appId),
                        bannerId: provider === 'startio' ? (prev.startioBannerId || prev.bannerId) : (prev.bannerId)
                      }));
                      addLog(`Changed target active Ad Network to: ${provider.toUpperCase()}`);
                    }}
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-lg bg-white font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="none">No Active Ads (Disabled)</option>
                    <option value="startio">Start.io Monetization SDK</option>
                    <option value="monetag">Monetag (Popunder / Native SDK)</option>
                    <option value="adsterra">Adsterra (Direct Ad Link Banner)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Priority Delivery Target</label>
                  <select
                    id="ad-priority-select"
                    value={adSetting.priority}
                    onChange={e => setAdSetting(prev => ({ ...prev, priority: e.target.value as AdSetting['priority'] }))}
                    className="w-full text-xs p-2.5 border border-gray-305 rounded-lg bg-white focus:outline-none"
                  >
                    <option value="high">High priority (Deliver ads on every second event)</option>
                    <option value="medium">Medium priority (Balanced ad delivery frequency)</option>
                    <option value="low">Low priority (Minimize visual disruption)</option>
                  </select>
                </div>
              </div>

              {/* Placements layout switchers */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">ACTIVE BANNER PLACEMENTS</h3>
                
                <div className="space-y-2 text-xs bg-white p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                      Home Screen Footer Banner
                    </span>
                    <button
                      id="toggle-ad-home"
                      type="button"
                      onClick={() => handleToggleAdLocation('homeBanner')}
                      className="text-slate-500 cursor-pointer"
                    >
                      {adSetting.placementLimits.homeBanner ? (
                        <ToggleRight className="w-7 h-7 text-indigo-500" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-gray-400" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                      Task List Header Banner
                    </span>
                    <button
                      id="toggle-ad-tasklist"
                      type="button"
                      onClick={() => handleToggleAdLocation('taskListBanner')}
                      className="text-slate-500 cursor-pointer"
                    >
                      {adSetting.placementLimits.taskListBanner ? (
                        <ToggleRight className="w-7 h-7 text-indigo-500" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-gray-400" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                      Task Details Inside Banner
                    </span>
                    <button
                      id="toggle-ad-details"
                      type="button"
                      onClick={() => handleToggleAdLocation('taskDetailsBanner')}
                      className="text-slate-500 cursor-pointer"
                    >
                      {adSetting.placementLimits.taskDetailsBanner ? (
                        <ToggleRight className="w-7 h-7 text-indigo-500" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-gray-400" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                      Wallet Screen Centered Banner
                    </span>
                    <button
                      id="toggle-ad-wallet"
                      type="button"
                      onClick={() => handleToggleAdLocation('walletBanner')}
                      className="text-slate-500 cursor-pointer"
                    >
                      {adSetting.placementLimits.walletBanner ? (
                        <ToggleRight className="w-7 h-7 text-indigo-500" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-gray-400" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                      Daily Reward Watch Section
                    </span>
                    <button
                      id="toggle-ad-rewards"
                      type="button"
                      onClick={() => handleToggleAdLocation('rewardBanner')}
                      className="text-slate-500 cursor-pointer"
                    >
                      {adSetting.placementLimits.rewardBanner ? (
                        <ToggleRight className="w-7 h-7 text-indigo-500" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Specific Settings Panel */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest">INDIVIDUAL AD NETWORKS SETUP</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* START.IO SETTINGS CARD */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <span className="w-3 h-3 rounded-full bg-[#dfba73]"></span>
                    <h4 className="font-bold text-slate-900 text-sm">Start.io SDK Settings</h4>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Start.io App ID</label>
                      <input
                        type="text"
                        value={adSetting.startioAppId || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdSetting(prev => ({ 
                            ...prev, 
                            startioAppId: val,
                            appId: prev.provider === 'startio' ? val : prev.appId
                          }));
                        }}
                        placeholder="e.g. 208395729"
                        className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Banner Placement ID</label>
                      <input
                        type="text"
                        value={adSetting.startioBannerId || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdSetting(prev => ({ 
                            ...prev, 
                            startioBannerId: val,
                            bannerId: prev.provider === 'startio' ? val : prev.bannerId
                          }));
                        }}
                        placeholder="e.g. startio_banner_placement_1"
                        className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Interstitial Placement ID</label>
                      <input
                        type="text"
                        value={adSetting.startioInterstitialId || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdSetting(prev => ({ 
                            ...prev, 
                            startioInterstitialId: val,
                            interstitialId: prev.provider === 'startio' ? val : prev.interstitialId
                          }));
                        }}
                        placeholder="e.g. startio_interstitial_placement_2"
                        className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Rewarded Video Placement ID</label>
                      <input
                        type="text"
                        value={adSetting.startioRewardedId || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdSetting(prev => ({ 
                            ...prev, 
                            startioRewardedId: val,
                            rewardedId: prev.provider === 'startio' ? val : prev.rewardedId
                          }));
                        }}
                        placeholder="e.g. startio_rewarded_placement_3"
                        className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* ADSTERRA SETTINGS CARD */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <span className="w-3 h-3 rounded-full bg-[#1877f2]"></span>
                    <h4 className="font-bold text-slate-900 text-sm">Adsterra Settings</h4>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Adsterra Direct Link URL</label>
                      <input
                        type="text"
                        value={adSetting.adsterraDirectLink || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdSetting(prev => ({ 
                            ...prev, 
                            adsterraDirectLink: val,
                            appId: prev.provider === 'adsterra' ? val : prev.appId
                          }));
                        }}
                        placeholder="https://www.highratecpm.com/..."
                        className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Banner Widget iframe/Script Code</label>
                      <textarea
                        rows={3}
                        value={adSetting.adsterraBannerCode || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdSetting(prev => ({ ...prev, adsterraBannerCode: val }));
                        }}
                        placeholder="<script>...</script> or <iframe>...</iframe>"
                        className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 font-mono text-[10px]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Popunder Integration Code</label>
                      <textarea
                        rows={3}
                        value={adSetting.adsterraPopunderCode || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdSetting(prev => ({ ...prev, adsterraPopunderCode: val }));
                        }}
                        placeholder="Popunder script code wrapper..."
                        className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 font-mono text-[10px]"
                      />
                    </div>
                  </div>
                </div>

                {/* MONETAG SETTINGS CARD */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                    <h4 className="font-bold text-slate-900 text-sm">Monetag Settings</h4>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Monetag Zone ID / Tag ID</label>
                      <input
                        type="text"
                        value={adSetting.monetagZoneId || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdSetting(prev => ({ 
                            ...prev, 
                            monetagZoneId: val,
                            appId: prev.provider === 'monetag' ? val : prev.appId
                          }));
                        }}
                        placeholder="e.g. 8872935"
                        className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Monetag Direct Smartlink URL</label>
                      <input
                        type="text"
                        value={adSetting.monetagDirectLink || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdSetting(prev => ({ ...prev, monetagDirectLink: val }));
                        }}
                        placeholder="https://..."
                        className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Monetag Popunder script tag code</label>
                      <textarea
                        rows={3}
                        value={adSetting.monetagPopunderCode || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdSetting(prev => ({ ...prev, monetagPopunderCode: val }));
                        }}
                        placeholder="<script ... data-zone='8872935'></script>"
                        className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 font-mono text-[10px]"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Save Settings Action Button */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm mt-6">
              <div className="text-left space-y-1">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Save className="w-4 h-4 text-indigo-600" />
                  এড সেটিংস সেইভ করুন (Save Ad Settings)
                </h4>
                <p className="text-xs text-slate-500">
                  আপনার এড সেটিংস রিয়েল-টাইমে ক্লাউড ডাটাবেজ (Firestore)-এর সাথে সিঙ্ক হয়, তবুও নিচে ক্লিক করে নিশ্চিত করুন।
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                {adSaveSuccess && (
                  <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 p-2.5 px-4 rounded-xl animate-pulse">
                    ✓ সেটিংস ক্লাউডে সংরক্ষিত হয়েছে! (Saved successfully!)
                  </div>
                )}
                <button
                  onClick={() => {
                    setAdSaveSuccess(true);
                    setAdSetting(prev => ({ ...prev })); // Force reactivity update to write to Firestore
                    addLog(`MANUAL SYNC: Ad settings (Start.io, Adsterra, Monetag) synchronized to Google Firestore successfully.`);
                    setTimeout(() => setAdSaveSuccess(false), 4000);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3 px-6 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center uppercase tracking-wider"
                >
                  <Save className="w-4 h-4" />
                  সেইভ সেটিংস (Save settings)
                </button>
              </div>
            </div>

            {/* Comprehensive Ad Troubleshooting & Code Insertion Guide */}
            <div className="bg-gradient-to-br from-indigo-50/50 via-slate-50 to-amber-50/20 border border-slate-200 rounded-2xl p-6 mt-8 space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-indigo-600" />
                  এড সেটিংস ও কোড বসানোর পূর্ণাঙ্গ নির্দেশিকা (Ad Setup & Troubleshooting Guide)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  আপনার এড নেটওয়ার্ক কোডগুলো কেন শো করছে না এবং কিভাবে সঠিক জায়গায় কোড বসাবেন তার সমাধান নিচে দেওয়া হলো:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 leading-relaxed">
                
                {/* Reason 1: AdBlocker */}
                <div className="bg-white border border-gray-150 rounded-xl p-4.5 space-y-2 shadow-sm">
                  <span className="p-1 px-2.5 text-[10px] font-extrabold bg-rose-50 text-rose-600 rounded-md uppercase tracking-wider">
                    সমস্যা ১: এড-ব্লকার (AdBlocker / Brave Shield)
                  </span>
                  <p className="font-bold text-slate-800">এড শো না হওয়ার প্রধান কারণ:</p>
                  <p>
                    আপনার ব্রাউজারে যদি কোনো <strong>AdBlocker (যেমন: uBlock Origin, AdBlock Plus)</strong> অথবা <strong>Brave Browser-এর Shield</strong> চালু থাকে, তবে Adsterra, Monetag এবং Start.io-এর সমস্ত স্ক্রিপ্ট লোড হওয়া ব্লক করে দেওয়া হয়।
                  </p>
                  <p className="text-indigo-600 font-bold bg-indigo-50/50 p-2 rounded border border-indigo-100/50">
                    💡 সমাধান: এড দেখার জন্য আপনার ব্রাউজার বা ডিভাইসের এড-ব্লকার সাময়িকভাবে বন্ধ (Pause/Disable) করুন এবং পেজটি রিফ্রেশ করুন।
                  </p>
                </div>

                {/* Reason 2: Sandbox Environment */}
                <div className="bg-white border border-gray-150 rounded-xl p-4.5 space-y-2 shadow-sm">
                  <span className="p-1 px-2.5 text-[10px] font-extrabold bg-amber-50 text-amber-700 rounded-md uppercase tracking-wider">
                    সমস্যা ২: আইফ্রেম স্যান্ডবক্স (Iframe Sandbox)
                  </span>
                  <p className="font-bold text-slate-800">কেন প্রিভিউতে পপআপ বা ডাইরেক্ট লিঙ্ক খোলে না?</p>
                  <p>
                    গুগল এআই স্টুডিওর এই প্রিভিউ উইন্ডোটি একটি অত্যন্ত সুরক্ষিত <strong>Iframe Sandbox</strong>-এর ভেতরে চলে। সিকিউরিটি পলিসির কারণে স্যান্ডবক্সের ভেতর এড নেটওয়ার্কের পপআপ বা ডাইরেক্ট রিডাইরেক্ট হওয়া ব্রাউজার আটকে দেয়।
                  </p>
                  <p className="text-amber-700 font-bold bg-amber-50/50 p-2 rounded border border-amber-100/50">
                    💡 সমাধান: আসল এড ও পপআপ টেস্ট করার জন্য উপরের <span className="underline">Shared App URL</span> টি কপি করে একটি সম্পূর্ণ নতুন ট্যাব বা উইন্ডোতে ওপেন করুন।
                  </p>
                </div>

                {/* Guide: Where to insert what */}
                <div className="bg-white border border-gray-150 rounded-xl p-4.5 space-y-2 shadow-sm md:col-span-2">
                  <span className="p-1 px-2.5 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 rounded-md uppercase tracking-wider">
                    কোথায় কোন কোড বসাবেন? (Which Code Goes Where?)
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="border border-slate-100 p-3 rounded-lg bg-slate-50/30">
                      <p className="font-bold text-slate-800 border-b pb-1 mb-1.5 text-[11px] text-amber-700">Start.io (স্টার্ট ডট আইও)</p>
                      <ul className="list-disc pl-4 space-y-1 text-[11px]">
                        <li><strong>Start.io App ID</strong>: আপনার একাউন্ট থেকে প্রাপ্ত শুধুমাত্র সংখ্যা দিয়ে গঠিত আইডিটি বসান (যেমন: <code className="font-mono bg-white p-0.5 border rounded">205240515</code>)।</li>
                        <li>ব্যানার, ইন্টারস্টিশিয়াল ও রিওয়ার্ডেড পজিশনে আপনার Placement ID বসান।</li>
                      </ul>
                    </div>
                    
                    <div className="border border-slate-100 p-3 rounded-lg bg-slate-50/30">
                      <p className="font-bold text-slate-800 border-b pb-1 mb-1.5 text-[11px] text-[#1877f2]">Adsterra (এডস্টেরা)</p>
                      <ul className="list-disc pl-4 space-y-1 text-[11px]">
                        <li><strong>Direct Link URL</strong>: আপনার ডিরেক্ট লিঙ্কের পুরো লিঙ্কটি বসান (যেমন: <code className="font-mono bg-white p-0.5 border rounded">https://www.effectivecpm...</code>)।</li>
                        <li><strong>Banner Code</strong>: ব্যানার উইজেট থেকে কপি করা সম্পূর্ণ <code className="font-mono bg-white p-0.5 border rounded">&lt;script&gt;</code> বা <code className="font-mono bg-white p-0.5 border rounded">&lt;iframe&gt;</code> কোডটি হুবহু বসান।</li>
                        <li><strong>Popunder Code</strong>: Popunder কোডটি পেস্ট করুন। এটি ইউজারের ক্লিকের পর পপআপ ওপেন করবে।</li>
                      </ul>
                    </div>

                    <div className="border border-slate-100 p-3 rounded-lg bg-slate-50/30">
                      <p className="font-bold text-slate-800 border-b pb-1 mb-1.5 text-[11px] text-rose-600">Monetag (মনেট্যাগ)</p>
                      <ul className="list-disc pl-4 space-y-1 text-[11px]">
                        <li><strong>Zone ID / Tag ID</strong>: Monetag-এর ড্যাশবোর্ড থেকে প্রাপ্ত সংখ্যাবাচক জোন আইডি বসান (যেমন: <code className="font-mono bg-white p-0.5 border rounded">9903489</code>)।</li>
                        <li><strong>Direct Smartlink URL</strong>: Monetag ডিরেক্ট লিঙ্ক বা স্মার্টলিঙ্কটি দিন।</li>
                        <li><strong>Popunder Code</strong>: Monetag থেকে দেওয়া সম্পূর্ণ জাভাস্ক্রিপ্ট স্ক্রিপ্ট ট্যাগ কোডটি হুবহু পেস্ট করুন।</li>
                      </ul>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}
      </div>

      {/* Synchronized Terminal State Line */}
      <div className="bg-slate-900 px-6 py-2 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1 text-emerald-400">
          <BadgeAlert className="w-3.5 h-3.5" /> 
           Anti-Cheat system: Multi-Account & VPN Interception active.
        </span>
        <span className="text-slate-500 mt-1 md:mt-0">Admin Portal v2.0 • Real-time Sync Frame active</span>
      </div>
    </div>
  );
}
