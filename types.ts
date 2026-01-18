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
  description: string;
  timestamp: number;
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
  SUBJECT_CHAPTERS = '/batch/:batchId/subject/:subjectName', // New
  CHAPTER_LECTURES = '/batch/:batchId/chapter/:chapterId', // New
  VIDEO_PLAYER = '/player/:contentId', // New
  PURCHASES = '/purchases',
  COMMUNITY = '/community',
  PROFILE = '/profile',
  SETTINGS = '/settings',
  HELP = '/help',
  ADMIN = '/admin',
  ADMIN_UPLOAD = '/admin/upload', // Deprecated in UI, merged into Dashboard but kept for routing safety
}