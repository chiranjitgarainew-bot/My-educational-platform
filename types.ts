export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  password?: string; // Added for authentication persistence
  role: 'student' | 'admin'; // Added to distinguish user permissions
  
  // Extended Profile Fields
  phone?: string;
  dob?: string;
  village?: string;
  address?: string;
  bio?: string;
  
  // Settings & Preferences
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
  
  // Educational Data
  enrolledBatches?: string[]; // IDs of batches user has purchased/joined
}

export interface EnrollmentRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  batchId: string;
  batchName: string;
  amount: number;
  transactionId?: string; // For manual verify
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
}

export enum RoutePath {
  HOME = '/',
  CLASSES = '/classes',
  CLASS_DETAILS = '/classes/:batchId',
  PAYMENT = '/payment/:batchId', // New Payment Route
  BATCH_SUBJECTS = '/batch/:batchId/subjects', // New Subjects Route after payment
  PURCHASES = '/purchases',
  COMMUNITY = '/community',
  PROFILE = '/profile',
  SETTINGS = '/settings',
  HELP = '/help',
  ADMIN = '/admin', // Database view
  ADMIN_UPLOAD = '/admin/upload', // Class Upload view
}

export interface ClassBatch {
  id: string;
  name: string; // e.g., "Class 8"
  batchName: string; // e.g., "Disha Batch"
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