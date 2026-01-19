/**
 * PAGES & VIEWS
 * Contains all page rendering functions and their specific logic
 */

// Dispatcher to render the correct page based on state
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
        case 'edit-profile': return pageEditProfile();
        case 'purchases': return pagePurchases();
        case 'settings': return pageSettings();
        case 'help': return pageHelp();
        default: return pageHome();
    }
}

// Dispatcher to attach listeners for the current page
function attachPageLogic() {
    if(state.route === 'admin') attachAdminLogic();
    if(state.route === 'admin-upload') attachAdminUploadLogic();
    if(state.route === 'payment') attachPaymentLogic();
    if(state.route === 'player') attachPlayerLogic();
    if(state.route === 'chat') attachChatLogic();
    if(state.route === 'settings') attachSettingsLogic();
    if(state.route === 'edit-profile') attachEditProfileLogic();
}

// --- HOME & LISTINGS ---

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
        const b = BATCHES.find(x => x.id === state.params.id);
        
        if(!code) return UI.alert('Oops!', 'Please enter a coupon code', 'error');
        const coupon = db.validateCoupon(code, b.price);
        
        if(coupon) {
            state.tempPayment = { couponApplied: code, discountAmount: parseInt(coupon.amount) };
            renderApp();
            UI.alert('Savings Unlocked!', `Coupon Applied! You saved ₹${coupon.amount}`, 'success');
        } else {
            UI.alert('Invalid Coupon', 'Code is invalid, expired, or limit reached.', 'error');
        }
    };
    window.removeCoupon = () => { state.tempPayment = { couponApplied: null, discountAmount: 0 }; renderApp(); };

    document.getElementById('phonepe-btn').onclick = async () => {
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

        if(state.tempPayment.couponApplied) db.incrementCouponUsage(state.tempPayment.couponApplied);

        const upiLink = `upi://pay?pa=9732140742@ybl&pn=StudyPlatform&am=${finalPrice}&cu=INR`;
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
            window.location.href = upiLink;
        } else {
             const modal = document.getElementById('pay-modal');
             modal.classList.remove('hidden');
             await new Promise(r => setTimeout(r, 2000));
             modal.classList.add('hidden');
        }

        UI.alert('Request Submitted', 'If the payment app opened, please complete the transaction. We have received your enrollment request.', 'success');
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
        
        if(state.tempPayment.couponApplied) db.incrementCouponUsage(state.tempPayment.couponApplied);
        
        UI.alert('Payment Request Received', 'We have received your manual payment request. Please allow some time for verification.', 'info');
        navigate('profile');
    };
}

function pagePurchases() {
    const enrolled = BATCHES.filter(b => state.user.enrolledBatches?.includes(b.id));

    return `
    <h2 class="text-2xl font-bold mb-6 flex items-center gap-2"><i data-lucide="book-open-check" class="text-indigo-600"></i> My Learning</h2>
    
    <div class="grid gap-5">
        ${enrolled.map(b => `
            <div data-link="subjects" data-params='{"id":"${b.id}"}' class="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div class="h-24 ${b.color} relative p-4">
                    <span class="bg-white/90 text-xs font-bold px-3 py-1 rounded-full absolute bottom-3 left-4 shadow-sm text-gray-800 flex items-center gap-1">
                        <i data-lucide="play-circle" width="14" class="text-indigo-600"></i> Continue Learning
                    </span>
                    <i data-lucide="book" class="text-white/30 absolute top-2 right-4 w-16 h-16"></i>
                </div>
                <div class="p-5">
                    <h3 class="text-lg font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition">${b.batchName}</h3>
                    <p class="text-xs text-gray-400 mb-4 line-clamp-1">${b.description}</p>
                    
                    <div class="w-full bg-gray-100 rounded-full h-2 mb-2">
                        <div class="bg-green-500 h-2 rounded-full" style="width: 15%"></div>
                    </div>
                    <div class="flex justify-between text-[10px] font-bold text-gray-400">
                        <span>15% Completed</span>
                        <span>View Subjects <i data-lucide="chevron-right" width="10" class="inline"></i></span>
                    </div>
                </div>
            </div>
        `).join('')}
        
        ${enrolled.length === 0 ? `
            <div class="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <i data-lucide="lock" width="32"></i>
                </div>
                <h3 class="text-lg font-bold text-gray-900">No Batches Purchased</h3>
                <p class="text-gray-400 text-sm mb-6 max-w-xs mx-auto">You haven't enrolled in any classes yet. Purchase a batch to start learning.</p>
                <button data-link="classes" class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-indigo-500/30 transition">Explore Batches</button>
            </div>
        ` : ''}
    </div>`;
}

function pageSubjects() {
    const b = BATCHES.find(x => x.id === state.params.id);
    if(!state.user.enrolledBatches.includes(b.id)) { navigate('payment', {id: b.id}); return ''; }

    return `
    <div class="pb-10">
        <div class="bg-slate-900 -m-4 p-8 pb-16 mb-8 text-white rounded-b-[40px] shadow-lg relative overflow-hidden">
             <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
             <button onclick="window.history.back()" class="mb-6 bg-white/10 hover:bg-white/20 p-2 rounded-full transition backdrop-blur-md"><i data-lucide="arrow-left"></i></button>
             <span class="px-3 py-1 bg-indigo-500 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest mb-2 inline-block">My Classroom</span>
             <h1 class="text-2xl font-black leading-tight">${b.batchName}</h1>
             <p class="text-slate-400 text-sm mt-2">Select a subject to view chapters</p>
        </div>
        <div class="space-y-4 px-2 -mt-10 relative z-10">
            ${b.subjects.map((sub, idx) => {
                const gradient = getGradient(idx);
                return `
                <div data-link="chapters" data-params='{"bid":"${b.id}","sub":"${encodeURIComponent(sub)}"}' 
                     class="bg-white p-5 rounded-2xl shadow-md border-l-4 hover:border-l-8 transition-all duration-300 flex items-center justify-between cursor-pointer group"
                     style="border-color: #6366f1;"> 
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 bg-gradient-to-br ${gradient} text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                            ${sub[0]}
                        </div>
                        <div>
                            <h3 class="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition">${sub}</h3>
                            <p class="text-xs text-gray-400 font-bold mt-0.5 uppercase tracking-wide">Course Material</p>
                        </div>
                    </div>
                    <div class="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition shadow-sm">
                        <i data-lucide="chevron-right" width="20"></i>
                    </div>
                </div>`;
            }).join('')}
        </div>
    </div>`;
}

