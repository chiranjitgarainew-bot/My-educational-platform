import { User, ClassContent, EnrollmentRequest, Coupon, Chapter } from '../types';

const DB_KEY = 'study_platform_users_v2';
const SESSION_KEY = 'study_platform_session_v2';
const CONTENT_KEY = 'study_platform_content_v2';
const REQUESTS_KEY = 'study_platform_requests_v2';
const COUPONS_KEY = 'study_platform_coupons_v2';
const CHAPTERS_KEY = 'study_platform_chapters_v2';

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

  async saveUser(user: User): Promise<User> {
    const users = this._getData<Record<string, User>>(DB_KEY, {});
    if (Object.keys(users).length === 0) user.role = 'admin';
    users[user.email] = user;
    this._saveData(DB_KEY, users);
    
    const currentSession = this.getSession();
    if (currentSession && currentSession.email === user.email) this.setSession(user);
    return user;
  }

  // --- CONTENT METHODS ---
  async saveClassContent(content: ClassContent): Promise<void> {
    const allContent = this._getData<ClassContent[]>(CONTENT_KEY, []);
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
  
  async deleteChapter(chapterId: string): Promise<void> {
     let chapters = this._getData<Chapter[]>(CHAPTERS_KEY, []);
     chapters = chapters.filter(c => c.id !== chapterId);
     this._saveData(CHAPTERS_KEY, chapters);
     
     // Optional: Delete content associated with this chapter
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

  setSession(user: User): void {
    this._saveData(SESSION_KEY, user);
  }

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
  }
}

export const userDb = new DatabaseService();