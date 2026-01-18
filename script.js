/**
 * SINGLE FILE LOGIC: DB, Auth, Router, Components
 */

// --- 1. DATA & CONSTANTS ---

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

// --- 2. LOCAL DATABASE SERVICE ---

const DB_KEY = 'sp_users';
const SESSION_KEY = 'sp_session';
const CONTENT_KEY = 'sp_content';
const REQ_KEY = 'sp_requests';
const CHAP_KEY = 'sp_chapters';
const PROG_KEY = 'sp_progress';
const MSG_KEY = 'sp_messages';

const db = {
    _get(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch { return d; } },
    _save(k, v) { localStorage.setItem(k, JSON.stringify(v)); },

    // Users & Session
    getUsers() { return this._get(DB_KEY, {}); },
    getUser(email) { return this.getUsers()[email]; },
    saveUser(u) {
        const users = this.getUsers();
        if(Object.keys(users).length === 0) { u.role = 'admin'; u.isVerified = true; }
        users[u.email] = u;
        this._save(DB_KEY, users);
        const s = this.getSession();
        if(s && s.email === u.email) this.setSession(u);
        return u;
    },
    
    // Security: One Device Login
    initiateSession(email) {
        const users = this.getUsers();
        const u = users[email];
        if(!u) return null;
        u.deviceId = 'dev_' + Date.now() + Math.random().toString(36).substr(2,5);
        u.lastLogin = Date.now();
        users[email] = u;
        this._save(DB_KEY, users);
        this.setSession(u);
        return u;
    },
    validateSession() {
        const s = this.getSession();
        if(!s) return false;
        const u = this.getUser(s.email);
        if(!u || u.deviceId !== s.deviceId) { this.clearSession(); return false; }
        return true;
    },
    getSession() { return this._get(SESSION_KEY, null); },
    setSession(u) { this._save(SESSION_KEY, u); },
    clearSession() { localStorage.removeItem(SESSION_KEY); },

    verifyEmail(email, code) {
        const users = this.getUsers();
        const u = users[email];
        if(u && u.verificationCode === code) {
            u.isVerified = true;
            delete u.verificationCode;
            users[email] = u;
            this._save(DB_KEY, users);
            return {success: true};
        }
        return {success: false, msg: 'Invalid Code'};
    },

    // Content & Chapters
    getContent() { return this._get(CONTENT_KEY, []); },
    saveContent(c) { 
        const all = this.getContent(); 
        all.unshift(c); 
        this._save(CONTENT_KEY, all); 
    },
    deleteContent(id) {
        this._save(CONTENT_KEY, this.getContent().filter(c => c.id !== id));
    },
    getChapters(bid, sub) {
        return this._get(CHAP_KEY, []).filter(c => c.batchId === bid && c.subject === sub).sort((a,b)=>a.order-b.order);
    },
    seedChapters(list) {
        const all = this._get(CHAP_KEY, []);
        this._save(CHAP_KEY, [...all, ...list]);
    },
    hasChapters(bid) { return this._get(CHAP_KEY, []).some(c => c.batchId === bid); },

    // Requests (Payment)
    getRequests() { return this._get(REQ_KEY, []); },
    createRequest(r) { 
        const all = this.getRequests(); 
        all.unshift(r); 
        this._save(REQ_KEY, all); 
    },
    approveRequest(id) {
        const reqs = this.getRequests();
        const r = reqs.find(x => x.id === id);
        if(r) {
            r.status = 'approved';
            this._save(REQ_KEY, reqs);
            const users = this.getUsers();
            const u = users[r.userEmail];
            if(u) {
                u.enrolledBatches = u.enrolledBatches || [];
                if(!u.enrolledBatches.includes(r.batchId)) u.enrolledBatches.push(r.batchId);
                this._save(DB_KEY, users);
            }
        }
    },

    // Progress
    saveProgress(p) {
        const map = this._get(PROG_KEY, {});
        const key = `${p.userId}_${p.contentId}`;
        if((p.watchedSeconds/p.totalSeconds) > 0.9) p.completed = true;
        else if(map[key]?.completed) p.completed = true;
        map[key] = p;
        this._save(PROG_KEY, map);
    },
    getUserProgress(uid) {
        return Object.values(this._get(PROG_KEY, {})).filter(p => p.userId === uid);
    },

    // Messages
    getMessages(u1, u2) {
        return this._get(MSG_KEY, []).filter(m => 
            (m.senderId === u1 && m.receiverId === u2) || (m.senderId === u2 && m.receiverId === u1)
        ).sort((a,b)=>a.timestamp-b.timestamp);
    },
    sendMessage(m) {
        const all = this._get(MSG_KEY, []);
        all.push(m);
        this._save(MSG_KEY, all);
    }
};