function pageChapters() {
    const { bid, sub } = state.params; 
    const sName = decodeURIComponent(sub); 
    const chapters = db.getChapters(bid, sName);

    if(chapters.length === 0) { seedData().then(() => renderApp()); return '<div class="text-center mt-20"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div><p class="mt-4 text-gray-500">Loading Content...</p></div>'; }

    return `
    <div>
        <div class="flex items-center gap-3 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-4 z-20">
            <button onclick="window.history.back()" class="p-2 hover:bg-gray-100 rounded-full transition"><i data-lucide="arrow-left" width="20"></i></button>
            <h1 class="text-lg font-bold truncate flex-1">${sName}</h1>
        </div>
        
        <div class="grid gap-4">
            ${chapters.map((ch, idx) => {
                const hasContent = db.hasContentForChapter(ch.id);
                const gradient = getGradient(idx);
                
                return `
                <div data-link="${hasContent ? 'lectures' : ''}" data-params='{"cid":"${ch.id}"}' 
                     class="relative overflow-hidden p-5 rounded-2xl shadow-sm border border-gray-100 group transition-all duration-300 ${hasContent ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer bg-white' : 'opacity-80 bg-gray-50'}">
                    
                    <!-- Color Bar/Gradient Background Effect -->
                    <div class="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${gradient}"></div>
                    
                    <div class="flex items-start justify-between pl-3 relative z-10">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Chapter ${String(idx+1).padStart(2,'0')}</span>
                                ${!hasContent ? '<span class="text-[9px] font-bold text-white bg-indigo-500 px-2 py-0.5 rounded-full animate-pulse">Coming Soon</span>' : ''}
                            </div>
                            <h3 class="font-bold text-lg text-slate-800 leading-tight ${hasContent ? 'group-hover:text-indigo-600' : 'text-gray-500'} transition-colors">
                                ${ch.title.split(': ')[1] || ch.title}
                            </h3>
                        </div>
                        
                        <div class="w-10 h-10 flex items-center justify-center rounded-full ${hasContent ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-gray-100 text-gray-300'} transition-colors shadow-sm ml-3">
                            <i data-lucide="${hasContent ? 'play-circle' : 'lock'}" width="20"></i>
                        </div>
                    </div>
                    
                    ${hasContent ? `
                    <div class="mt-3 pl-3 pt-3 border-t border-gray-50 flex items-center gap-2">
                        <div class="flex -space-x-2">
                            <div class="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-indigo-600">V</div>
                        </div>
                        <span class="text-xs font-bold text-gray-400">Video Lectures Available</span>
                    </div>` : ''}
                </div>
            `}).join('')}
        </div>
    </div>`;
}

function pageLectures() {
    const { cid } = state.params; const contents = db.getContent().filter(c => c.chapterId === cid); const progress = db.getUserProgress(state.user.id);
    return `
    <div>
        <div class="flex items-center gap-3 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-4 z-20">
            <button onclick="window.history.back()" class="p-2 hover:bg-gray-100 rounded-full transition"><i data-lucide="arrow-left" width="20"></i></button>
            <h1 class="text-lg font-bold">Class Lectures</h1>
        </div>
        <div class="grid gap-5">
            ${contents.map((c, idx) => {
                const done = progress.find(p => p.contentId === c.id && p.completed);
                return `
                <div data-link="player" data-params='{"id":"${c.id}"}' class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div class="aspect-video bg-slate-900 relative flex items-center justify-center overflow-hidden">
                        ${c.thumbnail ? `<img src="${c.thumbnail}" class="w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-700">` : `<div class="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"></div>`}
                        <div class="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition"></div>
                        <div class="absolute inset-0 flex items-center justify-center z-10">
                            <div class="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 shadow-lg group-hover:scale-110 group-hover:bg-indigo-600/90 transition duration-300">
                                ${done ? '<i data-lucide="check" class="text-white" width="24"></i>' : '<i data-lucide="play" fill="currentColor" width="24"></i>'}
                            </div>
                        </div>
                        ${done ? '<div class="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">COMPLETED</div>' : ''}
                    </div>
                    <div class="p-5">
                        <h3 class="font-bold text-gray-800 line-clamp-1 text-lg">${c.title}</h3>
                        <p class="text-xs text-gray-400 mt-1 line-clamp-2">${c.description || 'Watch this lecture to understand the concepts.'}</p>
                    </div>
                </div>`;
            }).join('')}
            ${contents.length === 0 ? `<div class="text-center py-16 border-2 border-dashed border-gray-200 rounded-3xl"><div class="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400"><i data-lucide="video-off"></i></div><p class="text-gray-400 font-bold">No lectures uploaded yet.</p></div>` : ''}
        </div>
        ${state.user.role === 'admin' ? `<button data-link="admin-upload" class="fixed bottom-24 right-6 w-14 h-14 bg-slate-900 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition z-50 animate-bounce"><i data-lucide="plus"></i></button>` : ''}
    </div>`;
}

// --- VIDEO PLAYER ---

