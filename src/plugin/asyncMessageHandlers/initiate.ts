import store from '../store';
import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import getLastOpened from '@/utils/getLastOpened';
import { getUsedTokenSet } from '@/utils/getUsedTokenSet';
import { getModifiedTokenSet } from '@/utils/getModifiedTokenSet';
import { getUISettings } from '@/utils/uiSettings';
import { getUserId } from '../helpers';
import { getSavedStorageType, getTokenData } from '../node';
import {
  notifyAPIProviders, notifyLastOpened, notifyLicenseKey, notifyNoSelection, notifyNoTokenValues, notifyStorageType, notifyTokenValues, notifyUserId, notifyModifiedTokenSet,
} from '../notifiers';
import { getActiveTheme } from '@/utils/getActiveTheme';
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
    const modifiedTokenSet = await getModifiedTokenSet();
    console.log('initia', modifiedTokenSet);
    store.inspectDeep = settings.inspectDeep;
    if (currentUser) {
      notifyUserId({
        userId,
        figmaId: currentUser.id,
        name: currentUser.name,
      });
    }
    const licenseKey = await LicenseKeyProperty.read();
    notifyLicenseKey(licenseKey ?? '');

    notifyLastOpened(lastOpened);
    notifyStorageType(storageType);
    notifyModifiedTokenSet(modifiedTokenSet);

    const apiProviders = await ApiProvidersProperty.read();
    if (apiProviders) notifyAPIProviders(apiProviders);
    const oldTokens = await getTokenData();
    if (oldTokens) {
      notifyTokenValues(
        {
          ...oldTokens, activeTheme, usedTokenSet, storageType,
        },
        { userId: currentUser?.id, licenseKey },
      );
    } else {
      notifyNoTokenValues();
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
