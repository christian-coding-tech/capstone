document.addEventListener('DOMContentLoaded', () => {
    const calendar = document.getElementById('publicCalendar');
    if (!calendar) return;
    const monthLabel = document.getElementById('publicCalMonth');
    const eventList = document.getElementById('publicCalendarEvents');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let shownDate = new Date();
    let events = [];
    let selectedDate = '';
    const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

    function showEvents(date) {
        selectedDate = date;
        calendar.querySelectorAll('[data-date]').forEach(cell => cell.classList.toggle('selected', cell.dataset.date === date));
        const dayEvents = events.filter(item => item.date_of_use === date);
        if (!dayEvents.length) {
            eventList.innerHTML = '<p>No approved events scheduled for this date.</p>';
            return;
        }
        eventList.innerHTML = dayEvents.map(item => {
            const [hour, minute] = item.time_start.split(':');
            const time = `${Number(hour) % 12 || 12}:${minute} ${Number(hour) >= 12 ? 'PM' : 'AM'}`;
            const audience = item.target_course || item.target_department;
            return `<article class="public-event-item"><span class="public-event-time">${escapeHtml(time)}</span><div><strong>${escapeHtml(item.event_name)}</strong><span>${escapeHtml(item.venue_name)}${audience ? ` · ${escapeHtml(audience)}` : ''}</span></div></article>`;
        }).join('');
    }

    function drawCalendar() {
        const year = shownDate.getFullYear();
        const month = shownDate.getMonth();
        monthLabel.textContent = `${monthNames[month]} ${year}`;
        const firstDay = new Date(year, month, 1).getDay();
        const days = new Date(year, month + 1, 0).getDate();
        const daysWithEvents = new Set(events.map(event => event.date_of_use));
        let markup = dayNames.map(day => `<span class="public-calendar-weekday">${day}</span>`).join('');
        for (let index = 0; index < firstDay; index++) markup += '<span class="public-calendar-blank"></span>';
        for (let day = 1; day <= days; day++) {
            const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            markup += `<button type="button" class="public-calendar-day ${daysWithEvents.has(date) ? 'has-event' : ''} ${selectedDate === date ? 'selected' : ''}" data-date="${date}" aria-label="${monthNames[month]} ${day}${daysWithEvents.has(date) ? ', has events' : ''}">${day}${daysWithEvents.has(date) ? '<i></i>' : ''}</button>`;
        }
        calendar.innerHTML = markup;
        calendar.querySelectorAll('[data-date]').forEach(button => button.addEventListener('click', () => showEvents(button.dataset.date)));
    }

    async function loadMonth() {
        calendar.innerHTML = '<p class="public-calendar-loading">Loading calendar…</p>';
        try {
            const response = await fetch(`auth/public_events.php?month=${shownDate.getMonth() + 1}&year=${shownDate.getFullYear()}`);
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error('Calendar unavailable.');
            events = data.data;
            drawCalendar();
            if (!selectedDate || !selectedDate.startsWith(`${shownDate.getFullYear()}-${String(shownDate.getMonth() + 1).padStart(2, '0')}`)) {
                const today = new Date();
                selectedDate = today.getFullYear() === shownDate.getFullYear() && today.getMonth() === shownDate.getMonth()
                    ? `${shownDate.getFullYear()}-${String(shownDate.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
                    : '';
            }
            if (selectedDate) showEvents(selectedDate);
            else eventList.innerHTML = '<p>Select a date to see its events.</p>';
        } catch {
            calendar.innerHTML = '<p class="public-calendar-loading">Could not load campus events.</p>';
        }
    }

    document.getElementById('publicCalPrev').addEventListener('click', () => { shownDate.setMonth(shownDate.getMonth() - 1); loadMonth(); });
    document.getElementById('publicCalNext').addEventListener('click', () => { shownDate.setMonth(shownDate.getMonth() + 1); loadMonth(); });
    loadMonth();
});
