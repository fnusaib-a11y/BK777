import { Task } from '../types';

export const initialTasks: Task[] = [
  {
    id: 'task-yt-1',
    title: 'Watch & Like Reward Video',
    description: 'Watch the full video to understand the secret earning strategy and hit like.',
    category: 'youtube',
    rewardCoins: 49,
    durationSeconds: 45,
    link: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    instructions: [
      'Click on Start Task which opens the inline premium browser.',
      'A countdown timer of 45 seconds will begin at the top.',
      'Watch at least 45 seconds without closing or minimizing.',
      'Click "Claim Reward" when the timer completes.'
    ],
    verificationType: 'timer',
    active: true,
    dailyLimit: 200,
    globalLimit: 5000,
    completionsCount: 2646
  },
  {
    id: 'task-fb-1',
    title: 'Like & Share Official FB Post',
    description: 'Visit our official Facebook page, like the pinned post and share it with friends.',
    category: 'facebook',
    rewardCoins: 67,
    durationSeconds: 0,
    link: 'https://www.facebook.com',
    instructions: [
      'Open the target Facebook page using the app browser.',
      'Like the recent reward campaign announcement post.',
      'Take a clear screenshot of your like action.',
      'Upload the screenshot here as proof for manual approval.'
    ],
    verificationType: 'screenshot',
    active: true,
    dailyLimit: 300,
    globalLimit: 4512,
    completionsCount: 2315
  },
  {
    id: 'task-web-1',
    title: 'Explore TechNews Blog Campaign',
    description: 'Visit the TechNews blog post, scroll to read through, and claim your coins.',
    category: 'website',
    rewardCoins: 150,
    durationSeconds: 30,
    link: 'https://news.google.com',
    instructions: [
      'Start the task to load the website inside our fast browser.',
      'Keep the browser active; a 30-second security timer will tick.',
      'Do not minimize or hide the app; doing so pauses the timer.',
      'Click the floating Coin claim button once standard browsing duration is hit.'
    ],
    verificationType: 'timer',
    active: true,
    dailyLimit: 150,
    globalLimit: 4982,
    completionsCount: 3848
  },
  {
    id: 'task-survey-1',
    title: 'Earning Habits Mini Survey',
    description: 'Share your opinions regarding online rewards to help us structure better tasks.',
    category: 'survey',
    rewardCoins: 71,
    durationSeconds: 0,
    link: '',
    instructions: [
      'Read and answer all three simple questions honestly.',
      'Choose the most accurate option.',
      'Submit the answers to instantly receive your survey bonus of 71 coins.'
    ],
    verificationType: 'survey',
    surveyQuestions: [
      {
        question: 'Which social media platform do you use the most daily?',
        options: ['YouTube & Video Streaming', 'Facebook & Messaging', 'Telegram & Discord', 'Web Search'],
        answerIndex: 1
      },
      {
        question: 'What is your preferred mobile payment cashout method?',
        options: ['bKash', 'Nagad / Rocket', 'Binance Pay / Crypto', 'Other Mobile Banking'],
        answerIndex: 0
      },
      {
        question: 'How many hours do you spend seeking extra income online weekly?',
        options: ['Less than 2 hours', '2 to 5 hours', '5 to 10 hours', 'Over 10 hours'],
        answerIndex: 2
      }
    ],
    active: true,
    dailyLimit: 500,
    globalLimit: 10000,
    completionsCount: 3177
  },
  {
    id: 'task-tg-1',
    title: 'Join Earning Tips TG Channel',
    description: 'Stay updated with exclusive multi-coin secret promo codes by joining Telegram.',
    category: 'telegram',
    rewardCoins: 67,
    durationSeconds: 0,
    link: 'https://t.me',
    instructions: [
      'Click Start Task, join the official feedback telegram channel.',
      'Input your telegram username as verification proof.',
      'Upload a screenshot verifying your membership.'
    ],
    verificationType: 'manual',
    active: true,
    dailyLimit: 500,
    globalLimit: 5000,
    completionsCount: 458
  },
  {
    id: 'task-app-1',
    title: 'Install Tomb of the Mask App',
    description: 'Download the classic arcade mobile game and have fun for 3 minutes.',
    category: 'install',
    rewardCoins: 92,
    durationSeconds: 120,
    link: 'https://play.google.com/store',
    instructions: [
      'Click Start to register your device for validation.',
      'Install Tomb of the Mask from the App Store.',
      'Keep it open for 2 minutes.',
      'Submit a screenshot of the main screen with your proof.'
    ],
    verificationType: 'screenshot',
    active: true,
    dailyLimit: 100,
    globalLimit: 2000,
    completionsCount: 165
  },
  {
    id: 'task-bonus-1',
    title: 'Earn Extra Daily Rewards',
    description: 'Check inside daily checks to review sponsors and claim simple ad points.',
    category: 'bonus',
    rewardCoins: 129,
    durationSeconds: 15,
    link: 'https://ads.google.com',
    instructions: [
      'Enter sponsor portal.',
      'Browse for 15 seconds to triggers ad credits.',
      'Confirm security cap and earn.'
    ],
    verificationType: 'timer',
    active: true,
    dailyLimit: 500,
    globalLimit: 10000,
    completionsCount: 4807
  }
];
