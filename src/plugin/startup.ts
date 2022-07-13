import { ApiProvidersProperty, LicenseKeyProperty } from '@/figmaStorage';
import { getActiveTheme } from '@/utils/getActiveTheme';
import getLastOpened from '@/utils/getLastOpened';
import { getUsedTokenSet } from '@/utils/getUsedTokenSet';
import { getUISettings } from '@/utils/uiSettings';
import { getUserId } from './helpers';
import { getSavedStorageType, getTokenData } from './node';

export async function startup() {
  // on startup we need to fetch all the locally available data so we can bootstrap our UI
  const [
    settings,
    usedTokenSet,
    activeTheme,
    userId, // the user ID is used for license key binding
    lastOpened,
    storageType,
    localApiProviders,
    licenseKey,
    localTokenData,
  ] = await Promise.all([
    getUISettings(),
    getUsedTokenSet(),
    getActiveTheme(),
    getUserId(),
    getLastOpened(),
    getSavedStorageType(),
    ApiProvidersProperty.read(),
    LicenseKeyProperty.read(),
    getTokenData(),
  ]);
}
