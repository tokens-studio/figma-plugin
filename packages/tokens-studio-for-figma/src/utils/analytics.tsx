import mixpanel from './mixpanel';
import pjs from '../../package.json';
import { hashFigmaUserId } from './hashFigmaId';

export function track(name: string, opts: Record<string, any> = {}) {
  if (process.env.MIXPANEL_ACCESS_TOKEN) {
    // If figmaId is present, hash it before sending
    const data = { ...opts };
    if (typeof data.figmaId === 'string') {
      data.figmaId = hashFigmaUserId(data.figmaId);
    }
    if (typeof data.userId === 'string') {
      data.userId = hashFigmaUserId(data.userId);
    }
    mixpanel.track(name, data);
  }
}

export function identify({ userId, figmaId }: { userId: string; figmaId?: string | null }) {
  if (process.env.MIXPANEL_ACCESS_TOKEN && figmaId) {
    const hashedFigmaId = hashFigmaUserId(figmaId);
    const hashedUserId = hashFigmaUserId(userId);
    mixpanel.identify(hashedFigmaId);
    mixpanel.people.set({
      USER_ID: hashedUserId,
      FIGMA_USER_ID: hashedFigmaId,
      version: pjs.version,
    });
  }
}

export function setUserData(data: { [key: string]: string }) {
  if (process.env.MIXPANEL_ACCESS_TOKEN && 'people' in mixpanel) {
    // Remove userName if present
    const filtered = { ...data };
    delete filtered.userName;
    mixpanel.people.set(filtered);
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
