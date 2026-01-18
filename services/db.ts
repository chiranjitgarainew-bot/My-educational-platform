import { User, ClassContent, EnrollmentRequest } from '../types';

const DB_KEY = 'study_platform_users_v2';
const SESSION_KEY = 'study_platform_session_v2';
const CONTENT_KEY = 'study_platform_content_v2';
const REQUESTS_KEY = 'study_platform_requests_v2';

/**
 * DATABASE SERVICE LAYER (Client-Side Simulation)
 * 
 * This file allows the app to run in the browser without a real backend.
 * It uses localStorage to save users, classes, and requests.
 */

class DatabaseService {
  
  // --- INTERNAL HELPER METHODS ---

  private _getUsers(): Record<string, User> {
    try {
      const data = localStorage.getItem(DB_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error("Error reading users from DB", error);
      return {};
    }
  }

  private _saveUsers(users: Record<string, User>): void {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(users));
    } catch (error) {
      console.error("Error saving users to DB", error);
    }
  }

  private _getContent(): ClassContent[] {
    try {
      const data = localStorage.getItem(CONTENT_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  private _saveContent(content: ClassContent[]): void {
    localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
  }

  private _getRequests(): EnrollmentRequest[] {
    try {
      const data = localStorage.getItem(REQUESTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  private _saveRequests(requests: EnrollmentRequest[]): void {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  }

  // --- USER API METHODS ---

  async getAllUsers(): Promise<User[]> {
    const usersMap = this._getUsers();
    return Object.values(usersMap);
  }

  async getUser(email: string): Promise<User | undefined> {
    const users = this._getUsers();
    return users[email];
  }

  async saveUser(user: User): Promise<User> {
    const users = this._getUsers();
    
    // First user becomes ADMIN automatically
    const isFirstUser = Object.keys(users).length === 0;
    if (isFirstUser) {
      user.role = 'admin';
    }

    users[user.email] = user;
    this._saveUsers(users);
    
    // Update session if needed
    const currentSession = this.getSession();
    if (currentSession && currentSession.email === user.email) {
      this.setSession(user);
    }
    
    return user;
  }

  // --- CONTENT / CLASS API METHODS ---

  async saveClassContent(content: ClassContent): Promise<void> {
    const allContent = this._getContent();
    allContent.unshift(content); // Add new content to top
    this._saveContent(allContent);
  }

  async deleteClassContent(contentId: string): Promise<void> {
    const allContent = this._getContent();
    const filteredContent = allContent.filter(c => c.id !== contentId);
    this._saveContent(filteredContent);
  }

  async getAllContent(): Promise<ClassContent[]> {
    return this._getContent();
  }

  // --- ENROLLMENT REQUEST METHODS ---

  async createEnrollmentRequest(request: EnrollmentRequest): Promise<void> {
    const requests = this._getRequests();
    requests.unshift(request);
    this._saveRequests(requests);
  }

  async getEnrollmentRequests(): Promise<EnrollmentRequest[]> {
    return this._getRequests();
  }

  async approveEnrollment(requestId: string): Promise<boolean> {
    const requests = this._getRequests();
    const reqIndex = requests.findIndex(r => r.id === requestId);
    
    if (reqIndex === -1) return false;
    
    const request = requests[reqIndex];
    
    // 1. Update Request Status
    request.status = 'approved';
    this._saveRequests(requests);

    // 2. Add Batch to User
    const users = this._getUsers();
    const user = Object.values(users).find(u => u.id === request.userId);
    
    if (user) {
        const currentBatches = user.enrolledBatches || [];
        if (!currentBatches.includes(request.batchId)) {
            user.enrolledBatches = [...currentBatches, request.batchId];
            this._saveUsers(users);
            
            // Update session if it's the current user
            const currentSession = this.getSession();
            if (currentSession && currentSession.id === user.id) {
                this.setSession(user);
            }
        }
        return true;
    }
    return false;
  }

  async rejectEnrollment(requestId: string): Promise<void> {
    const requests = this._getRequests();
    const req = requests.find(r => r.id === requestId);
    if (req) {
        req.status = 'rejected';
        this._saveRequests(requests);
    }
  }

  // --- SESSION MANAGEMENT ---

  getSession(): User | null {
    try {
      const data = localStorage.getItem(SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  setSession(user: User): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
  }
}

export const userDb = new DatabaseService();