function pagePlayer() {
    const c = db.getContentById(state.params.id); if(!c) return '<div class="p-10 text-center">Video Not Found</div>';
    
    // Check if YouTube
    const isYoutube = c.videoUrl.includes('youtube') || c.videoUrl.includes('youtu.be');

    if (isYoutube) {
        return `
        <div class="bg-black min-h-screen text-white flex flex-col">
            <div class="aspect-video bg-black relative sticky top-0 z-50 shadow-2xl">
                <iframe src="${c.videoUrl}" class="w-full h-full" allowfullscreen allow="autoplay"></iframe>
                <button onclick="window.history.back()" class="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur-md rounded-full hover:bg-black/60 transition text-white border border-white/10"><i data-lucide="arrow-left"></i></button>
            </div>
            <div class="p-6 flex-1 bg-slate-900">
                <h1 class="text-xl font-bold leading-tight text-white">${c.title}</h1>
                <div class="flex items-center gap-3 mt-4 mb-6"><span class="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-300">Lecture</span><span class="text-xs text-gray-500">&bull;</span><span class="text-xs text-gray-400 font-bold">Updated Recently</span></div>
                <p class="text-slate-400 text-sm leading-relaxed border-t border-white/10 pt-4">${c.description}</p>
            </div>
        </div>`;
    }

    // Custom Player for MP4/HLS
    return `
    <div class="bg-black min-h-screen flex flex-col items-center justify-center relative">
        <button onclick="window.history.back()" class="absolute top-6 left-6 z-[60] p-2 bg-black/50 text-white rounded-full backdrop-blur-md hover:bg-black/70"><i data-lucide="arrow-left"></i></button>
        
        <div class="w-full max-w-4xl aspect-video relative group overflow-hidden bg-black shadow-2xl sm:rounded-xl" id="video-container">
            <video id="custom-video" class="w-full h-full object-contain cursor-pointer" poster="${c.thumbnail || ''}"></video>
            
            <!-- Loading Spinner -->
            <div id="loading-overlay" class="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none opacity-0 transition-opacity z-20">
                <div class="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>

            <!-- Center Play Button -->
            <div id="center-play" class="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 z-10">
                <div class="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/30 shadow-2xl">
                    <i data-lucide="play" width="40" fill="currentColor"></i>
                </div>
            </div>

            <!-- Controls Bar -->
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col gap-2 z-30">
                <!-- Progress -->
                <div class="relative w-full h-1 group/seek">
                    <div class="absolute w-full h-full bg-white/30 rounded-full"></div>
                    <div id="progress-filled" class="absolute h-full bg-indigo-500 rounded-full w-0"></div>
                    <input type="range" id="seek-bar" value="0" min="0" max="100" class="absolute w-full h-full opacity-0 cursor-pointer">
                </div>
                
                <div class="flex justify-between items-center text-white mt-1">
                    <div class="flex items-center gap-4">
                        <button id="play-pause-btn" class="hover:text-indigo-400 transition"><i data-lucide="play" width="24" fill="currentColor"></i></button>
                        <div class="flex items-center gap-2 group/vol hidden sm:flex">
                            <button id="mute-btn"><i data-lucide="volume-2" width="20"></i></button>
                            <input type="range" id="volume-bar" min="0" max="1" step="0.1" value="1" class="w-20 h-1 bg-white/30 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white cursor-pointer">
                        </div>
                        <span class="text-xs font-mono font-bold tracking-wider opacity-80"><span id="curr-time">00:00</span> / <span id="total-time">00:00</span></span>
                    </div>
                    
                    <div class="flex items-center gap-3">
                        <button id="speed-btn" class="text-xs font-bold border border-white/30 px-2 py-1 rounded hover:bg-white/20 transition">1x</button>
                        <button id="fullscreen-btn" class="hover:text-indigo-400 transition"><i data-lucide="maximize" width="20"></i></button>
                    </div>
                </div>
            </div>
            
            <!-- Mobile Double Tap Areas -->
            <div class="absolute inset-y-0 left-0 w-1/4 z-10" id="tap-left"></div>
            <div class="absolute inset-y-0 right-0 w-1/4 z-10" id="tap-right"></div>
        </div>
        
        <div class="p-6 w-full max-w-4xl">
             <h1 class="text-2xl font-bold leading-tight text-white mb-2">${c.title}</h1>
             <p class="text-slate-400 text-sm">${c.description}</p>
        </div>
    </div>
    `;
}

function attachPlayerLogic() {
    const c = db.getContentById(state.params.id);
    if(!c) return;

    // Save progress periodically for all types
    const progressInterval = setInterval(() => { 
        // Logic handled inside specific handlers or here if globally accessible
    }, 5000);

    const isYoutube = c.videoUrl.includes('youtube') || c.videoUrl.includes('youtu.be');
    
    if(!isYoutube) {
        const video = document.getElementById('custom-video');
        const container = document.getElementById('video-container');
        const playBtn = document.getElementById('play-pause-btn');
        const centerPlay = document.getElementById('center-play');
        const seekBar = document.getElementById('seek-bar');
        const progressFilled = document.getElementById('progress-filled');
        const currTime = document.getElementById('curr-time');
        const totalTime = document.getElementById('total-time');
        const speedBtn = document.getElementById('speed-btn');
        const fullBtn = document.getElementById('fullscreen-btn');
        const loading = document.getElementById('loading-overlay');
        const tapLeft = document.getElementById('tap-left');
        const tapRight = document.getElementById('tap-right');

        // HLS Support
        if(Hls.isSupported() && c.videoUrl.includes('.m3u8')) { 
            const hls = new Hls(); hls.loadSource(c.videoUrl); hls.attachMedia(video); 
        } else { 
            video.src = c.videoUrl; 
        }

        // --- CONTROLS LOGIC ---
        const formatTime = (s) => { const m=Math.floor(s/60); const sec=Math.floor(s%60); return `${m}:${sec<10?'0':''}${sec}`; };
        
        const togglePlay = () => {
            if(video.paused) { video.play(); centerPlay.style.opacity = '0'; playBtn.innerHTML = '<i data-lucide="pause" width="24" fill="currentColor"></i>'; }
            else { video.pause(); centerPlay.style.opacity = '1'; playBtn.innerHTML = '<i data-lucide="play" width="24" fill="currentColor"></i>'; }
            lucide.createIcons();
        };

        // Events
        playBtn.onclick = togglePlay;
        centerPlay.onclick = togglePlay; // Initial click
        
        video.ontimeupdate = () => {
            const p = (video.currentTime / video.duration) * 100 || 0;
            seekBar.value = p;
            progressFilled.style.width = `${p}%`;
            currTime.innerText = formatTime(video.currentTime);
            
            // Save Progress
            db.saveProgress({ userId: state.user.id, contentId: c.id, batchId: c.batchId, chapterId: c.chapterId, watchedSeconds: Math.floor(video.currentTime), totalSeconds: c.duration || video.duration || 600, lastUpdated: Date.now(), completed: false });
        };

        video.onloadedmetadata = () => totalTime.innerText = formatTime(video.duration);
        video.onwaiting = () => loading.style.opacity = '1';
        video.onplaying = () => loading.style.opacity = '0';
        video.onended = () => { centerPlay.style.opacity = '1'; playBtn.innerHTML = '<i data-lucide="rotate-ccw" width="24"></i>'; lucide.createIcons(); };

        seekBar.oninput = (e) => {
            const time = (e.target.value / 100) * video.duration;
            video.currentTime = time;
        };

        speedBtn.onclick = () => {
            let s = video.playbackRate;
            if(s === 1) s = 1.5; else if(s === 1.5) s = 2; else s = 1;
            video.playbackRate = s;
            speedBtn.innerText = `${s}x`;
        };

        fullBtn.onclick = () => {
            if(!document.fullscreenElement) container.requestFullscreen();
            else document.exitFullscreen();
        };

        // Double Tap Logic
        let lastTap = 0;
        const handleDoubleTap = (direction) => {
            const now = Date.now();
            if (now - lastTap < 300) {
                // Double tap detected
                video.currentTime += (direction === 'left' ? -10 : 10);
                // Show feedback animation (simple alert for now or implement better overlay later)
                const overlay = document.createElement('div');
                overlay.className = 'absolute inset-0 flex items-center justify-center pointer-events-none animate-fade-in';
                overlay.innerHTML = `<div class="bg-black/60 text-white px-4 py-2 rounded-full font-bold backdrop-blur">${direction === 'left' ? '-10s' : '+10s'}</div>`;
                container.appendChild(overlay);
                setTimeout(() => overlay.remove(), 600);
            }
            lastTap = now;
        };

        tapLeft.onclick = () => handleDoubleTap('left');
        tapRight.onclick = () => handleDoubleTap('right');
    }
}

