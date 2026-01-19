/**
 * DATA & DATABASE SERVICE
 * Includes: Constants, Gradients, DB Logic, and SECURITY Utilities
 */

// ==========================================
// 1. DATA CONSTANTS
// ==========================================

const BATCHES = [
    { 
      id: '8', name: 'Class 8', batchName: 'দিশা ব্যাচ (Class-08)', 
      description: 'Foundation building & basics for Class 8 students.', 
      color: 'bg-green-500', price: 1999, originalPrice: 3998, discount: 50,
      subjects: ['গণিত (Mathematics)', 'জীবন বিজ্ঞান (Life Science)', 'ভৌত বিজ্ঞান (Physical Science)'],
      language: 'Bengali'
    },
    { 
      id: '9', name: 'Class 9', batchName: 'লক্ষ্য ব্যাচ (Class-09)', 
      description: 'Advanced concepts introduction for Class 9.', 
      color: 'bg-purple-500', price: 2499, originalPrice: 4999, discount: 50,
      subjects: ['গণিত (Mathematics)', 'জীবন বিজ্ঞান (Life Science)', 'ভৌত বিজ্ঞান (Physical Science)'],
      language: 'Bengali'
    },
    { 
      id: '10', name: 'Class 10', batchName: 'উড়ান ব্যাচ (Class-10)', 
      description: 'Complete Board exam preparation.', 
      color: 'bg-indigo-500', price: 2999, originalPrice: 5999, discount: 50,
      subjects: ['গণিত (Mathematics)', 'জীবন বিজ্ঞান (Life Science)', 'ভৌত বিজ্ঞান (Physical Science)'],
      language: 'Bengali'
    }
];

// Initial users with plain text for seeding only. 
// These will be converted to hashes immediately upon app load.
const PRELOADED_USERS = [
    {
        id: 'ADMIN01',
        name: 'Super Admin',
        email: 'admin@study.com',
        tempPassword: 'admin', // Will be hashed and removed
        role: 'admin',
        isVerified: true,
        phone: '+91 90000 00000',
        address: 'Admin HQ, EdTech City',
        dob: '1990-01-01',
        bio: 'Managing the platform content and users.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
        enrolledBatches: [], 
        friends: []
    },
    {
        id: 'STU01',
        name: 'Rahul Sharma',
        email: 'student@study.com', 
        tempPassword: '123', // Will be hashed and removed
        role: 'student',
        isVerified: true,
        phone: '+91 98765 43210', 
        address: '12/A, College Street, Kolkata', 
        dob: '2008-05-15',
        bio: 'Class 9 Student aspiring to be an engineer.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
        enrolledBatches: ['8', '9'], 
        friends: []
    }
];

const GRADIENTS = [
    'from-blue-500 to-cyan-400',
    'from-fuchsia-500 to-pink-500',
    'from-emerald-500 to-teal-400',
    'from-orange-500 to-amber-400',
    'from-violet-600 to-indigo-500',
    'from-rose-500 to-red-400'
];

function getGradient(index) {
    return GRADIENTS[index % GRADIENTS.length];
}

// ==========================================
// 2. SECURITY UTILITIES (Hashing & Validation)
// ==========================================

const Security = {
    // Generate a random unique salt (Hex string)
    generateSalt() {
        const array = new Uint8Array(16);
        window.crypto.getRandomValues(array);
        return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    },

    // Hash password + salt using SHA-256 (Async)
    async hashPassword(password, salt) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + salt);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    // Validate Password Strength
    validateStrength(password) {
        if (password.length < 8) return { valid: false, msg: "Password must be at least 8 characters." };
        if (!/[A-Z]/.test(password)) return { valid: false, msg: "Must contain at least 1 uppercase letter." };
        if (!/[0-9]/.test(password)) return { valid: false, msg: "Must contain at least 1 number." };
        return { valid: true };
    }
};

// ==========================================
// 3. DATABASE SERVICE
// ==========================================

const KEYS = {
    USERS: 'app_users',
    SESSION: 'app_session', 
    CONTENT: 'app_content',
    REQUESTS: 'app_requests',
    CHAPTERS: 'app_chapters',
    PROGRESS: 'app_progress',
    MESSAGES: 'app_messages',
    COUPONS: 'app_coupons',
    ACTIVITY: 'app_activity_logs'
};

