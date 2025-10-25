import {
  ApiProvidersProperty, AuthDataProperty, LicenseKeyProperty, InitialLoadProperty,
} from '@/figmaStorage';
import { getActiveTheme } from '@/utils/getActiveTheme';
import { getSelectedExportThemes } from '@/utils/getSelectedExportThemes';
import { getSelectedExportSets } from '@/utils/getSelectedExportSets';
import { getActiveExportTab } from '@/utils/getActiveExportTab';
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
    localApiProviders,
    licenseKey,
    initialLoad,
    localTokenData,
    authData,
    usedEmail,
    variableExportSettings,
    selectedExportThemes,
    selectedExportSets,
    activeExportTab,
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
    UsedEmailProperty.read(),
    getVariableExportSettings(),
    getSelectedExportThemes(),
    getSelectedExportSets(),
    getActiveExportTab(),
  ]);

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
    usedEmail,
    selectedExportThemes,
    selectedExportSets,
    activeExportTab,
  };
}
