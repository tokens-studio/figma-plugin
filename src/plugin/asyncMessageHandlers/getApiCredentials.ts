import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { ApiProvidersProperty } from '@/figmaStorage';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { getUsedTokenSet } from '@/utils/getUsedTokenSet';
import { getUISettings } from '@/utils/uiSettings';
import compareProvidersWithStored from '../compareProviders';
import { getSavedStorageType, getTokenData } from '../node';
import { notifyAPIProviders, notifyNoSelection, notifySetTokens } from '../notifiers';
import store from '../store';

export const getApiCredentials: AsyncMessageChannelHandlers[AsyncMessageTypes.GET_API_CREDENTIALS] = async (msg) => {
  try {
    const settings = await getUISettings();
    const usedTokenSet = await getUsedTokenSet();
    store.inspectDeep = settings.inspectDeep;
    const storageType = await getSavedStorageType();
    const apiProviders = await ApiProvidersProperty.read();
    if (apiProviders) notifyAPIProviders(apiProviders);
    switch (storageType.provider) {
      case StorageProviderType.JSONBIN:
      case StorageProviderType.GITHUB:
      case StorageProviderType.GITLAB:
      case StorageProviderType.ADO:
      case StorageProviderType.URL: {
        compareProvidersWithStored({
          providers: apiProviders ?? [], storageType, usedTokenSet, shouldPull: msg.shouldPull, featureFlags: msg.featureFlags,
        });
        break;
      }
      default: {
        const oldTokens = await getTokenData();
        if (oldTokens) {
          notifySetTokens({ ...oldTokens, usedTokenSet });
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
