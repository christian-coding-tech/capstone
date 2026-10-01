document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('accountNotifications');
    if (!root) return;

    const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
    const dateLabel = value => new Date(`${value}T00:00:00`).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
    let isOpen = false;
    let lastData = { unread: 0, data: [] };

    root.innerHTML = `<button type="button" class="notification-bell" aria-label="Open event invitations" aria-expanded="false">
        <i class="fa-regular fa-bell"></i><span class="notification-count" hidden></span>
    </button><section class="notification-popover" hidden aria-label="Event invitations">
        <div class="notification-popover-heading"><div><strong>Event invitations</strong><span class="notification-subtitle">Updates for your account</span></div><button type="button" class="notification-refresh" aria-label="Refresh notifications"><i class="fa-solid fa-rotate"></i></button></div>
        <div class="notification-list" aria-live="polite"><div class="notification-loading">Loading invitations…</div></div>
    </section>`;

    const bell = root.querySelector('.notification-bell');
    const count = root.querySelector('.notification-count');
    const popover = root.querySelector('.notification-popover');
    const list = root.querySelector('.notification-list');

    function render(data) {
        lastData = data;
        count.hidden = !data.unread;
        count.textContent = data.unread > 99 ? '99+' : data.unread;
        if (!data.data.length) {
            list.innerHTML = '<div class="notification-empty"><i class="fa-regular fa-calendar-xmark"></i><span>No upcoming event invitations.</span></div>';
            return;
        }
        list.innerHTML = data.data.map(item => `<a class="notification-item ${Number(item.invite_read) ? '' : 'is-unread'}" href="student.php#eventHistory">
            <span class="notification-item-icon"><i class="fa-solid fa-calendar-check"></i></span>
            <span class="notification-item-copy"><strong>${escapeHtml(item.event_name)}</strong><span>${escapeHtml(item.venue_name)} · ${escapeHtml(dateLabel(item.date_of_use))}</span><small>Hosted by ${escapeHtml(item.host_name)}</small></span>
            ${Number(item.invite_read) ? '' : '<i class="notification-unread-dot" aria-label="Unread"></i>'}
        </a>`).join('');
    }

    async function refresh() {
        try {
            const response = await fetch('auth/event_notifications.php', { headers: { Accept: 'application/json' } });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || 'Could not load notifications.');
            render(data);
        } catch (error) {
            list.innerHTML = `<div class="notification-empty"><i class="fa-solid fa-triangle-exclamation"></i><span>${escapeHtml(error.message)}</span></div>`;
        }
    }

    async function markRead() {
        if (!lastData.unread) return;
        const form = new FormData();
        form.append('action', 'read');
        try {
            const response = await fetch('auth/event_notifications.php', { method: 'POST', body: form, headers: { Accept: 'application/json' } });
            const data = await response.json();
            if (response.ok && data.success) {
                lastData.data.forEach(item => { item.invite_read = 1; });
                lastData.unread = 0;
                render(lastData);
            }
        } catch {}
    }

    bell.addEventListener('click', async () => {
        isOpen = !isOpen;
        bell.setAttribute('aria-expanded', String(isOpen));
        popover.hidden = !isOpen;
        if (!isOpen) return;
        await refresh();
        await markRead();
    });
    root.querySelector('.notification-refresh').addEventListener('click', refresh);
    document.addEventListener('click', event => {
        if (isOpen && !root.contains(event.target)) {
            isOpen = false;
            popover.hidden = true;
            bell.setAttribute('aria-expanded', 'false');
        }
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && isOpen) {
            isOpen = false;
            popover.hidden = true;
            bell.setAttribute('aria-expanded', 'false');
            bell.focus();
        }
    });

    refresh();
    window.setInterval(refresh, 60000);
});
