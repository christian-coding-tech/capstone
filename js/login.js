document.addEventListener('DOMContentLoaded', () => {

    // ── Ripple effect ──
    document.querySelectorAll('.login-btn').forEach(button => {
        button.addEventListener('click', event => {
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            button.appendChild(ripple);
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
            setTimeout(() => ripple.remove(), 700);
        });
    });

    // ── Modal helpers ──
    function openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ── Login modal ──
    const loginModal   = document.getElementById('loginModal');
    const loginToggle  = document.getElementById('loginToggle');
    const loginClose   = document.getElementById('loginClose');
    const loginError   = document.getElementById('loginError');
    const loginForm    = document.getElementById('loginForm');
    const loginSubmit  = document.getElementById('loginSubmit');
    const togglePw     = document.getElementById('togglePw');
    const pwInput      = document.getElementById('userPassword');

    loginToggle.addEventListener('click', () => openModal(loginModal));
    loginClose.addEventListener('click',  () => closeModal(loginModal));

    loginModal.addEventListener('click', e => {
        if (e.target === loginModal) closeModal(loginModal);
    });

    togglePw.addEventListener('click', () => {
        const isText = pwInput.type === 'text';
        pwInput.type = isText ? 'password' : 'text';
        togglePw.querySelector('i').className = isText ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
    });

    loginForm.addEventListener('submit', async e => {
        e.preventDefault();
        loginError.classList.remove('visible');
        loginSubmit.disabled = true;
        loginSubmit.querySelector('span').textContent = 'Signing in...';

        const formData = new FormData(loginForm);

        try {
            const res  = await fetch('auth/login_handler.php', { method: 'POST', body: formData });
            const data = await res.json();

            if (data.success) {
                loginSubmit.querySelector('span').textContent = 'Redirecting...';
                window.location.href = data.redirect;
            } else {
                loginError.textContent = data.message;
                loginError.classList.add('visible');
                loginSubmit.disabled = false;
                loginSubmit.querySelector('span').textContent = 'Sign In';
            }
        } catch {
            loginError.textContent = 'Something went wrong. Please try again.';
            loginError.classList.add('visible');
            loginSubmit.disabled = false;
            loginSubmit.querySelector('span').textContent = 'Sign In';
        }
    });

    // ── Feedback modal ──
    const feedbackModal   = document.getElementById('feedbackModal');
    const feedbackToggle  = document.getElementById('feedbackToggle');
    const feedbackClose   = document.getElementById('feedbackClose');
    const feedbackForm    = document.getElementById('feedbackForm');
    const feedbackSuccess = document.getElementById('feedbackSuccess');
    const feedbackError   = document.getElementById('feedbackError');

    feedbackToggle.addEventListener('click', () => openModal(feedbackModal));

    feedbackClose.addEventListener('click', () => {
        closeModal(feedbackModal);
        feedbackSuccess.classList.remove('visible');
        feedbackError.classList.remove('visible');
    });

    feedbackModal.addEventListener('click', e => {
        if (e.target === feedbackModal) {
            closeModal(feedbackModal);
            feedbackSuccess.classList.remove('visible');
            feedbackError.classList.remove('visible');
        }
    });

    feedbackForm.addEventListener('submit', async e => {
        e.preventDefault();
        feedbackSuccess.classList.remove('visible');
        feedbackError.classList.remove('visible');

        const formData = new FormData(feedbackForm);

        try {
            const res  = await fetch('auth/feedback_handler.php', { method: 'POST', body: formData });
            const data = await res.json();

            if (data.success) {
                feedbackSuccess.textContent = 'Thank you! Your feedback has been sent.';
                feedbackSuccess.classList.add('visible');
                feedbackForm.reset();
            } else {
                feedbackError.textContent = data.message || 'Failed to send feedback.';
                feedbackError.classList.add('visible');
            }
        } catch {
            feedbackError.textContent = 'Something went wrong. Please try again.';
            feedbackError.classList.add('visible');
        }
    });
});