// --- NEW ADMIN DASHBOARD (ADVANCED) ---

function pageAdmin() {
    const tab = state.params.tab || 'dashboard';
    
    // Sidebar items
    const tabs = [
        { id: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
        { id: 'users', icon: 'users', label: 'Users' },
        { id: 'payments', icon: 'credit-card', label: 'Payments' },
        { id: 'content', icon: 'video', label: 'Content' },
        { id: 'coupons', icon: 'ticket', label: 'Coupons' },
        { id: 'logs', icon: 'activity', label: 'Logs' },
    ];

    // Helper to render content based on tab
    const renderContent = () => {
        switch(tab) {
            case 'dashboard': return adminDashboardView();
            case 'users': return adminUsersView();
            case 'payments': return adminPaymentsView();
            case 'content': return adminContentView();
            case 'coupons': return adminCouponsView();
            case 'logs': return adminLogsView();
            default: return adminDashboardView();
        }
    };

    return `
    <div class="min-h-[80vh] flex flex-col md:flex-row gap-4">
        <!-- Admin Sidebar (Mobile horizontal, Desktop vertical) -->
        <div class="bg-white p-2 md:p-4 rounded-2xl shadow-sm border border-gray-100 flex md:flex-col gap-2 overflow-x-auto md:w-48 sticky top-20 z-10 h-fit">
            ${tabs.map(t => `
                <button onclick="navigate('admin', {tab: '${t.id}'})" 
                    class="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition whitespace-nowrap
                    ${tab === t.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-600 hover:bg-slate-50'}">
                    <i data-lucide="${t.icon}" width="18"></i>
                    ${t.label}
                </button>
            `).join('')}
        </div>

        <!-- Admin Content Area -->
        <div class="flex-1 space-y-4">
             ${tab !== 'dashboard' ? `<h2 class="text-xl font-black text-slate-800 capitalize mb-4 px-2">${tab} Management</h2>` : ''}
             ${renderContent()}
        </div>
    </div>`;
}

// -- Sub-Views for Admin --

function adminDashboardView() {
    const reqs = db.getRequests(); 
    const users = Object.values(db.getUsers()); 
    const totalRevenue = reqs.filter(r => r.status === 'approved').reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const pendingReqs = reqs.filter(r => r.status === 'pending').length;

    return `
    <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <h2 class="text-2xl font-black mb-1">Admin Panel</h2>
            <p class="text-indigo-100 text-sm">Welcome back, Admin. Here is your overview.</p>
        </div>
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div class="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Users</div>
            <div class="text-3xl font-black text-slate-800">${users.length}</div>
        </div>
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div class="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Revenue</div>
            <div class="text-3xl font-black text-slate-800">₹${totalRevenue}</div>
        </div>
        <div class="col-span-2 bg-orange-50 p-5 rounded-2xl border border-orange-100 flex justify-between items-center cursor-pointer hover:bg-orange-100 transition" onclick="navigate('admin', {tab: 'payments'})">
            <div>
                <div class="text-orange-600 text-xs font-bold uppercase tracking-wider mb-1">Pending Requests</div>
                <div class="text-2xl font-black text-orange-700">${pendingReqs}</div>
            </div>
            <div class="bg-orange-200 text-orange-700 p-2 rounded-full"><i data-lucide="arrow-right"></i></div>
        </div>
    </div>`;
}

function adminUsersView() {
    const users = Object.values(db.getUsers());
    const term = (state.params.search || '').toLowerCase();
    const filtered = users.filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));

    return `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex gap-2">
            <input type="text" id="user-search" value="${state.params.search || ''}" placeholder="Search by name or email..." 
                class="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100">
            <button onclick="navigate('admin', {tab:'users', search: document.getElementById('user-search').value})" 
                class="bg-slate-800 text-white px-4 rounded-lg font-bold text-sm">Search</button>
        </div>
        <div class="divide-y divide-gray-50 max-h-[60vh] overflow-y-auto">
            ${filtered.map(u => `
                <div class="p-4 flex items-center gap-3 hover:bg-gray-50 transition">
                    <img src="${u.avatar}" class="w-10 h-10 rounded-full bg-gray-200 border border-gray-300">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-slate-800 text-sm truncate">${u.name}</span>
                            ${u.role === 'admin' ? '<span class="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded">ADMIN</span>' : '<span class="bg-gray-100 text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded">STUDENT</span>'}
                        </div>
                        <div class="text-xs text-gray-500 truncate">${u.email}</div>
                    </div>
                    ${u.role !== 'admin' ? `
                        <button onclick="toggleSuspend('${u.email}')" 
                            class="px-3 py-1.5 rounded-lg text-xs font-bold border transition ${u.isSuspended ? 'bg-red-50 text-red-600 border-red-100' : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-100'}">
                            ${u.isSuspended ? 'Suspended' : 'Suspend'}
                        </button>
                    ` : ''}
                </div>
            `).join('')}
            ${filtered.length === 0 ? '<div class="p-8 text-center text-gray-400 text-sm">No users found.</div>' : ''}
        </div>
    </div>`;
}

