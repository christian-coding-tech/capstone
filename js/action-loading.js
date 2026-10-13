(() => {
    const overlay = document.getElementById('actionLoader');
    const caption = document.getElementById('actionLoaderCaption');
    if (!overlay || !caption) return;

    window.ActionLoading = {
        show(message) {
            caption.textContent = message;
            overlay.classList.add('is-active');
            overlay.setAttribute('aria-hidden', 'false');
        },
        hide() {
            overlay.classList.remove('is-active');
            overlay.setAttribute('aria-hidden', 'true');
        }
    };

    document.addEventListener('click', event => {
        const logoutLink = event.target.closest('a[href]');
        if (!logoutLink || !/\/auth\/logout\.php(?:[?#]|$)/i.test(logoutLink.pathname + logoutLink.search + logoutLink.hash)) return;
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || logoutLink.target && logoutLink.target !== '_self') return;
        window.ActionLoading.show('Signing out of your account…');
    });
})();
