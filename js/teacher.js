document.addEventListener('DOMContentLoaded', () => {

    // ── State ──
    let activeTab    = 'pending';
    let dateFrom     = '';
    let dateTo       = '';

    // ── Elements ──
    const tabBtns        = document.querySelectorAll('.tab-btn');
    const tabContent     = document.getElementById('tabContent');
    const dateFromInput  = document.getElementById('dateFrom');
    const dateToInput    = document.getElementById('dateTo');
    const applyFilter    = document.getElementById('applyFilter');
    const clearFilter    = document.getElementById('clearFilter');
    const fabBtn         = document.getElementById('fabBtn');
    const reservModal    = document.getElementById('reservationModal');
    const reservClose    = document.getElementById('reservationClose');
    const reservForm     = document.getElementById('reservationForm');
    const reservError    = document.getElementById('reservationError');
    const reservSuccess  = document.getElementById('reservationSuccess');
    const reservSubmit   = document.getElementById('reservationSubmit');
    const venueSelect    = document.getElementById('venueSelect');
    const fileInput      = document.getElementById('proposalPdf');
    const fileLabel      = document.getElementById('fileLabel');
    const fileWrap       = document.getElementById('fileUploadWrap');
    const printModal     = document.getElementById('printModal');
    const printClose     = document.getElementById('printClose');
    const printContent   = document.getElementById('printContent');
    const chatbotToggle  = document.getElementById('chatbotToggle');
    const chatbotPanel   = document.getElementById('chatbotPanel');
    const chatbotClose   = document.getElementById('chatbotClose');
    const chatbotInput   = document.getElementById('chatbotInput');
    const chatbotSend    = document.getElementById('chatbotSend');
    const chatbotMsgs    = document.getElementById('chatbotMessages');

    // ── Helpers ──
    function openModal(modal)  { modal.classList.add('active');    document.body.style.overflow = 'hidden'; }
    function closeModal(modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }

    function formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    function formatDateTime(s) {
        if (!s) return '—';
        const d = new Date(s);
        return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    function formatTime(timeStr) {
        if (!timeStr) return '—';
        const [h, m] = timeStr.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const h12  = hour % 12 || 12;
        return `${h12}:${m} ${ampm}`;
    }

    // ── Badge Counts ──
    async function loadBadges() {
        try {
            const res  = await fetch('auth/get_badge_counts.php');
            const data = await res.json();
            if (!data.success) return;
            const counts = data.counts;
            ['pending', 'approved', 'rejected'].forEach(status => {
                const badge = document.getElementById(`badge-${status}`);
                if (!badge) return;
                if (counts[status] > 0) {
                    badge.textContent = counts[status];
                    badge.classList.add('visible');
                } else {
                    badge.textContent = '';
                    badge.classList.remove('visible');
                }
            });
        } catch {}
    }

    // ── Reservation cache ──
    let reservationCache = {};

    // ── Load Reservations ──
    async function loadReservations() {
        tabContent.innerHTML = `
            <div class="loading-state">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Loading...</span>
            </div>`;

        let url = `auth/get_reservations.php?status=${activeTab}`;
        if (dateFrom) url += `&date_from=${dateFrom}`;
        if (dateTo)   url += `&date_to=${dateTo}`;

        try {
            const res  = await fetch(url);
            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                tabContent.innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><span>Server error: ${text.substring(0, 100)}</span></div>`;
                return;
            }

            if (!data.success) {
                tabContent.innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><span>Failed to load requests.</span></div>`;
                return;
            }

            if (data.data.length === 0) {
                const labels = { pending: 'No pending requests', approved: 'No approved requests', rejected: 'No rejected requests' };
                tabContent.innerHTML = `<div class="empty-state"><i class="fa-solid fa-inbox"></i><span>${labels[activeTab]}</span></div>`;
                return;
            }

            reservationCache = {};
            data.data.forEach(r => { reservationCache[r.id] = r; });
            tabContent.innerHTML = data.data.map(r => buildCard(r)).join('');

        } catch (err) {
            tabContent.innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><span>Something went wrong: ${err.message}</span></div>`;
        }
    }

    // ── Build Card ──
    function buildCard(r) {
        const pillClass = { pending: 'pill-pending', approved: 'pill-approved', rejected: 'pill-rejected' }[r.status];
        const pillLabel = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }[r.status];

        let actionsHtml = '';
        if (r.status === 'approved') {
            actionsHtml = `<div class="card-actions"><button class="action-btn" onclick="openPrintById(${r.id})"><i class="fa-solid fa-print"></i> View / Print</button></div>`;
        }

        let rejectionHtml = '';
        if (r.status === 'rejected' && r.rejection_reason) {
            rejectionHtml = `
                <div class="rejection-reason">
                    <strong><i class="fa-solid fa-circle-xmark"></i> Reason for Rejection</strong>
                    ${r.rejection_reason}
                </div>`;
        }

        let approvedByHtml = '';
        if (r.status === 'approved' && r.approved_by_name) {
            approvedByHtml = `<span><i class="fa-solid fa-circle-check"></i> Approved by ${r.approved_by_name}</span>`;
        }

        return `
            <div class="request-card">
                <div class="card-left">
                    <div class="card-venue">${r.venue_name}</div>
                    <div class="card-event">${r.event_name}</div>
                    <div class="card-meta">
                        <span><i class="fa-solid fa-calendar"></i> ${formatDate(r.date_of_use)}</span>
                        <span><i class="fa-solid fa-clock"></i> ${formatTime(r.time_start)} — ${formatTime(r.time_end)}</span>
                        <span><i class="fa-solid fa-paper-plane"></i> Submitted ${formatDateTime(r.created_at)}</span>
                        ${approvedByHtml}
                    </div>
                    ${rejectionHtml}
                </div>
                <div class="card-right">
                    <span class="status-pill ${pillClass}">${pillLabel}</span>
                    ${actionsHtml}
                </div>
            </div>`;
    }

    // ── Tabs ──
    tabBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTab = btn.dataset.tab;

            const fd = new FormData();
            fd.append('status', activeTab);
            await fetch('auth/mark_read.php', { method: 'POST', body: fd });

            const badge = document.getElementById(`badge-${activeTab}`);
            if (badge) { badge.textContent = ''; badge.classList.remove('visible'); }

            loadReservations();
        });
    });

    // ── Date Filter ──
    applyFilter.addEventListener('click', () => {
        dateFrom = dateFromInput.value;
        dateTo   = dateToInput.value;
        loadReservations();
    });

    clearFilter.addEventListener('click', () => {
        dateFrom = dateTo = '';
        dateFromInput.value = '';
        dateToInput.value   = '';
        loadReservations();
    });

    // ── FAB → Reservation Modal ──
    fabBtn.addEventListener('click', () => {
        reservForm.reset();
        fileLabel.textContent = 'Click to upload or drag & drop';
        fileWrap.classList.remove('has-file');
        document.getElementById('roomFieldWrap').style.display = 'none';
        document.getElementById('roomNumber').required = false;
        document.getElementById('roomNumber').value = '';
        reservError.classList.remove('visible');
        reservSuccess.classList.remove('visible');
        openModal(reservModal);
    });

    reservClose.addEventListener('click', () => {
        closeModal(reservModal);
        reservError.classList.remove('visible');
        reservSuccess.classList.remove('visible');
    });

    reservModal.addEventListener('click', e => {
        if (e.target === reservModal) {
            closeModal(reservModal);
            reservError.classList.remove('visible');
            reservSuccess.classList.remove('visible');
        }
    });

    // ── Load Venues ──
    async function loadVenues() {
        try {
            const res  = await fetch('auth/get_venues.php');
            const data = await res.json();
            if (!data.success) return;
            data.venues.forEach(v => {
                const opt = document.createElement('option');
                opt.value       = v.id;
                opt.textContent = v.name;
                venueSelect.appendChild(opt);
            });

            venueSelect.addEventListener('change', () => {
                const selectedText = venueSelect.options[venueSelect.selectedIndex].text.toLowerCase();
                const roomWrap     = document.getElementById('roomFieldWrap');
                const roomInput    = document.getElementById('roomNumber');
                if (selectedText.includes('classroom') || selectedText.includes('room')) {
                    roomWrap.style.display = 'flex';
                    roomInput.required     = true;
                } else {
                    roomWrap.style.display = 'none';
                    roomInput.required     = false;
                    roomInput.value        = '';
                }
            });

        } catch {}
    }

    // ── File Upload Label ──
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            fileLabel.textContent = fileInput.files[0].name;
            fileWrap.classList.add('has-file');
        } else {
            fileLabel.textContent = 'Click to upload or drag & drop';
            fileWrap.classList.remove('has-file');
        }
    });

    // ── Reservation Form Submit ──
    reservForm.addEventListener('submit', async e => {
        e.preventDefault();
        reservError.classList.remove('visible');
        reservSuccess.classList.remove('visible');
        reservSubmit.disabled = true;
        reservSubmit.querySelector('span').textContent = 'Submitting...';

        const formData = new FormData(reservForm);

        try {
            const res  = await fetch('auth/reservation_handler.php', { method: 'POST', body: formData });
            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                reservError.textContent = 'Server error: ' + text.substring(0, 200);
                reservError.classList.add('visible');
                reservSubmit.disabled = false;
                reservSubmit.querySelector('span').textContent = 'Submit Request';
                return;
            }

            if (data.success) {
                reservSuccess.textContent = 'Request submitted successfully!';
                reservSuccess.classList.add('visible');
                reservForm.reset();
                fileLabel.textContent = 'Click to upload or drag & drop';
                fileWrap.classList.remove('has-file');
                document.getElementById('roomFieldWrap').style.display = 'none';
                document.getElementById('roomNumber').required = false;
                await loadReservations();
                loadBadges();
                setTimeout(() => {
                    closeModal(reservModal);
                    reservSuccess.classList.remove('visible');
                }, 2000);
            } else {
                reservError.textContent = data.message || 'Something went wrong.';
                reservError.classList.add('visible');
            }
        } catch (err) {
            reservError.textContent = 'Something went wrong: ' + err.message;
            reservError.classList.add('visible');
        } finally {
            reservSubmit.disabled = false;
            reservSubmit.querySelector('span').textContent = 'Submit Request';
        }
    });

    // ── Print Modal ──
    window.openPrintById = function(id) {
        const r = reservationCache[id];
        if (!r) { alert('Could not load reservation details.'); return; }
        window.openPrint(r);
    };

    window.openPrint = function(r) {
        const approvedByHtml = r.approved_by_name
            ? `<div class="print-row"><span>Approved By</span><span>${r.approved_by_name}</span></div>
               <div class="print-row"><span>Approved On</span><span>${formatDateTime(r.approved_at)}</span></div>`
            : '';
        printContent.innerHTML = `
            <div class="print-content-box">
                <h2>Venue Reservation — Approval Slip</h2>
                <p class="print-school">ACLC College Tacloban - Fatima Campus</p>
                <div class="print-row"><span>Venue</span><span>${r.venue_name}</span></div>
                <div class="print-row"><span>Event</span><span>${r.event_name}</span></div>
                <div class="print-row"><span>Date of Use</span><span>${formatDate(r.date_of_use)}</span></div>
                <div class="print-row"><span>Time</span><span>${formatTime(r.time_start)} — ${formatTime(r.time_end)}</span></div>
                <div class="print-row"><span>Submitted</span><span>${formatDateTime(r.created_at)}</span></div>
                ${approvedByHtml}
                <div class="print-approved-badge"><i class="fa-solid fa-circle-check"></i> Approved</div>
            </div>`;
        openModal(printModal);
    };

    printClose.addEventListener('click', () => closeModal(printModal));
    printModal.addEventListener('click', e => { if (e.target === printModal) closeModal(printModal); });

    // ── Chatbot ──
    chatbotToggle.addEventListener('click', () => chatbotPanel.classList.toggle('active'));
    chatbotClose.addEventListener('click',  () => chatbotPanel.classList.remove('active'));

    const chatHeader = document.querySelector('.chatbot-header');
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    chatHeader.style.cursor = 'grab';

    chatHeader.addEventListener('mousedown', e => {
        isDragging  = true;
        dragOffsetX = e.clientX - chatbotPanel.getBoundingClientRect().left;
        dragOffsetY = e.clientY - chatbotPanel.getBoundingClientRect().top;
        chatHeader.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        const x = Math.max(0, Math.min(e.clientX - dragOffsetX, window.innerWidth  - chatbotPanel.offsetWidth));
        const y = Math.max(0, Math.min(e.clientY - dragOffsetY, window.innerHeight - chatbotPanel.offsetHeight));
        chatbotPanel.style.right  = 'auto';
        chatbotPanel.style.bottom = 'auto';
        chatbotPanel.style.left   = `${x}px`;
        chatbotPanel.style.top    = `${y}px`;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        chatHeader.style.cursor = 'grab';
    });

    function appendMsg(text, sender) {
        const div = document.createElement('div');
        div.className = `chat-msg ${sender}`;
        div.innerHTML = `<div class="chat-bubble">${text}</div>`;
        chatbotMsgs.appendChild(div);
        chatbotMsgs.scrollTop = chatbotMsgs.scrollHeight;
        return div;
    }

    async function sendChatMessage() {
        const text = chatbotInput.value.trim();
        if (!text) return;
        chatbotInput.value = '';
        appendMsg(text, 'user');

        const loadingMsg = appendMsg('<i class="fa-solid fa-spinner fa-spin"></i>', 'bot');

        try {
            const fd = new FormData();
            fd.append('message', text);
            const res  = await fetch('auth/chatbot_handler.php', { method: 'POST', body: fd });
            const data = await res.json();
            loadingMsg.querySelector('.chat-bubble').innerHTML = data.success
                ? data.reply
                : "Sorry, I couldn't process that. Please try again.";
        } catch {
            loadingMsg.querySelector('.chat-bubble').innerHTML = "Something went wrong. Please try again.";
        }
    }

    chatbotSend.addEventListener('click', sendChatMessage);
    chatbotInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendChatMessage(); });

    // ── Init ──
    loadVenues();
    loadBadges();
    loadReservations();
});