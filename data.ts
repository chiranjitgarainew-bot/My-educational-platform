import { ClassBatch } from './types';

export const BATCHES: ClassBatch[] = [
  { 
    id: '8', 
    name: 'Class 8', 
    batchName: 'দিশা ব্যাচ (Class-08)', 
    description: 'Foundation building & basics for Class 8 students.', 
    color: 'bg-green-500',
    price: 1999,
    originalPrice: 3998,
    discount: 50,
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Bengali'],
    instructors: [
      'ভৌতবিজ্ঞান: Bidesh Chayan Sahoo',
      'রসায়ন: Nantu Kumar Das (NKD Sir)',
      'গণিত: Amit Sir'
    ],
    features: ['Daily Live Classes', 'PDF Notes', 'Weekly Mock Tests', 'Doubt Clearing Sessions'],
    language: 'Bengali'
  },
  { 
    id: '9', 
    name: 'Class 9', 
    batchName: 'লক্ষ্য ব্যাচ (Class-09)', 
    description: 'Advanced concepts introduction for Class 9.', 
    color: 'bg-purple-500',
    price: 2499,
    originalPrice: 4999,
    discount: 50,
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Life Science'],
    instructors: [
      'ভৌতবিজ্ঞান: Bidesh Sir',
      'গণিত: Rahul Sir'
    ],
    features: ['Chapter-wise Tests', 'Recorded Backup', 'Mentorship'],
    language: 'Bengali'
  },
  { 
    id: '10', 
    name: 'Class 10', 
    batchName: 'উড়ান ব্যাচ (Class-10)', 
    description: 'Complete Board exam preparation.', 
    color: 'bg-indigo-500',
    price: 2999,
    originalPrice: 5999,
    discount: 50,
    subjects: ['All Subjects'],
    instructors: ['Team BongMistry'],
    features: ['Test Series', 'Last Minute Suggestions', 'Full Syllabus Coverage'],
    language: 'Bengali'
  },
  { 
    id: '11', 
    name: 'Class 11', 
    batchName: 'প্রয়াস ব্যাচ (Science)', 
    description: 'Stream specialization for Science students.', 
    color: 'bg-blue-500',
    price: 3499,
    originalPrice: 6999,
    discount: 50,
    subjects: ['Physics', 'Chemistry', 'Math', 'Bio'],
    instructors: ['Expert Faculty'],
    features: ['NEET/JEE Foundation', 'Deep Concepts'],
    language: 'Bengali'
  },
  { 
    id: '12', 
    name: 'Class 12', 
    batchName: 'বিজয় ব্যাচ (Science)', 
    description: 'Final board & competitive prep.', 
    color: 'bg-teal-500',
    price: 3999,
    originalPrice: 7999,
    discount: 50,
    subjects: ['Physics', 'Chemistry', 'Math', 'Bio'],
    instructors: ['Expert Faculty'],
    features: ['Mock Tests', 'Previous Year Q&A'],
    language: 'Bengali'
  },
];

export const getBatchById = (id: string | undefined) => {
  return BATCHES.find(b => b.id === id);
};