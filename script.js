/**
 * FULL APPLICATION LOGIC
 * Includes: Database Service, Authentication, Router, and UI Rendering
 */

// ==========================================
// 1. DATA CONSTANTS (Batches & Config)
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

// ==========================================
// 2. DATABASE SERVICE (Safe Storage Wrapper)
// ==========================================

const KEYS = {
    USERS: 'app_users',
    SESSION: 'app_session',
    CONTENT: 'app_content',
    REQUESTS: 'app_requests',
    CHAPTERS: 'app_chapters',
    PROGRESS: 'app_progress',
    MESSAGES: 'app_messages',
    COUPONS: 'app_coupons'
};

// Safe Storage Handler
const storage = {
    memory: {},
    isAvailable: false,
    init() {
        try {
            localStorage.setItem('test_storage', '1');
            localStorage.removeItem('test_storage');
            this.isAvailable = true;
        } catch(e) {
            this.isAvailable = false;
        }
    },
    getItem(key) {
        if(this.isAvailable) return localStorage.getItem(key);
        return this.memory[key] || null;
    },
    setItem(key, value) {
        if(this.isAvailable) localStorage.setItem(key, value);
        else this.memory[key] = value;
    },
    removeItem(key) {
        if(this.isAvailable) localStorage.removeItem(key);
        else delete this.memory[key];
    }
};
storage.init();

const db = {
    _get(key, def) { 
        try { return JSON.parse(storage.getItem(key)) || def; } 
        catch { return def; } 
    },
    _save(key, val) { 
        storage.setItem(key, JSON.stringify(val)); 
    },

    // --- User Management ---
    getUsers() { return this._get(KEYS.USERS, {}); },
    getUser(email) { return this.getUsers()[email]; },
    getUserById(id) { return Object.values(this.getUsers()).find(u => u.id === id); },
    
    saveUser(user) {
        const users = this.getUsers();
        if (Object.keys(users).length === 0) { 
            user.role = 'admin'; 
            user.isVerified = true; 
        }
        users[user.email] = user;
        this._save(KEYS.USERS, users);
        
        const session = this.getSession();
        if(session && session.email === user.email) this.setSession(user);
        return user;
    },

    // --- Session ---
    initiateSession(email) {
        const users = this.getUsers();
        const user = users[email];
        if(!user) return null;
        user.deviceId = 'dev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        user.lastLogin = Date.now();
        users[email] = user;
        this._save(KEYS.USERS, users);
        this.setSession(user);
        return user;
    },
    validateSession() {
        const session = this.getSession();
        if(!session) return false;
        const user = this.getUser(session.email);
        if(!user || user.deviceId !== session.deviceId) { 
            this.clearSession(); return false; 
        }
        return true;
    },
    getSession() { return this._get(KEYS.SESSION, null); },
    setSession(u) { this._save(KEYS.SESSION, u); },
    clearSession() { storage.removeItem(KEYS.SESSION); },

    verifyEmail(email, code) {
        const users = this.getUsers();
        const user = users[email];
        if (user && user.verificationCode === code) {
            user.isVerified = true;
            delete user.verificationCode;
            users[email] = user;
            this._save(KEYS.USERS, users);
            return { success: true };
        }
        return { success: false, msg: 'Invalid Verification Code' };
    },

    // --- Content ---
    getContent() { return this._get(KEYS.CONTENT, []); },
    getContentById(id) { return this.getContent().find(c => c.id === id); },
    saveContent(c) { 
        const all = this.getContent(); 
        all.unshift(c); 
        this._save(KEYS.CONTENT, all); 
    },
    getChapters(batchId, subject) {
        return this._get(KEYS.CHAPTERS, [])
            .filter(c => c.batchId === batchId && c.subject === subject)
            .sort((a,b) => a.order - b.order);
    },
    seedChapters(list) {
        const all = this._get(KEYS.CHAPTERS, []);
        this._save(KEYS.CHAPTERS, [...all, ...list]);
    },
    hasChapters(batchId) {
        return this._get(KEYS.CHAPTERS, []).some(c => c.batchId === batchId);
    },

    // --- Coupons ---
    getCoupons() { return this._get(KEYS.COUPONS, []); },
    saveCoupon(coupon) {
        const all = this.getCoupons();
        all.push(coupon);
        this._save(KEYS.COUPONS, all);
    },
    deleteCoupon(code) {
        let all = this.getCoupons();
        all = all.filter(c => c.code !== code);
        this._save(KEYS.COUPONS, all);
    },
    validateCoupon(code) {
        const all = this.getCoupons();
        return all.find(c => c.code === code);
    },

    // --- Enrollment Requests ---
    getRequests() { return this._get(KEYS.REQUESTS, []); },
    createRequest(req) { 
        const all = this.getRequests(); 
        all.unshift(req); 
        this._save(KEYS.REQUESTS, all); 
    },
    approveRequest(id) {
        const reqs = this.getRequests();
        const req = reqs.find(r => r.id === id);
        if(req) {
            req.status = 'approved';
            this._save(KEYS.REQUESTS, reqs);
            const users = this.getUsers();
            const user = Object.values(users).find(u => u.id === req.userId);
            if(user) {
                user.enrolledBatches = user.enrolledBatches || [];
                if(!user.enrolledBatches.includes(req.batchId)) {
                    user.enrolledBatches.push(req.batchId);
                    users[user.email] = user;
                    this._save(KEYS.USERS, users);
                }
            }
        }
    },
    rejectRequest(id) {
        const reqs = this.getRequests();
        const req = reqs.find(r => r.id === id);
        if(req) {
            req.status = 'rejected';
            this._save(KEYS.REQUESTS, reqs);
        }
    },

    // --- Progress & Chat ---
    saveProgress(p) {
        const map = this._get(KEYS.PROGRESS, {});
        const key = `${p.userId}_${p.contentId}`;
        if((p.watchedSeconds / p.totalSeconds) > 0.9) p.completed = true;
        else if(map[key]?.completed) p.completed = true;
        map[key] = p;
        this._save(KEYS.PROGRESS, map);
    },
    getUserProgress(uid) { return Object.values(this._get(KEYS.PROGRESS, {})).filter(p => p.userId === uid); },
    getMessages(u1, u2) {
        return this._get(KEYS.MESSAGES, [])
            .filter(m => (m.senderId === u1 && m.receiverId === u2) || (m.senderId === u2 && m.receiverId === u1))
            .sort((a,b) => a.timestamp - b.timestamp);
    },
    sendMessage(msg) {
        const all = this._get(KEYS.MESSAGES, []);
        all.push(msg);
        this._save(KEYS.MESSAGES, all);
    },
    addFriend(userId, friendId) {
        const users = this.getUsers();
        const user = Object.values(users).find(u => u.id === userId);
        const friend = Object.values(users).find(u => u.id === friendId);
        if(user && friend) {
            user.friends = user.friends || [];
            friend.friends = friend.friends || [];
            if(!user.friends.includes(friendId)) user.friends.push(friendId);
            if(!friend.friends.includes(userId)) friend.friends.push(userId);
            users[user.email] = user;
            users[friend.email] = friend;
            this._save(KEYS.USERS, users);
            const session = this.getSession();
            if(session && session.id === user.id) this.setSession(user);
        }
    }
};