// --- 3. STATE & ROUTER ---

const state = {
    user: null,
    route: 'home',
    params: {},
    interval: null
};

function navigate(route, params = {}) {
    state.route = route;
    state.params = params;
    renderApp();
    window.scrollTo(0,0);
}

// Global Click Delegation for Links
document.addEventListener('click', e => {
    const link = e.target.closest('[data-link]');
    if(link) {
        e.preventDefault();
        navigate(link.dataset.link, link.dataset.params ? JSON.parse(link.dataset.params) : {});
    }
});

async function seed() {
    if(!db.hasChapters('8')) {
        const ch = [];
        for(let i=1; i<=5; i++) ch.push({ id:`s8_${i}`, batchId:'8', subject:'গণিত (Mathematics)', title:`Chapter ${i}: Demo Math`, order:i });
        db.seedChapters(ch);
    }
}

// --- 4. RENDERERS ---

function renderApp() {
    const app = document.getElementById('app');
    
    // Security Interval
    if(!state.interval) {
        state.interval = setInterval(() => {
            if(state.user && !db.validateSession()) {
                alert('Session expired. Logged in from another device.');
                state.user = null;
                db.clearSession();
                renderApp();
            }
        }, 5000);
    }

    const session = db.getSession();
    if(!session) {
        state.user = null;
        app.innerHTML = renderAuth();
        attachAuthListeners();
    } else {
        if(!state.user) state.user = session;
        app.innerHTML = renderLayout(getPageHTML());
        attachLayoutListeners();
        attachPageListeners();
    }
    lucide.createIcons();
}

// -- Auth Page --
function renderAuth() {
    return `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div class="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] animate-float"></div>
        <div class="glass w-full max-w-md rounded-3xl p-8 relative z-10 shadow-xl border border-white">
            <div class="text-center mb-8">
                <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg transform -rotate-3">
                    <i data-lucide="book-open" width="32"></i>
                </div>
                <h2 class="text-3xl font-extrabold text-slate-800" id="auth-title">Welcome Back</h2>
                <p class="text-slate-500 text-sm mt-2">Secure One-Device Login</p>
            </div>
            <form id="auth-form" class="space-y-5">
                <div id="name-field" class="hidden"><input type="text" id="name" placeholder="Full Name" class="w-full p-3.5 bg-white/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"></div>
                <div><input type="email" id="email" placeholder="Email Address" required class="w-full p-3.5 bg-white/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"></div>
                <div id="pass-field"><input type="password" id="password" placeholder="Password" required class="w-full p-3.5 bg-white/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"></div>
                <div id="otp-field" class="hidden text-center"><p class="text-xs text-yellow-600 bg-yellow-50 p-2 rounded mb-2">Demo OTP: 123456</p><input type="text" id="otp" placeholder="Enter 6-digit OTP" class="w-full p-3.5 text-center tracking-[1em] font-bold border rounded-xl"></div>
                <div id="msg" class="text-center text-sm font-bold min-h-[20px]"></div>
                <button type="submit" class="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg hover:scale-[1.02] transition-transform"><span id="btn-text">Log In</span></button>
            </form>
            <div class="mt-6 text-center"><button id="toggle-auth" class="text-indigo-600 font-bold hover:underline text-sm">Create Account</button></div>
        </div>
    </div>`;
}

