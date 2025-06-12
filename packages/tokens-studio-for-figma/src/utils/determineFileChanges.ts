import compact from 'just-compact';
import { isEqual } from './isEqual';
import { tryParseJson } from './tryParseJson';
import { joinPath } from './string';
import { SystemFilenames } from '@/constants/SystemFilenames';
import type { ThemeObjectsList } from '@/types';
import type { AnyTokenList } from '@/types/tokens';
import { TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';
import removeIdPropertyFromTokens from './removeIdPropertyFromTokens';

export type LastSyncedState = [
  Record<string, AnyTokenList>,
  ThemeObjectsList?,
  TokenFormatOptions?,
];

export type FileChangesInfo = {
  filesToCreate: string[];
  filesToUpdate: string[];
  filesToDelete: string[];
  hasChanges: boolean;
};

function getAllFilesAsChanges(
  tokens: Record<string, AnyTokenList>,
  themes: ThemeObjectsList,
  basePath: string,
  isMultiFile: boolean,
  isSingleJsonFile: boolean,
): FileChangesInfo {
  const filesToCreate: string[] = [];

  if (isSingleJsonFile) {
    filesToCreate.push(basePath);
  } else if (isMultiFile) {
    // Add all token set files
    Object.keys(tokens).forEach((tokenSetName) => {
      filesToCreate.push(joinPath(basePath, `${tokenSetName}.json`));
    });

    // Add themes if they exist
    if (themes.length > 0) {
      filesToCreate.push(joinPath(basePath, `${SystemFilenames.THEMES}.json`));
    }

    // Add metadata if tokens exist
    if (Object.keys(tokens).length > 0) {
      filesToCreate.push(joinPath(basePath, `${SystemFilenames.METADATA}.json`));
    }
  }

  return {
    filesToCreate,
    filesToUpdate: [],
    filesToDelete: [],
    hasChanges: filesToCreate.length > 0,
  };
}

/**
 * Determines which files need to be created, updated, or deleted based on the difference
 * between current state and lastSyncedState
 */
export function determineFileChanges(
  currentTokens: Record<string, AnyTokenList>,
  currentThemes: ThemeObjectsList,
  currentFormat: TokenFormatOptions,
  lastSyncedState: string,
  basePath: string,
  isMultiFile: boolean,
  isSingleJsonFile: boolean,
): FileChangesInfo {
  const parsedLastSyncedState = tryParseJson<LastSyncedState>(lastSyncedState);

  if (!parsedLastSyncedState) {
    // If we can't parse lastSyncedState, treat everything as new files
    return getAllFilesAsChanges(currentTokens, currentThemes, basePath, isMultiFile, isSingleJsonFile);
  }

  const [lastTokens = {}, lastThemes = [], lastFormat] = parsedLastSyncedState;

  const filesToCreate: string[] = [];
  const filesToUpdate: string[] = [];
  const filesToDelete: string[] = [];

  if (isSingleJsonFile) {
    // For single file mode, just check if anything has changed
    const currentState = compact([removeIdPropertyFromTokens(currentTokens), currentThemes, currentFormat]);
    const lastState = compact([removeIdPropertyFromTokens(lastTokens), lastThemes, lastFormat]);

    if (!isEqual(currentState, lastState)) {
      filesToUpdate.push(basePath);
    }
  } else if (isMultiFile) {
    // Check token sets
    const currentTokenSetNames = Object.keys(currentTokens);
    const lastTokenSetNames = Object.keys(lastTokens);

    // Find new and updated token sets
    currentTokenSetNames.forEach((tokenSetName) => {
      const filePath = joinPath(basePath, `${tokenSetName}.json`);
      const currentTokenSet = removeIdPropertyFromTokens({ [tokenSetName]: currentTokens[tokenSetName] })[tokenSetName];
      const lastTokenSet = lastTokens[tokenSetName] ? removeIdPropertyFromTokens({ [tokenSetName]: lastTokens[tokenSetName] })[tokenSetName] : undefined;

      if (!lastTokenSet) {
        filesToCreate.push(filePath);
      } else if (!isEqual(currentTokenSet, lastTokenSet)) {
        filesToUpdate.push(filePath);
      }
    });

    // Find deleted token sets
    lastTokenSetNames.forEach((tokenSetName) => {
      if (!currentTokens[tokenSetName]) {
        const filePath = joinPath(basePath, `${tokenSetName}.json`);
        filesToDelete.push(filePath);
      }
    });

    // Check themes
    const themesPath = joinPath(basePath, `${SystemFilenames.THEMES}.json`);
    if (!isEqual(currentThemes, lastThemes)) {
      if (currentThemes.length > 0) {
        if (lastThemes.length === 0) {
          filesToCreate.push(themesPath);
        } else {
          filesToUpdate.push(themesPath);
        }
      } else if (lastThemes.length > 0) {
        filesToDelete.push(themesPath);
      }
    }

    // Check metadata (token set order)
    const metadataPath = joinPath(basePath, `${SystemFilenames.METADATA}.json`);
    const currentMetadata = { tokenSetOrder: currentTokenSetNames };
    const lastMetadata = { tokenSetOrder: lastTokenSetNames };

    if (!isEqual(currentMetadata, lastMetadata)) {
      if (currentTokenSetNames.length > 0) {
        if (lastTokenSetNames.length === 0) {
          filesToCreate.push(metadataPath);
        } else {
          filesToUpdate.push(metadataPath);
        }
      } else if (lastTokenSetNames.length > 0) {
        filesToDelete.push(metadataPath);
      }
    }
  }

  const hasChanges = filesToCreate.length > 0 || filesToUpdate.length > 0 || filesToDelete.length > 0;

  return {
    filesToCreate,
    filesToUpdate,
    filesToDelete,
    hasChanges,
  };
}
