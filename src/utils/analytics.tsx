import mixpanel from './mixpanel';

export function track(name: string, opts = {}) {
    mixpanel.track(name, opts);
}

export function identify(data: string) {
    mixpanel.identify(data);
}

export function initializeAnalytics() {
    if (process.env.MIXPANEL_ACCESS_TOKEN) {
        mixpanel.init(process.env.MIXPANEL_ACCESS_TOKEN, {
            disable_cookie: true,
            disable_persistence: true,
            api_host: 'https://api-eu.mixpanel.com',
        });
    }
}
