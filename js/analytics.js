// This page's whole surface onto PostHog. It mirrors, deliberately and almost
// line for line, `src/lib/analytics.ts` in the langx/website repository — the
// two sites make the same promises on their privacy pages, so they had better
// be configured the same way.
//
// The key is empty in the repository and the site ships that way: with no key
// nothing is loaded, nothing is sent, and this file is inert. Paste the app's
// PostHog project key below to turn it on — the same project, because the free
// plan allows exactly one and a separate "LangX Web" would have needed a card.
// It is public by design — it can write events and never read them — which is
// why it can sit in a repository with no build step to hide it in, and why it
// is already extractable from the mobile app's bundle.
const POSTHOG_KEY = 'phc_AZYA4geCkg9crLryffsPs25DKokh9VvSnT85Z4iz2dF7';
const POSTHOG_HOST = 'https://eu.i.posthog.com';

// Four settings here are declarations, not preferences. They are what
// `privacy.html` says about this page; change one and that page is wrong.
//
//  - cookieless_mode 'always' — nothing is written to your browser. No cookie,
//    no localStorage, no sessionStorage. PostHog counts a visitor with a hash
//    it computes on its own side from a salt it discards daily, so there is
//    nothing stored on your device to ask consent for and this page keeps its
//    promise of having no cookie banner.
//  - person_profiles 'never' — no person record, and identify() is a no-op.
//  - disable_session_recording — no recordings.
//  - autocapture false — clicks are not swept up wholesale. What is sent is the
//    page view plus the one event below.
//
// The cost of cookieless is real: a returning visitor is a new one tomorrow.
// This measures which pages get read and which links get clicked, never
// retention.
//
// posthog.js is vendored next to this file rather than loaded from PostHog's
// CDN, the same way gsap.min.js is, so nothing here reaches a third party for
// code. It is `dist/array.no-external.js` from posthog-js 1.428.6; re-copy it
// from that package to update, and change the version in this comment.
//
// That build earns its size. Measured on this page, the only request leaving
// for PostHog is the one carrying the events, to /e/ — no configuration file
// from its asset CDN and no /flags call. The website's bundled `posthog-js`
// still makes both, which is why langx.io's cookie policy has to name them and
// privacy.html here does not.
(function () {
    if (!POSTHOG_KEY || typeof posthog === 'undefined') return;

    posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        defaults: '2026-05-30',
        cookieless_mode: 'always',
        person_profiles: 'never',
        disable_session_recording: true,
        autocapture: false,
        // One project, three surfaces. Stamps every event with where it came
        // from so the app's dashboards can exclude it; in before_send rather
        // than register() because the first $pageview is captured during init.
        before_send: function (event) {
            if (event) event.properties.langx_surface = 'token-website';
            return event;
        },
        // Flags need a stable identity, which cookieless deliberately does not
        // have, so nothing here could use one. Measured against an invalid key
        // the SDK still called /flags once on load despite this; treat the
        // switch as intent, not as a promise about the request count.
        advanced_disable_flags: true
    });

    // The hosts worth recording a click for. One delegated listener in the
    // capture phase rather than a handler per link, so a click routed through a
    // child element still counts.
    const appHosts = ['get.langx.io', 'app.langx.io', 'apps.apple.com', 'play.google.com'];

    document.addEventListener('click', function (event) {
        const link = event.target instanceof Element && event.target.closest('a');
        if (!link || !link.href) return;

        let host;
        try {
            host = new URL(link.href).host;
        } catch (error) {
            return;
        }
        if (appHosts.indexOf(host) === -1) return;

        posthog.capture('download_clicked', {
            destination: host,
            location: window.location.pathname
        });
    }, true);
})();
