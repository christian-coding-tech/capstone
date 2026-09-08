document.addEventListener('DOMContentLoaded', () => {

    const panel      = document.getElementById('navChatbotPanel');
    const messages   = document.getElementById('navChatbotMessages');
    const input      = document.getElementById('navChatbotInput');
    const sendBtn    = document.getElementById('navChatbotSend');
    const minimizeBtn = document.getElementById('navChatbotMinimize');
    const tab        = document.getElementById('navChatbotTab');
    const quickReplies = document.getElementById('navQuickReplies');
    const mapCanvas = document.getElementById('mapCanvas');
    const mapLocationName = document.getElementById('mapLocationName');
    const mapLocationDescription = document.getElementById('mapLocationDescription');
    const mapRoute = document.getElementById('mapRoute');
    const mapRouteLine = document.getElementById('mapRouteLine');
    const mapRouteStart = document.getElementById('mapRouteStart');
    const mapRouteDestination = document.getElementById('mapRouteDestination');
    const mapViewport = document.getElementById('mapViewport');
    const facilityPreview = document.getElementById('facilityPreview');
    const facilitySign = document.getElementById('facilitySign');
    const facilityCaption = document.getElementById('facilityCaption');
    const mapStatus = document.getElementById('mapStatus');
    const routeBrief = document.getElementById('routeBrief');
    const routeBriefTitle = document.getElementById('routeBriefTitle');
    const routeBriefText = document.getElementById('routeBriefText');
    const routeBriefBadge = document.getElementById('routeBriefBadge');
    const mapHelp = document.getElementById('mapHelp');
    const mapHelpToggle = document.getElementById('mapHelpToggle');
    const mapHelpClose = document.getElementById('mapHelpClose');

    panel.classList.add('is-open');

    let mapScale = 1;
    let mapX = 0;
    let mapY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragOriginX = 0;
    let dragOriginY = 0;

    const mapPoints = {
        'main building': [55, 23],
        'cafeteria': [28, 64],
        'basketball court': [40, 55],
        'activity court': [40, 55],
        'parking lot': [84, 48],
        'gate / guardhouse': [72, 68],
        'main gate': [72, 68],
        'garden area': [16, 50]
        , 'library': [60, 39]
        , 'admin lounge': [62, 53]
        , 'computer lab': [49, 38]
        , 'registrar': [47, 31]
        , 'cashier': [42, 31]
        , 'faculty room': [58, 32]
    };

    function isFacilityResult(context) {
        return ['Room', 'Teacher', 'Venue / Place'].includes(context?.destinationType);
    }

    function showFacilityPreview(context) {
        const destination = context.destination || 'Room or facility';
        const floor = context.floor ? ` - ${context.floor}` : '';
        facilitySign.textContent = `${destination}${floor}`.toUpperCase();
        facilityCaption.textContent = `${destination}${floor} - interior sample view`;
        facilityPreview.dataset.scene = 'facility';
        facilityPreview.hidden = false;
        mapViewport.classList.add('is-facility');
    }

    function getSampleScene(location) {
        const name = String(location || '').toLowerCase();
        if (name.includes('cafeteria')) return 'cafeteria';
        if (name.includes('basketball') || name.includes('activity')) return 'court';
        if (name.includes('parking')) return 'parking';
        if (name.includes('gate') || name.includes('guardhouse')) return 'gate';
        return 'building';
    }

    function showSamplePreview(location) {
        const scene = getSampleScene(location);
        facilityPreview.dataset.scene = scene;
        facilitySign.textContent = String(location).toUpperCase();
        facilityCaption.textContent = `${location} - sample area view`;
        facilityPreview.hidden = false;
        mapViewport.classList.add('is-facility');
    }

    function hideFacilityPreview() {
        facilityPreview.hidden = true;
        delete facilityPreview.dataset.scene;
        mapViewport.classList.remove('is-facility');
    }

    function getMapPoint(value, context = {}) {
        const name = String(value || '').toLowerCase();
        const knownPoint = Object.entries(mapPoints).find(([key]) => name.includes(key) || key.includes(name));
        if (knownPoint) return knownPoint[1];

        if (context.floor) {
            const floorNumber = Number.parseInt(context.floor, 10);
            if (Number.isFinite(floorNumber)) return [54, 24 + floorNumber * 7];
        }

        if (context.destinationType === 'Teacher' || context.destinationType === 'Room') return [54, 45];
        return [54, 40];
    }

    function setMarker(marker, point) {
        marker.style.left = `${point[0]}%`;
        marker.style.top = `${point[1]}%`;
        marker.hidden = false;
        marker.classList.add('is-visible');
    }

    function drawRoute(context) {
        if (!context || !context.currentLocation || !context.destination) return;

        const start = getMapPoint(context.currentLocation, context);
        const destination = getMapPoint(context.destination, context);
        const bend = [start[0] + (destination[0] - start[0]) * 0.5, start[1]];

        mapRouteLine.setAttribute('points', [start, bend, destination].map(point => point.join(',')).join(' '));
        setMarker(mapRouteStart, start);
        setMarker(mapRouteDestination, destination);
        mapRoute.classList.add('is-visible');
        mapScale = 1.18;
        mapX = Math.max(-90, Math.min(90, (50 - destination[0]) * 1.4));
        mapY = Math.max(-70, Math.min(70, (50 - destination[1]) * 1.1));
        if (isFacilityResult(context)) showFacilityPreview(context);
        else hideFacilityPreview();
        mapLocationName.textContent = `Route: ${context.currentLocation} to ${context.destination}`;
        mapLocationDescription.textContent = 'The highlighted path shows the suggested route from your location to the destination.';
        routeBrief.hidden = false;
        routeBriefTitle.textContent = context.destination;
        routeBriefText.textContent = `${context.currentLocation}${context.floor ? `, ${context.floor}` : ''} to your selected destination.`;
        routeBriefBadge.textContent = isFacilityResult(context) ? 'FACILITY' : 'CAMPUS';
        mapStatus.innerHTML = '<i class="fa-solid fa-circle"></i> Route ready';
    }

    function updateMap() {
        mapCanvas.style.transform = `translate(calc(-50% + ${mapX}px), calc(-50% + ${mapY}px)) scale(${mapScale})`;
    }

    function setMapHelp(isOpen) {
        mapHelp.hidden = !isOpen;
        mapHelpToggle.setAttribute('aria-expanded', String(isOpen));
        mapHelpToggle.classList.toggle('is-active', isOpen);
    }

    function zoomMap(amount) {
        mapScale = Math.max(0.8, Math.min(1.8, mapScale + amount));
        updateMap();
    }

    function moveMap(x, y) {
        mapX = Math.max(-90, Math.min(90, mapX + x));
        mapY = Math.max(-70, Math.min(70, mapY + y));
        updateMap();
    }

    function startMapDrag(event) {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        isDragging = true;
        dragStartX = event.clientX;
        dragStartY = event.clientY;
        dragOriginX = mapX;
        dragOriginY = mapY;
        mapViewport.classList.add('is-dragging');
        mapViewport.setPointerCapture(event.pointerId);
    }

    function dragMap(event) {
        if (!isDragging) return;
        mapX = Math.max(-180, Math.min(180, dragOriginX + event.clientX - dragStartX));
        mapY = Math.max(-120, Math.min(120, dragOriginY + event.clientY - dragStartY));
        updateMap();
    }

    function stopMapDrag(event) {
        if (!isDragging) return;
        isDragging = false;
        mapViewport.classList.remove('is-dragging');
        if (event && mapViewport.hasPointerCapture(event.pointerId)) mapViewport.releasePointerCapture(event.pointerId);
    }

    document.getElementById('mapZoomIn').addEventListener('click', () => zoomMap(0.1));
    document.getElementById('mapZoomOut').addEventListener('click', () => zoomMap(-0.1));
    document.getElementById('mapReset').addEventListener('click', () => {
        mapScale = 1;
        mapX = 0;
        mapY = 0;
        updateMap();
    });
    mapHelpToggle.addEventListener('click', () => setMapHelp(mapHelp.hidden));
    mapHelpClose.addEventListener('click', () => setMapHelp(false));

    function handleMapLabelClick(event) {
        event.preventDefault();
        const label = event.currentTarget;
        document.querySelectorAll('.map-hotspot').forEach(item => item.classList.remove('is-selected'));
        label.classList.add('is-selected');
        const point = getMapPoint(label.dataset.location);
        mapScale = 1.2;
        mapX = Math.max(-90, Math.min(90, (50 - point[0]) * 1.4));
        mapY = Math.max(-70, Math.min(70, (50 - point[1]) * 1.1));
        hideFacilityPreview();
        showSamplePreview(label.dataset.location);
        mapLocationName.textContent = label.dataset.location;
        mapLocationDescription.textContent = label.dataset.description;
        updateMap();
        document.getElementById('mapLocationInfo').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    document.querySelectorAll('.map-hotspot').forEach(label => label.addEventListener('click', handleMapLabelClick));

    document.querySelectorAll('.campus-location').forEach(card => {
        const focusLocation = () => {
            const point = getMapPoint(card.dataset.location);
            mapScale = 1.2;
            mapX = Math.max(-90, Math.min(90, (50 - point[0]) * 1.4));
            mapY = Math.max(-70, Math.min(70, (50 - point[1]) * 1.1));
            hideFacilityPreview();
            showSamplePreview(card.dataset.location);
            mapLocationName.textContent = card.dataset.location;
            mapLocationDescription.textContent = card.dataset.description;
            mapStatus.innerHTML = '<i class="fa-solid fa-circle"></i> Area selected';
            updateMap();
            document.getElementById('mapLocationInfo').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        };
        card.addEventListener('click', focusLocation);
        card.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                focusLocation();
            }
        });
    });

    mapViewport.addEventListener('pointerdown', startMapDrag);
    mapViewport.addEventListener('pointermove', dragMap);
    mapViewport.addEventListener('pointerup', stopMapDrag);
    mapViewport.addEventListener('pointercancel', stopMapDrag);

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
            drawRoute(navContext);
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
                showSamplePreview(loc);
                mapLocationName.textContent = loc;
                mapLocationDescription.textContent = `Sample view for ${loc}. Choose a destination to get a route.`;
                mapStatus.innerHTML = '<i class="fa-solid fa-circle"></i> Starting area selected';
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
            navContext.destination = text;
            drawRoute(navContext);

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
        panel.classList.remove('is-open');
        tab.classList.add('is-visible');
        minimizeBtn.setAttribute('aria-expanded', 'false');
        tab.setAttribute('aria-expanded', 'true');
    });

    tab.addEventListener('click', () => {
        panel.classList.add('is-open');
        tab.classList.remove('is-visible');
        minimizeBtn.setAttribute('aria-expanded', 'true');
        tab.setAttribute('aria-expanded', 'false');
    });

    startFlow();
});