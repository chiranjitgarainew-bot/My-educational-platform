/**
 * CORE APPLICATION LOGIC
 * Handles State, Routing Logic, Initialization, and Offline detection.
 * Delegates View Rendering to pages.js and ui.js
 */

// ==========================================
// 1. APP STATE & ROUTING
// ==========================================

const state = {
    user: null,
    route: 'home',
    params: {},
    checkInterval: null,
    tempPayment: { couponApplied: null, discountAmount: 0 }
};

function navigate(route, params = {}) {
    // ROUTE GUARD: Check Admin Access
    if (route.startsWith('admin') && state.user && state.user.role !== 'admin') {
        UI.alert('Access Denied', 'You do not have permission to view this page.', 'error');
        return;
    }

    state.route = route;
    state.params = params;
    // Reset temporary states when leaving payment
    if(route !== 'payment') state.tempPayment = { couponApplied: null, discountAmount: 0 };
    renderApp();
    window.scrollTo(0, 0);
}

// Global Event Listener for Navigation
document.addEventListener('click', e => {
    const link = e.target.closest('[data-link]');
    if(link) {
        e.preventDefault();
        navigate(link.dataset.link, link.dataset.params ? JSON.parse(link.dataset.params) : {});
    }
});

// ==========================================
// 2. DATA SEEDING (Specific Class 8)
// ==========================================

async function seedData() {
    db.seedUsers();

    if(!db.hasChapters('8')) {
        const mathChapters = [
            "INTRODUCTION CLASS", "পূর্বপাঠের পুনরালোচনা", "পাই চিত্র", "মূলদ সংখ্যার ধারণা", 
            "বহুপদী সংখ্যামালার গুণ ও ভাগ", "ঘনফল নির্ণয়", "পূরক কোণ, সম্পূরক কোণ ও সন্নিহিত কোণ",
            "বিপ্রতীপ কোণের ধারণা", "সমান্তরাল সরলরেখা ও ছেদকের ধর্ম", "ত্রিভুজের দুটি বাহু ও তাদের বিপরীত কোণের সম্পর্ক",
            "ত্রৈরাশিক", "শতকরা", "মিশ্রণ", "বীজগাণিতিক সংখ্যামালার উৎপাদকে বিশ্লেষণ",
            "বীজগাণিতিক সংখ্যামালার গ.সা.গু. ও ল.সা.গু.", "বীজগাণিতিক সংখ্যামালার সরলীকরণ", "ত্রিভুজের কোণ ও বাহুর মধ্যে সম্পর্কের যাচাই",
            "সময় ও কার্য", "লেখচিত্র", "সমীকরণ গঠন ও সমাধান", "জ্যামিতিক প্রমাণ",
            "ত্রিভুজ অঙ্কন", "সমান্তরাল সরলরেখা অঙ্কন", "প্রদত্ত সরলরেখাংশকে সমান তিনটি, পাঁচটি ভাগে বিভক্ত করা"
        ];
        
        const lifeScienceChapters = [
            "INTRODUCTION CLASS", "প্রাদুর্ভাব, মহামারি ও অতিমারি", "জীবদেহের গঠন", "অণুজীবের জগৎ",
            "মানুষের খাদ্য ও খাদ্য উৎপাদন", "অন্তঃক্ষরা গ্রন্থি ও বয়ঃসন্ধি", "জীববৈচিত্র্য, পরিবেশের সংকট ও বিপন্ন প্রাণী সংরক্ষণ",
            "আমাদের চারপাশের পরিবেশ ও উদ্ভিদজগৎ"
        ];

        const phyScienceChapters = [
            "বল ও চাপ", "স্পর্শ ছাড়া ক্রিয়াশীল বল", "তাপ", "আলো",
            "মৌল, যৌগ ও রাসায়নিক বিক্রিয়া", "কয়েকটি গ্যাসের পরিচিতি", "প্রকৃতিতে ও জীবজগতে বিভিন্ন রূপে কার্বন যৌগের অবস্থান",
            "প্রাকৃতিক ঘটনা ও তার বিশ্লেষণ"
        ];

        const ch = [];
        mathChapters.forEach((title, i) => ch.push({ id:`s8_m_${i+1}`, batchId:'8', subject:'গণিত (Mathematics)', title:`Chapter ${String(i+1).padStart(2,'0')}: ${title}`, order:i+1 }));
        lifeScienceChapters.forEach((title, i) => ch.push({ id:`s8_l_${i+1}`, batchId:'8', subject:'জীবন বিজ্ঞান (Life Science)', title:`Chapter ${String(i+1).padStart(2,'0')}: ${title}`, order:i+1 }));
        phyScienceChapters.forEach((title, i) => ch.push({ id:`s8_p_${i+1}`, batchId:'8', subject:'ভৌত বিজ্ঞান (Physical Science)', title:`Chapter ${String(i+1).padStart(2,'0')}: ${title}`, order:i+1 }));

        db.seedChapters(ch);
    }

    if(!db.hasChapters('9')) {
        const ch = []; for(let i=1; i<=5; i++) ch.push({ id:`s9_${i}`, batchId:'9', subject:'ভৌত বিজ্ঞান (Physical Science)', title:`Chapter ${i}: Physics Concept`, order:i }); db.seedChapters(ch);
    }
    if(!db.hasChapters('10')) {
        const ch = []; for(let i=1; i<=5; i++) ch.push({ id:`s10_${i}`, batchId:'10', subject:'জীবন বিজ্ঞান (Life Science)', title:`Chapter ${i}: Biology Intro`, order:i }); db.seedChapters(ch);
    }
}

