import store from '../store';
import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import getLastOpened from '@/utils/getLastOpened';
import { getUsedTokenSet } from '@/utils/getUsedTokenSet';
import { getUISettings } from '@/utils/uiSettings';
import { getUserId } from '../helpers';
import { getSavedStorageType, getTokenData } from '../node';
import {
  notifyAPIProviders, notifyLastOpened, notifyLicenseKey, notifyNoSelection, notifyStorageType, notifyTokenValues, notifyUserId,
} from '../notifiers';
import { getActiveTheme } from '@/utils/getActiveTheme';

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
    const licenseKey = await figma.clientStorage.getAsync('licenseKey');
    notifyLicenseKey(licenseKey);

    notifyLastOpened(lastOpened);
    notifyStorageType(storageType);

    const apiProviders = await figma.clientStorage.getAsync('apiProviders');
    if (apiProviders) notifyAPIProviders(JSON.parse(apiProviders));
    const oldTokens = await getTokenData();
    if (oldTokens) {
      notifyTokenValues({
        ...oldTokens, activeTheme, usedTokenSet, storageType,
      });
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
