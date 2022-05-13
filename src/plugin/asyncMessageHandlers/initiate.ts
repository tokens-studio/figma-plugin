import store from '../store';
import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { StorageProviderType } from '@/types/api';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { getFeatureFlags } from '@/utils/featureFlags';
import getLastOpened from '@/utils/getLastOpened';
import { getUsedTokenSet } from '@/utils/getUsedTokenSet';
import { getUISettings } from '@/utils/uiSettings';
import compareProvidersWithStored from '../compareProviders';
import { getUserId } from '../helpers';
import { getSavedStorageType, getTokenData } from '../node';
import {
  notifyAPIProviders, notifyLastOpened, notifyLicenseKey, notifyNoSelection, notifyNoTokenValues, notifyStorageType, notifyTokenValues, notifyUserId,
} from '../notifiers';
import { getActiveTheme } from '@/utils/getActiveTheme';

export const initiate: AsyncMessageChannelHandlers[AsyncMessageTypes.INITIATE] = async () => {
  try {
    const { currentUser } = figma;
    const settings = await getUISettings();
    const featureFlagId = await getFeatureFlags();
    const usedTokenSet = await getUsedTokenSet();
    const activeTheme = await getActiveTheme();
    const userId = await getUserId();
    const lastOpened = await getLastOpened();
    const storageType = getSavedStorageType();
    store.inspectDeep = settings.inspectDeep;
    if (currentUser) {
      notifyUserId({
        userId,
        figmaId: currentUser.id,
        name: currentUser.name,
      });
    }
    notifyLastOpened(lastOpened);
    notifyStorageType(storageType);

    const licenseKey = await figma.clientStorage.getAsync('licenseKey');
    notifyLicenseKey(licenseKey);

    // @TODO fix setting of activeTheme
    const apiProviders = await figma.clientStorage.getAsync('apiProviders');
    if (apiProviders) notifyAPIProviders(JSON.parse(apiProviders));
    switch (storageType.provider) {
      case StorageProviderType.JSONBIN:
      case StorageProviderType.GITHUB:
      case StorageProviderType.GITLAB:
      case StorageProviderType.ADO:
      case StorageProviderType.URL: {
        compareProvidersWithStored({
          providers: apiProviders,
          storageType,
          featureFlagId,
          usedTokenSet,
        });
        break;
      }
      default: {
        const oldTokens = getTokenData();
        if (oldTokens) {
          notifyTokenValues({ ...oldTokens, activeTheme, usedTokenSet });
        } else {
          notifyNoTokenValues();
        }
      }
    }
  } catch (err) {
    figma.closePlugin('There was an error, check console (F12)');
    console.error(err);
    return;
  }

  if (!figma.currentPage.selection.length) {
    notifyNoSelection();
  }
};
