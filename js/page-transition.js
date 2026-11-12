(() => {
    const body = document.body;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const transitionDuration = 240;
    let navigationPending = false;

    function isLocalPageChange(url) {
        return (url.protocol === 'http:' || url.protocol === 'https:')
            && url.origin === window.location.origin
            && !(url.pathname === window.location.pathname && url.search === window.location.search);
    }

    function navigate(destination) {
        const url = new URL(destination, window.location.href);
        if (motionPreference.matches || !isLocalPageChange(url)) {
            window.location.assign(url.href);
            return;
        }
        if (navigationPending) return;

        navigationPending = true;
        body.classList.remove('page-entering');
        body.classList.add('page-leaving');
        window.setTimeout(() => window.location.assign(url.href), transitionDuration);
    }

    window.PageTransition = Object.freeze({ navigate });

    if (motionPreference.matches) return;

    body.classList.add('page-entering');
    body.addEventListener('animationend', event => {
        if (event.target === body && event.animationName === 'systemPageEnter') {
            body.classList.remove('page-entering');
        }
    });

    document.addEventListener('click', event => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (!(event.target instanceof Element)) return;

        const link = event.target.closest('a[href]');
        if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self') || link.relList.contains('external')) return;

        const url = new URL(link.href, window.location.href);
        if (!isLocalPageChange(url)) return;

        event.preventDefault();
        navigate(url.href);
    });
})();
