import {
  ApiProvidersProperty, AuthDataProperty, LicenseKeyProperty, InitialLoadProperty, OAuthTokensProperty, ActiveOrganizationIdProperty,
} from '@/figmaStorage';
import { StorageProviderType } from '@/constants/StorageProviderType';
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
    rawApiProviders,
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

  let localApiProviders = rawApiProviders;
  if (rawApiProviders && rawApiProviders.some((p) => p?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH || p?.internalId?.startsWith('tokens-studio-'))) {
    localApiProviders = rawApiProviders.filter((p) => p?.provider !== StorageProviderType.TOKENS_STUDIO_OAUTH && !p?.internalId?.startsWith('tokens-studio-'));
    await ApiProvidersProperty.write(localApiProviders);
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
    localApiProviders,
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
