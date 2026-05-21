import {
  ApiProvidersProperty, AuthDataProperty, LicenseKeyProperty, InitialLoadProperty, OAuthTokensProperty, ActiveOrganizationIdProperty,
} from '@/figmaStorage';
import { getActiveTheme } from '@/utils/getActiveTheme';
import { getSelectedExportThemes } from '@/utils/getSelectedExportThemes';
import { getVariableExportSettings } from '@/utils/getVariableExportSettings';
import getLastOpened from '@/utils/getLastOpened';
import getOnboardingExplainer from '@/utils/getOnboardingExplainer';
import { getUsedTokenSet } from '@/utils/getUsedTokenSet';
import { getUISettings } from '@/utils/uiSettings';
import { getUserId } from '../../plugin/helpers';
import { getSavedStorageType, getTokenData } from '../../plugin/node';
import { UsedEmailProperty } from '@/figmaStorage/UsedEmailProperty';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { areProvidersDuplicate } from '@/utils/isSameCredentials';

export async function startup() {
  // on startup we need to fetch all the locally available data so we can bootstrap our UI
  const [
    settings,
    usedTokenSet,
    activeTheme,
    userId, // the user ID is used for license key binding
    lastOpened,
    onboardingExplainer,
    storageType,
    localApiProviders,
    licenseKey,
    initialLoad,
    localTokenData,
    authData,
    oauthTokens,
    usedEmail,
    variableExportSettings,
    selectedExportThemes,
    activeOrganizationId,
  ] = await Promise.all([
    getUISettings(false),
    getUsedTokenSet(),
    getActiveTheme(),
    getUserId(),
    getLastOpened(),
    getOnboardingExplainer(),
    getSavedStorageType(),
    ApiProvidersProperty.read(),
    LicenseKeyProperty.read(),
    InitialLoadProperty.read(),
    getTokenData(),
    AuthDataProperty.read(),
    OAuthTokensProperty.read(),
    UsedEmailProperty.read(),
    getVariableExportSettings(),
    getSelectedExportThemes(),
    ActiveOrganizationIdProperty.read(),
  ]);

  // Check for duplicate sync providers in localApiProviders, then delete one of them
  let cleanedApiProviders = localApiProviders;
  if (localApiProviders && localApiProviders.length > 1) {
    const keep: typeof localApiProviders = [];
    let didRemove = false;
    for (const provider of localApiProviders) {
      // Find if there is an existing provider in 'keep' that is a duplicate of 'provider'
      const duplicateIndex = keep.findIndex((k) => areProvidersDuplicate(k, provider));
      if (duplicateIndex === -1) {
        keep.push(provider);
      } else {
        // We found a duplicate! We need to decide which one to keep.
        // If the current one ('provider') has the same internalId as the active storageType,
        // we should keep it instead of the existing one.
        const isActiveCurrent = storageType && storageType.provider !== StorageProviderType.LOCAL && 'internalId' in storageType && storageType.internalId && provider.internalId === storageType.internalId;
        if (isActiveCurrent) {
          keep[duplicateIndex] = provider;
        }
        didRemove = true;
      }
    }
    if (didRemove) {
      cleanedApiProviders = keep;
      console.warn('[Deduplication] Removed duplicate sync provider credentials from storage.');
      await ApiProvidersProperty.write(cleanedApiProviders);
    }
  }

  // If we have saved variable export settings, apply them to the settings
  let finalSettings = settings;
  if (variableExportSettings && Object.keys(variableExportSettings).length > 0) {
    finalSettings = {
      ...settings,
      ...variableExportSettings,
    };
  }

  return {
    settings: finalSettings,
    activeTheme,
    lastOpened,
    onboardingExplainer,
    storageType,
    localApiProviders: cleanedApiProviders,
    licenseKey,
    initialLoad: initialLoad ?? false,
    localTokenData: localTokenData ? {
      ...localTokenData,
      usedTokenSet,
    } : null,
    user: figma.currentUser ? {
      userId,
      figmaId: figma.currentUser.id,
      name: figma.currentUser.name,
    } : null,
    authData,
    oauthTokens,
    usedEmail,
    selectedExportThemes,
    activeOrganizationId,
  };
}
