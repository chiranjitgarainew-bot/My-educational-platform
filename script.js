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
// 2. DATABASE SERVICE (Local Storage)
// ==========================================

const KEYS = {
    USERS: 'app_users',
    SESSION: 'app_session',
    CONTENT: 'app_content',
    REQUESTS: 'app_requests',
    CHAPTERS: 'app_chapters',
    PROGRESS: 'app_progress',
    MESSAGES: 'app_messages'
};

const db = {
    _get(key, def) { 
        try { return JSON.parse(localStorage.getItem(key)) || def; } 
        catch { return def; } 
    },
    _save(key, val) { 
        localStorage.setItem(key, JSON.stringify(val)); 
    },

    // --- User Management ---
    getUsers() { return this._get(KEYS.USERS, {}); },
    getUser(email) { return this.getUsers()[email]; },
    getUserById(id) { return Object.values(this.getUsers()).find(u => u.id === id); },
    
    saveUser(user) {
        const users = this.getUsers();
        // First user becomes Admin automatically
        if (Object.keys(users).length === 0) { 
            user.role = 'admin'; 
            user.isVerified = true; 
        }
        users[user.email] = user;
        this._save(KEYS.USERS, users);
        
        // Update session if it's the current user
        const session = this.getSession();
        if(session && session.email === user.email) this.setSession(user);
        
        return user;
    },

    // --- Security: Session & Device ID ---
    initiateSession(email) {
        const users = this.getUsers();
        const user = users[email];
        if(!user) return null;

        // Generate new Device ID -> Kicks out other devices
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
        // If user deleted or device ID changed
        if(!user || user.deviceId !== session.deviceId) { 
            this.clearSession(); 
            return false; 
        }
        return true;
    },
    
    getSession() { return this._get(KEYS.SESSION, null); },
    setSession(u) { this._save(KEYS.SESSION, u); },
    clearSession() { localStorage.removeItem(KEYS.SESSION); },

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

    // --- Content & Chapters ---
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

    // --- Enrollment Requests (Payment) ---
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
            
            // Add batch to user's enrolled list
            const users = this.getUsers();
            const user = Object.values(users).find(u => u.id === req.userId);
            if(user) {
                user.enrolledBatches = user.enrolledBatches || [];
                if(!user.enrolledBatches.includes(req.batchId)) {
                    user.enrolledBatches.push(req.batchId);
                    users[user.email] = user; // Update map by email
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

    // --- Progress Tracking ---
    saveProgress(p) {
        const map = this._get(KEYS.PROGRESS, {});
        const key = `${p.userId}_${p.contentId}`;
        
        // Mark completed if > 90% watched
        if((p.watchedSeconds / p.totalSeconds) > 0.9) p.completed = true;
        else if(map[key]?.completed) p.completed = true; // Keep completed status
        
        map[key] = p;
        this._save(KEYS.PROGRESS, map);
    },
    getUserProgress(uid) {
        return Object.values(this._get(KEYS.PROGRESS, {})).filter(p => p.userId === uid);
    },

    // --- Social & Chat ---
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
            
            // Update session if needed
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
    checkInterval: null
};

// --- Navigation Helper ---
function navigate(route, params = {}) {
    state.route = route;
    state.params = params;
    renderApp();
    window.scrollTo(0, 0);
}

// --- Global Event Listener (for standard links) ---
document.addEventListener('click', e => {
    const link = e.target.closest('[data-link]');
    if(link) {
        e.preventDefault();
        const route = link.dataset.link;
        const params = link.dataset.params ? JSON.parse(link.dataset.params) : {};
        navigate(route, params);
    }
});

// --- Data Seeder (Runs once) ---
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

    // 1. Setup Security Interval (Single Device Check)
    if(!state.checkInterval) {
        state.checkInterval = setInterval(() => {
            if(state.user && !db.validateSession()) {
                clearInterval(state.checkInterval);
                state.checkInterval = null;
                state.user = null;
                db.clearSession();
                alert('You have been logged out because your account was accessed from another device.');
                renderApp();
            }
        }, 5000); // Check every 5s
    }

    // 2. Auth Check
    const session = db.getSession();
    if (!session) {
        state.user = null;
        app.innerHTML = renderAuthPage();
        attachAuthLogic();
    } else {
        if(!state.user) state.user = session; // Sync state
        app.innerHTML = renderLayout(renderCurrentPage());
        attachLayoutLogic();
        attachPageLogic();
    }
    
    // 3. Initialize Icons
    lucide.createIcons();
}

// ==========================================
// 5. VIEW COMPONENTS (HTML Templates)
// ==========================================

// --- AUTH PAGE ---
function renderAuthPage() {
    return `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
        <!-- Background Blobs -->
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
                <div id="name-field" class="hidden animate-slide-up">
                    <input type="text" id="name" placeholder="Full Name" class="w-full p-4 bg-white/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition">
                </div>
                <div>
                    <input type="email" id="email" placeholder="Email Address" required class="w-full p-4 bg-white/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition">
                </div>
                <div id="pass-field">
                    <input type="password" id="password" placeholder="Password" required class="w-full p-4 bg-white/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition">
                </div>
                <div id="otp-field" class="hidden animate-slide-up text-center">
                    <p class="text-xs font-bold text-yellow-600 bg-yellow-50 p-2 rounded mb-2 border border-yellow-100">Demo Code: 123456</p>
                    <input type="text" id="otp" placeholder="######" maxlength="6" class="w-full p-4 text-center tracking-[1em] font-extrabold border rounded-xl text-xl">
                </div>

                <div id="msg" class="text-center text-sm font-bold min-h-[20px] transition-colors"></div>

                <button type="submit" class="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    <span id="btn-text">Log In</span>
                </button>
            </form>
            
            <div class="mt-6 text-center">
                <button id="toggle-auth" class="text-indigo-600 font-bold hover:underline text-sm transition">Create Account</button>
            </div>
        </div>
    </div>`;
}

function attachAuthLogic() {
    const form = document.getElementById('auth-form');
    const toggle = document.getElementById('toggle-auth');
    const els = {
        name: document.getElementById('name-field'),
        pass: document.getElementById('pass-field'),
        otp: document.getElementById('otp-field'),
        title: document.getElementById('auth-title'),
        btn: document.getElementById('btn-text'),
        msg: document.getElementById('msg')
    };
    
    let mode = 'login'; // 'login' | 'signup' | 'verify'
    let tempEmail = '';

    toggle.onclick = () => {
        if(mode === 'login') {
            mode = 'signup';
            els.title.innerText = 'Join Us';
            els.btn.innerText = 'Sign Up';
            els.name.classList.remove('hidden');
            toggle.innerText = 'Back to Login';
            els.msg.innerText = '';
        } else {
            mode = 'login';
            els.title.innerText = 'Welcome Back';
            els.btn.innerText = 'Log In';
            els.name.classList.add('hidden');
            els.otp.classList.add('hidden');
            els.pass.classList.remove('hidden');
            toggle.innerText = 'Create Account';
            els.msg.innerText = '';
        }
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const pass = document.getElementById('password')?.value;
        const name = document.getElementById('name')?.value;
        const otp = document.getElementById('otp')?.value;

        els.msg.innerText = 'Processing...'; 
        els.msg.className = 'text-center text-blue-600 font-bold mb-2';
        
        await new Promise(r => setTimeout(r, 600)); // Simulate network

        if (mode === 'signup') {
            if(db.getUser(email)) {
                els.msg.innerText = 'Account already exists. Please login.';
                els.msg.className = 'text-center text-red-500 font-bold mb-2';
                return;
            }
            // Create user
            db.saveUser({
                id: Date.now().toString(),
                name, email, password: pass,
                role: 'student', isVerified: false, verificationCode: '123456',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g,'')}`,
                enrolledBatches: [], friends: []
            });
            // Switch to Verify
            mode = 'verify'; tempEmail = email;
            els.title.innerText = 'Verify Email';
            els.btn.innerText = 'Verify Code';
            els.name.classList.add('hidden'); els.pass.classList.add('hidden');
            els.otp.classList.remove('hidden');
            els.msg.innerText = 'Verification code sent to email (123456)';
            els.msg.className = 'text-center text-green-600 font-bold mb-2';
            
        } else if (mode === 'verify') {
            const res = db.verifyEmail(tempEmail, otp);
            if(res.success) {
                db.initiateSession(tempEmail);
                renderApp();
            } else {
                els.msg.innerText = res.msg;
                els.msg.className = 'text-center text-red-500 font-bold mb-2';
            }
        } else { // Login
            const u = db.getUser(email);
            if(!u || u.password !== pass) {
                els.msg.innerText = 'Invalid email or password.';
                els.msg.className = 'text-center text-red-500 font-bold mb-2';
                return;
            }
            if(!u.isVerified) {
                mode = 'verify'; tempEmail = email;
                u.verificationCode = '123456'; db.saveUser(u);
                els.title.innerText = 'Verify Email'; els.btn.innerText = 'Verify';
                els.pass.classList.add('hidden'); els.otp.classList.remove('hidden');
                els.msg.innerText = 'Account not verified. Code sent.';
                return;
            }
            // Success Login
            db.initiateSession(email);
            renderApp();
        }
    };
}

// --- MAIN LAYOUT ---
function renderLayout(content) {
    const u = state.user;
    return `
    <div class="min-h-screen bg-slate-50 flex flex-col">
        <!-- Header -->
        <header class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex justify-between items-center transition-all">
            <button id="menu-btn" class="p-2 hover:bg-gray-100 rounded-full transition"><i data-lucide="menu" class="text-gray-700"></i></button>
            <h1 class="font-bold text-indigo-600 text-lg tracking-tight">Study Platform</h1>
            <div class="cursor-pointer" data-link="profile">
                <img src="${u.avatar}" class="w-9 h-9 rounded-full border border-gray-300 shadow-sm hover:scale-105 transition">
            </div>
        </header>

        <!-- Sidebar -->
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
                <button id="logout-btn" class="w-full flex items-center px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition">
                    <i data-lucide="log-out" class="mr-3 w-5"></i> Sign Out
                </button>
            </nav>
        </div>

        <!-- Main Content -->
        <main class="flex-1 p-4 max-w-3xl mx-auto w-full animate-fade-in pb-24">
            ${content}
        </main>

        <!-- Bottom Navigation -->
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
    return `<button data-link="${route}" class="flex flex-col items-center w-full transition-all p-2 ${active}">
        <i data-lucide="${icon}" width="22" class="mb-1"></i>
        <span class="text-[10px] font-bold">${label}</span>
    </button>`;
}

function attachLayoutLogic() {
    const sb = document.getElementById('sidebar');
    const ov = document.getElementById('sidebar-overlay');
    
    document.getElementById('menu-btn').onclick = () => {
        sb.classList.remove('-translate-x-full');
        ov.classList.remove('hidden');
    };
    
    const close = () => {
        sb.classList.add('-translate-x-full');
        ov.classList.add('hidden');
    };
    
    document.getElementById('close-menu').onclick = close;
    ov.onclick = close;
    
    document.getElementById('logout-btn').onclick = () => {
        if(confirm('Are you sure you want to logout?')) {
            db.clearSession();
            renderApp();
        }
    };
}

// --- PAGE ROUTER ---
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
        case 'inbox': return pageInbox();
        case 'chat': return pageChat();
        case 'profile': return pageProfile();
        case 'purchases': return pagePurchases();
        default: return pageHome();
    }
}

function attachPageLogic() {
    if(state.route === 'admin') attachAdminLogic();
    if(state.route === 'payment') attachPaymentLogic();
    if(state.route === 'player') attachPlayerLogic();
    if(state.route === 'chat') attachChatLogic();
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
        <!-- Hero Card -->
        <div class="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-500/20">
            <div class="relative z-10">
                <h1 class="text-3xl font-extrabold mb-2">Hello, ${u.name.split(' ')[0]}! 👋</h1>
                <p class="text-indigo-100 opacity-90">Ready to start your learning journey today?</p>
                <button data-link="classes" class="mt-6 bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition transform inline-flex items-center gap-2">
                    Browse Batches <i data-lucide="arrow-right" width="18"></i>
                </button>
            </div>
            <!-- Decorative Blobs -->
            <div class="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div class="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/30 rounded-full blur-2xl -ml-10 -mb-10"></div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-4">
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2"><i data-lucide="clock"></i></div>
                <div class="text-3xl font-black text-slate-800">${watchHours}h</div>
                <div class="text-xs font-bold text-gray-400 uppercase tracking-wide">Watch Time</div>
            </div>
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <div class="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-2"><i data-lucide="check-circle"></i></div>
                <div class="text-3xl font-black text-slate-800">${completedLessons}</div>
                <div class="text-xs font-bold text-gray-400 uppercase tracking-wide">Completed</div>
            </div>
        </div>

        <!-- Quick Action -->
        <div data-link="purchases" class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center cursor-pointer hover:border-indigo-200 transition">
            <div class="flex items-center gap-4">
                <div class="bg-orange-100 p-3 rounded-xl text-orange-600"><i data-lucide="play-circle"></i></div>
                <div>
                    <h3 class="font-bold text-lg">Resume Learning</h3>
                    <p class="text-gray-400 text-xs">Continue where you left off</p>
                </div>
            </div>
            <i data-lucide="chevron-right" class="text-gray-300"></i>
        </div>
    </div>`;
}

function pageClasses() {
    return `
    <h2 class="text-2xl font-black text-slate-800 mb-5">Explore Batches</h2>
    <div class="grid gap-6">
        ${BATCHES.map(b => {
            const isEnrolled = state.user.enrolledBatches?.includes(b.id);
            return `
            <div data-link="batch" data-params='{"id":"${b.id}"}' class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div class="h-28 ${b.color} relative p-4 flex flex-col justify-between">
                    <span class="bg-white/90 text-xs font-bold px-3 py-1 rounded-full self-start shadow-sm flex items-center gap-1">
                        ${isEnrolled ? '<i data-lucide="check" width="12" class="text-green-600"></i> Enrolled' : '<i data-lucide="star" width="12" class="text-yellow-500"></i> 2024-25 Batch'}
                    </span>
                </div>
                <div class="p-6 relative">
                    <div class="absolute -top-8 right-6 w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
                        <i data-lucide="book-open" class="text-indigo-600"></i>
                    </div>
                    <h3 class="text-xl font-bold text-slate-800 pr-10">${b.name}</h3>
                    <p class="text-sm text-slate-500 mt-2 line-clamp-2">${b.description}</p>
                    <div class="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                        <div class="text-xs font-bold text-gray-400 flex items-center gap-1">
                            <i data-lucide="layers" width="14"></i> ${b.subjects.length} Subjects
                        </div>
                        <span class="text-indigo-600 text-sm font-bold flex items-center gap-1">Details <i data-lucide="arrow-right" width="14"></i></span>
                    </div>
                </div>
            </div>`;
        }).join('')}
    </div>`;
}

function pageBatchDetails() {
    const b = BATCHES.find(x => x.id === state.params.id);
    const isEnrolled = state.user.enrolledBatches?.includes(b.id);

    return `
    <div class="space-y-5">
        <button onclick="window.history.back()" class="flex items-center text-gray-500 font-bold hover:text-gray-800 transition">
            <i data-lucide="arrow-left" width="20" class="mr-1"></i> Back
        </button>
        
        <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 ${b.color} opacity-10 rounded-bl-full"></div>
            <h1 class="text-2xl font-black text-gray-900 mb-2">${b.batchName}</h1>
            <p class="text-gray-500 leading-relaxed">${b.description}</p>
            
            <div class="mt-6">
                <h4 class="font-bold text-gray-800 mb-3 text-sm uppercase">Subjects Included</h4>
                <div class="flex flex-wrap gap-2">
                    ${b.subjects.map(s => `
                        <span class="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-600 flex items-center gap-2">
                            <div class="w-2 h-2 rounded-full ${b.color}"></div> ${s}
                        </span>
                    `).join('')}
                </div>
            </div>
        </div>

        <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg sticky bottom-24">
            ${isEnrolled ? `
                <div class="text-center">
                    <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <i data-lucide="check" width="32"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800">You are Enrolled!</h3>
                    <p class="text-sm text-gray-500 mb-6">Start watching your lessons now.</p>
                    <button data-link="subjects" data-params='{"id":"${b.id}"}' class="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-indigo-500/30 transition">
                        Start Learning
                    </button>
                </div>
            ` : `
                <div class="flex justify-between items-end mb-6">
                    <div>
                        <p class="text-sm text-gray-400 font-bold">Total Price</p>
                        <div class="flex items-baseline gap-2">
                            <span class="text-3xl font-black text-gray-900">₹${b.price}</span>
                            <span class="text-lg text-gray-400 line-through">₹${b.originalPrice}</span>
                        </div>
                    </div>
                    <div class="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold">
                        ${b.discount}% OFF
                    </div>
                </div>
                <button data-link="payment" data-params='{"id":"${b.id}"}' class="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 rounded-xl font-bold shadow-lg hover:scale-[1.02] transition">
                    Enroll Now
                </button>
            `}
        </div>
    </div>`;
}

function pagePayment() {
    const b = BATCHES.find(x => x.id === state.params.id);
    return `
    <div>
        <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
            <button onclick="window.history.back()"><i data-lucide="arrow-left"></i></button> Payment
        </h2>
        
        <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center mb-6 relative overflow-hidden">
            <div class="text-3xl font-black mb-6">₹${b.price}</div>
            
            <div class="bg-white p-2 inline-block rounded-xl border-2 border-gray-900 mb-4">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=9732140742@ybl&am=${b.price}" 
                     class="w-48 h-48 rounded-lg" alt="QR Code">
            </div>
            
            <p class="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Scan with any UPI App</p>
            <div class="flex justify-center gap-4 text-gray-400">
                <span class="text-xs">GPay</span> &bull; <span class="text-xs">PhonePe</span> &bull; <span class="text-xs">Paytm</span>
            </div>
        </div>

        <div class="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-xs mb-6 border border-yellow-100">
            <strong>Note:</strong> After payment, click the button below. Admin will verify and approve your enrollment.
        </div>
        
        <button id="confirm-payment-btn" class="w-full bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-500/30 hover:scale-[1.02] transition">
            I Have Paid
        </button>
    </div>`;
}

function attachPaymentLogic() {
    document.getElementById('confirm-payment-btn').onclick = () => {
        const b = BATCHES.find(x => x.id === state.params.id);
        
        db.createRequest({
            id: Date.now().toString(),
            userId: state.user.id,
            userName: state.user.name,
            userEmail: state.user.email,
            batchId: b.id,
            batchName: b.name,
            amount: b.price,
            timestamp: Date.now(),
            status: 'pending'
        });
        
        alert('Payment request submitted! Admin will approve it shortly.');
        navigate('classes');
    };
}

function pageSubjects() {
    const b = BATCHES.find(x => x.id === state.params.id);
    if(!state.user.enrolledBatches.includes(b.id)) { 
        navigate('payment', {id: b.id}); 
        return ''; 
    }

    return `
    <div class="pb-10">
        <div class="bg-indigo-600 -m-4 p-8 pb-12 mb-6 text-white rounded-b-[40px] shadow-lg">
             <button onclick="navigate('classes')" class="mb-4 text-white/80 hover:text-white"><i data-lucide="arrow-left"></i></button>
             <h1 class="text-3xl font-black">${b.batchName}</h1>
             <p class="text-indigo-200 mt-2">Select a subject to continue</p>
        </div>
        
        <div class="space-y-4 px-2 -mt-8">
            ${b.subjects.map(sub => `
                <div data-link="chapters" data-params='{"bid":"${b.id}","sub":"${encodeURIComponent(sub)}"}' 
                     class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:border-indigo-300 transition group">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xl group-hover:bg-indigo-600 group-hover:text-white transition">
                            ${sub[0]}
                        </div>
                        <h3 class="font-bold text-lg text-slate-800">${sub}</h3>
                    </div>
                    <div class="bg-gray-50 p-2 rounded-full group-hover:bg-indigo-50 transition">
                        <i data-lucide="chevron-right" class="text-gray-400 group-hover:text-indigo-600"></i>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>`;
}

function pageChapters() {
    const { bid, sub } = state.params;
    const sName = decodeURIComponent(sub);
    const chapters = db.getChapters(bid, sName);

    // Seed data if empty for demo
    if(chapters.length === 0) {
        seedData().then(() => renderApp());
        return '<div class="text-center mt-20"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div><p class="mt-4 text-gray-500">Loading Content...</p></div>';
    }

    return `
    <div>
        <div class="flex items-center gap-2 mb-6">
            <button onclick="navigate('subjects', {id:'${bid}'})" class="p-2 bg-white rounded-full border border-gray-200"><i data-lucide="arrow-left" width="18"></i></button>
            <h1 class="text-xl font-bold truncate">${sName}</h1>
        </div>
        
        <div class="grid gap-3">
            ${chapters.map((ch, idx) => `
                <div data-link="lectures" data-params='{"cid":"${ch.id}"}' 
                     class="bg-white p-5 rounded-2xl shadow-sm border-l-[6px] border-l-indigo-500 border-gray-100 cursor-pointer hover:shadow-md transition">
                    <div class="text-[10px] font-extrabold text-indigo-500 uppercase tracking-wider mb-1">Chapter ${String(idx+1).padStart(2, '0')}</div>
                    <h3 class="font-bold text-lg text-gray-900">${ch.title}</h3>
                    <div class="mt-2 text-xs text-gray-400 font-bold flex items-center gap-1">
                        <i data-lucide="play-circle" width="12"></i> View Lectures
                    </div>
                </div>
            `).join('')}
        </div>
    </div>`;
}

function pageLectures() {
    const { cid } = state.params;
    const contents = db.getContent().filter(c => c.chapterId === cid);
    const progress = db.getUserProgress(state.user.id);

    return `
    <div>
        <div class="flex items-center gap-2 mb-6">
            <button onclick="window.history.back()" class="p-2 bg-white rounded-full border border-gray-200"><i data-lucide="arrow-left" width="18"></i></button>
            <h1 class="text-xl font-bold">Class Lectures</h1>
        </div>

        <div class="grid gap-4">
            ${contents.map((c, idx) => {
                const done = progress.find(p => p.contentId === c.id && p.completed);
                return `
                <div data-link="player" data-params='{"id":"${c.id}"}' class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg transition group">
                    <div class="aspect-video bg-slate-900 relative flex items-center justify-center overflow-hidden">
                        ${c.thumbnail 
                            ? `<img src="${c.thumbnail}" class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-500">` 
                            : `<div class="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"></div>`
                        }
                        <div class="absolute inset-0 flex items-center justify-center z-10">
                            <div class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 group-hover:scale-110 transition">
                                ${done ? '<i data-lucide="check" class="text-green-400"></i>' : '<i data-lucide="play" fill="currentColor"></i>'}
                            </div>
                        </div>
                    </div>
                    <div class="p-4">
                        <h3 class="font-bold text-gray-800 line-clamp-1">${c.title}</h3>
                        <p class="text-xs text-gray-400 mt-1 line-clamp-2">${c.description || 'Start watching now...'}</p>
                    </div>
                </div>`;
            }).join('')}
            
            ${contents.length === 0 ? `
                <div class="text-center py-12 border-2 border-dashed border-gray-200 rounded-3xl">
                    <div class="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400"><i data-lucide="video-off"></i></div>
                    <p class="text-gray-400 font-bold">No lectures uploaded yet.</p>
                </div>
            ` : ''}
        </div>

        ${state.user.role === 'admin' ? `
            <button onclick="alert('Please use the desktop admin portal to upload videos.');" 
                    class="fixed bottom-24 right-6 w-14 h-14 bg-slate-900 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition z-50">
                <i data-lucide="plus"></i>
            </button>
        ` : ''}
    </div>`;
}

function pagePlayer() {
    const c = db.getContentById(state.params.id);
    if(!c) return '<div class="p-10 text-center">Video Not Found</div>';

    return `
    <div class="bg-black min-h-screen text-white flex flex-col">
        <div class="aspect-video bg-black relative sticky top-0 z-50">
            ${c.videoUrl.includes('youtube') 
                ? `<iframe src="${c.videoUrl}" class="w-full h-full" allowfullscreen allow="autoplay"></iframe>` 
                : `<video id="video-el" controls class="w-full h-full" poster="${c.thumbnail || ''}"></video>`
            }
            <button onclick="window.history.back()" class="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur rounded-full hover:bg-black/60 transition"><i data-lucide="arrow-left"></i></button>
        </div>
        <div class="p-6 flex-1 bg-slate-900">
            <h1 class="text-xl font-bold leading-tight">${c.title}</h1>
            <p class="text-slate-400 text-sm mt-3 leading-relaxed">${c.description}</p>
        </div>
    </div>`;
}

function attachPlayerLogic() {
    const c = db.getContentById(state.params.id);
    if(c && !c.videoUrl.includes('youtube')) {
        const video = document.getElementById('video-el');
        
        // HLS Support
        if(Hls.isSupported() && c.videoUrl.includes('.m3u8')) {
            const hls = new Hls();
            hls.loadSource(c.videoUrl);
            hls.attachMedia(video);
        } else {
            video.src = c.videoUrl;
        }

        // Save Progress every 5s
        const interval = setInterval(() => {
            if(!video.paused) {
                db.saveProgress({
                    userId: state.user.id,
                    contentId: c.id,
                    batchId: c.batchId,
                    chapterId: c.chapterId,
                    watchedSeconds: Math.floor(video.currentTime),
                    totalSeconds: c.duration || 600, // Default 10 mins if not set
                    lastUpdated: Date.now(),
                    completed: false
                });
            }
        }, 5000);

        // Cleanup on navigate away is handled by replacing innerHTML (script re-runs)
        // But for cleaner SPA, listeners should be removed. 
        // In this simple architecture, replacing DOM kills the listener references automatically.
    }
}

// --- ADMIN PANEL ---
function pageAdmin() {
    const reqs = db.getRequests();
    return `
    <h2 class="text-2xl font-bold mb-6">Admin Dashboard</h2>
    
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex justify-between items-center">
            <span>Pending Requests</span>
            <span class="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">${reqs.filter(r=>r.status==='pending').length}</span>
        </div>
        
        <div class="divide-y divide-gray-100">
            ${reqs.filter(r => r.status === 'pending').map(r => `
                <div class="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                    <div>
                        <div class="font-bold text-slate-800">${r.userName}</div>
                        <div class="text-xs text-gray-500">${r.batchName} &bull; <span class="text-green-600 font-bold">₹${r.amount}</span></div>
                        <div class="text-[10px] text-gray-400 mt-1">${new Date(r.timestamp).toLocaleString()}</div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="approvePay('${r.id}')" class="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><i data-lucide="check"></i></button>
                        <button onclick="rejectPay('${r.id}')" class="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><i data-lucide="x"></i></button>
                    </div>
                </div>
            `).join('')}
            
            ${reqs.filter(r => r.status === 'pending').length === 0 ? '<div class="p-8 text-center text-gray-400 text-sm">No pending requests found.</div>' : ''}
        </div>
    </div>`;
}

function attachAdminLogic() {
    window.approvePay = (id) => { 
        if(confirm('Approve this enrollment?')) {
            db.approveRequest(id); 
            renderApp(); 
        }
    };
    window.rejectPay = (id) => { 
        if(confirm('Reject this request?')) {
            db.rejectRequest(id); 
            renderApp(); 
        }
    };
}

// --- SOCIAL / CHAT ---
function pageInbox() {
    const friends = state.user.friends || [];
    return `
    <h2 class="text-2xl font-bold mb-4">Messages</h2>
    <div class="grid gap-3">
        ${friends.length > 0 ? friends.map(fid => {
            const f = db.getUserById(fid);
            if(!f) return '';
            const lastMsg = db.getMessages(state.user.id, fid).pop();
            return `
            <div data-link="chat" data-params='{"fid":"${fid}"}' class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition">
                <img src="${f.avatar}" class="w-12 h-12 rounded-full border border-gray-200">
                <div class="flex-1">
                    <div class="font-bold text-slate-800">${f.name}</div>
                    <div class="text-xs text-gray-500 truncate">${lastMsg ? lastMsg.text : 'Start chatting...'}</div>
                </div>
                <i data-lucide="chevron-right" class="text-gray-300"></i>
            </div>`;
        }).join('') : `
            <div class="text-center py-10 bg-white rounded-2xl border border-dashed">
                <p class="text-gray-400 mb-4">No friends added yet.</p>
                <button data-link="profile" class="text-indigo-600 font-bold text-sm hover:underline">Find Friends</button>
            </div>
        `}
    </div>`;
}

function pageChat() {
    const fid = state.params.fid;
    const f = db.getUserById(fid);
    const msgs = db.getMessages(state.user.id, fid);
    
    return `
    <div class="flex flex-col h-[calc(100vh-140px)] bg-slate-50">
        <div class="flex items-center gap-3 p-4 bg-white border-b border-gray-200 shadow-sm sticky top-0">
            <button onclick="window.history.back()" class="text-gray-600"><i data-lucide="arrow-left"></i></button>
            <img src="${f.avatar}" class="w-8 h-8 rounded-full">
            <span class="font-bold text-lg">${f.name}</span>
        </div>
        
        <div class="flex-1 overflow-y-auto p-4 space-y-3" id="chat-box">
            ${msgs.map(m => `
                <div class="flex ${m.senderId === state.user.id ? 'justify-end' : 'justify-start'} animate-slide-up">
                    <div class="px-4 py-2 rounded-2xl max-w-[80%] text-sm shadow-sm ${
                        m.senderId === state.user.id 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white border border-gray-200 rounded-tl-none'
                    }">
                        ${m.text}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <form id="chat-form" class="p-3 bg-white border-t border-gray-200 flex gap-2 items-center">
            <input type="text" id="chat-in" class="flex-1 bg-gray-100 rounded-full px-4 py-3 outline-none text-sm focus:ring-2 focus:ring-indigo-500/20 transition" placeholder="Type a message..." autocomplete="off">
            <button type="submit" class="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 transform hover:scale-110">
                <i data-lucide="send" width="18"></i>
            </button>
        </form>
    </div>`;
}

function attachChatLogic() {
    const form = document.getElementById('chat-form');
    if(form) {
        // Scroll to bottom
        const box = document.getElementById('chat-box');
        box.scrollTop = box.scrollHeight;
        
        form.onsubmit = e => {
            e.preventDefault();
            const input = document.getElementById('chat-in');
            const txt = input.value.trim();
            if(!txt) return;
            
            db.sendMessage({
                id: Date.now().toString(),
                senderId: state.user.id,
                receiverId: state.params.fid,
                text: txt,
                timestamp: Date.now(),
                isRead: false
            });
            renderApp(); // Re-render to show message
            // Note: In real app, you'd append DOM node instead of full re-render for performance
        };
    }
}

// --- PROFILE ---
function pageProfile() {
    const u = state.user;
    const otherUsers = Object.values(db.getUsers()).filter(x => x.id !== u.id);
    
    return `
    <div class="space-y-6">
        <div class="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <img src="${u.avatar}" class="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg relative z-10 -mt-10">
            <h2 class="text-2xl font-bold mt-4">${u.name}</h2>
            <p class="text-gray-500 text-sm">${u.email}</p>
            <div class="mt-4 flex justify-center gap-2">
                <span class="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600 uppercase tracking-wide">${u.role}</span>
                ${u.isVerified ? '<span class="px-3 py-1 bg-green-100 rounded-full text-xs font-bold text-green-600 flex items-center gap-1"><i data-lucide="shield-check" width="12"></i> Verified</span>' : ''}
            </div>
        </div>

        <div>
            <h3 class="font-bold text-lg mb-4 px-2">Community & Friends</h3>
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                ${otherUsers.length > 0 ? otherUsers.map(user => `
                    <div class="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                        <div class="flex items-center gap-3">
                            <img src="${user.avatar}" class="w-10 h-10 rounded-full">
                            <div>
                                <div class="font-bold text-sm">${user.name}</div>
                                <div class="text-[10px] text-gray-400">Student</div>
                            </div>
                        </div>
                        ${u.friends?.includes(user.id) 
                            ? '<span class="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded">Friend</span>' 
                            : `<button onclick="requestFriend('${user.id}')" class="text-indigo-600 bg-indigo-50 p-2 rounded-full hover:bg-indigo-100"><i data-lucide="user-plus" width="16"></i></button>`
                        }
                    </div>
                `).join('') : '<div class="p-6 text-center text-gray-400 text-sm">No other users found.</div>'}
            </div>
        </div>
    </div>`;
}

// Global function for onclick binding in HTML string
window.requestFriend = (id) => {
    db.addFriend(state.user.id, id);
    alert('Friend added successfully!');
    renderApp();
};

function pagePurchases() {
    const enrolled = BATCHES.filter(b => state.user.enrolledBatches?.includes(b.id));
    return `
    <h2 class="text-2xl font-bold mb-6">My Enrolled Batches</h2>
    <div class="grid gap-4">
        ${enrolled.map(b => `
            <div data-link="subjects" data-params='{"id":"${b.id}"}' class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition group">
                <div class="flex justify-between items-center mb-2">
                    <span class="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Active</span>
                </div>
                <h3 class="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition">${b.batchName}</h3>
                <p class="text-sm text-gray-400 mt-1">Click to view subjects</p>
            </div>
        `).join('')}
        
        ${enrolled.length === 0 ? `
            <div class="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                    <i data-lucide="book"></i>
                </div>
                <h3 class="font-bold text-gray-900">No enrollments yet</h3>
                <p class="text-gray-400 text-sm mb-4">Explore batches and start learning.</p>
                <button data-link="classes" class="text-indigo-600 font-bold hover:underline">Browse Batches</button>
            </div>
        ` : ''}
    </div>`;
}

// ==========================================
// 7. INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Check local storage availability
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
    } catch(e) {
        alert('Local Storage is disabled. This app requires Local Storage to function.');
        return;
    }
    
    // Seed initial content if needed
    seedData();
    
    // Start App
    renderApp();
});
