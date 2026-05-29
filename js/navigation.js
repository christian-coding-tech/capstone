document.addEventListener('DOMContentLoaded', () => {

    const panel      = document.getElementById('navChatbotPanel');
    const messages   = document.getElementById('navChatbotMessages');
    const input      = document.getElementById('navChatbotInput');
    const sendBtn    = document.getElementById('navChatbotSend');
    const minimizeBtn = document.getElementById('navChatbotMinimize');
    const tab        = document.getElementById('navChatbotTab');
    const quickReplies = document.getElementById('navQuickReplies');

    // ── Get context from landing page ──
    let navContext = null;
    try {
        navContext = JSON.parse(sessionStorage.getItem('navContext') || 'null');
        sessionStorage.removeItem('navContext');
    } catch {}

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
        div.innerHTML = `<div class="chat-bubble typing-indicator"><span></span><span></span><span></span></div>`;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    function removeTyping() {
        const t = document.getElementById('typingIndicator');
        if (t) t.remove();
    }

    function showReplies(options, onSelect) {
        quickReplies.innerHTML = '';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'nav-quick-reply-btn';
            btn.textContent = opt;
            btn.addEventListener('click', () => {
                quickReplies.innerHTML = '';
                appendMsg(opt, 'user');
                onSelect(opt);
            });
            quickReplies.appendChild(btn);
        });
    }

    async function botSay(text, delay = 800) {
        showTyping();
        await new Promise(r => setTimeout(r, delay));
        removeTyping();
        appendMsg(text, 'bot');
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

    // ── Start ──
    async function startFlow() {
        input.disabled = true;

        if (navContext && navContext.directions) {
            // Continue from landing page context
            await botSay(`Here are your directions to <strong>${navContext.destination}</strong>:`, 600);
            await new Promise(r => setTimeout(r, 400));
            appendMsg(navContext.directions, 'bot');
            await new Promise(r => setTimeout(r, 800));
            await botSay('Did you find what you were looking for?', 600);
            showReplies(['Yes, I found it! 👍', 'No, I need more help'], handleDoneCheck);
        } else {
            // Fresh start — no context
            await botSay('👋 Welcome to ACLC Fatima Campus Navigation!', 500);
            await botSay('The full 3D navigation is coming soon. For now I can give you text directions. Where are you currently located?', 1000);
            showReplies([
                'Main Building',
                'Cafeteria',
                'Basketball Court',
                'Parking Lot',
                'Gate / Guardhouse'
            ], async (loc) => {
                navContext = { currentLocation: loc, floor: null, destination: null };
                if (loc === 'Main Building') {
                    await botSay('Which floor are you on?', 700);
                    showReplies(['1st Floor','2nd Floor','3rd Floor','4th Floor','5th Floor'], async (floor) => {
                        navContext.floor = floor;
                        await askDestination();
                    });
                } else {
                    await askDestination();
                }
            });
        }

        input.disabled = false;
    }

    async function askDestination() {
        await botSay('What are you looking for?', 700);
        showReplies(['Teacher', 'Room', 'Venue / Place'], async (type) => {
            navContext.destinationType = type;
            const prompts = {
                'Teacher':       'Which teacher are you looking for? Type their name.',
                'Room':          'Which room are you looking for? (e.g. Room 301)',
                'Venue / Place': 'Which venue or place? (e.g. Library, Admin Lounge)'
            };
            await botSay(prompts[type], 700);
            input.disabled = false;
            input.focus();
            // Wait for text input
            input.dataset.expecting = 'details';
        });
    }

    async function handleDoneCheck(answer) {
        quickReplies.innerHTML = '';
        if (answer.startsWith('Yes')) {
            await botSay('Wonderful! 🎉 Thank you for using ACLC Campus Navigation. Have a great day!', 700);
            input.disabled = true;
            await new Promise(r => setTimeout(r, 2500));
            window.location.href = 'index.php';
        } else {
            await botSay('No problem! Let me help you again.', 600);
            navContext = null;
            await askDestination();
        }
    }

    // ── Input handler ──
    async function handleInput() {
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        quickReplies.innerHTML = '';
        appendMsg(text, 'user');
        input.disabled = true;

        if (input.dataset.expecting === 'details') {
            delete input.dataset.expecting;
            showTyping();

            const userMsg = `I am at ${navContext.currentLocation}${navContext.floor ? `, ${navContext.floor}` : ''}. I am looking for ${navContext.destinationType}: ${text}. Give me directions.`;
            const context = { ...navContext, destination: text };
            const reply   = await askNavAI(userMsg, context);

            removeTyping();
            appendMsg(reply, 'bot');

            await new Promise(r => setTimeout(r, 800));
            await botSay('Did you find what you were looking for?', 600);
            showReplies(['Yes, I found it! 👍', 'No, I need more help'], handleDoneCheck);
        }

        input.disabled = false;
    }

    sendBtn.addEventListener('click', handleInput);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') handleInput(); });

    // ── Minimize ──
    minimizeBtn.addEventListener('click', () => {
        panel.style.display = 'none';
        tab.style.display   = 'flex';
    });

    tab.addEventListener('click', () => {
        panel.style.display = 'flex';
        tab.style.display   = 'none';
    });

    startFlow();
});