(() => {
    const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
    const dateLabel = value => new Date(`${value}T00:00:00`).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
    const timeLabel = value => {
        const [hour, minute] = value.split(':');
        return `${Number(hour) % 12 || 12}:${minute} ${Number(hour) >= 12 ? 'PM' : 'AM'}`;
    };

    async function showRoster(eventId, host) {
        host.innerHTML = '<div class="loading-state"><i class="fa-solid fa-spinner fa-spin"></i><span>Loading attendance roster…</span></div>';
        try {
            const response = await fetch(`auth/event_attendees.php?event_id=${encodeURIComponent(eventId)}`);
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || 'Could not load attendees.');
            const counts = { attended: 0, registered: 0, absent: 0, unavailable: 0 };
            data.data.forEach(person => counts[person.attendance_status] = (counts[person.attendance_status] || 0) + 1);
            host.innerHTML = `<section class="attendance-roster">
                <div class="attendance-summary">
                    <span><strong>${counts.attended}</strong> attended</span>
                    <span><strong>${counts.registered}</strong> not checked in</span>
                    <span><strong>${counts.absent}</strong> absent</span>
                    <span><strong>${counts.unavailable}</strong> unable to attend</span>
                </div>
                ${data.data.length ? `<div class="attendance-table-wrap"><table class="attendance-table"><thead><tr><th>Student</th><th>Course · Department</th><th>Attendance</th><th>Check-in</th></tr></thead><tbody>${data.data.map(person => `<tr>
                    <td>${escapeHtml(person.full_name)} <small>${escapeHtml(person.school_id)}</small></td>
                    <td>${escapeHtml(person.course || '—')} · ${escapeHtml(person.department || 'Department not set')}</td>
                    <td><span class="attendance-badge attendance-${escapeHtml(person.attendance_status)}">${escapeHtml(person.attendance_status)}</span></td>
                    <td>${person.checked_in_at ? escapeHtml(new Date(person.checked_in_at).toLocaleString('en-PH')) : '—'}</td>
                </tr>`).join('')}</tbody></table></div>` : '<p class="empty-attendance">No students were in the target group when this event was approved.</p>'}
            </section>`;
        } catch (error) {
            host.innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><span>${escapeHtml(error.message)}</span></div>`;
        }
    }

    function openScanner(eventId, host) {
        if (!window.Html5Qrcode) {
            alert('QR scanner could not load. Check your internet connection and reload.');
            return;
        }
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active scanner-overlay';
        overlay.innerHTML = `<div class="modal-box scanner-box"><button type="button" class="modal-close scanner-close"><i class="fa-solid fa-xmark"></i></button><h2 class="modal-title">Scan attendee QR</h2><p class="modal-subtitle">Allow camera access and scan a student event QR code.</p><div id="eventQrReader"></div><div class="modal-error scanner-message" role="status"></div></div>`;
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
        const scanner = new Html5Qrcode('eventQrReader');
        let stopped = false;
        const close = async () => {
            if (stopped) return;
            stopped = true;
            try { await scanner.stop(); } catch {}
            scanner.clear();
            overlay.remove();
            document.body.style.overflow = '';
        };
        overlay.querySelector('.scanner-close').addEventListener('click', close);
        overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
        scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 240, height: 240 } }, async decoded => {
            if (stopped) return;
            const form = new FormData();
            form.append('token', decoded.trim());
            try {
                const response = await fetch('auth/scan_event_qr.php', { method: 'POST', body: form });
                const data = await response.json();
                const status = overlay.querySelector('.scanner-message');
                status.textContent = data.message || 'Attendance scan complete.';
                status.classList.add('visible');
                if (data.success) {
                    await close();
                    await showRoster(eventId, host);
                }
            } catch {
                const status = overlay.querySelector('.scanner-message');
                status.textContent = 'Could not submit the check-in. Try again.';
                status.classList.add('visible');
            }
        }, () => {}).catch(error => {
            const status = overlay.querySelector('.scanner-message');
            status.textContent = `Camera unavailable: ${error}`;
            status.classList.add('visible');
        });
    }

    function getEventCategory(event, now = new Date()) {
        if (event.status === 'rejected') return 'rejected';
        const startsAt = new Date(`${event.date_of_use}T${event.time_start}`);
        const endsAt = new Date(`${event.date_of_use}T${event.time_end}`);
        if (endsAt < now) return 'history';
        if (startsAt <= now) return 'ongoing';
        return 'hosted';
    }

    function eventCard(event, category) {
        const eventId = Number(event.event_id);
        const statusText = category === 'ongoing' ? 'On-going'
            : category === 'rejected' ? 'Rejected'
                : category === 'history' ? 'History' : 'Hosted';
        const audience = event.target_course || event.target_department || 'All students';
        const searchText = `${event.event_name} ${event.venue_name} ${event.target_course || ''} ${event.target_department || ''} ${event.host_name || ''}`.toLowerCase();
        const attendanceActions = event.status === 'approved'
            ? `<button class="action-btn" data-roster="${eventId}"><i class="fa-solid fa-users"></i> View attendance</button>${category === 'ongoing' ? `<button class="action-btn primary-scan-btn" data-scan="${eventId}"><i class="fa-solid fa-qrcode"></i> Scan QR</button>` : ''}`
            : '';
        const rejection = event.status === 'rejected'
            ? `<div class="event-rejection-reason"><strong>Reason</strong><span>${escapeHtml(event.rejection_reason || 'No reason provided.')}</span></div>`
            : '';
        const attendanceStats = event.status === 'approved'
            ? `<div class="hosted-event-stats"><span><strong>${Number(event.attendee_count || 0)}</strong> students</span><span><strong>${Number(event.attended_count || 0)}</strong> attended</span><span><strong>${Number(event.not_checked_in_count || 0)}</strong> not checked in</span><span><strong>${Number(event.absent_count || 0)}</strong> absent</span><span><strong>${Number(event.unavailable_count || 0)}</strong> unable to attend</span></div>`
            : '';

        return `<article class="hosted-event-card" data-search="${escapeHtml(searchText)}">
            <div class="hosted-event-heading"><div><span class="dashboard-eyebrow"><i class="fa-solid fa-calendar-check"></i> ${escapeHtml(statusText)} · ${escapeHtml(audience)}</span><h3>${escapeHtml(event.event_name)}</h3><p>${escapeHtml(event.venue_name)}${event.host_name ? ` · ${escapeHtml(event.host_name)}` : ''}</p></div>
            <span class="hosted-event-date">${escapeHtml(dateLabel(event.date_of_use))}<br>${escapeHtml(timeLabel(event.time_start))} – ${escapeHtml(timeLabel(event.time_end))}</span></div>
            ${attendanceStats}${rejection}
            ${attendanceActions ? `<div class="hosted-event-actions">${attendanceActions}</div><div class="hosted-event-roster" id="event-roster-${eventId}" hidden></div>` : ''}
        </article>`;
    }

    async function renderEvents(container) {
        container.innerHTML = '<div class="loading-state"><i class="fa-solid fa-spinner fa-spin"></i><span>Loading event history…</span></div>';
        try {
            const response = await fetch('auth/hosted_events.php');
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || 'Unable to load events.');

            const categories = [
                { id: 'ongoing', label: 'On-going' },
                { id: 'rejected', label: 'Rejected' },
                { id: 'hosted', label: 'Hosted' },
                { id: 'history', label: 'History' },
            ];
            let activeCategory = 'ongoing';
            let searchQuery = '';
            const events = data.data;
            const getMatchingEvents = category => events.filter(event => getEventCategory(event) === category);

            container.innerHTML = `<div class="event-history-toolbar">
                <label class="event-category-control"><span>Category</span><span class="event-category-select-wrap"><select class="event-category-select" aria-label="Choose event category">
                    ${categories.map(category => `<option value="${category.id}">${category.label} (${getMatchingEvents(category.id).length})</option>`).join('')}
                </select><i class="fa-solid fa-chevron-down" aria-hidden="true"></i></span></label>
                <label class="event-search-wrap"><i class="fa-solid fa-magnifying-glass"></i><input type="search" class="event-search" placeholder="Search event, venue, course, or department…" aria-label="Search events"></label>
            </div><div class="event-history-list" role="tabpanel"></div>`;

            const list = container.querySelector('.event-history-list');
            const categorySelect = container.querySelector('.event-category-select');
            const renderCategory = () => {
                const matching = getMatchingEvents(activeCategory).filter(event => {
                    const searchable = `${event.event_name} ${event.venue_name} ${event.target_course || ''} ${event.target_department || ''} ${event.host_name || ''}`.toLowerCase();
                    return searchable.includes(searchQuery);
                });
                if (!matching.length) {
                    const emptyText = searchQuery ? 'No events match your search.' : `There are no ${categories.find(category => category.id === activeCategory).label.toLowerCase()} events.`;
                    list.innerHTML = `<div class="empty-state"><i class="fa-solid fa-calendar-xmark"></i><span>${escapeHtml(emptyText)}</span></div>`;
                    return;
                }
                list.innerHTML = matching.map(event => eventCard(event, activeCategory)).join('');
                list.querySelectorAll('[data-roster]').forEach(button => button.addEventListener('click', () => {
                    const roster = list.querySelector(`#event-roster-${button.dataset.roster}`);
                    roster.hidden = !roster.hidden;
                    if (!roster.hidden) showRoster(button.dataset.roster, roster);
                }));
                list.querySelectorAll('[data-scan]').forEach(button => button.addEventListener('click', () => {
                    const roster = list.querySelector(`#event-roster-${button.dataset.scan}`);
                    roster.hidden = false;
                    openScanner(button.dataset.scan, roster);
                }));
            };

            categorySelect.addEventListener('change', () => {
                activeCategory = categorySelect.value;
                renderCategory();
            });
            container.querySelector('.event-search').addEventListener('input', inputEvent => {
                searchQuery = inputEvent.target.value.trim().toLowerCase();
                renderCategory();
            });
            renderCategory();
        } catch (error) {
            container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><span>${escapeHtml(error.message)}</span></div>`;
        }
    }

    window.EventTools = { renderEvents, showRoster };
})();