// ==========================================
// 3. APP STATE & ROUTING
// ==========================================

const state = {
    user: null,
    route: 'home',
    params: {},
    checkInterval: null,
    tempPayment: { couponApplied: null, discountAmount: 0 }
};

function navigate(route, params = {}) {
    state.route = route;
    state.params = params;
    if(route !== 'payment') state.tempPayment = { couponApplied: null, discountAmount: 0 };
    renderApp();
    window.scrollTo(0, 0);
}

document.addEventListener('click', e => {
    const link = e.target.closest('[data-link]');
    if(link) {
        e.preventDefault();
        const route = link.dataset.link;
        const params = link.dataset.params ? JSON.parse(link.dataset.params) : {};
        navigate(route, params);
    }
});

async function seedData() {
    if(!db.hasChapters('8')) {
        const ch = [];
        for(let i=1; i<=5; i++) {
            ch.push({ 
                id:`s8_${i}`, batchId:'8', subject:'গণিত (Mathematics)', 
                title:`Chapter ${i}: Demo Math Lesson`, order:i 
            });
        }
        db.seedChapters(ch);
    }
}

// ==========================================
// 4. MAIN RENDERER
// ==========================================

function renderApp() {
    const app = document.getElementById('app');

    if(!state.checkInterval) {
        state.checkInterval = setInterval(() => {
            if(state.user && !db.validateSession()) {
                clearInterval(state.checkInterval);
                state.checkInterval = null;
                state.user = null;
                db.clearSession();
                alert('Logged out due to multi-device login.');
                renderApp();
            }
        }, 5000);
    }

    const session = db.getSession();
    if (!session) {
        state.user = null;
        app.innerHTML = renderAuthPage();
        attachAuthLogic();
    } else {
        if(!state.user) state.user = session;
        app.innerHTML = renderLayout(renderCurrentPage());
        attachLayoutLogic();
        attachPageLogic();
    }
    lucide.createIcons();
}

// ==========================================
// 5. VIEW COMPONENTS
// ==========================================

// --- AUTH PAGE ---
function renderAuthPage() {
    return `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div class="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] animate-float"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] animate-float" style="animation-delay: 2s"></div>
        <div class="glass w-full max-w-md rounded-3xl p-8 relative z-10 shadow-2xl border border-white/40 animate-fade-in">
            <div class="text-center mb-8">
                <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg transform -rotate-3 hover:rotate-0 transition">
                    <i data-lucide="book-open" width="32"></i>
                </div>
                <h2 class="text-3xl font-extrabold text-slate-800 tracking-tight" id="auth-title">Welcome Back</h2>
                <p class="text-slate-500 text-sm mt-2 font-medium">Secure Login &bull; One Device Policy</p>
            </div>
            <form id="auth-form" class="space-y-4">
                <div id="name-field" class="hidden animate-slide-up"><input type="text" id="name" placeholder="Full Name" class="w-full p-4 bg-white/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition"></div>
                <div><input type="email" id="email" placeholder="Email Address" required class="w-full p-4 bg-white/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition"></div>
                <div id="pass-field"><input type="password" id="password" placeholder="Password" required class="w-full p-4 bg-white/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition"></div>
                <div id="otp-field" class="hidden animate-slide-up text-center">
                    <p class="text-xs font-bold text-yellow-600 bg-yellow-50 p-2 rounded mb-2 border border-yellow-100">Demo Code: 123456</p>
                    <input type="text" id="otp" placeholder="######" maxlength="6" class="w-full p-4 text-center tracking-[1em] font-extrabold border rounded-xl text-xl">
                </div>
                <div id="msg" class="text-center text-sm font-bold min-h-[20px] transition-colors"></div>
                <button type="submit" class="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"><span id="btn-text">Log In</span></button>
            </form>
            <div class="mt-6 text-center"><button id="toggle-auth" class="text-indigo-600 font-bold hover:underline text-sm transition">Create Account</button></div>
        </div>
    </div>`;
}

