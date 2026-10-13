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
            const canAttend = Number(event.is_attendee) && (event.history_state === 'upcoming' || event.history_state === 'ongoing');
            const eventEnded = new Date(`${event.date_of_use}T${event.time_end}`) < new Date();
            const qrIsActive = canAttend && event.attendance_status === 'registered' && !eventEnded;
            const qrId = `event-qr-${Number(event.event_id)}`;
            const statusLabel = event.history_state === 'ongoing' ? 'On-going'
                : event.history_state === 'upcoming' ? 'Pre-booked'
                : event.history_state === 'attended' ? 'Attended'
                : event.history_state === 'unavailable' ? 'Unable to attend' : 'Missed';
            const qrMarkup = Number(event.is_attendee)
                ? `<div class="event-qr-wrap ${qrIsActive ? '' : 'event-qr-archived'}">
                    <div class="event-qr" id="${qrId}" data-token="${escapeHtml(event.qr_token)}"></div>
                    <span>${qrIsActive
                        ? 'Show this QR code to an authorized event scanner.'
                        : eventEnded || event.attendance_status === 'attended'
                            ? 'Read-only event pass. This QR expired when the event ended or your attendance was recorded.'
                            : 'Read-only event pass. It cannot check you in while your RSVP is marked unable to attend.'}</span>
                </div>`
                : '';
            const attendanceAction = canAttend && event.attendance_status !== 'unavailable'
                ? `<button class="action-btn unavailable-btn" data-unavailable="${Number(event.event_id)}"><i class="fa-solid fa-circle-xmark"></i> I can’t attend</button>`
                : event.attendance_status === 'unavailable'
                    ? `<button class="action-btn" data-register="${Number(event.event_id)}"><i class="fa-solid fa-rotate-left"></i> I can attend</button>` : '';
            const scanAction = event.history_state === 'ongoing' && Number(event.can_scan)
                ? `<button class="action-btn primary-scan-btn" data-scan="${Number(event.event_id)}"><i class="fa-solid fa-camera"></i> Scan attendance</button><div class="hosted-event-roster" id="student-event-roster-${Number(event.event_id)}" hidden></div>`
                : '';

            return `<article class="request-card event-history-card">
                <div class="card-left">
                    <div class="event-status-label">${escapeHtml(statusLabel)}</div>
                    <div class="card-venue">${escapeHtml(event.event_name)}</div>
                    <div class="card-event">${escapeHtml(event.venue_name)} · Hosted by ${escapeHtml(event.host_name)}${event.target_department ? ` · ${escapeHtml(event.target_department)}` : ''}</div>
                    <div class="card-meta"><span><i class="fa-solid fa-calendar"></i> ${escapeHtml(displayDate(event.date_of_use))}</span>
                    <span><i class="fa-solid fa-clock"></i> ${escapeHtml(displayTime(event.time_start))} – ${escapeHtml(displayTime(event.time_end))}</span>
                    ${event.attendance_status === 'attended' && event.checked_in_at ? `<span><i class="fa-solid fa-circle-check"></i> Checked in ${escapeHtml(new Date(event.checked_in_at).toLocaleString('en-PH'))}</span>` : ''}</div>
                    ${Number(event.is_attendee) ? `<div class="event-pass-details">
                        <span><strong>Student:</strong> ${escapeHtml(event.student_name)}</span>
                        <span><strong>USN:</strong> ${escapeHtml(event.student_usn)}</span>
                        <span><strong>Section:</strong> ${escapeHtml(event.section || '—')}</span>
                        <span><strong>Program:</strong> ${escapeHtml(event.program || '—')}</span>
                        <span><strong>Adviser:</strong> ${escapeHtml(event.adviser || '—')}</span>
                        ${event.id_photo ? `<img class="event-pass-photo" src="${escapeHtml(event.id_photo)}" alt="ID photo for ${escapeHtml(event.student_name)}" loading="lazy">` : ''}
                    </div>` : ''}
                    ${qrMarkup}${attendanceAction}${scanAction}
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
        const scanButton = event.target.closest('[data-scan]');
        if (scanButton) {
            const roster = content.querySelector(`#student-event-roster-${scanButton.dataset.scan}`);
            if (window.EventTools && roster) {
                roster.hidden = false;
                window.EventTools.openScanner(scanButton.dataset.scan, roster);
            }
            else alert('The QR scanner could not load. Refresh the page and try again.');
            return;
        }
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

    async function loadAccountQr() {
        const host = document.getElementById('accountQrCode');
        if (!host) return;
        try {
            const response = await fetch('auth/user_qr_code.php');
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || 'Unable to load your QR code.');
            if (data.image_data) {
                const image = document.createElement('img');
                image.src = data.image_data;
                image.alt = 'Personal student ID QR code';
                host.replaceChildren(image);
                return;
            }
            if (!window.QRCode) throw new Error('QR generator unavailable. Refresh the page to try again.');
            host.textContent = '';
            new QRCode(host, { text: data.token, width: 144, height: 144, colorDark: '#10243b', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
            const canvas = host.querySelector('canvas');
            if (!canvas) throw new Error('Unable to generate your QR image.');
            const qrImage = canvas.toDataURL('image/png');
            const save = new FormData();
            save.append('image_data', qrImage);
            const saved = await fetch('auth/user_qr_code.php', { method: 'POST', body: save });
            const result = await saved.json();
            if (!saved.ok || !result.success) {
                const message = document.createElement('small');
                message.textContent = result.message || 'QR generated, but the image could not be saved.';
                host.appendChild(message);
            }
        } catch (error) {
            if (host.querySelector('canvas')) {
                const message = document.createElement('small');
                message.textContent = error.message;
                host.appendChild(message);
            } else {
                host.textContent = error.message;
            }
        }
    }
    loadAccountQr();

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
