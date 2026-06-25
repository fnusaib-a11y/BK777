export type TaskCategory =
  | 'youtube'
  | 'facebook'
  | 'website'
  | 'install'
  | 'survey'
  | 'telegram'
  | 'daily'
  | 'bonus';

export type VerificationType = 'timer' | 'screenshot' | 'survey' | 'manual';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  rewardCoins: number;
  durationSeconds: number; // For timer-based
  link: string;
  instructions: string[];
  verificationType: VerificationType;
  surveyQuestions?: { question: string; options: string[]; answerIndex: number }[];
  active: boolean;
  dailyLimit: number;
  globalLimit: number;
  completionsCount: number;
}

export interface AdSetting {
  provider: 'startio' | 'monetag' | 'adsterra' | 'none';
  isEnabled: boolean;
  appId: string;
  bannerId: string;
  interstitialId: string;
  rewardedId: string;
  placementLimits: {
    homeBanner: boolean;
    taskListBanner: boolean;
    taskDetailsBanner: boolean;
    walletBanner: boolean;
    rewardBanner: boolean;
  };
  priority: 'high' | 'medium' | 'low';
  dailyLimit: number;
  
  // start.io settings
  startioAppId?: string;
  startioBannerId?: string;
  startioInterstitialId?: string;
  startioRewardedId?: string;

  // adsterra settings
  adsterraDirectLink?: string;
  adsterraBannerCode?: string;
  adsterraPopunderCode?: string;

  // monetag settings
  monetagZoneId?: string;
  monetagDirectLink?: string;
  monetagPopunderCode?: string;
}

export interface KYCData {
  fullName: string;
  dateOfBirth: string;
  country: string;
  address: string;
  nidFront: string; // Base64 or placeholder
  nidBack: string;  // Base64 or placeholder
  selfie: string;    // Base64 or placeholder
  status: 'none' | 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amountCoins: number;
  amountFiat: number; // Calculated cash value
  method: 'bKash' | 'Nagad' | 'Rocket' | 'Binance Pay';
  accountDetails: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
}

export interface UserState {
  uid: string;
  name: string;
  email: string;
  avatarUrl: string;
  coinsAvailable: number;
  coinsPending: number;
  coinsLifetime: number;
  dailyStreak: number;
  lastCheckIn?: string;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  isBanned: boolean;
  isSuspended: boolean;
  vpnDetected: boolean;
  kyc: KYCData;
  completedTaskIds: string[];
  completedSurveyAnswers?: Record<string, string>; // task_id -> selected answers
}

export interface SystemStats {
  totalUsers: number;
  activeUsersToday: number;
  totalTasks: number;
  completedTasksCount: number;
  totalWithdrawnFiat: number;
  pendingWithdrawalsCount: number;
  pendingKycCount: number;
  estimatedAdRevenue: number;
}