const storage = {
    memory: {},
    isAvailable: false,
    init() {
        try { localStorage.setItem('test_storage', '1'); localStorage.removeItem('test_storage'); this.isAvailable = true; } 
        catch(e) { this.isAvailable = false; }
    },
    getItem(key) { return this.isAvailable ? localStorage.getItem(key) : (this.memory[key] || null); },
    setItem(key, value) { if(this.isAvailable) localStorage.setItem(key, value); else this.memory[key] = value; },
    removeItem(key) { if(this.isAvailable) localStorage.removeItem(key); else delete this.memory[key]; }
};
storage.init();

const db = {
    _get(key, def) { try { return JSON.parse(storage.getItem(key)) || def; } catch { return def; } },
    _save(key, val) { storage.setItem(key, JSON.stringify(val)); },

    getUsers() { return this._get(KEYS.USERS, {}); },
    getUser(email) { return this.getUsers()[email]; },
    getUserById(id) { return Object.values(this.getUsers()).find(u => u.id === id); },
    
    // Save User (Expects user object to already have hashed password if coming from signup)
    saveUser(user) {
        const users = this.getUsers();
        users[user.email] = user;
        this._save(KEYS.USERS, users);
        const session = this.getSession();
        if(session && session.email === user.email) this.setSession(user);
        return user;
    },

    // Updated Seed Logic to Hash Preloaded Passwords
    async seedUsers() {
        const users = this.getUsers();
        let changed = false;
        
        for (const u of PRELOADED_USERS) {
            if (!users[u.email]) {
                // New seed user - hash their temp password
                const salt = Security.generateSalt();
                const hash = await Security.hashPassword(u.tempPassword, salt);
                
                const secureUser = { ...u, salt: salt, passwordHash: hash };
                delete secureUser.tempPassword; // Remove plain text
                
                users[u.email] = secureUser;
                changed = true;
            }
        }
        
        if (changed) {
            this._save(KEYS.USERS, users);
            console.log("Database seeded and passwords secured.");
        }
    },

    // Secure Login Verification
    async authenticate(email, passwordInput) {
        const user = this.getUser(email);
        if (!user) return { success: false, msg: 'Account not found.' };

        // Handle verify logic
        if (!user.passwordHash || !user.salt) {
             // Fallback for very old unmigrated data (shouldn't happen with new seed)
             if (user.password === passwordInput) return { success: true, user };
             return { success: false, msg: 'Security update required. Reset password.' };
        }

        // Hash input with stored salt
        const inputHash = await Security.hashPassword(passwordInput, user.salt);
        
        if (inputHash === user.passwordHash) {
            return { success: true, user };
        } else {
            return { success: false, msg: 'Incorrect password.' };
        }
    },

    logActivity(userId, type, description) {
        const logs = this._get(KEYS.ACTIVITY, []);
        const newLog = { id: Date.now().toString(36), userId, type, description, timestamp: Date.now() };
        logs.unshift(newLog);
        if(logs.length > 1000) logs.length = 1000;
        this._save(KEYS.ACTIVITY, logs);
    },
    getUserLogs(userId) { return this._get(KEYS.ACTIVITY, []).filter(log => log.userId === userId); },

    initiateSession(email) {
        const users = this.getUsers();
        const user = users[email];
        if(!user) return null;
        user.deviceId = 'dev_' + Date.now();
        user.lastLogin = Date.now();
        users[email] = user;
        this._save(KEYS.USERS, users);
        this.setSession(user);
        this.logActivity(user.id, 'LOGIN', 'User logged in');
        return user;
    },
    
    validateSession() {
        const session = this.getSession();
        if(!session) return false;
        const user = this.getUser(session.email);
        if(!user || user.deviceId !== session.deviceId) { this.clearSession(); return false; }
        return true;
    },
    
    getSession() { return this._get(KEYS.SESSION, null); },
    setSession(u) { this._save(KEYS.SESSION, u); },
    clearSession() { storage.removeItem(KEYS.SESSION); },

    verifyEmail(email, code) {
        const users = this.getUsers();
        const user = users[email];
        if (user && user.verificationCode === code) {
            user.isVerified = true; delete user.verificationCode;
            users[email] = user; this._save(KEYS.USERS, users);
            this.logActivity(user.id, 'VERIFY', 'Email verified');
            return { success: true };
        }
        return { success: false, msg: 'Invalid Code' };
    },

    getContent() { return this._get(KEYS.CONTENT, []); },
    getContentById(id) { return this.getContent().find(c => c.id === id); },
    saveContent(c) { const all = this.getContent(); all.unshift(c); this._save(KEYS.CONTENT, all); },
    getChapters(batchId, subject) { return this._get(KEYS.CHAPTERS, []).filter(c => c.batchId === batchId && c.subject === subject).sort((a,b) => a.order - b.order); },
    seedChapters(list) { const all = this._get(KEYS.CHAPTERS, []); this._save(KEYS.CHAPTERS, [...all, ...list]); },
    hasChapters(batchId) { return this._get(KEYS.CHAPTERS, []).some(c => c.batchId === batchId); },
    hasContentForChapter(chapterId) {
        return this.getContent().some(c => c.chapterId === chapterId);
    },

    getCoupons() { return this._get(KEYS.COUPONS, []); },
    saveCoupon(c) { const all = this.getCoupons(); all.push(c); this._save(KEYS.COUPONS, all); },
    deleteCoupon(code) { let all = this.getCoupons(); all = all.filter(c => c.code !== code); this._save(KEYS.COUPONS, all); },
    validateCoupon(code) { return this.getCoupons().find(c => c.code === code); },

    getRequests() { return this._get(KEYS.REQUESTS, []); },
    createRequest(req) { const all = this.getRequests(); all.unshift(req); this._save(KEYS.REQUESTS, all); this.logActivity(req.userId, 'PURCHASE_REQUEST', `Request for ${req.batchName}`); },
    approveRequest(id) {
        const reqs = this.getRequests(); const req = reqs.find(r => r.id === id);
        if(req) {
            req.status = 'approved'; this._save(KEYS.REQUESTS, reqs);
            const users = this.getUsers(); const user = Object.values(users).find(u => u.id === req.userId);
            if(user) {
                user.enrolledBatches = user.enrolledBatches || [];
                if(!user.enrolledBatches.includes(req.batchId)) {
                    user.enrolledBatches.push(req.batchId); users[user.email] = user; this._save(KEYS.USERS, users);
                    this.logActivity(user.id, 'ENROLL_SUCCESS', `Approved: ${req.batchName}`);
                    const session = this.getSession();
                    if(session && session.id === user.id) { session.enrolledBatches = user.enrolledBatches; this.setSession(session); if(state && state.user && state.user.id === user.id) state.user.enrolledBatches = user.enrolledBatches; }
                }
            }
        }
    },
    rejectRequest(id) {
        const reqs = this.getRequests(); const req = reqs.find(r => r.id === id);
        if(req) { req.status = 'rejected'; this._save(KEYS.REQUESTS, reqs); this.logActivity(req.userId, 'ENROLL_REJECT', `Rejected: ${req.batchName}`); }
    },

    saveProgress(p) {
        const map = this._get(KEYS.PROGRESS, {}); const key = `${p.userId}_${p.contentId}`;
        let justCompleted = false;
        if((p.watchedSeconds / p.totalSeconds) > 0.9 && !p.completed) { p.completed = true; justCompleted = true; } else if(map[key]?.completed) p.completed = true;
        map[key] = p; this._save(KEYS.PROGRESS, map);
        if(justCompleted) this.logActivity(p.userId, 'COMPLETION', `Completed lesson`);
    },
    getUserProgress(uid) { return Object.values(this._get(KEYS.PROGRESS, {})).filter(p => p.userId === uid); },
    getMessages(u1, u2) { return this._get(KEYS.MESSAGES, []).filter(m => (m.senderId === u1 && m.receiverId === u2) || (m.senderId === u2 && m.receiverId === u1)).sort((a,b) => a.timestamp - b.timestamp); },
    sendMessage(msg) { const all = this._get(KEYS.MESSAGES, []); all.push(msg); this._save(KEYS.MESSAGES, all); },
    addFriend(userId, friendId) {
        const users = this.getUsers(); const user = Object.values(users).find(u => u.id === userId); const friend = Object.values(users).find(u => u.id === friendId);
        if(user && friend) {
            user.friends = user.friends || []; friend.friends = friend.friends || [];
            if(!user.friends.includes(friendId)) { user.friends.push(friendId); this.logActivity(userId, 'FRIEND', `Added friend: ${friend.name}`); }
            if(!friend.friends.includes(userId)) friend.friends.push(userId);
            users[user.email] = user; users[friend.email] = friend; this._save(KEYS.USERS, users);
            const session = this.getSession(); if(session && session.id === user.id) this.setSession(user);
        }
    }
};