function adminPaymentsView() {
    const reqs = db.getRequests();
    const filter = state.params.filter || 'pending';
    const filtered = reqs.filter(r => filter === 'all' ? true : r.status === filter);

    return `
    <div>
        <div class="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
            <button onclick="navigate('admin', {tab:'payments', filter:'pending'})" class="px-4 py-2 rounded-lg text-xs font-bold border transition ${filter==='pending' ? 'bg-orange-500 text-white border-orange-600' : 'bg-white text-gray-500 border-gray-200'}">Pending</button>
            <button onclick="navigate('admin', {tab:'payments', filter:'approved'})" class="px-4 py-2 rounded-lg text-xs font-bold border transition ${filter==='approved' ? 'bg-green-500 text-white border-green-600' : 'bg-white text-gray-500 border-gray-200'}">Approved</button>
            <button onclick="navigate('admin', {tab:'payments', filter:'rejected'})" class="px-4 py-2 rounded-lg text-xs font-bold border transition ${filter==='rejected' ? 'bg-red-500 text-white border-red-600' : 'bg-white text-gray-500 border-gray-200'}">Rejected</button>
            <button onclick="navigate('admin', {tab:'payments', filter:'all'})" class="px-4 py-2 rounded-lg text-xs font-bold border transition ${filter==='all' ? 'bg-slate-800 text-white border-slate-900' : 'bg-white text-gray-500 border-gray-200'}">All</button>
        </div>
        
        <div class="space-y-3">
            ${filtered.map(r => `
                <div class="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col gap-3 relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-1 h-full ${r.status==='pending'?'bg-orange-400':r.status==='approved'?'bg-green-500':'bg-red-500'}"></div>
                    <div class="flex justify-between items-start pl-3">
                        <div>
                            <div class="font-bold text-slate-800">${r.userName}</div>
                            <div class="text-xs text-gray-500">${r.userEmail}</div>
                            <div class="text-xs font-bold text-indigo-600 mt-1">${r.batchName}</div>
                        </div>
                        <div class="text-right">
                            <div class="text-lg font-black text-slate-800">₹${r.amount}</div>
                            <div class="text-[10px] text-gray-400 uppercase font-bold">${r.method}</div>
                        </div>
                    </div>
                    ${r.status === 'pending' ? `
                    <div class="flex gap-2 pl-3 pt-2 border-t border-gray-50">
                        <button onclick="approvePay('${r.id}')" class="flex-1 bg-green-50 text-green-700 py-2 rounded-lg text-xs font-bold hover:bg-green-100">Approve</button>
                        <button onclick="rejectPay('${r.id}')" class="flex-1 bg-red-50 text-red-700 py-2 rounded-lg text-xs font-bold hover:bg-red-100">Reject</button>
                    </div>` : `
                    <div class="pl-3 text-[10px] font-bold uppercase tracking-wider ${r.status==='approved'?'text-green-600':'text-red-600'}">
                        Status: ${r.status}
                    </div>`}
                </div>
            `).join('')}
            ${filtered.length === 0 ? '<div class="p-10 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">No records found.</div>' : ''}
        </div>
    </div>`;
}

function adminContentView() {
    const chapters = db._get(KEYS.CHAPTERS, []);
    const content = db.getContent();
    const filterCid = state.params.cid || 'all';
    
    const filteredContent = filterCid === 'all' ? content : content.filter(c => c.chapterId === filterCid);

    return `
    <div>
        <div class="flex justify-between mb-4">
             <select onchange="navigate('admin', {tab:'content', cid: this.value})" class="bg-white border border-gray-200 text-sm rounded-lg p-2.5 outline-none max-w-[200px]">
                <option value="all">All Chapters</option>
                ${chapters.map(c => `<option value="${c.id}" ${filterCid===c.id?'selected':''}>${c.title}</option>`).join('')}
            </select>
            <button data-link="admin-upload" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><i data-lucide="plus" width="16"></i> Upload</button>
        </div>

        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
            ${filteredContent.map(c => `
                <div class="p-4 flex gap-4 hover:bg-gray-50 group">
                    <div class="w-16 h-10 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img src="${c.thumbnail || ''}" class="w-full h-full object-cover opacity-80">
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="font-bold text-slate-800 text-sm truncate">${c.title}</div>
                        <div class="text-xs text-gray-400 truncate">${c.type} &bull; ${c.id}</div>
                    </div>
                    <button onclick="deleteContent('${c.id}')" class="text-gray-300 hover:text-red-500 transition px-2"><i data-lucide="trash-2" width="16"></i></button>
                </div>
            `).join('')}
            ${filteredContent.length === 0 ? '<div class="p-8 text-center text-gray-400 text-sm">No content uploaded.</div>' : ''}
        </div>
    </div>`;
}

