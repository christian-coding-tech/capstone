document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('tabContent');
    const tabs = [...document.querySelectorAll('[data-history]')];
    let events = [];
    let activeHistory = 'upcoming';

    const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
    const displayDate = value => new Date(`${value}T00:00:00`).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
    const displayTime = value => {
        const [hour, minute] = value.split(':');
        return `${Number(hour) % 12 || 12}:${minute} ${Number(hour) >= 12 ? 'PM' : 'AM'}`;
    };

    function render() {
        const visible = events.filter(event => activeHistory === 'upcoming'
            ? ['upcoming', 'ongoing'].includes(event.history_state)
            : activeHistory === 'attended'
                ? event.history_state === 'attended'
                : ['missed', 'unavailable'].includes(event.history_state));

        if (!visible.length) {
            const emptyText = activeHistory === 'upcoming' ? 'No upcoming or on-going events for your account.'
                : activeHistory === 'attended' ? 'Attended events will appear here after your QR is scanned.'
                : 'You have no missed or unavailable events.';
            content.innerHTML = `<div class="empty-state"><i class="fa-solid fa-calendar-check"></i><span>${emptyText}</span></div>`;
            return;
        }

        content.innerHTML = visible.map(event => {
            const canAttend = event.history_state === 'upcoming' || event.history_state === 'ongoing';
            const qrId = `event-qr-${Number(event.event_id)}`;
            const statusLabel = event.history_state === 'ongoing' ? 'On-going'
                : event.history_state === 'upcoming' ? 'Pre-booked'
                : event.history_state === 'attended' ? 'Attended'
                : event.history_state === 'unavailable' ? 'Unable to attend' : 'Missed';
            const qrMarkup = canAttend && event.attendance_status === 'registered'
                ? `<div class="event-qr-wrap"><div class="event-qr" id="${qrId}" data-token="${escapeHtml(event.qr_token)}"></div><span>Show this QR code to the event host for attendance.</span></div>`
                : '';
            const attendanceAction = canAttend && event.attendance_status !== 'unavailable'
                ? `<button class="action-btn unavailable-btn" data-unavailable="${Number(event.event_id)}"><i class="fa-solid fa-circle-xmark"></i> I can’t attend</button>`
                : event.attendance_status === 'unavailable'
                    ? `<button class="action-btn" data-register="${Number(event.event_id)}"><i class="fa-solid fa-rotate-left"></i> I can attend</button>` : '';

            return `<article class="request-card event-history-card">
                <div class="card-left">
                    <div class="event-status-label">${escapeHtml(statusLabel)}</div>
                    <div class="card-venue">${escapeHtml(event.event_name)}</div>
                    <div class="card-event">${escapeHtml(event.venue_name)} · Hosted by ${escapeHtml(event.host_name)}${event.target_department ? ` · ${escapeHtml(event.target_department)}` : ''}</div>
                    <div class="card-meta"><span><i class="fa-solid fa-calendar"></i> ${escapeHtml(displayDate(event.date_of_use))}</span>
                    <span><i class="fa-solid fa-clock"></i> ${escapeHtml(displayTime(event.time_start))} – ${escapeHtml(displayTime(event.time_end))}</span>
                    ${event.attendance_status === 'attended' && event.checked_in_at ? `<span><i class="fa-solid fa-circle-check"></i> Checked in ${escapeHtml(new Date(event.checked_in_at).toLocaleString('en-PH'))}</span>` : ''}</div>
                    ${qrMarkup}${attendanceAction}
                </div>
            </article>`;
        }).join('');

        content.querySelectorAll('.event-qr').forEach(node => {
            if (window.QRCode) new QRCode(node, { text: node.dataset.token, width: 144, height: 144, colorDark: '#10243b', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
            else node.textContent = 'QR generator unavailable. Refresh the page to try again.';
        });
    }

    async function loadEvents() {
        content.innerHTML = '<div class="loading-state"><i class="fa-solid fa-spinner fa-spin"></i><span>Loading your event history…</span></div>';
        try {
            const response = await fetch('auth/event_history.php');
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || 'Unable to load events.');
            events = data.data;
            render();
        } catch (error) {
            content.innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><span>${escapeHtml(error.message)}</span></div>`;
        }
    }

    tabs.forEach(tab => tab.addEventListener('click', () => {
        tabs.forEach(item => item.classList.toggle('active', item === tab));
        activeHistory = tab.dataset.history;
        render();
    }));

    content.addEventListener('click', async event => {
        const button = event.target.closest('[data-unavailable], [data-register]');
        if (!button) return;
        const eventId = button.dataset.unavailable || button.dataset.register;
        const form = new FormData();
        form.append('event_id', eventId);
        form.append('action', button.dataset.unavailable ? 'unavailable' : 'register');
        button.disabled = true;
        try {
            const response = await fetch('auth/event_attendance_action.php', { method: 'POST', body: form });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || 'Could not update your RSVP.');
            await loadEvents();
        } catch (error) {
            alert(error.message);
            button.disabled = false;
        }
    });

    const chatPanel = document.getElementById('chatbotPanel');
    const chatToggle = document.getElementById('chatbotToggle');
    const chatClose = document.getElementById('chatbotClose');
    const chatInput = document.getElementById('chatbotInput');
    const chatSend = document.getElementById('chatbotSend');
    const chatMessages = document.getElementById('chatbotMessages');
    if (chatPanel && chatToggle && chatInput && chatSend && chatMessages) {
        const appendChat = (text, sender) => {
            const message = document.createElement('div');
            message.className = `chat-msg ${sender}`;
            const bubble = document.createElement('div');
            bubble.className = 'chat-bubble';
            bubble.textContent = text;
            message.appendChild(bubble);
            chatMessages.appendChild(message);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            return bubble;
        };
        const sendMessage = async () => {
            const text = chatInput.value.trim();
            if (!text) return;
            chatInput.value = '';
            appendChat(text, 'user');
            const responseBubble = appendChat('Thinking…', 'bot');
            chatInput.disabled = chatSend.disabled = true;
            try {
                const form = new FormData();
                form.append('message', text);
                const response = await fetch('auth/chatbot_handler.php', { method: 'POST', body: form });
                const data = await response.json();
                responseBubble.textContent = data.success ? data.reply : (data.message || 'I could not process that. Please try again.');
            } catch {
                responseBubble.textContent = 'Something went wrong. Please try again.';
            } finally {
                chatInput.disabled = chatSend.disabled = false;
                chatInput.focus();
            }
        };
        chatToggle.addEventListener('click', () => chatPanel.classList.toggle('active'));
        if (chatClose) chatClose.addEventListener('click', () => chatPanel.classList.remove('active'));
        chatSend.addEventListener('click', sendMessage);
        chatInput.addEventListener('keydown', event => { if (event.key === 'Enter') sendMessage(); });
    }

    loadEvents();
});