function attachAuthLogic() {
    const form = document.getElementById('auth-form');
    const toggle = document.getElementById('toggle-auth');
    const els = { name: document.getElementById('name-field'), pass: document.getElementById('pass-field'), otp: document.getElementById('otp-field'), title: document.getElementById('auth-title'), btn: document.getElementById('btn-text'), msg: document.getElementById('msg') };
    let mode = 'login'; let tempEmail = '';
    toggle.onclick = () => {
        if(mode === 'login') { mode = 'signup'; els.title.innerText = 'Join Us'; els.btn.innerText = 'Sign Up'; els.name.classList.remove('hidden'); toggle.innerText = 'Back to Login'; els.msg.innerText = ''; } 
        else { mode = 'login'; els.title.innerText = 'Welcome Back'; els.btn.innerText = 'Log In'; els.name.classList.add('hidden'); els.otp.classList.add('hidden'); els.pass.classList.remove('hidden'); toggle.innerText = 'Create Account'; els.msg.innerText = ''; }
    };
    form.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const pass = document.getElementById('password')?.value;
        const name = document.getElementById('name')?.value;
        const otp = document.getElementById('otp')?.value;
        els.msg.innerText = 'Processing...'; els.msg.className = 'text-center text-blue-600 font-bold mb-2';
        await new Promise(r => setTimeout(r, 600));
        if (mode === 'signup') {
            if(db.getUser(email)) { els.msg.innerText = 'Account exists.'; els.msg.className = 'text-center text-red-500 font-bold mb-2'; return; }
            db.saveUser({ id: Date.now().toString(), name, email, password: pass, role: 'student', isVerified: false, verificationCode: '123456', avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g,'')}`, enrolledBatches: [], friends: [] });
            mode = 'verify'; tempEmail = email; els.title.innerText = 'Verify Email'; els.btn.innerText = 'Verify Code'; els.name.classList.add('hidden'); els.pass.classList.add('hidden'); els.otp.classList.remove('hidden'); els.msg.innerText = 'Code sent (123456)'; els.msg.className = 'text-center text-green-600 font-bold mb-2';
        } else if (mode === 'verify') {
            const res = db.verifyEmail(tempEmail, otp);
            if(res.success) { db.initiateSession(tempEmail); renderApp(); } 
            else { els.msg.innerText = res.msg; els.msg.className = 'text-center text-red-500 font-bold mb-2'; }
        } else {
            const u = db.getUser(email);
            if(!u || u.password !== pass) { els.msg.innerText = 'Invalid credentials.'; els.msg.className = 'text-center text-red-500 font-bold mb-2'; return; }
            if(!u.isVerified) { mode = 'verify'; tempEmail = email; u.verificationCode = '123456'; db.saveUser(u); els.title.innerText = 'Verify Email'; els.btn.innerText = 'Verify'; els.pass.classList.add('hidden'); els.otp.classList.remove('hidden'); els.msg.innerText = 'Code sent.'; return; }
            db.initiateSession(email); renderApp();
        }
    };
}

// --- LAYOUT ---
function renderLayout(content) {
    const u = state.user;
    return `
    <div class="min-h-screen bg-slate-50 flex flex-col">
        <header class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex justify-between items-center transition-all">
            <button id="menu-btn" class="p-2 hover:bg-gray-100 rounded-full transition"><i data-lucide="menu" class="text-gray-700"></i></button>
            <h1 class="font-bold text-indigo-600 text-lg tracking-tight">Study Platform</h1>
            <div class="cursor-pointer" data-link="profile"><img src="${u.avatar}" class="w-9 h-9 rounded-full border border-gray-300 shadow-sm hover:scale-105 transition"></div>
        </header>
        <div id="sidebar-overlay" class="fixed inset-0 bg-black/40 z-40 hidden backdrop-blur-sm transition-opacity"></div>
        <div id="sidebar" class="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform -translate-x-full transition-transform duration-300">
            <div class="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white relative">
                <button id="close-menu" class="absolute top-4 right-4 text-white/80 hover:text-white"><i data-lucide="x"></i></button>
                <div class="flex flex-col items-center mt-4">
                    <img src="${u.avatar}" class="w-16 h-16 rounded-full border-4 border-white/20 mb-3 shadow-lg">
                    <h3 class="font-bold text-lg">${u.name}</h3>
                    <span class="px-2 py-0.5 bg-white/20 rounded text-[10px] uppercase font-bold tracking-wider">${u.role}</span>
                </div>
            </div>
            <nav class="p-4 space-y-1">
                ${navItem('home', 'Home', 'home')}
                ${navItem('book-open', 'All Batches', 'classes')}
                ${navItem('message-square', 'Inbox', 'inbox')}
                ${u.role === 'admin' ? navItem('shield', 'Admin Panel', 'admin') : ''}
                <hr class="my-4 border-gray-100">
                ${navItem('settings', 'Settings', 'settings')}
                ${navItem('help-circle', 'Help Center', 'help')}
                <button id="logout-btn" class="w-full flex items-center px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition"><i data-lucide="log-out" class="mr-3 w-5"></i> Sign Out</button>
            </nav>
        </div>
        <main class="flex-1 p-4 max-w-3xl mx-auto w-full animate-fade-in pb-24">${content}</main>
        <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
            <div class="flex justify-around py-2 max-w-3xl mx-auto">
                ${btmItem('home', 'Home', 'home')}
                ${btmItem('book', 'My Batch', 'purchases')}
                ${btmItem('message-circle', 'Chat', 'inbox')}
                ${btmItem('user', 'Profile', 'profile')}
            </div>
        </nav>
    </div>`;
}

function navItem(icon, label, route) {
    const active = state.route === route ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50';
    return `<button data-link="${route}" class="w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl transition ${active}"><i data-lucide="${icon}" class="mr-3 w-5"></i> ${label}</button>`;
}
function btmItem(icon, label, route) {
    const active = state.route === route ? 'text-indigo-600 scale-105' : 'text-gray-400';
    return `<button data-link="${route}" class="flex flex-col items-center w-full transition-all p-2 ${active}"><i data-lucide="${icon}" width="22" class="mb-1"></i><span class="text-[10px] font-bold">${label}</span></button>`;
}
function attachLayoutLogic() {
    const sb = document.getElementById('sidebar'); const ov = document.getElementById('sidebar-overlay');
    document.getElementById('menu-btn').onclick = () => { sb.classList.remove('-translate-x-full'); ov.classList.remove('hidden'); };
    const close = () => { sb.classList.add('-translate-x-full'); ov.classList.add('hidden'); };
    document.getElementById('close-menu').onclick = close; ov.onclick = close;
    document.getElementById('logout-btn').onclick = () => { if(confirm('Logout?')) { db.clearSession(); renderApp(); } };
}

// --- ROUTER ---
function renderCurrentPage() {
    switch(state.route) {
        case 'home': return pageHome();
        case 'classes': return pageClasses();
        case 'batch': return pageBatchDetails();
        case 'payment': return pagePayment();
        case 'subjects': return pageSubjects();
        case 'chapters': return pageChapters();
        case 'lectures': return pageLectures();
        case 'player': return pagePlayer();
        case 'admin': return pageAdmin();
        case 'admin-upload': return pageAdminUpload();
        case 'inbox': return pageInbox();
        case 'chat': return pageChat();
        case 'profile': return pageProfile();
        case 'purchases': return pagePurchases();
        case 'settings': return pageSettings();
        case 'help': return pageHelp();
        default: return pageHome();
    }
}
function attachPageLogic() {
    if(state.route === 'admin') attachAdminLogic();
    if(state.route === 'admin-upload') attachAdminUploadLogic();
    if(state.route === 'payment') attachPaymentLogic();
    if(state.route === 'player') attachPlayerLogic();
    if(state.route === 'chat') attachChatLogic();
    if(state.route === 'settings') attachSettingsLogic();
}

// ==========================================
// 6. INDIVIDUAL PAGES
// ==========================================

function pageHome() {
    const u = state.user;
    const progress = db.getUserProgress(u.id);
    const watchHours = Math.round(progress.reduce((acc, curr) => acc + curr.watchedSeconds, 0) / 3600);
    const completedLessons = progress.filter(p => p.completed).length;
    return `
    <div class="space-y-6">
        <div class="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-500/20">
            <div class="relative z-10"><h1 class="text-3xl font-extrabold mb-2">Hello, ${u.name.split(' ')[0]}! 👋</h1><p class="text-indigo-100 opacity-90">Ready to learn?</p><button data-link="classes" class="mt-6 bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition transform inline-flex items-center gap-2">Browse Batches <i data-lucide="arrow-right" width="18"></i></button></div>
            <div class="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div class="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/30 rounded-full blur-2xl -ml-10 -mb-10"></div>
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center"><div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2"><i data-lucide="clock"></i></div><div class="text-3xl font-black text-slate-800">${watchHours}h</div><div class="text-xs font-bold text-gray-400 uppercase tracking-wide">Watch Time</div></div>
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center"><div class="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-2"><i data-lucide="check-circle"></i></div><div class="text-3xl font-black text-slate-800">${completedLessons}</div><div class="text-xs font-bold text-gray-400 uppercase tracking-wide">Completed</div></div>
        </div>
        <div data-link="purchases" class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center cursor-pointer hover:border-indigo-200 transition">
            <div class="flex items-center gap-4"><div class="bg-orange-100 p-3 rounded-xl text-orange-600"><i data-lucide="play-circle"></i></div><div><h3 class="font-bold text-lg">Resume Learning</h3><p class="text-gray-400 text-xs">Continue where you left off</p></div></div><i data-lucide="chevron-right" class="text-gray-300"></i>
        </div>
    </div>`;
}

function pageClasses() {
    return `
    <h2 class="text-2xl font-black text-slate-800 mb-5">Explore Batches</h2>
    <div class="grid gap-6">
        ${BATCHES.map(b => {
            const isEnrolled = state.user.enrolledBatches?.includes(b.id);
            return `<div data-link="batch" data-params='{"id":"${b.id}"}' class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div class="h-28 ${b.color} relative p-4 flex flex-col justify-between"><span class="bg-white/90 text-xs font-bold px-3 py-1 rounded-full self-start shadow-sm flex items-center gap-1">${isEnrolled ? '<i data-lucide="check" width="12" class="text-green-600"></i> Enrolled' : '<i data-lucide="star" width="12" class="text-yellow-500"></i> 2024-25 Batch'}</span></div>
                <div class="p-6 relative"><div class="absolute -top-8 right-6 w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white"><i data-lucide="book-open" class="text-indigo-600"></i></div><h3 class="text-xl font-bold text-slate-800 pr-10">${b.name}</h3><p class="text-sm text-slate-500 mt-2 line-clamp-2">${b.description}</p><div class="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center"><div class="text-xs font-bold text-gray-400 flex items-center gap-1"><i data-lucide="layers" width="14"></i> ${b.subjects.length} Subjects</div><span class="text-indigo-600 text-sm font-bold flex items-center gap-1">Details <i data-lucide="arrow-right" width="14"></i></span></div></div>
            </div>`;
        }).join('')}
    </div>`;
}

function pageBatchDetails() {
    const b = BATCHES.find(x => x.id === state.params.id);
    const isEnrolled = state.user.enrolledBatches?.includes(b.id);
    return `
    <div class="space-y-5">
        <button onclick="window.history.back()" class="flex items-center text-gray-500 font-bold hover:text-gray-800 transition"><i data-lucide="arrow-left" width="20" class="mr-1"></i> Back</button>
        <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 ${b.color} opacity-10 rounded-bl-full"></div>
            <h1 class="text-2xl font-black text-gray-900 mb-2">${b.batchName}</h1>
            <p class="text-gray-500 leading-relaxed">${b.description}</p>
            <div class="mt-6"><h4 class="font-bold text-gray-800 mb-3 text-sm uppercase">Subjects Included</h4><div class="flex flex-wrap gap-2">${b.subjects.map(s => `<span class="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-600 flex items-center gap-2"><div class="w-2 h-2 rounded-full ${b.color}"></div> ${s}</span>`).join('')}</div></div>
        </div>
        <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg sticky bottom-24">
            ${isEnrolled ? `<div class="text-center"><div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce"><i data-lucide="check" width="32"></i></div><h3 class="text-xl font-bold text-gray-800">You are Enrolled!</h3><p class="text-sm text-gray-500 mb-6">Start watching your lessons now.</p><button data-link="subjects" data-params='{"id":"${b.id}"}' class="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-indigo-500/30 transition">Start Learning</button></div>` 
            : `<div class="flex justify-between items-end mb-6"><div><p class="text-sm text-gray-400 font-bold">Total Price</p><div class="flex items-baseline gap-2"><span class="text-3xl font-black text-gray-900">₹${b.price}</span><span class="text-lg text-gray-400 line-through">₹${b.originalPrice}</span></div></div><div class="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold">${b.discount}% OFF</div></div><button data-link="payment" data-params='{"id":"${b.id}"}' class="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 rounded-xl font-bold shadow-lg hover:scale-[1.02] transition">Enroll Now</button>`}
        </div>
    </div>`;
}

// --- PAYMENT PAGE ---
function pagePayment() {
    const b = BATCHES.find(x => x.id === state.params.id);
    const discount = state.tempPayment.discountAmount || 0;
    const finalPrice = Math.max(0, b.price - discount);

    return `
    <div>
        <h2 class="text-xl font-bold mb-6 flex items-center gap-2"><button onclick="window.history.back()"><i data-lucide="arrow-left"></i></button> Secure Payment</h2>
        
        <div class="bg-white p-5 rounded-2xl border border-gray-100 mb-4">
            <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Order Summary</h3>
            <div class="flex justify-between mb-2"><span class="text-gray-600">Batch Price</span><span class="font-bold">₹${b.price}</span></div>
            ${discount > 0 ? `<div class="flex justify-between mb-2 text-green-600"><span class="flex items-center gap-1"><i data-lucide="tag" width="14"></i> Coupon Discount</span><span class="font-bold">- ₹${discount}</span></div>` : ''}
            <div class="border-t border-gray-100 my-2 pt-2 flex justify-between text-lg font-black text-slate-800"><span>Total Payable</span><span>₹${finalPrice}</span></div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-gray-100 mb-6">
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Have a Coupon?</label>
            <div class="flex gap-2">
                <input type="text" id="coupon-code" value="${state.tempPayment.couponApplied || ''}" placeholder="Enter Code" class="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 uppercase font-bold text-slate-700" ${state.tempPayment.couponApplied ? 'disabled' : ''}>
                ${state.tempPayment.couponApplied 
                    ? `<button onclick="removeCoupon()" class="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold hover:bg-red-100"><i data-lucide="trash-2"></i></button>`
                    : `<button onclick="applyCoupon()" class="bg-slate-800 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-900">Apply</button>`
                }
            </div>
            ${state.tempPayment.couponApplied ? '<p class="text-xs text-green-600 font-bold mt-2 flex items-center gap-1"><i data-lucide="check-circle" width="12"></i> Coupon Applied Successfully!</p>' : ''}
        </div>

        <div class="space-y-3">
            <button id="phonepe-btn" class="w-full bg-[#5f259f] text-white py-4 rounded-xl font-bold shadow-lg shadow-purple-500/30 hover:scale-[1.02] transition flex items-center justify-center gap-2 relative overflow-hidden">
                <div class="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition"></div>
                <span>Continue with</span> <span class="font-black italic">PhonePe</span>
            </button>
            
            <div class="relative flex py-2 items-center"><div class="flex-grow border-t border-gray-200"></div><span class="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase">OR Scan QR</span><div class="flex-grow border-t border-gray-200"></div></div>
            
            <div class="bg-white p-6 rounded-2xl border border-gray-100 text-center">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=9732140742@ybl&am=${finalPrice}" class="w-32 h-32 mx-auto rounded-lg mb-4">
                <button id="manual-pay-btn" class="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm">I Have Paid (Manual Verify)</button>
            </div>
        </div>
        
        <div id="pay-modal" class="fixed inset-0 bg-black/80 z-50 hidden flex items-center justify-center backdrop-blur-sm">
            <div class="bg-white p-8 rounded-3xl text-center max-w-xs w-full animate-slide-up">
                <div class="w-16 h-16 border-4 border-[#5f259f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 class="text-lg font-bold text-gray-800">Processing Payment...</h3>
                <p class="text-xs text-gray-500 mt-2">Please do not close this window.</p>
            </div>
        </div>
    </div>`;
}

function attachPaymentLogic() {
    window.applyCoupon = () => {
        const code = document.getElementById('coupon-code').value.toUpperCase().trim();
        if(!code) return alert('Enter a code');
        const coupon = db.validateCoupon(code);
        if(coupon) {
            state.tempPayment = { couponApplied: code, discountAmount: parseInt(coupon.amount) };
            renderApp();
        } else {
            alert('Invalid Coupon Code');
        }
    };
    window.removeCoupon = () => { state.tempPayment = { couponApplied: null, discountAmount: 0 }; renderApp(); };

    document.getElementById('phonepe-btn').onclick = async () => {
        const modal = document.getElementById('pay-modal');
        modal.classList.remove('hidden');
        await new Promise(r => setTimeout(r, 2500));
        const b = BATCHES.find(x => x.id === state.params.id);
        const discount = state.tempPayment.discountAmount || 0;
        const finalPrice = Math.max(0, b.price - discount);

        db.createRequest({
            id: Date.now().toString(),
            userId: state.user.id,
            userName: state.user.name,
            userEmail: state.user.email,
            batchId: b.id,
            batchName: b.name,
            amount: finalPrice,
            timestamp: Date.now(),
            status: 'pending',
            method: 'PhonePe Gateway'
        });
        modal.classList.add('hidden');
        alert('Payment Successful via PhonePe! Enrollment request sent.');
        navigate('profile');
    };

    document.getElementById('manual-pay-btn').onclick = () => {
        const b = BATCHES.find(x => x.id === state.params.id);
        const discount = state.tempPayment.discountAmount || 0;
        const finalPrice = Math.max(0, b.price - discount);
        db.createRequest({
            id: Date.now().toString(),
            userId: state.user.id,
            userName: state.user.name,
            userEmail: state.user.email,
            batchId: b.id,
            batchName: b.name,
            amount: finalPrice,
            timestamp: Date.now(),
            status: 'pending',
            method: 'Manual UPI'
        });
        alert('Manual payment request submitted! Admin will verify.');
        navigate('profile');
    };
}

function pageSubjects() {
    const b = BATCHES.find(x => x.id === state.params.id);
    if(!state.user.enrolledBatches.includes(b.id)) { navigate('payment', {id: b.id}); return ''; }
    return `<div class="pb-10"><div class="bg-indigo-600 -m-4 p-8 pb-12 mb-6 text-white rounded-b-[40px] shadow-lg"><button onclick="navigate('classes')" class="mb-4 text-white/80 hover:text-white"><i data-lucide="arrow-left"></i></button><h1 class="text-3xl font-black">${b.batchName}</h1><p class="text-indigo-200 mt-2">Select a subject to continue</p></div><div class="space-y-4 px-2 -mt-8">${b.subjects.map(sub => `<div data-link="chapters" data-params='{"bid":"${b.id}","sub":"${encodeURIComponent(sub)}"}' class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:border-indigo-300 transition group"><div class="flex items-center gap-4"><div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xl group-hover:bg-indigo-600 group-hover:text-white transition">${sub[0]}</div><h3 class="font-bold text-lg text-slate-800">${sub}</h3></div><div class="bg-gray-50 p-2 rounded-full group-hover:bg-indigo-50 transition"><i data-lucide="chevron-right" class="text-gray-400 group-hover:text-indigo-600"></i></div></div>`).join('')}</div></div>`;
}
function pageChapters() {
    const { bid, sub } = state.params; const sName = decodeURIComponent(sub); const chapters = db.getChapters(bid, sName);
    if(chapters.length === 0) { seedData().then(() => renderApp()); return '<div class="text-center mt-20"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div><p class="mt-4 text-gray-500">Loading Content...</p></div>'; }
    return `<div><div class="flex items-center gap-2 mb-6"><button onclick="navigate('subjects', {id:'${bid}'})" class="p-2 bg-white rounded-full border border-gray-200"><i data-lucide="arrow-left" width="18"></i></button><h1 class="text-xl font-bold truncate">${sName}</h1></div><div class="grid gap-3">${chapters.map((ch, idx) => `<div data-link="lectures" data-params='{"cid":"${ch.id}"}' class="bg-white p-5 rounded-2xl shadow-sm border-l-[6px] border-l-indigo-500 border-gray-100 cursor-pointer hover:shadow-md transition"><div class="text-[10px] font-extrabold text-indigo-500 uppercase tracking-wider mb-1">Chapter ${String(idx+1).padStart(2, '0')}</div><h3 class="font-bold text-lg text-gray-900">${ch.title}</h3><div class="mt-2 text-xs text-gray-400 font-bold flex items-center gap-1"><i data-lucide="play-circle" width="12"></i> View Lectures</div></div>`).join('')}</div></div>`;
}
function pageLectures() {
    const { cid } = state.params; const contents = db.getContent().filter(c => c.chapterId === cid); const progress = db.getUserProgress(state.user.id);
    return `<div><div class="flex items-center gap-2 mb-6"><button onclick="window.history.back()" class="p-2 bg-white rounded-full border border-gray-200"><i data-lucide="arrow-left" width="18"></i></button><h1 class="text-xl font-bold">Class Lectures</h1></div><div class="grid gap-4">${contents.map((c, idx) => { const done = progress.find(p => p.contentId === c.id && p.completed); return `<div data-link="player" data-params='{"id":"${c.id}"}' class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg transition group"><div class="aspect-video bg-slate-900 relative flex items-center justify-center overflow-hidden">${c.thumbnail ? `<img src="${c.thumbnail}" class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-500">` : `<div class="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"></div>`}<div class="absolute inset-0 flex items-center justify-center z-10"><div class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 group-hover:scale-110 transition">${done ? '<i data-lucide="check" class="text-green-400"></i>' : '<i data-lucide="play" fill="currentColor"></i>'}</div></div></div><div class="p-4"><h3 class="font-bold text-gray-800 line-clamp-1">${c.title}</h3><p class="text-xs text-gray-400 mt-1 line-clamp-2">${c.description || 'Start watching now...'}</p></div></div>`; }).join('')}${contents.length === 0 ? `<div class="text-center py-12 border-2 border-dashed border-gray-200 rounded-3xl"><div class="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400"><i data-lucide="video-off"></i></div><p class="text-gray-400 font-bold">No lectures uploaded yet.</p></div>` : ''}</div>${state.user.role === 'admin' ? `<button data-link="admin-upload" class="fixed bottom-24 right-6 w-14 h-14 bg-slate-900 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition z-50"><i data-lucide="plus"></i></button>` : ''}</div>`;
}
function pagePlayer() {
    const c = db.getContentById(state.params.id); if(!c) return '<div class="p-10 text-center">Video Not Found</div>';
    return `<div class="bg-black min-h-screen text-white flex flex-col"><div class="aspect-video bg-black relative sticky top-0 z-50">${c.videoUrl.includes('youtube') ? `<iframe src="${c.videoUrl}" class="w-full h-full" allowfullscreen allow="autoplay"></iframe>` : `<video id="video-el" controls class="w-full h-full" poster="${c.thumbnail || ''}"></video>`}<button onclick="window.history.back()" class="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur rounded-full hover:bg-black/60 transition"><i data-lucide="arrow-left"></i></button></div><div class="p-6 flex-1 bg-slate-900"><h1 class="text-xl font-bold leading-tight">${c.title}</h1><p class="text-slate-400 text-sm mt-3 leading-relaxed">${c.description}</p></div></div>`;
}
function attachPlayerLogic() {
    const c = db.getContentById(state.params.id);
    if(c && !c.videoUrl.includes('youtube')) {
        const video = document.getElementById('video-el');
        if(Hls.isSupported() && c.videoUrl.includes('.m3u8')) { const hls = new Hls(); hls.loadSource(c.videoUrl); hls.attachMedia(video); } else { video.src = c.videoUrl; }
        setInterval(() => { if(!video.paused) { db.saveProgress({ userId: state.user.id, contentId: c.id, batchId: c.batchId, chapterId: c.chapterId, watchedSeconds: Math.floor(video.currentTime), totalSeconds: c.duration || 600, lastUpdated: Date.now(), completed: false }); } }, 5000);
    }
}

// --- ADMIN PANEL (Enhanced with Stats & Users Tab) ---
function pageAdmin() {
    if(state.user.role !== 'admin') return '<div class="p-10 text-center text-red-500">Access Denied</div>';
    const reqs = db.getRequests();
    const coupons = db.getCoupons();
    const users = Object.values(db.getUsers());
    const tab = state.params.tab || 'requests';

    // Stats
    const totalUsers = users.length;
    const totalRevenue = reqs.filter(r => r.status === 'approved').reduce((acc, curr) => acc + (curr.amount || 0), 0);

    return `
    <div class="mb-6">
        <h2 class="text-2xl font-bold mb-4">Admin Dashboard</h2>
        
        <!-- Dashboard Stats -->
        <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div class="text-xs text-gray-500 font-bold uppercase mb-1">Total Students</div>
                <div class="text-2xl font-black text-indigo-600">${totalUsers}</div>
            </div>
            <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div class="text-xs text-gray-500 font-bold uppercase mb-1">Total Revenue</div>
                <div class="text-2xl font-black text-green-600">₹${totalRevenue.toLocaleString()}</div>
            </div>
        </div>

        <div class="flex justify-between items-center mb-4">
            <div class="flex p-1 bg-white border border-gray-200 rounded-xl overflow-x-auto no-scrollbar">
                <button onclick="navigate('admin', {tab:'requests'})" class="px-4 py-2 text-sm font-bold rounded-lg transition whitespace-nowrap ${tab==='requests' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}">Requests</button>
                <button onclick="navigate('admin', {tab:'coupons'})" class="px-4 py-2 text-sm font-bold rounded-lg transition whitespace-nowrap ${tab==='coupons' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}">Coupons</button>
                <button onclick="navigate('admin', {tab:'users'})" class="px-4 py-2 text-sm font-bold rounded-lg transition whitespace-nowrap ${tab==='users' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}">Users</button>
            </div>
            <button data-link="admin-upload" class="bg-indigo-600 text-white p-2 rounded-lg shadow-md hover:bg-indigo-700 ml-2"><i data-lucide="upload" class="w-5 h-5"></i></button>
        </div>
    </div>

    ${tab === 'requests' ? `
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex justify-between items-center"><span>Pending</span><span class="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">${reqs.filter(r=>r.status==='pending').length}</span></div>
            <div class="divide-y divide-gray-100">
                ${reqs.filter(r => r.status === 'pending').map(r => `
                    <div class="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                        <div>
                            <div class="font-bold text-slate-800">${r.userName}</div>
                            <div class="text-xs text-gray-500">${r.batchName} &bull; <span class="text-green-600 font-bold">₹${r.amount}</span></div>
                            <div class="text-[10px] text-gray-400 mt-1">${r.method || 'Manual'} &bull; ${new Date(r.timestamp).toLocaleString()}</div>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="approvePay('${r.id}')" class="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><i data-lucide="check"></i></button>
                            <button onclick="rejectPay('${r.id}')" class="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><i data-lucide="x"></i></button>
                        </div>
                    </div>`).join('')}
                ${reqs.filter(r => r.status === 'pending').length === 0 ? '<div class="p-8 text-center text-gray-400 text-sm">No pending requests found.</div>' : ''}
            </div>
        </div>
    ` : tab === 'users' ? `
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700">All Students</div>
            <div class="divide-y divide-gray-100">
                ${users.map(u => `
                    <div class="p-4 flex items-center gap-3 hover:bg-gray-50">
                        <img src="${u.avatar}" class="w-10 h-10 rounded-full bg-gray-200">
                        <div class="flex-1">
                            <div class="font-bold text-slate-800 text-sm">${u.name} ${u.role==='admin'?'(Admin)':''}</div>
                            <div class="text-xs text-gray-500">${u.email}</div>
                        </div>
                        <div class="text-xs font-bold ${u.isVerified ? 'text-green-600' : 'text-yellow-600'}">${u.isVerified ? 'Verified' : 'Pending'}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : `
        <div class="space-y-6">
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 class="font-bold text-gray-700 mb-3">Create Coupon</h3>
                <form id="create-coupon-form" class="flex gap-2">
                    <input type="text" id="new-code" placeholder="Code" required class="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm uppercase font-bold outline-none">
                    <input type="number" id="new-amount" placeholder="₹" required class="w-20 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none">
                    <button type="submit" class="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-sm">Add</button>
                </form>
            </div>
            
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700">Active Coupons</div>
                <div class="divide-y divide-gray-100">
                    ${coupons.map(c => `
                        <div class="p-4 flex justify-between items-center">
                            <div><div class="font-black text-slate-800">${c.code}</div><div class="text-xs text-green-600 font-bold">Flat ₹${c.amount} OFF</div></div>
                            <button onclick="deleteCoupon('${c.code}')" class="text-red-500 p-2 hover:bg-red-50 rounded-lg"><i data-lucide="trash-2" width="16"></i></button>
                        </div>
                    `).join('')}
                    ${coupons.length === 0 ? '<div class="p-6 text-center text-gray-400 text-sm">No active coupons.</div>' : ''}
                </div>
            </div>
        </div>
    `}`;
}

function attachAdminLogic() {
    window.approvePay = (id) => { if(confirm('Approve?')) { db.approveRequest(id); renderApp(); } };
    window.rejectPay = (id) => { if(confirm('Reject?')) { db.rejectRequest(id); renderApp(); } };
    
    const form = document.getElementById('create-coupon-form');
    if(form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const code = document.getElementById('new-code').value.toUpperCase().trim();
            const amount = document.getElementById('new-amount').value;
            db.saveCoupon({ code, amount });
            renderApp();
        };
    }
    window.deleteCoupon = (code) => { if(confirm('Delete?')) { db.deleteCoupon(code); renderApp(); } };
}

function pageAdminUpload() {
    if(state.user.role !== 'admin') return '<div class="p-10 text-center text-red-500">Access Denied</div>';
    const chapters = db._get(KEYS.CHAPTERS, []);
    return `<div><div class="flex items-center gap-2 mb-6"><button onclick="window.history.back()" class="p-2 bg-white rounded-full border border-gray-200"><i data-lucide="arrow-left" width="18"></i></button><h1 class="text-xl font-bold">Upload Content</h1></div><div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><form id="upload-form" class="space-y-4"><div><label class="block text-sm font-bold text-gray-700 mb-1">Select Chapter</label><select id="chapter-select" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"><option value="">-- Choose Chapter --</option>${chapters.map(c => `<option value="${c.id}">${c.title} (${c.subject})</option>`).join('')}</select></div><div><label class="block text-sm font-bold text-gray-700 mb-1">Title</label><input type="text" id="vid-title" required class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"></div><div><label class="block text-sm font-bold text-gray-700 mb-1">Description</label><textarea id="vid-desc" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"></textarea></div><div><label class="block text-sm font-bold text-gray-700 mb-1">Video URL (YouTube or HLS)</label><input type="text" id="vid-url" required placeholder="https://..." class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"></div><div><label class="block text-sm font-bold text-gray-700 mb-1">Thumbnail URL</label><input type="text" id="vid-thumb" placeholder="https://..." class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"></div><button type="submit" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition">Upload Video</button></form></div></div>`;
}
function attachAdminUploadLogic() {
    const form = document.getElementById('upload-form');
    if(form) {
        form.onsubmit = (e) => {
            e.preventDefault(); const chId = document.getElementById('chapter-select').value; const title = document.getElementById('vid-title').value; const desc = document.getElementById('vid-desc').value; const url = document.getElementById('vid-url').value; const thumb = document.getElementById('vid-thumb').value;
            if(!chId) { alert('Select chapter'); return; }
            const chapter = db.getChapters(null, null).find(c => c.id === chId) || {batchId:'8', chapterId: chId};
            db.saveContent({ id: Date.now().toString(), batchId: chapter.batchId, chapterId: chId, title, description: desc, videoUrl: url, thumbnail: thumb, duration: 600, type: 'video' });
            alert('Uploaded!'); navigate('lectures', {cid: chId});
        };
    }
}

function pageInbox() {
    const friends = state.user.friends || [];
    return `<h2 class="text-2xl font-bold mb-4">Messages</h2><div class="grid gap-3">${friends.length > 0 ? friends.map(fid => { const f = db.getUserById(fid); if(!f) return ''; const lastMsg = db.getMessages(state.user.id, fid).pop(); return `<div data-link="chat" data-params='{"fid":"${fid}"}' class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition"><img src="${f.avatar}" class="w-12 h-12 rounded-full border border-gray-200"><div class="flex-1"><div class="font-bold text-slate-800">${f.name}</div><div class="text-xs text-gray-500 truncate">${lastMsg ? lastMsg.text : 'Start chatting...'}</div></div><i data-lucide="chevron-right" class="text-gray-300"></i></div>`; }).join('') : `<div class="text-center py-10 bg-white rounded-2xl border border-dashed"><p class="text-gray-400 mb-4">No friends added yet.</p><button data-link="profile" class="text-indigo-600 font-bold text-sm hover:underline">Find Friends</button></div>`}</div>`;
}
function pageChat() {
    const fid = state.params.fid; const f = db.getUserById(fid); const msgs = db.getMessages(state.user.id, fid);
    return `<div class="flex flex-col h-[calc(100vh-140px)] bg-slate-50"><div class="flex items-center gap-3 p-4 bg-white border-b border-gray-200 shadow-sm sticky top-0"><button onclick="window.history.back()" class="text-gray-600"><i data-lucide="arrow-left"></i></button><img src="${f.avatar}" class="w-8 h-8 rounded-full"><span class="font-bold text-lg">${f.name}</span></div><div class="flex-1 overflow-y-auto p-4 space-y-3" id="chat-box">${msgs.map(m => `<div class="flex ${m.senderId === state.user.id ? 'justify-end' : 'justify-start'} animate-slide-up"><div class="px-4 py-2 rounded-2xl max-w-[80%] text-sm shadow-sm ${m.senderId === state.user.id ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 rounded-tl-none'}">${m.text}</div></div>`).join('')}</div><form id="chat-form" class="p-3 bg-white border-t border-gray-200 flex gap-2 items-center"><input type="text" id="chat-in" class="flex-1 bg-gray-100 rounded-full px-4 py-3 outline-none text-sm focus:ring-2 focus:ring-indigo-500/20 transition" placeholder="Type a message..." autocomplete="off"><button type="submit" class="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 transform hover:scale-110"><i data-lucide="send" width="18"></i></button></form></div>`;
}
function attachChatLogic() {
    const form = document.getElementById('chat-form');
    if(form) { const box = document.getElementById('chat-box'); box.scrollTop = box.scrollHeight; form.onsubmit = e => { e.preventDefault(); const input = document.getElementById('chat-in'); const txt = input.value.trim(); if(!txt) return; db.sendMessage({ id: Date.now().toString(), senderId: state.user.id, receiverId: state.params.fid, text: txt, timestamp: Date.now(), isRead: false }); renderApp(); }; }
}

function pageProfile() {
    const u = state.user;
    const otherUsers = Object.values(db.getUsers()).filter(x => x.id !== u.id);
    const myRequests = db.getRequests().filter(r => r.userId === u.id);
    return `
    <div class="space-y-6 pb-20">
        <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <div class="relative z-10 -mt-2"><img src="${u.avatar}" class="w-28 h-28 rounded-full mx-auto border-[6px] border-white shadow-lg object-cover bg-white"></div>
            <h2 class="text-2xl font-black mt-3 text-slate-800">${u.name}</h2><p class="text-slate-500 text-sm font-medium">${u.email}</p>
            <div class="mt-4 flex justify-center gap-2">
                <span class="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border border-indigo-100">${u.role}</span>
                ${u.isVerified ? '<span class="px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border border-green-100 flex items-center gap-1"><i data-lucide="shield-check" width="14"></i> Verified</span>' : '<span class="px-4 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border border-yellow-100 flex items-center gap-1"><i data-lucide="shield-alert" width="14"></i> Unverified</span>'}
            </div>
        </div>
        <div><h3 class="font-bold text-lg mb-3 px-2 flex items-center gap-2"><i data-lucide="history" class="text-indigo-600"></i> Enrollment History</h3><div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">${myRequests.length > 0 ? `<div class="divide-y divide-gray-50">${myRequests.map(r => `<div class="p-4 flex justify-between items-center"><div><div class="font-bold text-slate-700 text-sm">${r.batchName}</div><div class="text-[10px] text-gray-400 font-medium">${new Date(r.timestamp).toLocaleDateString()}</div></div><div>${r.status === 'approved' ? '<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold">Approved</span>' : r.status === 'rejected' ? '<span class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold">Rejected</span>' : '<span class="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-[10px] font-bold">Pending</span>'}</div></div>`).join('')}</div>` : `<div class="p-8 text-center"><div class="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"><i data-lucide="file-text" class="text-gray-300"></i></div><p class="text-gray-400 text-xs font-bold">No payment requests yet.</p></div>`}</div></div>
        <div><h3 class="font-bold text-lg mb-3 px-2 flex items-center gap-2"><i data-lucide="users" class="text-indigo-600"></i> Community</h3><div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">${otherUsers.length > 0 ? otherUsers.map(user => `<div class="p-4 flex justify-between items-center hover:bg-gray-50 transition"><div class="flex items-center gap-3"><img src="${user.avatar}" class="w-10 h-10 rounded-full border border-gray-100"><div><div class="font-bold text-sm text-slate-700">${user.name}</div><div class="text-[10px] text-gray-400">Student</div></div></div>${u.friends?.includes(user.id) ? '<span class="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">Connected</span>' : `<button onclick="requestFriend('${user.id}')" class="text-indigo-600 bg-indigo-50 p-2 rounded-full hover:bg-indigo-100 hover:scale-110 transition"><i data-lucide="user-plus" width="16"></i></button>`}</div>`).join('') : '<div class="p-6 text-center text-gray-400 text-sm">No other users found.</div>'}</div></div>
        <button onclick="db.clearSession(); renderApp();" class="w-full bg-red-50 text-red-600 font-bold py-4 rounded-xl border border-red-100 hover:bg-red-100 transition flex items-center justify-center gap-2"><i data-lucide="log-out" width="18"></i> Sign Out</button>
    </div>`;
}
window.requestFriend = (id) => { db.addFriend(state.user.id, id); alert('Friend added!'); renderApp(); };

function pagePurchases() {
    const enrolled = BATCHES.filter(b => state.user.enrolledBatches?.includes(b.id));
    return `<h2 class="text-2xl font-bold mb-6">My Enrolled Batches</h2><div class="grid gap-4">${enrolled.map(b => `<div data-link="subjects" data-params='{"id":"${b.id}"}' class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition group"><div class="flex justify-between items-center mb-2"><span class="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Active</span></div><h3 class="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition">${b.batchName}</h3><p class="text-sm text-gray-400 mt-1">Click to view subjects</p></div>`).join('')}${enrolled.length === 0 ? `<div class="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200"><div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400"><i data-lucide="book"></i></div><h3 class="font-bold text-gray-900">No enrollments yet</h3><p class="text-gray-400 text-sm mb-4">Explore batches and start learning.</p><button data-link="classes" class="text-indigo-600 font-bold hover:underline">Browse Batches</button></div>` : ''}</div>`;
}

// --- SETTINGS (Enhanced) ---
function pageSettings() {
    const u = state.user;
    return `
    <h2 class="text-2xl font-bold mb-6">Settings</h2>
    
    <!-- Profile Edit Section -->
    <div class="bg-white rounded-2xl border border-gray-100 p-5 mb-4 flex items-center gap-4">
        <img src="${u.avatar}" class="w-16 h-16 rounded-full border border-gray-100">
        <div>
            <h3 class="font-bold text-lg">${u.name}</h3>
            <p class="text-xs text-gray-500 mb-2">${u.email}</p>
            <button id="edit-profile-btn" class="text-indigo-600 text-xs font-bold hover:underline">Edit Profile</button>
        </div>
    </div>

    <div class="space-y-4">
        <div class="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-center">
            <div><h3 class="font-bold text-slate-800">Push Notifications</h3><p class="text-xs text-gray-400">Receive class updates</p></div>
            <div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in"><input type="checkbox" name="toggle" id="toggle" checked class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/><label for="toggle" class="toggle-label block overflow-hidden h-6 rounded-full bg-indigo-300 cursor-pointer"></label></div>
        </div>
        
        <button onclick="alert('Password reset link sent to email.')" class="w-full bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-center hover:bg-gray-50">
            <span class="font-bold text-slate-800">Change Password</span><i data-lucide="chevron-right" class="text-gray-400"></i>
        </button>

        <button onclick="localStorage.clear(); window.location.reload()" class="w-full bg-red-50 p-5 rounded-2xl border border-red-100 flex justify-between items-center hover:bg-red-100">
            <span class="font-bold text-red-600">Clear Cache & Reset App</span><i data-lucide="trash-2" class="text-red-400"></i>
        </button>
        
        <div class="text-center text-xs text-gray-300 mt-4 font-mono">v1.5.3 &bull; Build 2024</div>
    </div>
    <style>.toggle-checkbox:checked { right: 0; border-color: #68D391; } .toggle-checkbox:checked + .toggle-label { background-color: #68D391; } .toggle-checkbox { right: 0; transition: all 0.3s; }</style>`;
}

function attachSettingsLogic() {
    const btn = document.getElementById('edit-profile-btn');
    if(btn) {
        btn.onclick = () => {
            const newName = prompt("Enter new name:", state.user.name);
            if(newName && newName !== state.user.name) {
                const u = state.user;
                u.name = newName;
                db.saveUser(u);
                alert("Profile Updated!");
                renderApp();
            }
        };
    }
}

function pageHelp() {
    return `<h2 class="text-2xl font-bold mb-6">Help Center</h2><div class="space-y-4"><div class="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg mb-6"><h3 class="font-bold text-lg mb-2">Need Support?</h3><p class="text-sm opacity-90 mb-4">Our team is available 24/7.</p><a href="mailto:support@studyapp.com" class="inline-block bg-white text-indigo-700 px-4 py-2 rounded-lg font-bold text-sm">Contact Support</a></div><h3 class="font-bold text-gray-500 uppercase text-xs tracking-wider px-2">FAQ</h3><div class="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50"><details class="group p-4"><summary class="flex justify-between items-center font-bold cursor-pointer list-none"><span>How to enroll?</span><span class="transition group-open:rotate-180"><i data-lucide="chevron-down"></i></span></summary><p class="text-gray-500 text-sm mt-3 leading-relaxed">Select batch -> Enroll -> Pay via PhonePe or UPI -> Wait for approval.</p></details><details class="group p-4"><summary class="flex justify-between items-center font-bold cursor-pointer list-none"><span>Payment Pending?</span><span class="transition group-open:rotate-180"><i data-lucide="chevron-down"></i></span></summary><p class="text-gray-500 text-sm mt-3 leading-relaxed">Manual payments take 1-2 hours. PhonePe payments are faster.</p></details></div></div>`;
}

document.addEventListener('DOMContentLoaded', () => { seedData(); renderApp(); });