function attachAuthListeners() {
    const form = document.getElementById('auth-form');
    const toggle = document.getElementById('toggle-auth');
    const fields = {
        name: document.getElementById('name-field'),
        pass: document.getElementById('pass-field'),
        otp: document.getElementById('otp-field'),
        title: document.getElementById('auth-title'),
        btn: document.getElementById('btn-text'),
        msg: document.getElementById('msg')
    };
    let mode = 'login', tempEmail = '';

    toggle.onclick = () => {
        if(mode === 'login') {
            mode = 'signup'; fields.title.innerText = 'Join Us'; fields.btn.innerText = 'Sign Up';
            fields.name.classList.remove('hidden'); toggle.innerText = 'Back to Login';
        } else {
            mode = 'login'; fields.title.innerText = 'Welcome Back'; fields.btn.innerText = 'Log In';
            fields.name.classList.add('hidden'); fields.otp.classList.add('hidden'); fields.pass.classList.remove('hidden');
            toggle.innerText = 'Create Account';
        }
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const pass = document.getElementById('password')?.value;
        const name = document.getElementById('name')?.value;
        const otp = document.getElementById('otp')?.value;
        
        fields.msg.innerText = 'Processing...'; fields.msg.className = 'text-center text-blue-500 font-bold';
        await new Promise(r => setTimeout(r, 600));

        if(mode === 'signup') {
            if(db.getUser(email)) { fields.msg.innerText = 'User exists'; fields.msg.className = 'text-center text-red-500'; return; }
            db.saveUser({
                id: Date.now().toString(), name, email, password: pass, role: 'student', isVerified: false, verificationCode: '123456',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`, enrolledBatches: []
            });
            mode = 'verify'; tempEmail = email;
            fields.title.innerText = 'Verify Email'; fields.btn.innerText = 'Verify';
            fields.name.classList.add('hidden'); fields.pass.classList.add('hidden'); fields.otp.classList.remove('hidden');
            fields.msg.innerText = 'Code sent (123456)';
        } else if (mode === 'verify') {
            const res = db.verifyEmail(tempEmail, otp);
            if(res.success) { db.initiateSession(tempEmail); renderApp(); }
            else { fields.msg.innerText = res.msg; fields.msg.className = 'text-center text-red-500'; }
        } else {
            const u = db.getUser(email);
            if(!u || u.password !== pass) { fields.msg.innerText = 'Invalid Credentials'; fields.msg.className = 'text-center text-red-500'; return; }
            if(!u.isVerified) {
                mode = 'verify'; tempEmail = email; u.verificationCode = '123456'; db.saveUser(u);
                fields.title.innerText = 'Verify Email'; fields.btn.innerText = 'Verify';
                fields.pass.classList.add('hidden'); fields.otp.classList.remove('hidden');
                fields.msg.innerText = 'Unverified. Code: 123456';
                return;
            }
            db.initiateSession(email);
            renderApp();
        }
    };
}

// -- Layout --
function renderLayout(content) {
    const u = state.user;
    return `
    <div class="min-h-screen bg-slate-50 flex flex-col">
        <header class="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
            <button id="menu-btn"><i data-lucide="menu"></i></button>
            <h1 class="font-bold text-indigo-600">Study Platform</h1>
            <img src="${u.avatar}" class="w-8 h-8 rounded-full border border-gray-300" data-link="profile">
        </header>
        <div id="sidebar-overlay" class="fixed inset-0 bg-black/50 z-40 hidden"></div>
        <div id="sidebar" class="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform -translate-x-full transition-transform duration-300">
            <div class="bg-indigo-600 p-6 text-white relative">
                <button id="close-menu" class="absolute top-4 right-4"><i data-lucide="x"></i></button>
                <div class="text-center mt-4">
                    <img src="${u.avatar}" class="w-16 h-16 rounded-full mx-auto border-4 border-white/20 mb-2">
                    <h3 class="font-bold">${u.name}</h3>
                    <p class="text-xs opacity-70 uppercase">${u.role}</p>
                </div>
            </div>
            <nav class="p-4 space-y-1">
                ${navItem('home', 'Home', 'home')}
                ${navItem('book-open', 'Classes', 'classes')}
                ${navItem('message-square', 'Inbox', 'inbox')}
                ${u.role === 'admin' ? navItem('settings', 'Admin', 'admin') : ''}
                <button id="logout" class="w-full flex items-center px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg mt-4"><i data-lucide="log-out" class="mr-3 w-5"></i> Sign Out</button>
            </nav>
        </div>
        <main class="flex-1 p-4 max-w-3xl mx-auto w-full animate-fade-in pb-24">${content}</main>
        <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 pb-safe">
            <div class="flex justify-around py-2 max-w-3xl mx-auto">
                ${btmItem('home', 'Home', 'home')}
                ${btmItem('book', 'My Batch', 'purchases')}
                ${btmItem('message-circle', 'Chat', 'inbox')}
                ${btmItem('user', 'Profile', 'profile')}
            </div>
        </nav>
    </div>`;
}

function navItem(i, l, r) { return `<button data-link="${r}" class="w-full flex items-center px-4 py-3 text-sm font-bold rounded-lg ${state.route===r?'bg-indigo-50 text-indigo-600':'text-gray-600'}"><i data-lucide="${i}" class="mr-3 w-5"></i> ${l}</button>`; }
function btmItem(i, l, r) { return `<button data-link="${r}" class="flex flex-col items-center w-full ${state.route===r?'text-indigo-600':'text-gray-400'}"><i data-lucide="${i}" width="24"></i><span class="text-[10px] font-bold mt-1">${l}</span></button>`; }

function attachLayoutListeners() {
    const sb = document.getElementById('sidebar'), ov = document.getElementById('sidebar-overlay');
    document.getElementById('menu-btn').onclick = () => { sb.classList.remove('-translate-x-full'); ov.classList.remove('hidden'); };
    const close = () => { sb.classList.add('-translate-x-full'); ov.classList.add('hidden'); };
    document.getElementById('close-menu').onclick = close; ov.onclick = close;
    document.getElementById('logout').onclick = () => { db.clearSession(); renderApp(); };
}

// -- Page Routing --
function getPageHTML() {
    switch(state.route) {
        case 'home': return pageHome();
        case 'classes': return pageClasses();
        case 'batch': return pageBatch();
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

function attachPageListeners() {
    if(state.route === 'admin') attachAdmin();
    if(state.route === 'payment') attachPayment();
    if(state.route === 'player') attachPlayer();
    if(state.route === 'chat') attachChat();
}

// --- Pages ---

function pageHome() {
    const u = state.user;
    const p = db.getUserProgress(u.id);
    const hrs = Math.round(p.reduce((a,b)=>a+b.watchedSeconds,0)/3600);
    return `
    <div class="space-y-6">
        <div class="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
            <h1 class="text-3xl font-extrabold relative z-10">Hello, ${u.name.split(' ')[0]}! 👋</h1>
            <p class="text-indigo-100 mt-2 relative z-10">Ready to learn something new?</p>
            <button data-link="classes" class="mt-6 bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold relative z-10">Browse Batches</button>
            <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100"><div class="text-xs font-bold text-gray-400">WATCH TIME</div><div class="text-2xl font-black">${hrs}h</div></div>
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100"><div class="text-xs font-bold text-gray-400">COMPLETED</div><div class="text-2xl font-black">${p.filter(x=>x.completed).length}</div></div>
        </div>
    </div>`;
}

function pageClasses() {
    return `
    <h2 class="text-2xl font-bold mb-4">Batches</h2>
    <div class="grid gap-4">
        ${BATCHES.map(b => `
        <div data-link="batch" data-params='{"id":"${b.id}"}' class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer">
            <div class="h-24 ${b.color} relative p-4"><span class="bg-white/90 px-2 py-1 rounded text-xs font-bold">${state.user.enrolledBatches?.includes(b.id)?'Enrolled':'Join Now'}</span></div>
            <div class="p-4">
                <h3 class="font-bold text-lg">${b.name}</h3>
                <p class="text-sm text-gray-500">${b.description}</p>
            </div>
        </div>`).join('')}
    </div>`;
}

function pageBatch() {
    const b = BATCHES.find(x => x.id === state.params.id);
    const enrolled = state.user.enrolledBatches?.includes(b.id);
    return `
    <div class="space-y-4">
        <button onclick="window.history.back()" class="flex items-center gap-2 font-bold text-gray-500"><i data-lucide="arrow-left"></i> Back</button>
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h1 class="text-2xl font-black">${b.batchName}</h1>
            <p class="text-gray-500 mt-2">${b.description}</p>
            <div class="mt-4 flex gap-2 flex-wrap">
                ${b.subjects.map(s => `<span class="px-2 py-1 bg-gray-100 rounded text-xs font-bold">${s}</span>`).join('')}
            </div>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-green-100 text-center">
            ${enrolled ? `
                <div class="text-green-600 font-bold text-xl mb-4">You are Enrolled!</div>
                <button data-link="subjects" data-params='{"id":"${b.id}"}' class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold">Start Learning</button>
            ` : `
                <div class="text-3xl font-black mb-4">₹${b.price}</div>
                <button data-link="payment" data-params='{"id":"${b.id}"}' class="w-full bg-green-600 text-white py-3 rounded-xl font-bold">Enroll Now</button>
            `}
        </div>
    </div>`;
}

function pagePayment() {
    const b = BATCHES.find(x => x.id === state.params.id);
    return `
    <div>
        <h2 class="text-xl font-bold mb-4">Pay for ${b.name}</h2>
        <div class="bg-white p-6 rounded-2xl border border-gray-100 text-center">
            <div class="text-2xl font-bold mb-4">₹${b.price}</div>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=9732140742@ybl&am=${b.price}" class="mx-auto border-4 border-black rounded-lg w-48">
            <p class="text-xs text-gray-400 mt-2">Scan with UPI</p>
        </div>
        <button id="paid-btn" class="w-full bg-green-600 text-white py-4 rounded-xl font-bold mt-4 shadow-lg">I Have Paid</button>
    </div>`;
}

function attachPayment() {
    document.getElementById('paid-btn').onclick = () => {
        const b = BATCHES.find(x => x.id === state.params.id);
        db.createRequest({
            id: Date.now().toString(), userId: state.user.id, userName: state.user.name, userEmail: state.user.email,
            batchId: b.id, batchName: b.name, amount: b.price, timestamp: Date.now(), status: 'pending'
        });
        alert('Request Sent! Wait for approval.');
        navigate('classes');
    };
}

function pageSubjects() {
    const b = BATCHES.find(x => x.id === state.params.id);
    if(!state.user.enrolledBatches.includes(b.id)) { navigate('payment', {id: b.id}); return ''; }
    return `
    <div>
        <button onclick="navigate('classes')" class="mb-4"><i data-lucide="arrow-left"></i></button>
        <h1 class="text-2xl font-bold mb-4">${b.batchName}</h1>
        <div class="grid gap-3">
            ${b.subjects.map(s => `
            <div data-link="chapters" data-params='{"bid":"${b.id}","sub":"${encodeURIComponent(s)}"}' class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center cursor-pointer">
                <span class="font-bold">${s}</span> <i data-lucide="chevron-right"></i>
            </div>`).join('')}
        </div>
    </div>`;
}

function pageChapters() {
    const { bid, sub } = state.params;
    const sName = decodeURIComponent(sub);
    const ch = db.getChapters(bid, sName);
    if(ch.length === 0) seed().then(() => renderApp());
    return `
    <div>
        <button onclick="navigate('subjects', {id:'${bid}'})" class="mb-4"><i data-lucide="arrow-left"></i></button>
        <h1 class="text-xl font-bold mb-4">${sName}</h1>
        <div class="grid gap-3">
            ${ch.map((c, i) => `
            <div data-link="lectures" data-params='{"cid":"${c.id}"}' class="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-indigo-500 cursor-pointer">
                <div class="text-xs font-bold text-indigo-500">CHAPTER ${i+1}</div>
                <div class="font-bold">${c.title}</div>
            </div>`).join('')}
            ${ch.length===0?'<p class="text-gray-400">Loading...</p>':''}
        </div>
    </div>`;
}

function pageLectures() {
    const { cid } = state.params;
    const all = db.getContent().filter(c => c.chapterId === cid);
    const prog = db.getUserProgress(state.user.id);
    return `
    <div>
        <button onclick="window.history.back()" class="mb-4"><i data-lucide="arrow-left"></i></button>
        <h1 class="text-xl font-bold mb-4">Lectures</h1>
        <div class="grid gap-4">
            ${all.map((c, i) => {
                const done = prog.find(p => p.contentId === c.id && p.completed);
                return `
                <div data-link="player" data-params='{"id":"${c.id}"}' class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer">
                    <div class="aspect-video bg-gray-900 relative flex items-center justify-center">
                        ${done ? '<i data-lucide="check-circle" class="text-green-500 w-12 h-12"></i>' : '<i data-lucide="play-circle" class="text-white w-12 h-12"></i>'}
                    </div>
                    <div class="p-4">
                        <div class="font-bold line-clamp-1">${c.title}</div>
                        <div class="text-xs text-gray-400 mt-1">${c.description || 'Watch Class'}</div>
                    </div>
                </div>`;
            }).join('')}
            ${all.length===0?'<div class="text-center p-10 border-2 border-dashed rounded-xl text-gray-400">No videos yet.</div>':''}
        </div>
        ${state.user.role==='admin'?`<button onclick="alert('Use desktop for upload')" class="fixed bottom-24 right-6 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-lg"><i data-lucide="plus"></i></button>`:''}
    </div>`;
}

function pagePlayer() {
    const c = db.getContentById(state.params.id);
    if(!c) return 'Video not found';
    return `
    <div class="bg-black min-h-screen text-white flex flex-col">
        <div class="aspect-video bg-black relative sticky top-0">
            ${c.videoUrl.includes('youtube') 
              ? `<iframe src="${c.videoUrl}" class="w-full h-full" allow="autoplay"></iframe>`
              : `<video id="video-el" controls class="w-full h-full"></video>`}
            <button onclick="window.history.back()" class="absolute top-4 left-4 p-2 bg-black/50 rounded-full"><i data-lucide="arrow-left"></i></button>
        </div>
        <div class="p-6">
            <h1 class="font-bold text-lg">${c.title}</h1>
            <p class="text-gray-400 text-sm mt-2">${c.description}</p>
        </div>
    </div>`;
}

function attachPlayer() {
    const c = db.getContentById(state.params.id);
    if(c && !c.videoUrl.includes('youtube')) {
        const v = document.getElementById('video-el');
        if(Hls.isSupported() && c.videoUrl.includes('.m3u8')) {
            const h = new Hls(); h.loadSource(c.videoUrl); h.attachMedia(v);
        } else v.src = c.videoUrl;
        
        setInterval(() => {
            if(!v.paused) db.saveProgress({
                userId: state.user.id, contentId: c.id, batchId: c.batchId, chapterId: c.chapterId,
                watchedSeconds: Math.floor(v.currentTime), totalSeconds: c.duration||600, lastUpdated: Date.now(), completed: false
            });
        }, 5000);
    }
}

function pageAdmin() {
    const reqs = db.getRequests();
    return `
    <h2 class="font-bold text-xl mb-4">Admin</h2>
    <div class="bg-white rounded-xl border border-gray-100 mb-6">
        <div class="p-4 bg-gray-50 border-b font-bold">Requests</div>
        ${reqs.filter(r=>r.status==='pending').map(r => `
        <div class="p-4 border-b flex justify-between items-center">
            <div><div class="font-bold">${r.userName}</div><div class="text-xs">${r.batchName}</div></div>
            <div class="flex gap-2">
                <button onclick="appr('${r.id}')" class="text-green-600"><i data-lucide="check-circle"></i></button>
                <button onclick="rej('${r.id}')" class="text-red-600"><i data-lucide="x-circle"></i></button>
            </div>
        </div>`).join('')}
        ${reqs.length===0?'<div class="p-4 text-gray-400">No requests</div>':''}
    </div>`;
}

function attachAdmin() {
    window.appr = (id) => { db.approveRequest(id); renderApp(); };
    window.rej = (id) => { db.rejectRequest(id); renderApp(); };
}

function pageInbox() {
    const friends = state.user.friends || [];
    return `
    <h2 class="font-bold text-xl mb-4">Messages</h2>
    <div class="grid gap-2">
        ${friends.map(fid => {
            const f = db.getUserById(fid);
            return f ? `
            <div data-link="chat" data-params='{"fid":"${fid}"}' class="bg-white p-4 rounded-xl flex items-center gap-3 border border-gray-100 cursor-pointer">
                <img src="${f.avatar}" class="w-10 h-10 rounded-full">
                <div class="font-bold">${f.name}</div>
            </div>` : '';
        }).join('')}
        <button data-link="profile" class="text-center text-indigo-600 mt-4 font-bold">Manage Friends</button>
    </div>`;
}

function pageChat() {
    const fid = state.params.fid;
    const f = db.getUserById(fid);
    const msgs = db.getMessages(state.user.id, fid);
    return `
    <div class="flex flex-col h-[calc(100vh-140px)]">
        <div class="flex items-center gap-3 p-3 border-b bg-white">
            <button onclick="window.history.back()"><i data-lucide="arrow-left"></i></button>
            <span class="font-bold">${f.name}</span>
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-2" id="chat-box">
            ${msgs.map(m => `<div class="flex ${m.senderId===state.user.id?'justify-end':'justify-start'}"><div class="px-3 py-2 rounded-xl text-sm ${m.senderId===state.user.id?'bg-indigo-600 text-white':'bg-white border'}">${m.text}</div></div>`).join('')}
        </div>
        <form id="chat-form" class="p-2 bg-white border-t flex gap-2">
            <input id="chat-in" class="flex-1 bg-gray-100 rounded-full px-4 outline-none" placeholder="Type...">
            <button type="submit" class="bg-indigo-600 text-white p-2 rounded-full"><i data-lucide="send" width="16"></i></button>
        </form>
    </div>`;
}

function attachChat() {
    const form = document.getElementById('chat-form');
    if(form) {
        form.onsubmit = e => {
            e.preventDefault();
            const txt = document.getElementById('chat-in').value;
            if(!txt) return;
            db.sendMessage({ id:Date.now().toString(), senderId:state.user.id, receiverId:state.params.fid, text:txt, timestamp:Date.now(), isRead:false });
            renderApp();
        };
        const box = document.getElementById('chat-box');
        box.scrollTop = box.scrollHeight;
    }
}

function pageProfile() {
    const u = state.user;
    const all = Object.values(db.getUsers()).filter(x => x.id !== u.id);
    return `
    <div class="text-center p-6 bg-white rounded-2xl border border-gray-100 mb-6">
        <img src="${u.avatar}" class="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gray-50">
        <h2 class="text-xl font-bold">${u.name}</h2>
        <p class="text-gray-500 text-sm">${u.email}</p>
    </div>
    <h3 class="font-bold mb-3">Add Friends</h3>
    <div class="space-y-2">
        ${all.map(x => `
        <div class="bg-white p-3 rounded-xl flex justify-between items-center shadow-sm">
            <div class="flex items-center gap-3">
                <img src="${x.avatar}" class="w-8 h-8 rounded-full">
                <span class="text-sm font-bold">${x.name}</span>
            </div>
            <button onclick="addFriend('${x.id}')" class="text-indigo-600 bg-indigo-50 p-2 rounded-full"><i data-lucide="user-plus" width="16"></i></button>
        </div>`).join('')}
    </div>`;
}

window.addFriend = (id) => {
    const u = state.user;
    if(!u.friends.includes(id)) {
        u.friends.push(id);
        const target = db.getUserById(id);
        if(!target.friends.includes(u.id)) { target.friends.push(u.id); db.saveUser(target); }
        db.saveUser(u);
        alert('Friend Added');
        renderApp();
    }
};

function pagePurchases() {
    const enrolled = BATCHES.filter(b => state.user.enrolledBatches?.includes(b.id));
    return `
    <h2 class="font-bold text-xl mb-4">My Batches</h2>
    <div class="grid gap-4">
        ${enrolled.map(b => `<div data-link="batch" data-params='{"id":"${b.id}"}' class="bg-white p-4 rounded-xl shadow border border-gray-100 font-bold">${b.batchName}</div>`).join('')}
        ${enrolled.length===0?'<p>No courses.</p>':''}
    </div>`;
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    seed();
    renderApp();
});
