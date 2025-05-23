import { Properties } from './Properties';
import { SharedPluginDataNamespaces } from './SharedPluginDataNamespaces';

export const SharedPluginDataKeys = Object.freeze({
  [SharedPluginDataNamespaces.TOKENS]: {
    version: 'version',
    values: 'values',
    updatedAt: 'updatedAt',
    storageType: 'storageType',
    persistentNodesCache: 'persistentNodesCache',
    usedTokenSet: 'usedTokenSet',
    checkForChanges: 'checkForChanges',
    activeTheme: 'activeTheme',
    themes: 'themes',
    collapsedTokenSets: 'collapsedTokenSets',
    tokenFormat: 'tokenFormat',
    fileKey: 'fileKey',
    isCompressed: 'isCompressed',
    variableExportSettings: 'variableExportSettings',
    selectedExportThemes: 'selectedExportThemes',
    ...Properties,
  },
});
