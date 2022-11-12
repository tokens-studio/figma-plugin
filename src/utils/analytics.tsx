import mixpanel from './mixpanel';
import * as pjs from '../../package.json';

export function track(name: string, opts = {}) {
  if (process.env.MIXPANEL_ACCESS_TOKEN) {
    mixpanel.track(name, opts);
  }
}

export function identify({ userId, figmaId, name }: { userId: string; figmaId?: string | null; name?: string }) {
  if (process.env.MIXPANEL_ACCESS_TOKEN && figmaId) {
    mixpanel.identify(figmaId);

    mixpanel.people.set({
      USER_ID: userId,
      FIGMA_USER_ID: figmaId,
      NAME: name,
      version: pjs.plugin_version,
    });
  }
}

export function setUserData(data: { [key: string]: string }) {
  if (process.env.MIXPANEL_ACCESS_TOKEN && 'people' in mixpanel) {
    mixpanel.people.set(data);
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
