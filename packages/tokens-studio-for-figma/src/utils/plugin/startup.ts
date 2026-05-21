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
import { isTokensStudioDuplicate } from '@/utils/isSameCredentials';

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

  // Deduplicate Tokens Studio / Tokens Studio OAuth sync providers in localApiProviders
  let cleanedApiProviders = localApiProviders;
  if (localApiProviders && localApiProviders.length > 0) {
    const uniqueProviders: typeof localApiProviders = [];
    for (const provider of localApiProviders) {
      if (
        provider.provider === StorageProviderType.TOKENS_STUDIO ||
        provider.provider === StorageProviderType.TOKENS_STUDIO_OAUTH
      ) {
        const duplicateIdx = uniqueProviders.findIndex((existing) => 
          isTokensStudioDuplicate(existing, provider)
        );
        if (duplicateIdx > -1) {
          const existing = uniqueProviders[duplicateIdx];
          if (
            existing.provider === StorageProviderType.TOKENS_STUDIO ||
            existing.provider === StorageProviderType.TOKENS_STUDIO_OAUTH
          ) {
            let keepCurrent = false;
            
            const existingHasBaseUrl = !!existing.baseUrl;
            const currentHasBaseUrl = !!provider.baseUrl;
            
            if (currentHasBaseUrl && !existingHasBaseUrl) {
              keepCurrent = true;
            } else if (provider.provider === StorageProviderType.TOKENS_STUDIO_OAUTH && existing.provider !== StorageProviderType.TOKENS_STUDIO_OAUTH) {
              keepCurrent = true;
            }
            
            if (keepCurrent) {
              uniqueProviders[duplicateIdx] = provider;
            }
          }
        } else {
          uniqueProviders.push(provider);
        }
      } else {
        uniqueProviders.push(provider);
      }
    }

    if (uniqueProviders.length !== localApiProviders.length) {
      cleanedApiProviders = uniqueProviders;
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
