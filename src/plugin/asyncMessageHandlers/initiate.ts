import store from '../store';
import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
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
import { StorageProviderType } from '@/constants/StorageProviderType';
import { LicenseKeyProperty } from '@/figmaStorage/LicenseKeyProperty';
import { ApiProvidersProperty } from '@/figmaStorage';

export const initiate: AsyncMessageChannelHandlers[AsyncMessageTypes.INITIATE] = async () => {
  try {
    const { currentUser } = figma;
    const settings = await getUISettings();
    const usedTokenSet = await getUsedTokenSet();
    const activeTheme = await getActiveTheme();
    const userId = await getUserId();
    const lastOpened = await getLastOpened();
    const storageType = await getSavedStorageType();
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

    const licenseKey = await LicenseKeyProperty.read();
    notifyLicenseKey(licenseKey ?? '');

    // @TODO fix setting of activeTheme
    const apiProviders = await ApiProvidersProperty.read();
    if (apiProviders) notifyAPIProviders(apiProviders);
    switch (storageType.provider) {
      case StorageProviderType.JSONBIN:
      case StorageProviderType.GITHUB:
      case StorageProviderType.GITLAB:
      case StorageProviderType.ADO:
      case StorageProviderType.URL: {
        compareProvidersWithStored({
          providers: apiProviders ?? [],
          storageType,
          usedTokenSet,
        });
        break;
      }
      default: {
        const oldTokens = await getTokenData();
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
