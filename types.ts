export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  password?: string;
  role: 'student' | 'admin';
  phone?: string;
  dob?: string;
  village?: string;
  address?: string;
  bio?: string;
  username?: string;
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  twoFactorEnabled?: boolean;
  enrolledBatches?: string[];
  
  // Security Features
  isVerified?: boolean; // Email verification status
  verificationCode?: string; // Mock OTP
  deviceId?: string; // For Single Session Enforcement
  lastLogin?: number;

  // Social Features
  friends?: string[]; // Array of User IDs
  friendRequests?: string[]; // Array of User IDs who sent request
  blockedUsers?: string[]; // Array of User IDs blocked by this user
}

export interface EnrollmentRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  batchId: string;
  batchName: string;
  amount: number;
  transactionId?: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'flat' | 'percent';
  value: number;
  expiryDate?: string;
  isActive: boolean;
}

export interface Chapter {
  id: string;
  batchId: string;
  subject: string;
  title: string;
  description?: string;
  order: number;
}

export interface ClassBatch {
  id: string;
  name: string;
  batchName: string;
  description: string;
  color: string;
  price: number;
  originalPrice: number;
  discount: number;
  subjects: string[];
  instructors: string[];
  features: string[];
  language: string;
}

export interface ClassContent {
  id: string;
  title: string;
  subject: string;
  batchId: string;
  chapterId?: string; // Linked to Chapter
  videoUrl: string;
  thumbnail?: string; // Base64 or URL
  description: string;
  timestamp: number;
  duration?: number; // Duration in seconds (default 600 if missing)
  order?: number; // For sequencing lectures
}

export interface ProgressRecord {
  userId: string;
  contentId: string;
  batchId: string;
  subject: string;
  chapterId?: string;
  watchedSeconds: number;
  totalSeconds: number;
  completed: boolean; // True if watched > 90%
  lastUpdated: number;
}

export interface PrivateMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  isRead: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export enum RoutePath {
  HOME = '/',
  CLASSES = '/classes',
  CLASS_DETAILS = '/classes/:batchId',
  PAYMENT = '/payment/:batchId',
  BATCH_SUBJECTS = '/batch/:batchId/subjects',
  SUBJECT_CHAPTERS = '/batch/:batchId/subject/:subjectName',
  CHAPTER_LECTURES = '/batch/:batchId/chapter/:chapterId',
  VIDEO_PLAYER = '/player/:contentId',
  
  // Social Routes
  INBOX = '/inbox',
  CHAT = '/chat/:friendId',
  COMMUNITY = '/community',
  
  PROFILE = '/profile',
  SETTINGS = '/settings',
  HELP = '/help',
  ADMIN = '/admin',
  ADMIN_UPLOAD = '/admin/upload',
  PURCHASES = '/purchases',
}