function adminCouponsView() {
    const coupons = db.getCoupons();
    return `
    <div class="space-y-6">
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 class="font-bold text-gray-800 mb-3 text-sm">Create New Coupon</h3>
            <form id="create-coupon-form" class="space-y-3">
                <div class="flex gap-2">
                    <input type="text" id="c-code" placeholder="CODE (e.g. SAVE50)" required class="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold uppercase outline-none">
                    <input type="number" id="c-amount" placeholder="Amount (₹)" required class="w-24 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none">
                </div>
                <div class="grid grid-cols-2 gap-2">
                     <input type="date" id="c-expiry" class="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold outline-none text-gray-500">
                     <input type="number" id="c-limit" placeholder="Max Usage Limit" class="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold outline-none">
                </div>
                <button type="submit" class="w-full bg-slate-800 text-white px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-900 transition">Create Coupon</button>
            </form>
        </div>

        <div class="space-y-3">
            ${coupons.map(c => {
                const isExpired = c.expiry && new Date(c.expiry).getTime() < Date.now();
                return `
                <div class="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex justify-between items-center ${isExpired ? 'opacity-60' : ''}">
                    <div class="flex items-center gap-3">
                        <div class="bg-green-100 p-2.5 rounded-lg text-green-600"><i data-lucide="tag" width="18"></i></div>
                        <div>
                            <div class="font-black text-slate-800 tracking-wider flex items-center gap-2">
                                ${c.code}
                                ${isExpired ? '<span class="text-[9px] bg-red-100 text-red-600 px-1 rounded">EXPIRED</span>' : ''}
                            </div>
                            <div class="text-xs text-gray-500 font-medium">
                                ₹${c.amount} Off &bull; Used: ${c.usageCount||0}/${c.maxUsage || '∞'}
                            </div>
                        </div>
                    </div>
                    <button onclick="deleteCoupon('${c.code}')" class="text-gray-400 p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition"><i data-lucide="trash-2" width="16"></i></button>
                </div>`;
            }).join('')}
             ${coupons.length === 0 ? '<div class="p-6 text-center text-gray-400 text-sm">No active coupons.</div>' : ''}
        </div>
    </div>`;
}

