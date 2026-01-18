import { User, ClassContent, EnrollmentRequest, Coupon, Chapter, PrivateMessage, ProgressRecord } from '../types';

const DB_KEY = 'study_platform_users_v2';
const SESSION_KEY = 'study_platform_session_v2';
const CONTENT_KEY = 'study_platform_content_v2';
const REQUESTS_KEY = 'study_platform_requests_v2';
const COUPONS_KEY = 'study_platform_coupons_v2';
const CHAPTERS_KEY = 'study_platform_chapters_v2';
const MESSAGES_KEY = 'study_platform_messages_v2';
const PROGRESS_KEY = 'study_platform_progress_v2';

class DatabaseService {
  
  // --- INTERNAL HELPERS ---
  private _getData<T>(key: string, defaultVal: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private _saveData(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- USER METHODS ---
  async getAllUsers(): Promise<User[]> {
    const usersMap = this._getData<Record<string, User>>(DB_KEY, {});
    return Object.values(usersMap);
  }

  async getUser(email: string): Promise<User | undefined> {
    const users = this._getData<Record<string, User>>(DB_KEY, {});
    return users[email];
  }

  async getUserById(id: string): Promise<User | undefined> {
    const users = this._getData<Record<string, User>>(DB_KEY, {});
    return Object.values(users).find(u => u.id === id);
  }

  async saveUser(user: User): Promise<User> {
    const users = this._getData<Record<string, User>>(DB_KEY, {});
    if (Object.keys(users).length === 0) {
        user.role = 'admin';
        user.isVerified = true; // First admin is auto verified
    }
    
    // Initialize defaults
    if (!user.friends) user.friends = [];
    if (!user.friendRequests) user.friendRequests = [];
    if (!user.blockedUsers) user.blockedUsers = [];
    if (user.isVerified === undefined) user.isVerified = false; // Default unverified

    users[user.email] = user;
    this._saveData(DB_KEY, users);
    
    // We do NOT update session here automatically to prevent bypassing auth checks
    return user;
  }

  // --- SECURITY: EMAIL VERIFICATION ---
  async verifyUserEmail(email: string, code: string): Promise<{success: boolean, message: string}> {
      const users = this._getData<Record<string, User>>(DB_KEY, {});
      const user = users[email];
      
      if (!user) return { success: false, message: 'User not found' };
      
      // In a real app, check code expiration too
      if (user.verificationCode === code) {
          user.isVerified = true;
          user.verificationCode = undefined; // Clear code
          users[email] = user;
          this._saveData(DB_KEY, users);
          return { success: true, message: 'Verified successfully' };
      }
      
      return { success: false, message: 'Invalid verification code' };
  }

  // --- SECURITY: SINGLE DEVICE SESSION ---
  
  // Call this on Login
  async initiateSession(email: string): Promise<User | null> {
      const users = this._getData<Record<string, User>>(DB_KEY, {});
      const user = users[email];
      
      if (!user) return null;

      // Generate new Device ID
      const newDeviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      user.deviceId = newDeviceId;
      user.lastLogin = Date.now();
      
      // Update DB
      users[email] = user;
      this._saveData(DB_KEY, users);

      // Set Local Session with this Device ID
      this.setSession(user);
      
      return user;
  }

  // Call this periodically to check if kicked out
  async validateSession(): Promise<boolean> {
      const currentSession = this.getSession();
      if (!currentSession) return false;

      // Fetch fresh data from DB
      const dbUser = await this.getUser(currentSession.email);
      
      // If user deleted or device ID changed (logged in elsewhere)
      if (!dbUser || dbUser.deviceId !== currentSession.deviceId) {
          this.clearSession();
          return false;
      }
      return true;
  }

  // --- PROGRESS & WATCH HISTORY METHODS ---

  async saveProgress(record: ProgressRecord): Promise<void> {
    const progressMap = this._getData<Record<string, ProgressRecord>>(PROGRESS_KEY, {});
    const key = `${record.userId}_${record.contentId}`;
    
    const existing = progressMap[key];
    const percentage = (record.watchedSeconds / record.totalSeconds) * 100;
    
    if (percentage >= 90) {
      record.completed = true;
    } else if (existing && existing.completed) {
      record.completed = true;
    }

    progressMap[key] = record;
    this._saveData(PROGRESS_KEY, progressMap);
  }

  async getProgress(userId: string, contentId: string): Promise<ProgressRecord | undefined> {
    const progressMap = this._getData<Record<string, ProgressRecord>>(PROGRESS_KEY, {});
    return progressMap[`${userId}_${contentId}`];
  }

  async getAllUserProgress(userId: string): Promise<ProgressRecord[]> {
    const progressMap = this._getData<Record<string, ProgressRecord>>(PROGRESS_KEY, {});
    return Object.values(progressMap).filter(p => p.userId === userId);
  }

  async getLastWatched(userId: string): Promise<ProgressRecord | null> {
    const all = await this.getAllUserProgress(userId);
    if (all.length === 0) return null;
    return all.sort((a, b) => b.lastUpdated - a.lastUpdated)[0];
  }

  async getRecentHistory(userId: string, limit: number = 5): Promise<{content: ClassContent, progress: ProgressRecord}[]> {
    const allProgress = await this.getAllUserProgress(userId);
    const sorted = allProgress.sort((a, b) => b.lastUpdated - a.lastUpdated).slice(0, limit);
    const results: {content: ClassContent, progress: ProgressRecord}[] = [];
    
    for (const p of sorted) {
        const content = await this.getContentById(p.contentId);
        if (content) {
            results.push({ content, progress: p });
        }
    }
    return results;
  }

  // Analytics Calculations
  async getSubjectProgress(userId: string, batchId: string, subject: string): Promise<number> {
    const allContent = await this.getAllContent();
    const subjectContent = allContent.filter(c => c.batchId === batchId && c.subject === subject);
    if (subjectContent.length === 0) return 0;

    const userProgress = await this.getAllUserProgress(userId);
    let completedCount = 0;

    subjectContent.forEach(c => {
      const rec = userProgress.find(p => p.contentId === c.id);
      if (rec && rec.completed) completedCount++;
    });

    return Math.round((completedCount / subjectContent.length) * 100);
  }

  async getBatchProgress(userId: string, batchId: string): Promise<number> {
    const allContent = await this.getAllContent();
    const batchContent = allContent.filter(c => c.batchId === batchId);
    if (batchContent.length === 0) return 0;

    const userProgress = await this.getAllUserProgress(userId);
    let completedCount = 0;

    batchContent.forEach(c => {
        const rec = userProgress.find(p => p.contentId === c.id);
        if (rec && rec.completed) completedCount++;
    });

    return Math.round((completedCount / batchContent.length) * 100);
  }

  async getAdminAnalytics(): Promise<{
      totalWatchHours: number;
      activeStudents: number;
      batchStats: Record<string, number>;
  }> {
      const progressMap = this._getData<Record<string, ProgressRecord>>(PROGRESS_KEY, {});
      const records = Object.values(progressMap);

      const totalWatchSeconds = records.reduce((acc, curr) => acc + curr.watchedSeconds, 0);
      const activeUserIds = new Set(records.map(r => r.userId));

      const batchStats: Record<string, number> = {};
      records.filter(r => r.completed).forEach(r => {
          batchStats[r.batchId] = (batchStats[r.batchId] || 0) + 1;
      });

      return {
          totalWatchHours: Math.round(totalWatchSeconds / 3600),
          activeStudents: activeUserIds.size,
          batchStats
      };
  }

  // --- SOCIAL & FRIEND METHODS ---

  async sendFriendRequest(fromId: string, toId: string): Promise<void> {
    const users = this._getData<Record<string, User>>(DB_KEY, {});
    const targetUser = Object.values(users).find(u => u.id === toId);
    if (targetUser) {
      targetUser.friendRequests = targetUser.friendRequests || [];
      if (!targetUser.friendRequests.includes(fromId) && !targetUser.friends?.includes(fromId)) {
        targetUser.friendRequests.push(fromId);
        users[targetUser.email] = targetUser;
        this._saveData(DB_KEY, users);
      }
    }
  }

  async acceptFriendRequest(userId: string, requesterId: string): Promise<void> {
    const users = this._getData<Record<string, User>>(DB_KEY, {});
    const user = Object.values(users).find(u => u.id === userId);
    const requester = Object.values(users).find(u => u.id === requesterId);

    if (user && requester) {
      user.friends = user.friends || [];
      user.friendRequests = user.friendRequests || [];
      requester.friends = requester.friends || [];

      if (!user.friends.includes(requesterId)) user.friends.push(requesterId);
      if (!requester.friends.includes(userId)) requester.friends.push(userId);

      user.friendRequests = user.friendRequests.filter(id => id !== requesterId);

      users[user.email] = user;
      users[requester.email] = requester;
      this._saveData(DB_KEY, users);
      
      const session = this.getSession();
      if(session && session.id === user.id) this.setSession(user); // Update session if user is current
    }
  }

  async rejectFriendRequest(userId: string, requesterId: string): Promise<void> {
    const users = this._getData<Record<string, User>>(DB_KEY, {});
    const user = Object.values(users).find(u => u.id === userId);
    if (user) {
      user.friendRequests = (user.friendRequests || []).filter(id => id !== requesterId);
      users[user.email] = user;
      this._saveData(DB_KEY, users);
      const session = this.getSession();
      if(session && session.id === user.id) this.setSession(user);
    }
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    const users = this._getData<Record<string, User>>(DB_KEY, {});
    const user = Object.values(users).find(u => u.id === userId);
    const friend = Object.values(users).find(u => u.id === friendId);
    if (user && friend) {
       user.friends = (user.friends || []).filter(id => id !== friendId);
       friend.friends = (friend.friends || []).filter(id => id !== userId);
       users[user.email] = user;
       users[friend.email] = friend;
       this._saveData(DB_KEY, users);
       const session = this.getSession();
       if(session && session.id === user.id) this.setSession(user);
    }
  }

  async blockUser(userId: string, targetId: string): Promise<void> {
    const users = this._getData<Record<string, User>>(DB_KEY, {});
    const user = Object.values(users).find(u => u.id === userId);
    if (user) {
       user.blockedUsers = user.blockedUsers || [];
       if(!user.blockedUsers.includes(targetId)) {
         user.blockedUsers.push(targetId);
         user.friends = (user.friends || []).filter(id => id !== targetId);
         users[user.email] = user;
         this._saveData(DB_KEY, users);
         const session = this.getSession();
         if(session && session.id === user.id) this.setSession(user);
       }
    }
  }

  // --- MESSAGING METHODS ---
  async sendMessage(msg: PrivateMessage): Promise<void> {
    const messages = this._getData<PrivateMessage[]>(MESSAGES_KEY, []);
    messages.push(msg);
    this._saveData(MESSAGES_KEY, messages);
  }

  async getMessages(user1Id: string, user2Id: string): Promise<PrivateMessage[]> {
    const messages = this._getData<PrivateMessage[]>(MESSAGES_KEY, []);
    return messages.filter(m => 
      (m.senderId === user1Id && m.receiverId === user2Id) || 
      (m.senderId === user2Id && m.receiverId === user1Id)
    ).sort((a, b) => a.timestamp - b.timestamp);
  }

  async getLastMessage(user1Id: string, user2Id: string): Promise<PrivateMessage | undefined> {
    const msgs = await this.getMessages(user1Id, user2Id);
    return msgs[msgs.length - 1];
  }

  async markAsRead(userId: string, friendId: string): Promise<void> {
    const messages = this._getData<PrivateMessage[]>(MESSAGES_KEY, []);
    let updated = false;
    const newMessages = messages.map(m => {
       if (m.receiverId === userId && m.senderId === friendId && !m.isRead) {
         updated = true;
         return { ...m, isRead: true };
       }
       return m;
    });
    if (updated) this._saveData(MESSAGES_KEY, newMessages);
  }

  // --- CONTENT METHODS ---
  async saveClassContent(content: ClassContent): Promise<void> {
    const allContent = this._getData<ClassContent[]>(CONTENT_KEY, []);
    if (!content.duration) content.duration = 600; 
    allContent.unshift(content);
    this._saveData(CONTENT_KEY, allContent);
  }

  async deleteClassContent(contentId: string): Promise<void> {
    const allContent = this._getData<ClassContent[]>(CONTENT_KEY, []);
    const filtered = allContent.filter(c => c.id !== contentId);
    this._saveData(CONTENT_KEY, filtered);
  }

  async getAllContent(): Promise<ClassContent[]> {
    return this._getData<ClassContent[]>(CONTENT_KEY, []);
  }

  async getContentById(id: string): Promise<ClassContent | undefined> {
    const allContent = this._getData<ClassContent[]>(CONTENT_KEY, []);
    return allContent.find(c => c.id === id);
  }

  // --- CHAPTER METHODS ---
  async saveChapter(chapter: Chapter): Promise<void> {
    const chapters = this._getData<Chapter[]>(CHAPTERS_KEY, []);
    chapters.push(chapter);
    this._saveData(CHAPTERS_KEY, chapters);
  }

  async getChapters(batchId: string, subject: string): Promise<Chapter[]> {
    const chapters = this._getData<Chapter[]>(CHAPTERS_KEY, []);
    return chapters.filter(c => c.batchId === batchId && c.subject === subject)
                   .sort((a, b) => a.order - b.order);
  }

  async hasChapters(batchId: string): Promise<boolean> {
      const chapters = this._getData<Chapter[]>(CHAPTERS_KEY, []);
      return chapters.some(c => c.batchId === batchId);
  }

  async seedChapters(newChapters: Chapter[]): Promise<void> {
      const chapters = this._getData<Chapter[]>(CHAPTERS_KEY, []);
      const updated = [...chapters, ...newChapters];
      this._saveData(CHAPTERS_KEY, updated);
  }
  
  async deleteChapter(chapterId: string): Promise<void> {
     let chapters = this._getData<Chapter[]>(CHAPTERS_KEY, []);
     chapters = chapters.filter(c => c.id !== chapterId);
     this._saveData(CHAPTERS_KEY, chapters);
     let content = this._getData<ClassContent[]>(CONTENT_KEY, []);
     content = content.filter(c => c.chapterId !== chapterId);
     this._saveData(CONTENT_KEY, content);
  }

  // --- COUPON METHODS ---
  async saveCoupon(coupon: Coupon): Promise<void> {
    const coupons = this._getData<Coupon[]>(COUPONS_KEY, []);
    coupons.push(coupon);
    this._saveData(COUPONS_KEY, coupons);
  }

  async getCoupons(): Promise<Coupon[]> {
    return this._getData<Coupon[]>(COUPONS_KEY, []);
  }

  async deleteCoupon(id: string): Promise<void> {
    const coupons = this._getData<Coupon[]>(COUPONS_KEY, []);
    this._saveData(COUPONS_KEY, coupons.filter(c => c.id !== id));
  }

  async validateCoupon(code: string): Promise<Coupon | null> {
    const coupons = this._getData<Coupon[]>(COUPONS_KEY, []);
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
    return coupon || null;
  }

  // --- REQUEST METHODS ---
  async createEnrollmentRequest(request: EnrollmentRequest): Promise<void> {
    const requests = this._getData<EnrollmentRequest[]>(REQUESTS_KEY, []);
    requests.unshift(request);
    this._saveData(REQUESTS_KEY, requests);
  }

  async getEnrollmentRequests(): Promise<EnrollmentRequest[]> {
    return this._getData<EnrollmentRequest[]>(REQUESTS_KEY, []);
  }

  async approveEnrollment(requestId: string): Promise<boolean> {
    const requests = this._getData<EnrollmentRequest[]>(REQUESTS_KEY, []);
    const req = requests.find(r => r.id === requestId);
    if (!req) return false;
    
    req.status = 'approved';
    this._saveData(REQUESTS_KEY, requests);

    const users = this._getData<Record<string, User>>(DB_KEY, {});
    const user = Object.values(users).find(u => u.id === req.userId);
    
    if (user) {
        user.enrolledBatches = user.enrolledBatches || [];
        if (!user.enrolledBatches.includes(req.batchId)) {
            user.enrolledBatches.push(req.batchId);
            users[user.email] = user;
            this._saveData(DB_KEY, users);
            
            const session = this.getSession();
            if (session && session.id === user.id) this.setSession(user);
        }
        return true;
    }
    return false;
  }

  async rejectEnrollment(requestId: string): Promise<void> {
    const requests = this._getData<EnrollmentRequest[]>(REQUESTS_KEY, []);
    const req = requests.find(r => r.id === requestId);
    if (req) {
        req.status = 'rejected';
        this._saveData(REQUESTS_KEY, requests);
    }
  }

  // --- SESSION ---
  getSession(): User | null {
    return this._getData<User | null>(SESSION_KEY, null);
  }

  // Internal usage mostly, use initiateSession for Login
  setSession(user: User): void {
    this._saveData(SESSION_KEY, user);
  }

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
  }
}

export const userDb = new DatabaseService();