import mixpanel from './mixpanel';

export function track(name: string, opts = {}) {
  if (process.env.MIXPANEL_ACCESS_TOKEN) {
    mixpanel.track(name, opts);
  }
}

export function identify(data: string) {
  if (process.env.MIXPANEL_ACCESS_TOKEN) {
    mixpanel.identify(data);

    mixpanel.people.set({
      USER_ID: data,
    });
  }
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
