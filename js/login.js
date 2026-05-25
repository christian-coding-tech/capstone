document.addEventListener('DOMContentLoaded', () => {
    // Ripple effect for buttons
    const buttons = document.querySelectorAll('.login-btn');

    buttons.forEach(button => {
        button.addEventListener('click', event => {
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            button.appendChild(ripple);

            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

            window.setTimeout(() => ripple.remove(), 700);
        });
    });

    // Navigation popup modal
    const modalOverlay = document.getElementById('navigationModal');
    const navBtn = document.querySelector('.nav-btn');
    const modalClose = modalOverlay ? modalOverlay.querySelector('.modal-close') : null;

    const openModal = () => {
        if (!modalOverlay) return;
        modalOverlay.classList.add('is-open');
        modalOverlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    };

    const closeModal = () => {
        if (!modalOverlay) return;
        modalOverlay.classList.remove('is-open');
        modalOverlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    };

    if (navBtn && modalOverlay) {
        navBtn.addEventListener('click', () => openModal());
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            // Close only when clicking the overlay, not the modal content
            if (e.target === modalOverlay) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
});

