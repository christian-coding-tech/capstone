document.addEventListener('DOMContentLoaded', () => {
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
});
