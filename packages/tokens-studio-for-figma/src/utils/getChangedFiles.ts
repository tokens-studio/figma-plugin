import { CompareStateType } from './findDifferentState';
import { RemoteTokenStorageFile } from '@/storage/RemoteTokenStorage';

/**
 * Determines which files need to be pushed based on the changed state.
 * Returns a Set of file names/identifiers that have changes.
 * 
 * @param changedState - The state containing information about what has changed
 * @param files - All files that would normally be pushed (optional, for filtering)
 * @returns Set of file identifiers that have changes
 */
export function getChangedFiles(
  changedState: CompareStateType,
  files?: RemoteTokenStorageFile[]
): Set<string> {
  const changedFiles = new Set<string>();

  // Add changed token sets
  Object.keys(changedState.tokens).forEach((tokenSet) => {
    changedFiles.add(tokenSet);
  });

  // Add themes if they have changes
  if (changedState.themes && changedState.themes.length > 0) {
    changedFiles.add('$themes');
  }

  // Add metadata if it has changes
  if (changedState.metadata) {
    changedFiles.add('$metadata');
  }

  return changedFiles;
}

/**
 * Filters the files array to only include files that have changes.
 * 
 * @param files - All files that would normally be pushed
 * @param changedFiles - Set of file identifiers that have changes
 * @returns Filtered array of files that have changes
 */
export function filterChangedFiles(
  files: RemoteTokenStorageFile[],
  changedFiles: Set<string>
): RemoteTokenStorageFile[] {
  return files.filter((file) => {
    if (file.type === 'tokenSet') {
      return changedFiles.has(file.name);
    }
    if (file.type === 'themes') {
      return changedFiles.has('$themes');
    }
    if (file.type === 'metadata') {
      return changedFiles.has('$metadata');
    }
    return false;
  });
}