function adminLogsView() {
    const logs = db.getAllLogs();
    return `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="bg-gray-50 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Activity Timeline</div>
        <div class="divide-y divide-gray-50 max-h-[60vh] overflow-y-auto">
            ${logs.map(log => `
                <div class="p-4 flex gap-3 text-sm">
                    <div class="min-w-[60px] text-xs text-gray-400 font-mono text-right pt-0.5">${new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    <div>
                        <div class="font-bold text-slate-700 text-xs uppercase tracking-wide mb-0.5">${log.type}</div>
                        <div class="text-gray-600">${log.description}</div>
                        <div class="text-[10px] text-gray-400 mt-1">ID: ${log.userId}</div>
                    </div>
                </div>
            `).join('')}
            ${logs.length === 0 ? '<div class="p-8 text-center text-gray-400 text-sm">No activity recorded.</div>' : ''}
        </div>
    </div>`;
}

// --- Attach Logic ---

function attachAdminLogic() {
    // User Management
    window.toggleSuspend = (email) => {
        UI.confirm('Change Status?', 'Are you sure you want to suspend/unsuspend this user?', () => {
            db.toggleUserSuspension(email);
            renderApp();
        }, 'warning');
    };

    // Payments
    window.approvePay = (id) => UI.confirm('Approve Request?', 'Grant access to student?', () => { 
        db.approveRequest(id); renderApp(); 
    }, 'success');
    
    window.rejectPay = (id) => UI.confirm('Reject Request?', 'Action cannot be undone.', () => { 
        db.rejectRequest(id); renderApp(); 
    }, 'danger');
    
    // Coupons
    const cForm = document.getElementById('create-coupon-form');
    if(cForm) cForm.onsubmit = (e) => {
        e.preventDefault();
        const code = document.getElementById('c-code').value.toUpperCase().trim();
        const amount = document.getElementById('c-amount').value;
        const expiry = document.getElementById('c-expiry').value;
        const limit = document.getElementById('c-limit').value;

        db.saveCoupon({ 
            code, 
            amount, 
            expiry, 
            maxUsage: limit ? parseInt(limit) : null,
            usageCount: 0 
        });
        renderApp();
        UI.alert('Success', 'Coupon created successfully.', 'success');
    };
    window.deleteCoupon = (code) => UI.confirm('Delete Coupon?', 'This action is permanent.', () => { db.deleteCoupon(code); renderApp(); }, 'danger');

    // Content
    window.deleteContent = (id) => UI.confirm('Delete Content?', 'This video will be removed permanently.', () => { db.deleteContent(id); renderApp(); }, 'danger');
}

function pageAdminUpload() {
    if(state.user.role !== 'admin') return '<div class="p-10 text-center text-red-500">Access Denied</div>';
    const chapters = db._get(KEYS.CHAPTERS, []);
    return `
    <div>
        <div class="flex items-center gap-2 mb-6">
            <button onclick="window.history.back()" class="p-2 bg-white rounded-full border border-gray-200"><i data-lucide="arrow-left" width="18"></i></button>
            <h1 class="text-xl font-bold">Upload Content</h1>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <form id="upload-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Select Chapter</label>
                    <select id="chapter-select" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20">
                        <option value="">-- Choose Chapter --</option>
                        ${chapters.map(c => `<option value="${c.id}">${c.title} (${c.subject})</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Title</label>
                    <input type="text" id="vid-title" required class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20">
                </div>
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Description</label>
                    <textarea id="vid-desc" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"></textarea>
                </div>
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Video Type</label>
                     <select id="vid-type" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20">
                        <option value="youtube">YouTube Link</option>
                        <option value="mp4">Direct MP4/M3U8 Link</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Video URL</label>
                    <div class="flex gap-2">
                        <input type="text" id="vid-url" required placeholder="https://..." class="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20">
                        <button type="button" id="use-demo-btn" class="bg-slate-800 text-white px-3 rounded-xl text-xs font-bold whitespace-nowrap">Use Demo</button>
                    </div>
                    <p class="text-[10px] text-gray-400 mt-1">For MP4/M3U8, paste the direct file link.</p>
                </div>
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Thumbnail URL</label>
                    <input type="text" id="vid-thumb" placeholder="https://..." class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20">
                </div>
                <button type="submit" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition">Upload Video</button>
            </form>
        </div>
    </div>`;
}
function attachAdminUploadLogic() {
    const form = document.getElementById('upload-form');
    const demoBtn = document.getElementById('use-demo-btn');
    const urlInput = document.getElementById('vid-url');
    
    if(demoBtn) demoBtn.onclick = () => {
        // Sample Big Buck Bunny mp4
        urlInput.value = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
        document.getElementById('vid-title').value = "Demo Video: Big Buck Bunny";
        document.getElementById('vid-desc').value = "A test video to check the custom player functionality.";
    };

    if(form) form.onsubmit = (e) => { 
        e.preventDefault(); 
        const chId = document.getElementById('chapter-select').value; 
        const title = document.getElementById('vid-title').value; 
        const desc = document.getElementById('vid-desc').value; 
        const url = document.getElementById('vid-url').value; 
        const thumb = document.getElementById('vid-thumb').value;
        
        if(!chId) return UI.alert('Error', 'Select chapter', 'error');
        const chapter = db.getChapters(null, null).find(c => c.id === chId) || {batchId:'8', chapterId: chId};
        
        db.saveContent({ id: Date.now().toString(), batchId: chapter.batchId, chapterId: chId, title, description: desc, videoUrl: url, thumbnail: thumb, duration: 600, type: 'video' });
        UI.alert('Success', 'Video uploaded successfully!', 'success'); 
        navigate('admin', {tab: 'content'}); // Redirect back to content list
    };
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

function pageEditProfile() {
    const u = state.user;
    return `
    <div class="pb-10">
        <div class="flex items-center gap-3 mb-6 sticky top-0 bg-slate-50/90 backdrop-blur z-20 py-2">
            <button onclick="window.history.back()" class="p-2 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50"><i data-lucide="arrow-left" width="20"></i></button>
            <h1 class="text-2xl font-black text-slate-800">Edit Profile</h1>
        </div>

        <form id="edit-profile-form" class="space-y-6 animate-fade-in">
            <!-- Avatar Upload with Glass effect -->
            <div class="flex flex-col items-center justify-center">
                <div class="relative group cursor-pointer w-32 h-32" id="avatar-container">
                    <img src="${u.avatar}" id="avatar-preview" class="w-full h-full rounded-full border-[6px] border-white shadow-xl object-cover bg-white">
                    <div class="absolute inset-0 bg-slate-900/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 backdrop-blur-[2px]">
                        <i data-lucide="camera" class="text-white w-8 h-8 mb-1"></i>
                        <span class="text-white text-[10px] font-bold uppercase tracking-wide">Change</span>
                    </div>
                    <div class="absolute bottom-1 right-1 bg-indigo-600 p-2 rounded-full text-white border-2 border-white shadow-lg">
                        <i data-lucide="edit-2" width="14"></i>
                    </div>
                </div>
                <input type="file" id="avatar-input" class="hidden" accept="image/*">
                <p class="text-xs text-gray-400 font-medium mt-2">Tap image to update</p>
            </div>

            <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Full Name</label>
                    <div class="relative">
                        <i data-lucide="user" class="absolute left-4 top-3.5 text-gray-400 w-5 h-5"></i>
                        <input type="text" id="edit-name" value="${u.name}" class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition">
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Phone Number</label>
                    <div class="relative">
                        <i data-lucide="phone" class="absolute left-4 top-3.5 text-gray-400 w-5 h-5"></i>
                        <input type="tel" id="edit-phone" value="${u.phone || ''}" placeholder="+91 00000 00000" class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition">
                    </div>
                </div>

                 <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Address</label>
                    <div class="relative">
                        <i data-lucide="map-pin" class="absolute left-4 top-3.5 text-gray-400 w-5 h-5"></i>
                        <input type="text" id="edit-address" value="${u.address || ''}" placeholder="City, State" class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                     <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Date of Birth</label>
                        <input type="date" id="edit-dob" value="${u.dob || ''}" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition">
                    </div>
                     <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Gender</label>
                        <select id="edit-gender" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Bio</label>
                    <textarea id="edit-bio" rows="3" placeholder="Tell us about yourself..." class="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition resize-none">${u.bio || ''}</textarea>
                </div>
            </div>

            <button type="submit" class="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:scale-[1.02] transition flex items-center justify-center gap-2">
                <i data-lucide="save" width="18"></i> Save Changes
            </button>
        </form>
    </div>`;
}

function attachEditProfileLogic() {
    const u = state.user;
    
    // Avatar Click Trigger
    document.getElementById('avatar-container').onclick = () => document.getElementById('avatar-input').click();
    
    // Avatar Preview
    document.getElementById('avatar-input').onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => document.getElementById('avatar-preview').src = e.target.result;
            reader.readAsDataURL(file);
            UI.alert('Image Selected', 'Click "Save Changes" to update your profile picture.', 'info');
        }
    };

    document.getElementById('edit-profile-form').onsubmit = (e) => {
        e.preventDefault();
        
        // Collect Data
        const updatedUser = {
            ...u,
            name: document.getElementById('edit-name').value,
            phone: document.getElementById('edit-phone').value,
            address: document.getElementById('edit-address').value,
            dob: document.getElementById('edit-dob').value,
            bio: document.getElementById('edit-bio').value,
            avatar: document.getElementById('avatar-preview').src // In real app, upload this
        };

        // Save
        db.saveUser(updatedUser);
        
        // Update State
        state.user = updatedUser;
        
        // Feedback
        UI.alert('Profile Updated', 'Your changes have been saved successfully!', 'success');
        
        // Redirect
        setTimeout(() => navigate('profile'), 1500);
    };
}

function pageProfile() {
    const u = state.user;
    const logs = db.getUserLogs(u.id); 
    const getLogIcon = (type) => { switch(type) { case 'LOGIN': return 'log-in'; case 'SIGNUP': return 'user-plus'; case 'PURCHASE_REQUEST': return 'credit-card'; case 'ENROLL_SUCCESS': return 'check-circle'; case 'COMPLETION': return 'award'; default: return 'activity'; } };

    return `
    <div class="space-y-6 pb-20">
        <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center relative overflow-hidden group">
            <div class="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-violet-500 to-fuchsia-500 group-hover:scale-105 transition duration-500"></div>
            <div class="relative z-10 -mt-2"><img src="${u.avatar}" class="w-28 h-28 rounded-full mx-auto border-[6px] border-white shadow-lg object-cover bg-white"></div>
            <h2 class="text-2xl font-black mt-3 text-slate-800">${u.name}</h2><p class="text-slate-500 text-sm font-medium">${u.email}</p>
            
            <div class="mt-4 flex flex-col items-center gap-2">
                 <div class="bg-slate-100 px-4 py-2 rounded-xl text-slate-600 font-mono text-xs font-bold tracking-wider flex items-center gap-2 border border-slate-200">
                    <i data-lucide="hash" width="14"></i> Student ID: ${u.id}
                 </div>
                 <div class="flex gap-2">
                    <span class="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border border-indigo-100">${u.role}</span>
                    ${u.isVerified ? '<span class="px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border border-green-100 flex items-center gap-1"><i data-lucide="shield-check" width="14"></i> Verified</span>' : '<span class="px-4 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border border-yellow-100 flex items-center gap-1"><i data-lucide="shield-alert" width="14"></i> Unverified</span>'}
                 </div>
            </div>
            ${u.bio ? `<p class="mt-4 text-sm text-gray-500 italic max-w-xs mx-auto">"${u.bio}"</p>` : ''}
        </div>

        <div>
            <h3 class="font-bold text-lg mb-3 px-2 flex items-center gap-2"><i data-lucide="activity" class="text-indigo-600"></i> Recent Activity</h3>
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden max-h-80 overflow-y-auto">
                ${logs.length > 0 ? `<div class="divide-y divide-gray-50">
                    ${logs.map(log => `
                        <div class="p-4 flex gap-3 hover:bg-gray-50 transition">
                            <div class="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mt-1 flex-shrink-0">
                                <i data-lucide="${getLogIcon(log.type)}" width="16"></i>
                            </div>
                            <div>
                                <div class="font-bold text-slate-700 text-sm">${log.description}</div>
                                <div class="text-[10px] text-gray-400 font-medium">${new Date(log.timestamp).toLocaleString()}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>` : `<div class="p-8 text-center text-gray-400 text-xs font-bold">No activity recorded yet.</div>`}
            </div>
        </div>
        
        <button onclick="db.clearSession(); renderApp();" class="w-full bg-red-50 text-red-600 font-bold py-4 rounded-xl border border-red-100 hover:bg-red-100 transition flex items-center justify-center gap-2"><i data-lucide="log-out" width="18"></i> Sign Out</button>
    </div>`;
}

function pageSettings() {
    const u = state.user;
    return `
    <h2 class="text-2xl font-bold mb-6">Settings</h2>
    
    <!-- Profile Edit Section -->
    <div data-link="edit-profile" class="bg-white rounded-2xl border border-gray-100 p-5 mb-4 flex items-center gap-4 hover:shadow-md transition cursor-pointer group">
        <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-400 to-cyan-400 p-[2px]">
            <img src="${u.avatar}" class="w-full h-full rounded-full border-2 border-white object-cover">
        </div>
        <div class="flex-1">
            <h3 class="font-bold text-lg text-slate-800">${u.name}</h3>
            <p class="text-xs text-gray-500 mb-2">${u.email}</p>
            <span class="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold group-hover:bg-indigo-600 group-hover:text-white transition">Edit Profile</span>
        </div>
        <i data-lucide="chevron-right" class="text-gray-300 group-hover:text-indigo-600"></i>
    </div>

    <div class="space-y-4">
        <div class="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-center">
            <div><h3 class="font-bold text-slate-800">Push Notifications</h3><p class="text-xs text-gray-400">Receive class updates</p></div>
            <div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in"><input type="checkbox" name="toggle" id="toggle" checked class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/><label for="toggle" class="toggle-label block overflow-hidden h-6 rounded-full bg-indigo-300 cursor-pointer"></label></div>
        </div>
        
        <button onclick="UI.alert('Email Sent', 'Password reset link sent to ' + state.user.email, 'success')" class="w-full bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-center hover:bg-gray-50">
            <span class="font-bold text-slate-800">Change Password</span><i data-lucide="chevron-right" class="text-gray-400"></i>
        </button>

        <button onclick="localStorage.clear(); window.location.reload()" class="w-full bg-red-50 p-5 rounded-2xl border border-red-100 flex justify-between items-center hover:bg-red-100">
            <span class="font-bold text-red-600">Clear Cache & Reset App</span><i data-lucide="trash-2" class="text-red-400"></i>
        </button>
        
        <div class="text-center text-xs text-gray-300 mt-4 font-mono">v1.5.3 &bull; Build 2024</div>
    </div>
    <style>.toggle-checkbox:checked { right: 0; border-color: #68D391; } .toggle-checkbox:checked + .toggle-label { background-color: #68D391; } .toggle-checkbox { right: 0; transition: all 0.3s; }</style>`;
}

function pageHelp() {
    return `<h2 class="text-2xl font-bold mb-6">Help Center</h2><div class="space-y-4"><div class="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg mb-6"><h3 class="font-bold text-lg mb-2">Need Support?</h3><p class="text-sm opacity-90 mb-4">Our team is available 24/7.</p><a href="mailto:support@studyapp.com" class="inline-block bg-white text-indigo-700 px-4 py-2 rounded-lg font-bold text-sm">Contact Support</a></div><h3 class="font-bold text-gray-500 uppercase text-xs tracking-wider px-2">FAQ</h3><div class="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50"><details class="group p-4"><summary class="flex justify-between items-center font-bold cursor-pointer list-none"><span>How to enroll?</span><span class="transition group-open:rotate-180"><i data-lucide="chevron-down"></i></span></summary><p class="text-gray-500 text-sm mt-3 leading-relaxed">Select batch -> Enroll -> Pay via PhonePe or UPI -> Wait for approval.</p></details><details class="group p-4"><summary class="flex justify-between items-center font-bold cursor-pointer list-none"><span>Payment Pending?</span><span class="transition group-open:rotate-180"><i data-lucide="chevron-down"></i></span></summary><p class="text-gray-500 text-sm mt-3 leading-relaxed">Manual payments take 1-2 hours. PhonePe payments are faster.</p></details></div></div>`;
}
