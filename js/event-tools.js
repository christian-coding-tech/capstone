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
        overlay.innerHTML = `<div class="modal-box scanner-box"><button type="button" class="modal-close scanner-close"><i class="fa-solid fa-xmark"></i></button><h2 class="modal-title">Scan attendee QR</h2><p class="modal-subtitle">Allow camera access and scan the student’s personal or event QR code.</p><div id="eventQrReader"></div><button type="button" class="action-btn scanner-photo-btn" hidden><i class="fa-solid fa-camera"></i> Use camera photo</button><input class="scanner-photo-input" type="file" accept="image/*" capture="environment"><div class="modal-error scanner-message" role="status"></div></div>`;
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
        document.body.classList.add('scanner-open');
        const scanner = new Html5Qrcode('eventQrReader');
        const photoButton = overlay.querySelector('.scanner-photo-btn');
        const photoInput = overlay.querySelector('.scanner-photo-input');
        let stopped = false;
        let submitting = false;
        let completed = false;
        const close = async () => {
            if (stopped) return;
            stopped = true;
            try { await scanner.stop(); } catch {}
            scanner.clear();
            overlay.remove();
            document.body.style.overflow = '';
            document.body.classList.remove('scanner-open');
        };
        overlay.querySelector('.scanner-close').addEventListener('click', close);
        overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
        const handleDecoded = async decoded => {
            if (stopped || submitting || completed) return;
            submitting = true;
            const form = new FormData();
            form.append('token', decoded.trim());
            form.append('event_id', eventId);
            try {
                const response = await fetch('auth/scan_event_qr.php', { method: 'POST', body: form });
                const data = await response.json();
                const status = overlay.querySelector('.scanner-message');
                status.textContent = data.message || 'Attendance scan complete.';
                status.classList.add('visible');
                if (data.details) {
                    const details = data.details;
                    const detailCard = document.createElement('section');
                    detailCard.className = 'scan-attendee-details';
                    const dateTime = value => new Date(value).toLocaleString('en-PH');
                    detailCard.innerHTML = `<h3>${escapeHtml(details.full_name)}</h3>
                        ${details.id_photo ? `<img class="scan-id-photo" src="${escapeHtml(details.id_photo)}" alt="ID photo of ${escapeHtml(details.full_name)}">` : '<p class="scan-no-photo">No ID photo on file.</p>'}
                        <dl><dt>USN</dt><dd>${escapeHtml(details.usn)}</dd>
                        <dt>Section</dt><dd>${escapeHtml(details.section || '—')}</dd>
                        <dt>Program</dt><dd>${escapeHtml(details.program || '—')}</dd>
                        <dt>Adviser</dt><dd>${escapeHtml(details.adviser || '—')}</dd>
                        <dt>Event</dt><dd>${escapeHtml(details.event_name)}</dd>
                        <dt>Validity period</dt><dd>${escapeHtml(dateTime(details.valid_from))} – ${escapeHtml(dateTime(details.valid_until))}</dd></dl>`;
                    const previousDetails = overlay.querySelector('.scan-attendee-details');
                    if (previousDetails) previousDetails.replaceWith(detailCard);
                    else overlay.querySelector('.scanner-box').appendChild(detailCard);
                }
                if (data.success) {
                    completed = true;
                    try {
                        await scanner.stop();
                    } catch {
                        status.textContent += ' Close the scanner manually if the camera stays on.';
                    }
                    overlay.querySelector('#eventQrReader').hidden = true;
                    await showRoster(eventId, host);
                }
            } catch {
                const status = overlay.querySelector('.scanner-message');
                status.textContent = 'Could not submit the check-in. Try again.';
                status.classList.add('visible');
            } finally {
                submitting = false;
            }
        };
        photoButton.addEventListener('click', () => photoInput.click());
        photoInput.addEventListener('change', async () => {
            const image = photoInput.files?.[0];
            if (!image) return;
            const status = overlay.querySelector('.scanner-message');
            status.textContent = 'Reading QR from camera photo…';
            status.classList.add('visible');
            try {
                await handleDecoded(await scanner.scanFile(image, true));
            } catch {
                status.textContent = 'Could not read a QR code from that photo. Try again with the code in focus and fully visible.';
                status.classList.add('visible');
            } finally {
                photoInput.value = '';
            }
        });
        scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 240, height: 240 } }, handleDecoded, () => {}).catch(error => {
            const status = overlay.querySelector('.scanner-message');
            const cameraError = `${error?.name || ''} ${error?.message || error}`;
            if (/NotAllowedError|PermissionDenied|permission/i.test(cameraError)) {
                status.textContent = 'Camera permission was blocked. Allow camera access for this site in your browser settings, then retry. You can also use the camera photo option.';
            } else if (/NotReadableError|Could not start video source|overlay|bubble|in use/i.test(cameraError)) {
                status.textContent = 'Camera could not start. Close other apps using the camera and any floating bubbles, screen filters, or overlays, then retry. You can also use the camera photo option.';
            } else {
                status.textContent = `Live camera unavailable: ${error}. Check camera permission and use HTTPS, or try the camera photo option.`;
            }
            status.classList.add('visible');
            photoButton.hidden = false;
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

    async function openAvailableScanner(host) {
        try {
            const response = await fetch('auth/hosted_events.php');
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || 'Unable to load scannable events.');

            const now = new Date();
            const eligible = data.data.filter(event => {
                if (event.status !== 'approved' || !Number(event.can_scan)) return false;
                const startsAt = new Date(`${event.date_of_use}T${event.time_start}`);
                const endsAt = new Date(`${event.date_of_use}T${event.time_end}`);
                return now >= new Date(startsAt.getTime() - 30 * 60 * 1000) && now <= endsAt;
            });
            if (!eligible.length) {
                alert('There are no events available for QR attendance scanning right now.');
                return;
            }

            const launch = event => {
                host.hidden = false;
                showRoster(event.event_id, host);
                openScanner(event.event_id, host);
            };
            if (eligible.length === 1) {
                launch(eligible[0]);
                return;
            }

            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay active scanner-overlay';
            overlay.innerHTML = `<div class="modal-box scanner-box"><button type="button" class="modal-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button><h2 class="modal-title">Choose an event</h2><p class="modal-subtitle">Select which event to scan attendance for.</p><div class="hosted-event-actions">${eligible.map(event => `<button type="button" class="action-btn" data-event-scan="${Number(event.event_id)}"><i class="fa-solid fa-camera"></i> ${escapeHtml(event.event_name)} · ${escapeHtml(event.venue_name)}</button>`).join('')}</div></div>`;
            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden';
            const close = () => {
                overlay.remove();
                document.body.style.overflow = '';
            };
            overlay.querySelector('.modal-close').addEventListener('click', close);
            overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
            overlay.querySelectorAll('[data-event-scan]').forEach(button => button.addEventListener('click', () => {
                const selected = eligible.find(event => Number(event.event_id) === Number(button.dataset.eventScan));
                close();
                if (selected) launch(selected);
            }));
        } catch (error) {
            alert(error.message || 'Unable to open the QR scanner.');
        }
    }

    function eventCard(event, category) {
        const eventId = Number(event.event_id);
        const statusText = category === 'ongoing' ? 'On-going'
            : category === 'rejected' ? 'Rejected'
                : category === 'history' ? 'History' : 'Hosted';
        const audience = event.target_course || event.target_department || 'All students';
        const searchText = `${event.event_name} ${event.venue_name} ${event.target_course || ''} ${event.target_department || ''} ${event.host_name || ''}`.toLowerCase();
        const attendanceActions = event.status === 'approved'
            ? `${Number(event.can_manage_scanners) ? `<button class="action-btn" data-manage-scanners="${eventId}"><i class="fa-solid fa-user-shield"></i> Manage scanners</button>` : ''}<button class="action-btn" data-roster="${eventId}"><i class="fa-solid fa-users"></i> View attendance</button>${category === 'ongoing' && Number(event.can_scan) ? `<button class="action-btn primary-scan-btn" data-scan="${eventId}"><i class="fa-solid fa-camera"></i> Scan QR</button>` : ''}`
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
            ${Number(event.can_manage_scanners) && event.status === 'approved' ? `<div class="hosted-event-scanners" id="event-scanners-${eventId}" hidden></div>` : ''}
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
                list.querySelectorAll('[data-manage-scanners]').forEach(button => button.addEventListener('click', () => {
                    const panel = list.querySelector(`#event-scanners-${button.dataset.manageScanners}`);
                    panel.hidden = !panel.hidden;
                    if (!panel.hidden) showScannerAuthorizations(button.dataset.manageScanners, panel);
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

    async function showScannerAuthorizations(eventId, host) {
        host.innerHTML = '<div class="loading-state"><i class="fa-solid fa-spinner fa-spin"></i><span>Loading authorized scanners…</span></div>';
        try {
            const response = await fetch(`auth/event_scan_authorizations.php?event_id=${encodeURIComponent(eventId)}`);
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || 'Could not load scanner access.');
            const options = data.eligible.map(person => `<option value="${Number(person.id)}">${escapeHtml(person.full_name)} · ${escapeHtml(person.role)} · ${escapeHtml(person.user_id)}</option>`).join('');
            host.innerHTML = `<section class="scanner-access-panel"><h4>Authorized event scanners</h4>
                ${options ? `<form class="scanner-access-form"><select name="user_id" required><option value="">Choose a student or teacher</option>${options}</select><button class="action-btn" type="submit"><i class="fa-solid fa-user-plus"></i> Add scanner</button></form>` : '<p>No other active student or teacher accounts are available.</p>'}
                ${data.authorized.length ? `<ul>${data.authorized.map(person => `<li>${escapeHtml(person.full_name)} <span>${escapeHtml(person.role)} · ${escapeHtml(person.user_id)}</span><button type="button" class="action-btn" data-remove-scanner="${Number(person.id)}">Remove</button></li>`).join('')}</ul>` : '<p>No additional scanners authorized.</p>'}</section>`;
            const submit = host.querySelector('.scanner-access-form');
            if (submit) submit.addEventListener('submit', async event => {
                event.preventDefault();
                await updateScannerAuthorization(eventId, submit.elements.user_id.value, 'add', host);
            });
            host.querySelectorAll('[data-remove-scanner]').forEach(button => button.addEventListener('click', async () => {
                await updateScannerAuthorization(eventId, button.dataset.removeScanner, 'remove', host);
            }));
        } catch (error) {
            host.innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><span>${escapeHtml(error.message)}</span></div>`;
        }
    }

    async function updateScannerAuthorization(eventId, userId, action, host) {
        const form = new FormData();
        form.append('event_id', eventId);
        form.append('user_id', userId);
        form.append('action', action);
        try {
            const response = await fetch('auth/event_scan_authorizations.php', { method: 'POST', body: form });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || 'Could not update scanner access.');
            await showScannerAuthorizations(eventId, host);
        } catch (error) {
            host.insertAdjacentHTML('afterbegin', `<p class="scanner-access-error">${escapeHtml(error.message)}</p>`);
        }
    }

    window.EventTools = { renderEvents, showRoster, openScanner, openAvailableScanner };
})();