// ==========================================
// 3. MAIN RENDERER & OFFLINE LOGIC
// ==========================================

function renderOfflinePage() {
    return `
    <div class="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <div class="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center mb-8 relative">
            <div class="absolute inset-0 bg-red-500 rounded-full opacity-20 animate-ping"></div>
            <i data-lucide="wifi-off" class="text-red-500 w-16 h-16"></i>
        </div>
        <h1 class="text-3xl font-black text-white mb-2">You are Offline</h1>
        <p class="text-slate-400 mb-8 max-w-xs mx-auto leading-relaxed">It seems you lost your internet connection. Please reconnect to access your classroom.</p>
        <button onclick="window.location.reload()" class="px-8 py-3 bg-white text-slate-900 rounded-xl font-bold hover:scale-105 transition shadow-lg shadow-white/10 flex items-center gap-2">
            <i data-lucide="refresh-cw" width="18"></i> Try Reconnecting
        </button>
    </div>`;
}

function renderApp() {
    const app = document.getElementById('app');

    // 1. Handle Offline State
    if (!navigator.onLine) {
        app.innerHTML = renderOfflinePage();
        lucide.createIcons();
        window.addEventListener('online', renderApp);
        return;
    }
    window.addEventListener('offline', renderApp);

    // 2. Session Integrity Check
    if(!state.checkInterval) {
        state.checkInterval = setInterval(() => {
            if(state.user && !db.validateSession()) {
                clearInterval(state.checkInterval);
                state.checkInterval = null;
                state.user = null;
                db.clearSession();
                UI.alert('Session Expired', 'You have been logged out due to login on another device.', 'error');
                renderApp();
            }
        }, 5000);
    }

    const session = db.getSession();
    
    // 3. Main View Switching
    if (!session) {
        // Not Logged In -> Show Auth
        state.user = null;
        app.innerHTML = renderAuthPage(); // from ui.js
        attachAuthLogic(); // from ui.js
    } else {
        // Logged In -> Show Layout & Page
        if(!state.user) state.user = session;
        app.innerHTML = renderLayout(renderCurrentPage()); // renderLayout from ui.js, renderCurrentPage from pages.js
        attachLayoutLogic(); // from ui.js
        attachPageLogic(); // from pages.js
    }
    
    lucide.createIcons();
}

// ==========================================
// 4. INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    seedData();
    renderApp();
});
