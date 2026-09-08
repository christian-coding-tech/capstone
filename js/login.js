

document.addEventListener('DOMContentLoaded', () => {

    // ── Ripple effect ──
    document.querySelectorAll('.login-btn').forEach(button => {
        button.addEventListener('click', event => {
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            button.appendChild(ripple);
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
            ripple.style.top  = `${event.clientY - rect.top  - size / 2}px`;
            setTimeout(() => ripple.remove(), 700);
        });
    });

    // ── Modal helpers ──
    function openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ── Login modal ──
    const loginModal  = document.getElementById('loginModal');
    const loginToggle = document.getElementById('loginToggle');
    const loginClose  = document.getElementById('loginClose');
    const loginError  = document.getElementById('loginError');
    const loginForm   = document.getElementById('loginForm');
    const loginSubmit = document.getElementById('loginSubmit');
    const togglePw    = document.getElementById('togglePw');
    const pwInput     = document.getElementById('userPassword');

    loginToggle.addEventListener('click', () => openModal(loginModal));
    loginClose.addEventListener('click',  () => closeModal(loginModal));
    loginModal.addEventListener('click', e => { if (e.target === loginModal) closeModal(loginModal); });

    togglePw.addEventListener('click', () => {
        const isText = pwInput.type === 'text';
        pwInput.type = isText ? 'password' : 'text';
        togglePw.querySelector('i').className = isText ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
    });

    loginForm.addEventListener('submit', async e => {
        e.preventDefault();
        loginError.classList.remove('visible');
        loginSubmit.disabled = true;
        loginSubmit.querySelector('span').textContent = 'Signing in...';
        const formData = new FormData(loginForm);
        try {
            const res  = await fetch('auth/login_handler.php', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                loginSubmit.querySelector('span').textContent = 'Redirecting...';
                window.location.href = data.redirect;
            } else {
                loginError.textContent = data.message;
                loginError.classList.add('visible');
                loginSubmit.disabled = false;
                loginSubmit.querySelector('span').textContent = 'Sign In';
            }
        } catch {
            loginError.textContent = 'Something went wrong. Please try again.';
            loginError.classList.add('visible');
            loginSubmit.disabled = false;
            loginSubmit.querySelector('span').textContent = 'Sign In';
        }
    });

    // ── Feedback modal ──
    const feedbackModal   = document.getElementById('feedbackModal');
    const feedbackToggle  = document.getElementById('feedbackToggle');
    const feedbackClose   = document.getElementById('feedbackClose');
    const feedbackForm    = document.getElementById('feedbackForm');
    const feedbackSuccess = document.getElementById('feedbackSuccess');
    const feedbackError   = document.getElementById('feedbackError');

    const overviewFeedback = document.getElementById('overviewFeedback');
    if (overviewFeedback) overviewFeedback.addEventListener('click', () => openModal(feedbackModal));

    feedbackToggle.addEventListener('click', () => openModal(feedbackModal));

    feedbackClose.addEventListener('click', () => {
        closeModal(feedbackModal);
        feedbackSuccess.classList.remove('visible');
        feedbackError.classList.remove('visible');
    });

    feedbackModal.addEventListener('click', e => {
        if (e.target === feedbackModal) {
            closeModal(feedbackModal);
            feedbackSuccess.classList.remove('visible');
            feedbackError.classList.remove('visible');
        }
    });

    feedbackForm.addEventListener('submit', async e => {
        e.preventDefault();
        feedbackSuccess.classList.remove('visible');
        feedbackError.classList.remove('visible');
        const formData = new FormData(feedbackForm);
        try {
            const res  = await fetch('auth/feedback_handler.php', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                feedbackSuccess.textContent = 'Thank you! Your feedback has been sent.';
                feedbackSuccess.classList.add('visible');
                feedbackForm.reset();
            } else {
                feedbackError.textContent = data.message || 'Failed to send feedback.';
                feedbackError.classList.add('visible');
            }
        } catch {
            feedbackError.textContent = 'Something went wrong. Please try again.';
            feedbackError.classList.add('visible');
        }
    });

    // ══════════════════════════════════════
    // ── Navigation Mode ──
    // ══════════════════════════════════════
    const navBtn      = document.getElementById('navBtn');
    const navBlur     = document.getElementById('navBlurOverlay');
    const navCloseBtn = document.getElementById('navCloseBtn');
    const modelFrame  = document.getElementById('modelFrame');
    const navPanel    = document.getElementById('navChatbotPanel');
    const navMessages = document.getElementById('navChatbotMessages');
    const navInput    = document.getElementById('navChatbotInput');
    const navSend     = document.getElementById('navChatbotSend');
    const navMinimize = document.getElementById('navChatbotMinimize');
    const navTab      = document.getElementById('navChatbotTab');
    const navReplies  = document.getElementById('navQuickReplies');

    let navActive = false;

    let navState = {
        step: 'location',
        currentLocation: null,
        floor: null,
        destination: null
    };

    const locations = [
        'Main Building',
        'Cafeteria',
        'Basketball Court',
        'Parking Lot',
        'Gate / Guardhouse'
    ];

    const floors    = ['1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor'];
    const destTypes = ['Teacher', 'Room', 'Venue / Place'];

    // ── Nav helpers ──
    function navAppendMsg(text, sender) {
        const div = document.createElement('div');
        div.className = `chat-msg ${sender}`;
        div.innerHTML = `<div class="chat-bubble">${text}</div>`;
        navMessages.appendChild(div);
        navMessages.scrollTop = navMessages.scrollHeight;
        return div;
    }

    function navShowTyping() {
        const div = document.createElement('div');
        div.className = 'chat-msg bot';
        div.id = 'navTyping';
        div.innerHTML = `<div class="chat-bubble typing-indicator"><span></span><span></span><span></span></div>`;
        navMessages.appendChild(div);
        navMessages.scrollTop = navMessages.scrollHeight;
    }

    function navRemoveTyping() {
        const t = document.getElementById('navTyping');
        if (t) t.remove();
    }

    function navShowReplies(options, onSelect) {
        navReplies.innerHTML = '';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'nav-quick-reply-btn';
            btn.textContent = opt;
            btn.addEventListener('click', () => {
                navReplies.innerHTML = '';
                navAppendMsg(opt, 'user');
                onSelect(opt);
            });
            navReplies.appendChild(btn);
        });
    }

    function navClearReplies() { navReplies.innerHTML = ''; }

    async function navBotSay(text, delay = 800) {
        navShowTyping();
        await new Promise(r => setTimeout(r, delay));
        navRemoveTyping();
        navAppendMsg(text, 'bot');
    }

    async function askNavAI(userMessage, context) {
        try {
            const fd = new FormData();
            fd.append('message', userMessage);
            fd.append('nav_context', JSON.stringify(context));
            const res  = await fetch('auth/nav_chatbot_handler.php', { method: 'POST', body: fd });
            const data = await res.json();
            return data.success ? data.reply : "I'm having trouble right now. Please try again.";
        } catch {
            return "I'm having trouble connecting. Please try again.";
        }
    }

    // ── Enter navigation mode ──
    function enterNavMode() {
        navActive = true;
        navBlur.classList.add('active');
        modelFrame.classList.add('nav-centered');
        navCloseBtn.style.display = 'flex';
        navInput.disabled = false;
        setTimeout(() => {
            navPanel.style.display = 'flex';
            startNavFlow();
        }, 700);
    }

    // ── Exit navigation mode ──
    function exitNavMode() {
        navActive = false;
        navBlur.classList.remove('active');
        modelFrame.classList.remove('nav-centered');
        navCloseBtn.style.display = 'none';
        navPanel.style.display    = 'none';
        navTab.style.display      = 'none';
        navMessages.innerHTML     = '';
        navReplies.innerHTML      = '';
        navState = { step: 'location', currentLocation: null, floor: null, destination: null };
    }

    navBtn.addEventListener('click', () => {
        navBtn.classList.add('is-loading');
        navBtn.querySelector('i').className = 'fa-solid fa-spinner fa-spin';
        window.location.href = 'navigation.php';
    });
    navCloseBtn.addEventListener('click', exitNavMode);
    navBlur.addEventListener('click', exitNavMode);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && navActive) exitNavMode(); });

    // ── Minimize / restore ──
    navMinimize.addEventListener('click', () => {
        navPanel.style.display = 'none';
        navTab.style.display   = 'flex';
    });

    navTab.addEventListener('click', () => {
        navPanel.style.display = 'flex';
        navTab.style.display   = 'none';
    });

    // ── Navigation flow ──
    async function startNavFlow() {
        navState = { step: 'location', currentLocation: null, floor: null, destination: null };
        navInput.disabled = true;

        await navBotSay('👋 Welcome to ACLC Fatima Campus Navigation!', 500);
        await navBotSay('I\'ll help guide you to your destination. Where are you currently located?', 900);

        navShowReplies(locations, handleLocation);
        navInput.disabled = false;
        navInput.focus();
    }

    async function handleLocation(loc) {
        navClearReplies();
        navState.currentLocation = loc;

        if (loc === 'Main Building') {
            navState.step = 'floor';
            await navBotSay(`Got it — you're at the <strong>Main Building</strong>. Which floor are you on?`, 800);
            navShowReplies(floors, handleFloor);
        } else {
            navState.step = 'destination';
            await navBotSay(`Got it — you're at <strong>${loc}</strong>. What are you looking for?`, 800);
            navShowReplies(destTypes, handleDestType);
        }
    }

    async function handleFloor(floor) {
        navClearReplies();
        navState.floor = floor;
        navState.step  = 'destination';
        await navBotSay(`You're on the <strong>${floor}</strong>. What are you looking for?`, 800);
        navShowReplies(destTypes, handleDestType);
    }

    async function handleDestType(type) {
        navClearReplies();
        navState.destination = type;
        navState.step        = 'details';

        const prompts = {
            'Teacher':       'Which teacher are you looking for? Type their name.',
            'Room':          'Which room are you looking for? (e.g. Room 301, Computer Lab 1)',
            'Venue / Place': 'Which venue or place? (e.g. Library, Admin Lounge, Cafeteria)'
        };

        await navBotSay(prompts[type], 800);
        navInput.disabled = false;
        navInput.focus();
    }

    async function handleDetails(details) {
        navState.step = 'directions';
        navInput.disabled = true;

        await navBotSay('Let me find directions for you...', 500);
        navShowTyping();

        const context = {
            currentLocation: navState.currentLocation,
            floor:           navState.floor,
            destinationType: navState.destination,
            destination:     details
        };

        const userMsg = `I am at ${navState.currentLocation}${navState.floor ? `, ${navState.floor}` : ''}. I am looking for ${navState.destination}: ${details}. Give me directions.`;
        const reply   = await askNavAI(userMsg, context);

        navRemoveTyping();
        navAppendMsg(reply, 'bot');

        await new Promise(r => setTimeout(r, 800));
        await navBotSay('Redirecting you to the navigation page for more details...', 700);
        await new Promise(r => setTimeout(r, 1200));

        sessionStorage.setItem('navContext', JSON.stringify({
            ...context,
            details,
            directions: reply
        }));

        window.location.href = 'navigation.php';
    }

    async function handleNavInput() {
        const text = navInput.value.trim();
        if (!text || !navActive) return;
        navInput.value = '';
        navClearReplies();
        navAppendMsg(text, 'user');

        if      (navState.step === 'location')    await handleLocation(text);
        else if (navState.step === 'floor')        await handleFloor(text);
        else if (navState.step === 'destination')  await handleDestType(text);
        else if (navState.step === 'details')      await handleDetails(text);
    }

    navSend.addEventListener('click', handleNavInput);
    navInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleNavInput(); });

});