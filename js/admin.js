document.addEventListener('DOMContentLoaded', () => {

    // ── State ──
    let activeTab = 'pending';
    let dateFrom  = '';
    let dateTo    = '';
    let calYear   = new Date().getFullYear();
    let calMonth  = new Date().getMonth() + 1;
    let calSearch = '';
    let calData   = [];
    let teacherSearch = '';
    let studentSearch = '';

    // ── Elements ──
    const tabBtns         = document.querySelectorAll('.tab-btn');
    const tabContent      = document.getElementById('tabContent');
    const dateFromInput   = document.getElementById('dateFrom');
    const dateToInput     = document.getElementById('dateTo');
    const applyFilter     = document.getElementById('applyFilter');
    const clearFilter     = document.getElementById('clearFilter');
    const dateFilterWrap  = document.getElementById('dateFilterWrap');
    const rejectModal     = document.getElementById('rejectModal');
    const rejectClose     = document.getElementById('rejectClose');
    const rejectForm      = document.getElementById('rejectForm');
    const rejectError     = document.getElementById('rejectError');
    const rejectSubmit    = document.getElementById('rejectSubmit');
    const proposalModal   = document.getElementById('proposalModal');
    const proposalClose   = document.getElementById('proposalClose');
    const proposalContent = document.getElementById('proposalContent');
    const addTeacherModal    = document.getElementById('addTeacherModal');
    const addTeacherClose    = document.getElementById('addTeacherClose');
    const addTeacherForm     = document.getElementById('addTeacherForm');
    const addTeacherError    = document.getElementById('addTeacherError');
    const addTeacherSuccess  = document.getElementById('addTeacherSuccess');
    const addTeacherSubmit   = document.getElementById('addTeacherSubmit');
    const csvModal     = document.getElementById('csvModal');
    const csvClose     = document.getElementById('csvClose');
    const csvForm      = document.getElementById('csvForm');
    const csvError     = document.getElementById('csvError');
    const csvSuccess   = document.getElementById('csvSuccess');
    const csvSubmit    = document.getElementById('csvSubmit');
    const csvFile      = document.getElementById('csvFile');
    const csvFileWrap  = document.getElementById('csvFileWrap');
    const csvFileLabel = document.getElementById('csvFileLabel');
    const csvPreview   = document.getElementById('csvPreview');
    const addStudentModal   = document.getElementById('addStudentModal');
    const addStudentClose   = document.getElementById('addStudentClose');
    const addStudentForm    = document.getElementById('addStudentForm');
    const addStudentError   = document.getElementById('addStudentError');
    const addStudentSuccess = document.getElementById('addStudentSuccess');
    const addStudentSubmit  = document.getElementById('addStudentSubmit');
    const studentCsvModal    = document.getElementById('studentCsvModal');
    const studentCsvClose    = document.getElementById('studentCsvClose');
    const studentCsvForm     = document.getElementById('studentCsvForm');
    const studentCsvError    = document.getElementById('studentCsvError');
    const studentCsvSuccess  = document.getElementById('studentCsvSuccess');
    const studentCsvSubmit   = document.getElementById('studentCsvSubmit');
    const studentCsvFile     = document.getElementById('studentCsvFile');
    const studentCsvFileWrap = document.getElementById('studentCsvFileWrap');
    const studentCsvFileLabel = document.getElementById('studentCsvFileLabel');
    const studentCsvPreview  = document.getElementById('studentCsvPreview');
    const resetPwModal   = document.getElementById('resetPwModal');
    const resetPwClose   = document.getElementById('resetPwClose');
    const resetPwForm    = document.getElementById('resetPwForm');
    const resetPwError   = document.getElementById('resetPwError');
    const resetPwSuccess = document.getElementById('resetPwSuccess');
    const resetPwSubmit  = document.getElementById('resetPwSubmit');
    const resetPwInput   = document.getElementById('resetPwInput');
    const deactivateStudentModal  = document.getElementById('deactivateStudentModal');
    const deactivateStudentClose  = document.getElementById('deactivateStudentClose');
    const deactivateStudentForm   = document.getElementById('deactivateStudentForm');
    const deactivateStudentError  = document.getElementById('deactivateStudentError');
    const deactivateStudentSubmit = document.getElementById('deactivateStudentSubmit');
    const dayModal        = document.getElementById('dayModal');
    const dayClose        = document.getElementById('dayClose');
    const dayModalTitle   = document.getElementById('dayModalTitle');
    const dayModalContent = document.getElementById('dayModalContent');
    const chatbotToggle  = document.getElementById('chatbotToggle');
    const chatbotPanel   = document.getElementById('chatbotPanel');
    const chatbotClose   = document.getElementById('chatbotClose');
    const chatbotInput   = document.getElementById('chatbotInput');
    const chatbotSend    = document.getElementById('chatbotSend');
    const chatbotMsgs    = document.getElementById('chatbotMessages');

    // ── Helpers ──
    function openModal(m)  { m.classList.add('active');    document.body.style.overflow = 'hidden'; }
    function closeModal(m) { m.classList.remove('active'); document.body.style.overflow = ''; }

    function formatDate(s) {
        if (!s) return '—';
        const d = new Date(s + 'T00:00:00');
        return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    function formatTime(s) {
        if (!s) return '—';
        const [h, m] = s.split(':');
        const hour = parseInt(h);
        return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
    }

    function formatDateTime(s) {
        if (!s) return '—';
        const d = new Date(s);
        return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    function initials(name) {
        return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    }

    function loadingHtml() { return `<div class="loading-state"><i class="fa-solid fa-spinner fa-spin"></i><span>Loading...</span></div>`; }
    function emptyHtml(msg) { return `<div class="empty-state"><i class="fa-solid fa-inbox"></i><span>${msg}</span></div>`; }
    function errorHtml() { return `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><span>Something went wrong.</span></div>`; }

    // ── Badges ──
    async function loadBadges() {
        try {
            const res  = await fetch('auth/get_admin_badge_counts.php');
            const data = await res.json();
            if (!data.success) return;
            ['pending', 'approved', 'rejected', 'feedback'].forEach(k => {
                const b = document.getElementById(`badge-${k}`);
                if (!b) return;
                if (data.counts[k] > 0) { b.textContent = data.counts[k]; b.classList.add('visible'); }
                else { b.textContent = ''; b.classList.remove('visible'); }
            });
        } catch {}
    }

    // ── Tab switching ──
    const noFilterTabs = ['schedule', 'teachers', 'students'];

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTab = btn.dataset.tab;
            dateFilterWrap.style.display = noFilterTabs.includes(activeTab) ? 'none' : 'flex';

            // Clear badge on click
            const badge = document.getElementById(`badge-${activeTab}`);
            if (badge) { badge.textContent = ''; badge.classList.remove('visible'); }

            loadContent();
        });
    });

    // ── Date Filter ──
    applyFilter.addEventListener('click', () => {
        dateFrom = dateFromInput.value;
        dateTo   = dateToInput.value;
        loadContent();
    });

    clearFilter.addEventListener('click', () => {
        dateFrom = dateTo = '';
        dateFromInput.value = '';
        dateToInput.value   = '';
        loadContent();
    });

    // ── Content Router ──
    function loadContent() {
        const routes = {
            pending:  loadReservations,
            approved: loadReservations,
            rejected: loadReservations,
            schedule: loadSchedule,
            teachers: loadTeachers,
            students: loadStudents,
            feedback: loadFeedback,
        };
        (routes[activeTab] || loadReservations)();
    }
    // ── Reservation cache for view modal ──
        let reservationCache = {};
        
    // ── Reservations ──
    async function loadReservations() {
        tabContent.innerHTML = loadingHtml();
        let url = `auth/get_all_reservations.php?status=${activeTab}`;
        if (dateFrom) url += `&date_from=${dateFrom}`;
        if (dateTo)   url += `&date_to=${dateTo}`;
        try {
            const res  = await fetch(url);
            const data = await res.json();
            if (!data.success || data.data.length === 0) {
                tabContent.innerHTML = emptyHtml('No reservations found.');
                return;
            }
            reservationCache = {};
            data.data.forEach(r => { reservationCache[r.id] = r; });
            tabContent.innerHTML = data.data.map(buildReservationCard).join('');
        } catch { tabContent.innerHTML = errorHtml(); }
    }

    function buildReservationCard(r) {
        const pillClass = { pending: 'pill-pending', approved: 'pill-approved', rejected: 'pill-rejected' }[r.status];
        const pillLabel = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }[r.status];
        const rJson     = JSON.stringify(r).replace(/'/g, "\\'").replace(/"/g, '&quot;');

        let actions = '';
        if (r.status === 'pending') {
            actions = `
                <div class="card-actions">
                    <button class="action-btn" onclick="viewProposalById(${r.id})">
                        <i class="fa-solid fa-eye"></i> View
                    </button>
                    <button class="action-btn approve-btn" onclick="approveReservation(${r.id})">
                        <i class="fa-solid fa-check"></i> Approve
                    </button>
                    <button class="action-btn reject-btn" onclick="openReject(${r.id})">
                        <i class="fa-solid fa-xmark"></i> Reject
                    </button>
                </div>`;
        } else {
            const safeId = r.id;
            actions = `
                <div class="card-actions">
                    <button class="action-btn" onclick="viewProposalById(${safeId})">
                        <i class="fa-solid fa-eye"></i> View
                    </button>
                </div>`;
        }

        let rejHtml = r.status === 'rejected' && r.rejection_reason ? `
            <div class="rejection-reason">
                <strong><i class="fa-solid fa-circle-xmark"></i> Rejection Reason</strong>
                ${r.rejection_reason}
            </div>` : '';

        let approvedHtml = r.status === 'approved' && r.approved_by_name ? `
            <span><i class="fa-solid fa-circle-check"></i> Approved by ${r.approved_by_name} on ${formatDateTime(r.approved_at)}</span>` : '';

        return `
            <div class="request-card">
                <div class="card-left">
                    <div class="card-teacher"><i class="fa-solid fa-chalkboard-user"></i> ${r.teacher_name}</div>
                    <div class="card-venue">${r.venue_name}</div>
                    <div class="card-event">${r.event_name}</div>
                    <div class="card-meta">
                        <span><i class="fa-solid fa-calendar"></i> ${formatDate(r.date_of_use)}</span>
                        <span><i class="fa-solid fa-clock"></i> ${formatTime(r.time_start)} — ${formatTime(r.time_end)}</span>
                        <span><i class="fa-solid fa-paper-plane"></i> Submitted ${formatDateTime(r.created_at)}</span>
                        ${approvedHtml}
                    </div>
                    ${rejHtml}
                </div>
                <div class="card-right">
                    <span class="status-pill ${pillClass}">${pillLabel}</span>
                    ${actions}
                </div>
            </div>`;
    }

    // ── Approve ──
    window.approveReservation = async function(id) {
        if (!confirm('Approve this reservation?')) return;
        const fd = new FormData();
        fd.append('reservation_id', id);
        fd.append('action', 'approved');
        try {
            const res  = await fetch('auth/update_reservation.php', { method: 'POST', body: fd });
            const data = await res.json();
            if (data.success) { loadContent(); loadBadges(); }
            else alert(data.message);
        } catch { alert('Something went wrong.'); }
    };

    // ── Reject ──
    window.openReject = function(id) {
        document.getElementById('rejectReservationId').value = id;
        rejectError.classList.remove('visible');
        rejectForm.reset();
        openModal(rejectModal);
    };

    rejectClose.addEventListener('click', () => closeModal(rejectModal));
    rejectModal.addEventListener('click', e => { if (e.target === rejectModal) closeModal(rejectModal); });

    rejectForm.addEventListener('submit', async e => {
        e.preventDefault();
        rejectError.classList.remove('visible');
        rejectSubmit.disabled = true;
        rejectSubmit.querySelector('span').textContent = 'Submitting...';
        const fd = new FormData();
        fd.append('reservation_id', document.getElementById('rejectReservationId').value);
        fd.append('action', 'rejected');
        fd.append('rejection_reason', document.getElementById('rejectionReason').value);
        try {
            const res  = await fetch('auth/update_reservation.php', { method: 'POST', body: fd });
            const data = await res.json();
            if (data.success) { closeModal(rejectModal); loadContent(); loadBadges(); }
            else { rejectError.textContent = data.message; rejectError.classList.add('visible'); }
        } catch { rejectError.textContent = 'Something went wrong.'; rejectError.classList.add('visible'); }
        finally { rejectSubmit.disabled = false; rejectSubmit.querySelector('span').textContent = 'Confirm Rejection'; }
    });

    window.viewProposalById = function(id) {
        const r = reservationCache[id];
        if (!r) { alert('Could not load reservation details.'); return; }
        window.viewProposal(r);
    };
    
    // ── View Proposal ──
    window.viewProposal = function(r) {
        const pdfHtml = r.proposal_pdf
            ? `<a class="pdf-link" href="uploads/proposals/${r.proposal_pdf}" target="_blank"><i class="fa-solid fa-file-pdf"></i> View Uploaded Proposal PDF</a>`
            : '';
        const approvedHtml = r.approved_by_name
            ? `<div class="detail-row"><span>Approved By</span><span>${r.approved_by_name}</span></div>
               <div class="detail-row"><span>Approved At</span><span>${formatDateTime(r.approved_at)}</span></div>`
            : '';
        proposalContent.innerHTML = `
            <div class="proposal-detail-box">
                <div class="detail-row"><span>Teacher</span><span>${r.teacher_name}</span></div>
                <div class="detail-row"><span>Venue</span><span>${r.venue_name}</span></div>
                <div class="detail-row"><span>Event</span><span>${r.event_name}</span></div>
                <div class="detail-row"><span>Date of Use</span><span>${formatDate(r.date_of_use)}</span></div>
                <div class="detail-row"><span>Time</span><span>${formatTime(r.time_start)} — ${formatTime(r.time_end)}</span></div>
                <div class="detail-row"><span>Submitted</span><span>${formatDateTime(r.created_at)}</span></div>
                <div class="detail-row"><span>Status</span><span>${r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span></div>
                ${approvedHtml}
                ${pdfHtml}
            </div>`;
        openModal(proposalModal);
    };

    proposalClose.addEventListener('click', () => closeModal(proposalModal));
    proposalModal.addEventListener('click', e => { if (e.target === proposalModal) closeModal(proposalModal); });

    // ── Teachers Tab ──
    async function loadTeachers() {
        tabContent.innerHTML = loadingHtml();
        try {
            let url = `auth/manage_teachers.php?action=get`;
            if (teacherSearch) url += `&search=${encodeURIComponent(teacherSearch)}`;
            const res  = await fetch(url);
            const data = await res.json();

            const toolbar = `
                <div class="teacher-toolbar">
                    <div class="toolbar-actions">
                        <button class="toolbar-btn primary" id="openAddTeacher">
                            <i class="fa-solid fa-user-plus"></i> Add Teacher
                        </button>
                        <button class="toolbar-btn" id="openCsv">
                            <i class="fa-solid fa-file-csv"></i> Bulk Upload CSV
                        </button>
                    </div>
                    <div class="cal-search">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <input type="text" placeholder="Search teachers..." id="teacherSearchInput" value="${teacherSearch}">
                    </div>
                </div>`;

            tabContent.innerHTML = toolbar + ((!data.success || data.data.length === 0)
                ? emptyHtml('No teacher accounts yet.')
                : data.data.map(buildTeacherCard).join(''));

            document.getElementById('openAddTeacher').addEventListener('click', () => {
                addTeacherForm.reset();
                addTeacherError.classList.remove('visible');
                addTeacherSuccess.classList.remove('visible');
                openModal(addTeacherModal);
            });

            document.getElementById('openCsv').addEventListener('click', () => {
                csvForm.reset();
                csvFileLabel.textContent = 'Click to upload CSV file';
                csvFileWrap.classList.remove('has-file');
                csvPreview.innerHTML = '';
                csvError.classList.remove('visible');
                csvSuccess.classList.remove('visible');
                openModal(csvModal);
            });

            let searchTimer;
            document.getElementById('teacherSearchInput').addEventListener('input', e => {
                clearTimeout(searchTimer);
                searchTimer = setTimeout(() => {
                    teacherSearch = e.target.value.trim();
                    loadTeachers();
                }, 400);
            });

        } catch { tabContent.innerHTML = errorHtml(); }
    }

    function buildTeacherCard(t) {
        const statusClass = { active: 'status-active', inactive: 'status-inactive', deactivated: 'status-deactivated' }[t.status];
        const statusLabel = { active: 'Active', inactive: 'Inactive', deactivated: 'Deactivated' }[t.status];

        const toggleBtn = t.status === 'active'
            ? `<button class="action-btn deactivate-btn" onclick="toggleTeacher(${t.id},'deactivated')"><i class="fa-solid fa-ban"></i> Deactivate</button>`
            : `<button class="action-btn activate-btn" onclick="toggleTeacher(${t.id},'active')"><i class="fa-solid fa-circle-check"></i> Activate</button>`;

        const pendingEmailHtml = t.pending_email ? `
            <div class="pending-email-notice">
                <i class="fa-solid fa-envelope"></i>
                Pending: <strong>${t.pending_email}</strong>
                <button class="action-btn activate-btn" style="padding:4px 10px;font-size:0.75rem;" onclick="approveEmail(${t.id})">Approve</button>
                <button class="action-btn reject-btn"   style="padding:4px 10px;font-size:0.75rem;" onclick="rejectEmail(${t.id})">Reject</button>
            </div>` : '';

        return `
            <div class="teacher-card">
                <div class="teacher-card-left">
                    <div class="teacher-avatar">${initials(t.full_name)}</div>
                    <div>
                        <div class="teacher-name">${t.full_name}</div>
                        <div class="teacher-uid">${t.user_id}</div>
                        <div class="teacher-email">${t.email || 'No email'}</div>
                        ${pendingEmailHtml}
                    </div>
                </div>
                <div class="teacher-card-right">
                    <span class="status-badge ${statusClass}">${statusLabel}</span>
                    <div class="card-actions">
                        ${toggleBtn}
                        <button class="action-btn" onclick="openResetPw(${t.id})">
                            <i class="fa-solid fa-key"></i> Reset PW
                        </button>
                    </div>
                </div>
            </div>`;
    }

    window.toggleTeacher = async function(id, status) {
        if (!confirm(`${status === 'active' ? 'Activate' : 'Deactivate'} this account?`)) return;
        const fd = new FormData();
        fd.append('action', 'toggle_status');
        fd.append('id', id);
        fd.append('status', status);
        const res  = await fetch('auth/manage_teachers.php', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) loadTeachers();
        else alert(data.message);
    };

    window.approveEmail = async function(id) {
        const fd = new FormData();
        fd.append('action', 'approve_email');
        fd.append('id', id);
        const res  = await fetch('auth/manage_teachers.php', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) loadTeachers();
    };

    window.rejectEmail = async function(id) {
        const fd = new FormData();
        fd.append('action', 'reject_email');
        fd.append('id', id);
        const res  = await fetch('auth/manage_teachers.php', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) loadTeachers();
    };

    // ── Add Teacher ──
    addTeacherClose.addEventListener('click', () => closeModal(addTeacherModal));
    addTeacherModal.addEventListener('click', e => { if (e.target === addTeacherModal) closeModal(addTeacherModal); });

    addTeacherForm.addEventListener('submit', async e => {
        e.preventDefault();
        addTeacherError.classList.remove('visible');
        addTeacherSuccess.classList.remove('visible');
        addTeacherSubmit.disabled = true;
        addTeacherSubmit.querySelector('span').textContent = 'Creating...';
        const fd = new FormData(addTeacherForm);
        fd.append('action', 'add');
        try {
            const res  = await fetch('auth/manage_teachers.php', { method: 'POST', body: fd });
            const data = await res.json();
            if (data.success) {
                addTeacherSuccess.textContent = data.message;
                addTeacherSuccess.classList.add('visible');
                addTeacherForm.reset();
                loadTeachers();
            } else {
                addTeacherError.textContent = data.message;
                addTeacherError.classList.add('visible');
            }
        } catch {
            addTeacherError.textContent = 'Something went wrong.';
            addTeacherError.classList.add('visible');
        } finally {
            addTeacherSubmit.disabled = false;
            addTeacherSubmit.querySelector('span').textContent = 'Create Account';
        }
    });

    // ── Teacher CSV ──
    csvClose.addEventListener('click', () => closeModal(csvModal));
    csvModal.addEventListener('click', e => { if (e.target === csvModal) closeModal(csvModal); });

    csvFile.addEventListener('change', () => {
        if (csvFile.files.length > 0) { csvFileLabel.textContent = csvFile.files[0].name; csvFileWrap.classList.add('has-file'); }
    });

    csvForm.addEventListener('submit', async e => {
        e.preventDefault();
        csvError.classList.remove('visible');
        csvSuccess.classList.remove('visible');
        csvPreview.innerHTML = '';
        if (!csvFile.files.length) { csvError.textContent = 'Please select a CSV file.'; csvError.classList.add('visible'); return; }
        csvSubmit.disabled = true;
        csvSubmit.querySelector('span').textContent = 'Reading...';
        const fd = new FormData();
        fd.append('action', 'csv');
        fd.append('csv_file', csvFile.files[0]);
        try {
            const res  = await fetch('auth/manage_teachers.php', { method: 'POST', body: fd });
            const data = await res.json();
            if (!data.success) { csvError.textContent = data.message; csvError.classList.add('visible'); return; }
            if (!data.preview.length) { csvError.textContent = 'No valid rows found.'; csvError.classList.add('visible'); return; }
            csvPreview.innerHTML = buildCsvPreviewHtml(data.preview, 'teacher');
            document.getElementById('confirmCsvBtn').addEventListener('click', async () => {
                await confirmCsv('auth/manage_teachers.php', data.preview, csvSuccess, csvError);
                loadTeachers();
            });
        } catch { csvError.textContent = 'Something went wrong.'; csvError.classList.add('visible'); }
        finally { csvSubmit.disabled = false; csvSubmit.querySelector('span').textContent = 'Preview Accounts'; }
    });

    // ── Students Tab ──
    async function loadStudents() {
        tabContent.innerHTML = loadingHtml();
        try {
            let url = `auth/manage_students.php?action=get`;
            if (studentSearch) url += `&search=${encodeURIComponent(studentSearch)}`;
            const res  = await fetch(url);
            const data = await res.json();

            const toolbar = `
                <div class="teacher-toolbar">
                    <div class="toolbar-actions">
                        <button class="toolbar-btn primary" id="openAddStudent">
                            <i class="fa-solid fa-user-plus"></i> Add Student
                        </button>
                        <button class="toolbar-btn" id="openStudentCsv">
                            <i class="fa-solid fa-file-csv"></i> Bulk Upload CSV
                        </button>
                    </div>
                    <div class="cal-search">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <input type="text" placeholder="Search students..." id="studentSearchInput" value="${studentSearch}">
                    </div>
                </div>`;

            tabContent.innerHTML = toolbar + ((!data.success || data.data.length === 0)
                ? emptyHtml('No student accounts yet.')
                : data.data.map(buildStudentCard).join(''));

            document.getElementById('openAddStudent').addEventListener('click', () => {
                addStudentForm.reset();
                addStudentError.classList.remove('visible');
                addStudentSuccess.classList.remove('visible');
                openModal(addStudentModal);
            });

            document.getElementById('openStudentCsv').addEventListener('click', () => {
                studentCsvForm.reset();
                studentCsvFileLabel.textContent = 'Click to upload CSV file';
                studentCsvFileWrap.classList.remove('has-file');
                studentCsvPreview.innerHTML = '';
                studentCsvError.classList.remove('visible');
                studentCsvSuccess.classList.remove('visible');
                openModal(studentCsvModal);
            });

            let searchTimer;
            document.getElementById('studentSearchInput').addEventListener('input', e => {
                clearTimeout(searchTimer);
                searchTimer = setTimeout(() => {
                    studentSearch = e.target.value.trim();
                    loadStudents();
                }, 400);
            });

        } catch { tabContent.innerHTML = errorHtml(); }
    }

    function buildStudentCard(s) {
        const statusClass = { active: 'status-active', inactive: 'status-inactive', deactivated: 'status-deactivated' }[s.status];
        const statusLabel = { active: 'Active', inactive: 'Inactive', deactivated: 'Deactivated' }[s.status];

        const reasonBadge = s.deactivation_reason
            ? `<span class="deactivation-badge">${s.deactivation_reason}</span>` : '';

        const actionBtns = s.status === 'active'
            ? `<button class="action-btn deactivate-btn" onclick="openDeactivateStudent(${s.id})"><i class="fa-solid fa-ban"></i> Deactivate</button>`
            : `<button class="action-btn activate-btn" onclick="toggleStudent(${s.id},'active')"><i class="fa-solid fa-circle-check"></i> Activate</button>`;

        return `
            <div class="teacher-card">
                <div class="teacher-card-left">
                    <div class="teacher-avatar" style="background:linear-gradient(135deg,#1d9e75,#0f6e56)">${initials(s.full_name)}</div>
                    <div>
                        <div class="teacher-name">${s.full_name}</div>
                        <div class="teacher-uid">${s.user_id}</div>
                        <div class="teacher-email">${s.email || 'No email'}</div>
                    </div>
                </div>
                <div class="teacher-card-right">
                    <span class="status-badge ${statusClass}">${statusLabel}</span>
                    ${reasonBadge}
                    <div class="card-actions">
                        ${actionBtns}
                        <button class="action-btn" onclick="openResetPw(${s.id})">
                            <i class="fa-solid fa-key"></i> Reset PW
                        </button>
                    </div>
                </div>
            </div>`;
    }

    window.openDeactivateStudent = function(id) {
        document.getElementById('deactivateStudentId').value = id;
        deactivateStudentError.classList.remove('visible');
        deactivateStudentForm.reset();
        openModal(deactivateStudentModal);
    };

    window.toggleStudent = async function(id, status, reason = '') {
        const fd = new FormData();
        fd.append('action', 'toggle_status');
        fd.append('id', id);
        fd.append('status', status);
        fd.append('reason', reason);
        const res  = await fetch('auth/manage_students.php', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) loadStudents();
        else alert(data.message);
    };

    deactivateStudentClose.addEventListener('click', () => closeModal(deactivateStudentModal));
    deactivateStudentModal.addEventListener('click', e => { if (e.target === deactivateStudentModal) closeModal(deactivateStudentModal); });

    deactivateStudentForm.addEventListener('submit', async e => {
        e.preventDefault();
        const id     = document.getElementById('deactivateStudentId').value;
        const reason = document.getElementById('deactivateReason').value;
        if (!reason) { deactivateStudentError.textContent = 'Please select a reason.'; deactivateStudentError.classList.add('visible'); return; }
        deactivateStudentSubmit.disabled = true;
        await toggleStudent(id, 'deactivated', reason);
        closeModal(deactivateStudentModal);
        deactivateStudentSubmit.disabled = false;
    });

    // ── Add Student ──
    addStudentClose.addEventListener('click', () => closeModal(addStudentModal));
    addStudentModal.addEventListener('click', e => { if (e.target === addStudentModal) closeModal(addStudentModal); });

    addStudentForm.addEventListener('submit', async e => {
        e.preventDefault();
        addStudentError.classList.remove('visible');
        addStudentSuccess.classList.remove('visible');
        addStudentSubmit.disabled = true;
        addStudentSubmit.querySelector('span').textContent = 'Creating...';
        const fd = new FormData(addStudentForm);
        fd.append('action', 'add');
        try {
            const res  = await fetch('auth/manage_students.php', { method: 'POST', body: fd });
            const data = await res.json();
            if (data.success) {
                addStudentSuccess.textContent = data.message;
                addStudentSuccess.classList.add('visible');
                addStudentForm.reset();
                loadStudents();
            } else {
                addStudentError.textContent = data.message;
                addStudentError.classList.add('visible');
            }
        } catch {
            addStudentError.textContent = 'Something went wrong.';
            addStudentError.classList.add('visible');
        } finally {
            addStudentSubmit.disabled = false;
            addStudentSubmit.querySelector('span').textContent = 'Create Account';
        }
    });

    // ── Student CSV ──
    studentCsvClose.addEventListener('click', () => closeModal(studentCsvModal));
    studentCsvModal.addEventListener('click', e => { if (e.target === studentCsvModal) closeModal(studentCsvModal); });

    studentCsvFile.addEventListener('change', () => {
        if (studentCsvFile.files.length > 0) { studentCsvFileLabel.textContent = studentCsvFile.files[0].name; studentCsvFileWrap.classList.add('has-file'); }
    });

    studentCsvForm.addEventListener('submit', async e => {
        e.preventDefault();
        studentCsvError.classList.remove('visible');
        studentCsvSuccess.classList.remove('visible');
        studentCsvPreview.innerHTML = '';
        if (!studentCsvFile.files.length) { studentCsvError.textContent = 'Please select a CSV file.'; studentCsvError.classList.add('visible'); return; }
        studentCsvSubmit.disabled = true;
        studentCsvSubmit.querySelector('span').textContent = 'Reading...';
        const fd = new FormData();
        fd.append('action', 'csv');
        fd.append('csv_file', studentCsvFile.files[0]);
        try {
            const res  = await fetch('auth/manage_students.php', { method: 'POST', body: fd });
            const data = await res.json();
            if (!data.success) { studentCsvError.textContent = data.message; studentCsvError.classList.add('visible'); return; }
            if (!data.preview.length) { studentCsvError.textContent = 'No valid rows found.'; studentCsvError.classList.add('visible'); return; }
            studentCsvPreview.innerHTML = buildCsvPreviewHtml(data.preview, 'student');
            document.getElementById('confirmCsvBtn').addEventListener('click', async () => {
                await confirmCsv('auth/manage_students.php', data.preview, studentCsvSuccess, studentCsvError);
                loadStudents();
            });
        } catch { studentCsvError.textContent = 'Something went wrong.'; studentCsvError.classList.add('visible'); }
        finally { studentCsvSubmit.disabled = false; studentCsvSubmit.querySelector('span').textContent = 'Preview Accounts'; }
    });

    // ── Shared CSV helpers ──
    function buildCsvPreviewHtml(preview, type) {
        const rows = preview.map(r => `
            <tr>
                <td>${r.full_name}</td>
                <td>${r.user_id}</td>
                <td>${r.email || '—'}</td>
            </tr>`).join('');
        return `
            <table class="csv-preview-table">
                <thead><tr><th>Full Name</th><th>User ID</th><th>Email</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
            <button class="confirm-csv-btn" id="confirmCsvBtn">
                <i class="fa-solid fa-check"></i> Confirm & Create ${preview.length} ${type}(s)
            </button>`;
    }

    async function confirmCsv(endpoint, preview, successEl, errorEl) {
        const fd = new FormData();
        fd.append('action', 'csv_confirm');
        fd.append('accounts', JSON.stringify(preview));
        const res  = await fetch(endpoint, { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) { successEl.textContent = data.message; successEl.classList.add('visible'); }
        else { errorEl.textContent = data.message; errorEl.classList.add('visible'); }
    }

    // ── Reset Password ──
    window.openResetPw = function(id) {
        document.getElementById('resetPwTeacherId').value = id;
        resetPwForm.reset();
        resetPwError.classList.remove('visible');
        resetPwSuccess.classList.remove('visible');
        openModal(resetPwModal);
    };

    resetPwClose.addEventListener('click', () => closeModal(resetPwModal));
    resetPwModal.addEventListener('click', e => { if (e.target === resetPwModal) closeModal(resetPwModal); });

    resetPwForm.addEventListener('submit', async e => {
        e.preventDefault();
        resetPwError.classList.remove('visible');
        resetPwSuccess.classList.remove('visible');
        resetPwSubmit.disabled = true;
        resetPwSubmit.querySelector('span').textContent = 'Resetting...';
        const fd = new FormData();
        fd.append('action', 'reset_password');
        fd.append('id', document.getElementById('resetPwTeacherId').value);
        fd.append('new_password', resetPwInput.value);
        try {
            const res  = await fetch('auth/manage_teachers.php', { method: 'POST', body: fd });
            const data = await res.json();
            if (data.success) { resetPwSuccess.textContent = data.message; resetPwSuccess.classList.add('visible'); resetPwForm.reset(); }
            else { resetPwError.textContent = data.message; resetPwError.classList.add('visible'); }
        } catch { resetPwError.textContent = 'Something went wrong.'; resetPwError.classList.add('visible'); }
        finally { resetPwSubmit.disabled = false; resetPwSubmit.querySelector('span').textContent = 'Reset Password'; }
    });

    // ── Schedule ──
    async function loadSchedule() {
        tabContent.innerHTML = loadingHtml();
        let url = `auth/get_schedule_reservations.php?month=${calMonth}&year=${calYear}`;
        if (calSearch) url += `&search=${encodeURIComponent(calSearch)}`;
        try {
            const res  = await fetch(url);
            const data = await res.json();
            calData = data.data || [];
            renderCalendar();
        } catch { tabContent.innerHTML = errorHtml(); }
    }

    function renderCalendar() {
        const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        const dayNames   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        const firstDay   = new Date(calYear, calMonth - 1, 1).getDay();
        const daysInMonth = new Date(calYear, calMonth, 0).getDate();
        const today      = new Date();

        const eventsByDay = {};
        calData.forEach(r => {
            const day = parseInt(r.date_of_use.split('-')[2]);
            if (!eventsByDay[day]) eventsByDay[day] = [];
            eventsByDay[day].push(r);
        });

        let dayCells = '';
        for (let i = 0; i < firstDay; i++) dayCells += `<div class="cal-day other-month"></div>`;

        for (let d = 1; d <= daysInMonth; d++) {
            const events   = eventsByDay[d] || [];
            const isToday  = d === today.getDate() && calMonth === today.getMonth() + 1 && calYear === today.getFullYear();
            const hasEvents = events.length > 0;
            const pills    = events.slice(0, 2).map(e => `<span class="cal-event-pill">${e.venue_name}</span>`).join('');
            const more     = events.length > 2 ? `<span class="cal-event-pill">+${events.length - 2} more</span>` : '';
            dayCells += `
                <div class="cal-day ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}"
                     onclick="${hasEvents ? `openDayModal(${d})` : ''}">
                    <div class="cal-day-num">${d}</div>
                    ${pills}${more}
                </div>`;
        }

        tabContent.innerHTML = `
            <div class="schedule-toolbar">
                <div class="cal-nav">
                    <button class="cal-nav-btn" id="calPrev"><i class="fa-solid fa-chevron-left"></i></button>
                    <span class="cal-month-label">${monthNames[calMonth - 1]} ${calYear}</span>
                    <button class="cal-nav-btn" id="calNext"><i class="fa-solid fa-chevron-right"></i></button>
                </div>
                <div class="cal-search">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" placeholder="Search teacher, venue, event..." id="calSearchInput" value="${calSearch}">
                </div>
            </div>
            <div class="calendar-grid">
                <div class="cal-header-row">${dayNames.map(d => `<div class="cal-header-cell">${d}</div>`).join('')}</div>
                <div class="cal-body">${dayCells}</div>
            </div>`;

        document.getElementById('calPrev').addEventListener('click', () => {
            calMonth--; if (calMonth < 1) { calMonth = 12; calYear--; } loadSchedule();
        });
        document.getElementById('calNext').addEventListener('click', () => {
            calMonth++; if (calMonth > 12) { calMonth = 1; calYear++; } loadSchedule();
        });

        let searchTimer;
        document.getElementById('calSearchInput').addEventListener('input', e => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => { calSearch = e.target.value.trim(); loadSchedule(); }, 400);
        });
    }

    window.openDayModal = function(day) {
        const events = calData.filter(r => parseInt(r.date_of_use.split('-')[2]) === day);
        const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        dayModalTitle.textContent = `${monthNames[calMonth - 1]} ${day}, ${calYear}`;
        dayModalContent.innerHTML = events.map(r => `
            <div class="day-reservation-item">
                <div class="day-res-venue">${r.venue_name}</div>
                <div class="day-res-event">${r.event_name}</div>
                <div class="day-res-meta">
                    <span><i class="fa-solid fa-chalkboard-user"></i> ${r.teacher_name}</span>
                    <span><i class="fa-solid fa-clock"></i> ${formatTime(r.time_start)} — ${formatTime(r.time_end)}</span>
                </div>
            </div>`).join('');
        openModal(dayModal);
    };

    dayClose.addEventListener('click', () => closeModal(dayModal));
    dayModal.addEventListener('click', e => { if (e.target === dayModal) closeModal(dayModal); });

    // ── Feedback ──
    async function loadFeedback() {
        tabContent.innerHTML = loadingHtml();
        let url = `auth/get_feedback.php?`;
        if (dateFrom) url += `date_from=${dateFrom}&`;
        if (dateTo)   url += `date_to=${dateTo}`;
        try {
            const res  = await fetch(url);
            const data = await res.json();
            if (!data.success || data.data.length === 0) { tabContent.innerHTML = emptyHtml('No feedback yet.'); return; }
            tabContent.innerHTML = data.data.map(f => `
                <div class="feedback-card">
                    <div class="feedback-meta">
                        <span class="feedback-sender">
                            <i class="fa-solid fa-user"></i> ${f.name || 'Anonymous'}
                            ${f.email ? `<span style="color:#4a6a8a;font-weight:400;">— ${f.email}</span>` : ''}
                        </span>
                        <span class="feedback-date">${formatDateTime(f.created_at)}</span>
                    </div>
                    <p class="feedback-message">${f.message}</p>
                </div>`).join('');
        } catch { tabContent.innerHTML = errorHtml(); }
    }

    // ── Chatbot ──
    chatbotToggle.addEventListener('click', () => chatbotPanel.classList.toggle('active'));
    chatbotClose.addEventListener('click',  () => chatbotPanel.classList.remove('active'));

    const chatHeader = document.querySelector('.chatbot-header');
    let isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
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

    document.addEventListener('mouseup', () => { isDragging = false; chatHeader.style.cursor = 'grab'; });

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
    loadBadges();
    loadContent();
});