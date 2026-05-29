document.addEventListener('DOMContentLoaded', () => {

    const panel       = document.getElementById('navChatbotPanel');
    const messages    = document.getElementById('navChatbotMessages');
    const input       = document.getElementById('navChatbotInput');
    const sendBtn     = document.getElementById('navChatbotSend');
    const minimizeBtn = document.getElementById('navChatbotMinimize');
    const tab         = document.getElementById('navChatbotTab');

    // ── Navigation state ──
    let navState = {
        step: 'location',
        currentLocation: null,
        floor: null,
        destination: null
    };

    // ── Location options ──
    const locations = [
        'Main Building',
        'Cafeteria',
        'Basketball Court',
        'Parking Lot',
        'Gate / Guardhouse'
    ];

    const floors = ['1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor'];

    const destinationTypes = ['Teacher', 'Room', 'Venue / Place'];

    // ── Helpers ──
    function appendMsg(text, sender) {
        const div = document.createElement('div');
        div.className = `chat-msg ${sender}`;
        div.innerHTML = `<div class="chat-bubble">${text}</div>`;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
        return div;
    }

    function showTyping() {
        const div = document.createElement('div');
        div.className = 'chat-msg bot';
        div.id = 'typingIndicator';
        div.innerHTML = `
            <div class="chat-bubble typing-indicator">
                <span></span><span></span><span></span>
            </div>`;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    function removeTyping() {
        const t = document.getElementById('typingIndicator');
        if (t) t.remove();
    }

    function showQuickReplies(options, onSelect) {
        // Remove existing quick replies
        const existing = document.getElementById('quickReplies');
        if (existing) existing.remove();

        const wrap = document.createElement('div');
        wrap.className = 'quick-replies';
        wrap.id = 'quickReplies';

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'quick-reply-btn';
            btn.textContent = opt;
            btn.addEventListener('click', () => {
                wrap.remove();
                appendMsg(opt, 'user');
                onSelect(opt);
            });
            wrap.appendChild(btn);
        });

        messages.after(wrap);
    }

    function removeQuickReplies() {
        const existing = document.getElementById('quickReplies');
        if (existing) existing.remove();
    }

    async function botSay(text, delay = 800) {
        showTyping();
        await new Promise(r => setTimeout(r, delay));
        removeTyping();
        appendMsg(text, 'bot');
    }

    async function askGemini(userMessage, context) {
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

    // ── Navigation flow ──
    async function startFlow() {
        input.disabled = true;
        sendBtn.disabled = true;

        await botSay("👋 Welcome to ACLC Fatima Campus Navigation!", 600);
        await botSay("I'll help guide you to your destination. First, where are you currently located?", 1000);

        showQuickReplies(locations, handleLocationSelected);
        input.disabled = false;
        sendBtn.disabled = false;
    }

    async function handleLocationSelected(location) {
        removeQuickReplies();
        navState.currentLocation = location;

        if (location === 'Main Building') {
            navState.step = 'floor';
            await botSay(`Got it — you're at the <strong>Main Building</strong>. Which floor are you currently on?`, 800);
            showQuickReplies(floors, handleFloorSelected);
        } else {
            navState.step = 'destination';
            navState.floor = null;
            await botSay(`Got it — you're at the <strong>${location}</strong>. What are you looking for?`, 800);
            showQuickReplies(destinationTypes, handleDestinationSelected);
        }
    }

    async function handleFloorSelected(floor) {
        removeQuickReplies();
        navState.floor = floor;
        navState.step = 'destination';
        await botSay(`You're on the <strong>${floor}</strong>. What are you looking for?`, 800);
        showQuickReplies(destinationTypes, handleDestinationSelected);
    }

    async function handleDestinationSelected(type) {
        removeQuickReplies();
        navState.destination = type;
        navState.step = 'details';

        const prompts = {
            'Teacher':      'Which teacher are you looking for? Please type their name.',
            'Room':         'Which room are you looking for? (e.g. Room 301, Computer Lab 1)',
            'Venue / Place':'Which venue or place are you looking for? (e.g. Library, Admin Lounge, Cafeteria)'
        };

        await botSay(prompts[type], 800);
        input.disabled = false;
        input.focus();
    }

    async function handleDetailsInput(details) {
        navState.step = 'directions';
        input.disabled = true;
        sendBtn.disabled = true;

        await botSay('Let me find directions for you...', 600);

        showTyping();

        const context = {
            currentLocation: navState.currentLocation,
            floor:           navState.floor,
            destinationType: navState.destination,
            destination:     details,
            note:            'The 3D navigation system is under construction. Provide helpful text-based directions within ACLC College Tacloban Fatima Campus. Be specific about turns, floors, and landmarks. Keep it concise.'
        };

        const userMsg = `I am currently at ${navState.currentLocation}${navState.floor ? `, ${navState.floor}` : ''}. I am looking for ${navState.destination}: ${details}. Please give me directions.`;

        const reply = await askGemini(userMsg, context);
        removeTyping();
        appendMsg(reply, 'bot');

        await new Promise(r => setTimeout(r, 1000));
        await botSay('Did you find what you were looking for?', 600);

        navState.step = 'done_check';
        showQuickReplies(['Yes, I found it! 👍', 'No, I need more help'], handleDoneCheck);

        input.disabled = false;
        sendBtn.disabled = false;
    }

    async function handleDoneCheck(answer) {
        removeQuickReplies();

        if (answer.startsWith('Yes')) {
            await botSay('Wonderful! 🎉 Thank you for using the ACLC Campus Navigation System. Have a great day!', 800);
            navState.step = 'finished';
            input.disabled = true;
            sendBtn.disabled = true;
            await new Promise(r => setTimeout(r, 2500));
            window.location.href = 'index.php';
        } else {
            navState.step = 'location';
            navState.currentLocation = null;
            navState.floor = null;
            navState.destination = null;
            await botSay("No problem! Let's try again. Where are you currently located?", 800);
            showQuickReplies(locations, handleLocationSelected);
        }
    }

    // ── Input handler ──
    async function handleInput() {
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        removeQuickReplies();
        appendMsg(text, 'user');

        if (navState.step === 'location') {
            await handleLocationSelected(text);
        } else if (navState.step === 'floor') {
            await handleFloorSelected(text);
        } else if (navState.step === 'destination') {
            await handleDestinationSelected(text);
        } else if (navState.step === 'details') {
            await handleDetailsInput(text);
        } else if (navState.step === 'done_check') {
            const lower = text.toLowerCase();
            if (lower.includes('yes') || lower.includes('found') || lower.includes('thank')) {
                await handleDoneCheck('Yes, I found it! 👍');
            } else {
                await handleDoneCheck('No, I need more help');
            }
        }
    }

    sendBtn.addEventListener('click', handleInput);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') handleInput(); });

    // ── Minimize / Restore ──
    minimizeBtn.addEventListener('click', () => {
        panel.style.display = 'none';
        tab.style.display   = 'flex';
    });

    tab.addEventListener('click', () => {
        panel.style.display = 'flex';
        tab.style.display   = 'none';
    });

    // ── Start ──
    startFlow();
});