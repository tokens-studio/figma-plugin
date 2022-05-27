import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { ApiProvidersProperty } from '@/figmaStorage';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { getUsedTokenSet } from '@/utils/getUsedTokenSet';
import { getUISettings } from '@/utils/uiSettings';
import compareProvidersWithStored from '../compareProviders';
import { getSavedStorageType, getTokenData } from '../node';
import { notifyAPIProviders, notifyNoSelection, notifySetTokens, notifyFeatureFlags } from '../notifiers';
import { LicenseKeyProperty } from '@/figmaStorage/LicenseKeyProperty';
import store from '../store';

export const setFeatureFlags: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_FEATURE_FLAGS] = async (msg) => {
  try {
  } catch (err) {
    figma.closePlugin('There was an error, check console (F12)');
    console.error(err);
    return;
  }

  if (!figma.currentPage.selection.length) {
    notifyNoSelection();
  }
};
