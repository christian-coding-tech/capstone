document.addEventListener('DOMContentLoaded', () => {
    const noticeKey = 'capstone:release-announcement:2026-10-18-ui-refresh';
    let hasSeenNotice = false;

    try {
        hasSeenNotice = window.localStorage.getItem(noticeKey) === 'dismissed';
    } catch {
        hasSeenNotice = false;
    }

    if (hasSeenNotice) return;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const overlay = document.createElement('div');
    overlay.className = 'release-notice-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `
        <section class="release-notice" role="dialog" aria-modal="true" aria-labelledby="releaseNoticeTitle" aria-describedby="releaseNoticeDescription">
            <button class="release-notice-close" type="button" aria-label="Close update">
                <i class="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
            <div class="release-notice-icon" aria-hidden="true"><i class="fa-solid fa-sparkles"></i></div>
            <span class="release-notice-eyebrow">Interface update · October 18, 2026</span>
            <h2 id="releaseNoticeTitle">A more polished campus portal</h2>
            <p id="releaseNoticeDescription">The portal now has a more consistent, professional look, with smoother interactions across campus tools and dashboards.</p>
            <ul class="release-notice-list">
                <li><i class="fa-solid fa-mobile-screen-button" aria-hidden="true"></i><span><strong>Better mobile navigation</strong><small>Dashboard tabs and actions are easier to reach on smaller screens.</small></span></li>
                <li><i class="fa-solid fa-qrcode" aria-hidden="true"></i><span><strong>Quick student QR access</strong><small>Open your personal QR from the new QR button on the student dashboard.</small></span></li>
                <li><i class="fa-solid fa-camera" aria-hidden="true"></i><span><strong>Improved attendance scanning</strong><small>Camera controls and QR scanning adapt better to mobile devices.</small></span></li>
                <li><i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i><span><strong>A refined visual experience</strong><small>Consistent colors, clearer surfaces, and subtle motion make the system feel more polished.</small></span></li>
            </ul>
            <button class="release-notice-continue" type="button">Continue to dashboard <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>
        </section>`;
    document.body.appendChild(overlay);

    const closeButton = overlay.querySelector('.release-notice-close');
    const continueButton = overlay.querySelector('.release-notice-continue');
    const close = () => {
        overlay.classList.remove('is-visible');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = previousOverflow;
        try {
            window.localStorage.setItem(noticeKey, 'dismissed');
        } catch {
            // Keep the announcement dismissible when browser storage is disabled.
        }
        window.setTimeout(() => overlay.remove(), 220);
        if (previousFocus instanceof HTMLElement && previousFocus !== document.body) previousFocus.focus();
        document.removeEventListener('keydown', onKeydown);
    };
    const onKeydown = event => {
        if (event.key === 'Escape') close();
        if (event.key === 'Tab') {
            event.preventDefault();
            (document.activeElement === closeButton ? continueButton : closeButton).focus();
        }
    };

    closeButton.addEventListener('click', close);
    continueButton.addEventListener('click', close);
    overlay.addEventListener('click', event => {
        if (event.target === overlay) close();
    });
    document.addEventListener('keydown', onKeydown);
    document.body.style.overflow = 'hidden';
    window.requestAnimationFrame(() => {
        overlay.hidden = false;
        overlay.setAttribute('aria-hidden', 'false');
        window.requestAnimationFrame(() => {
            overlay.classList.add('is-visible');
            closeButton.focus();
        });
    });
});
