/**
 * UI COMPONENTS & LAYOUT
 * Handles Alerts, Modals, Auth Page (Secure), and Main Layout
 */

const UI = {
    // Advanced Alert Modal
    alert(title, message, type = 'success') {
        const themes = {
            success: { bg: 'bg-emerald-50', text: 'text-emerald-800', iconBg: 'bg-emerald-100', icon: 'check-circle-2', border: 'border-emerald-200', btn: 'bg-emerald-600 hover:bg-emerald-700' },
            error:   { bg: 'bg-rose-50',    text: 'text-rose-800',    iconBg: 'bg-rose-100',    icon: 'x-circle',       border: 'border-rose-200',    btn: 'bg-rose-600 hover:bg-rose-700' },
            info:    { bg: 'bg-blue-50',    text: 'text-blue-800',    iconBg: 'bg-blue-100',    icon: 'info',           border: 'border-blue-200',    btn: 'bg-blue-600 hover:bg-blue-700' },
            warning: { bg: 'bg-amber-50',   text: 'text-amber-800',   iconBg: 'bg-amber-100',   icon: 'alert-triangle', border: 'border-amber-200',   btn: 'bg-amber-600 hover:bg-amber-700' }
        };
        const t = themes[type] || themes.info;

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in';
        modal.innerHTML = `
            <div class="bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-2xl transform transition-all scale-100 animate-slide-up relative overflow-hidden border ${t.border}">
                <div class="absolute -top-10 -right-10 w-32 h-32 ${t.iconBg} rounded-full blur-3xl opacity-50"></div>
                <div class="relative z-10 flex flex-col items-center">
                    <div class="w-20 h-20 mb-4 rounded-full ${t.iconBg} ${t.text} flex items-center justify-center shadow-inner border-4 border-white">
                        <i data-lucide="${t.icon}" width="40"></i>
                    </div>
                    <h3 class="text-2xl font-black ${t.text} mb-2 text-center tracking-tight">${title}</h3>
                    <p class="text-center text-slate-500 font-medium text-sm mb-6 leading-relaxed">${message}</p>
                    <button id="ui-alert-btn" class="w-full py-4 rounded-xl font-bold text-white ${t.btn} transition shadow-lg transform active:scale-95 flex items-center justify-center gap-2">
                        <span>Continue</span> <i data-lucide="arrow-right" width="18"></i>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        lucide.createIcons();
        document.getElementById('ui-alert-btn').onclick = () => {
            modal.classList.add('opacity-0', 'scale-90');
            setTimeout(() => modal.remove(), 200);
        };
    },

    // Advanced Confirm Modal
    confirm(title, message, onConfirm, type = 'danger') {
        const isDanger = type === 'danger';
        const btnClass = isDanger ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200';
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in';
        modal.innerHTML = `
            <div class="bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-2xl transform transition-all scale-100 animate-slide-up border border-slate-100">
                 <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center shadow-sm border border-slate-100">
                    <i data-lucide="help-circle" width="32"></i>
                </div>
                <h3 class="text-xl font-black text-center text-slate-800 mb-2">${title}</h3>
                <p class="text-center text-slate-500 text-sm mb-8 font-medium">${message}</p>
                <div class="grid grid-cols-2 gap-3">
                    <button id="ui-cancel-btn" class="py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition">Cancel</button>
                    <button id="ui-confirm-btn" class="py-3.5 rounded-xl font-bold text-white ${btnClass} transition shadow-lg">Confirm</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        lucide.createIcons();
        document.getElementById('ui-cancel-btn').onclick = () => modal.remove();
        document.getElementById('ui-confirm-btn').onclick = () => {
            modal.remove();
            onConfirm();
        };
    }
};

// ==========================================
// AUTHENTICATION VIEWS
// ==========================================

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
                    <input type="text" id="otp" placeholder="######" maxlength="6" class="w-full p-4 text-center tracking-[1em] font-extrabold border rounded-xl text-xl">
                    <p class="text-xs text-gray-400 mt-2">Enter verification code sent to email</p>
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
        if(mode === 'login') { 
            mode = 'signup'; els.title.innerText = 'Join Us'; els.btn.innerText = 'Sign Up'; els.name.classList.remove('hidden'); toggle.innerText = 'Back to Login'; els.msg.innerText = ''; 
        } else { 
            mode = 'login'; els.title.innerText = 'Welcome Back'; els.btn.innerText = 'Log In'; els.name.classList.add('hidden'); els.otp.classList.add('hidden'); els.pass.classList.remove('hidden'); toggle.innerText = 'Create Account'; els.msg.innerText = ''; 
        }
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
            const studentId = 'STU' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
            db.saveUser({ id: studentId, name, email, password: pass, role: 'student', isVerified: false, verificationCode: '123456', avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g,'')}`, enrolledBatches: [], friends: [] });
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

// ==========================================
// MAIN LAYOUT
// ==========================================

function renderLayout(content) {
    const u = state.user;
    return `
    <div class="min-h-screen bg-slate-50 flex flex-col">
        <header class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex justify-between items-center transition-all">
            <button id="menu-btn" class="p-2 hover:bg-gray-100 rounded-full transition"><i data-lucide="menu" class="text-gray-700"></i></button>
            <h1 class="font-bold text-indigo-600 text-lg tracking-tight">Study Platform</h1>
            <div class="cursor-pointer" data-link="profile"><img src="${u.avatar}" class="w-9 h-9 rounded-full border border-gray-300 shadow-sm hover:scale-105 transition object-cover"></div>
        </header>
        <div id="sidebar-overlay" class="fixed inset-0 bg-black/40 z-40 hidden backdrop-blur-sm transition-opacity"></div>
        <div id="sidebar" class="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform -translate-x-full transition-transform duration-300">
            <div class="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white relative">
                <button id="close-menu" class="absolute top-4 right-4 text-white/80 hover:text-white"><i data-lucide="x"></i></button>
                <div class="flex flex-col items-center mt-4">
                    <img src="${u.avatar}" class="w-16 h-16 rounded-full border-4 border-white/20 mb-3 shadow-lg object-cover">
                    <h3 class="font-bold text-lg">${u.name}</h3>
                    <div class="mt-1 px-3 py-1 bg-white/20 rounded-full text-[10px] font-mono tracking-wider">ID: ${u.id}</div>
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
    document.getElementById('logout-btn').onclick = () => { 
        UI.confirm('Sign Out?', 'Are you sure you want to log out of your account?', () => {
            db.clearSession(); 
            renderApp();
        }, 'danger');
    };
}
