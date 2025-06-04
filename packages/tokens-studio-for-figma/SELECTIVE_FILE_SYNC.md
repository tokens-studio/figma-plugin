# Selective File Sync Implementation

## Overview

This implementation adds functionality to only push changed files during multi-file sync operations, rather than pushing all JSON files regardless of whether they've changed. This improves sync performance, reduces unnecessary writes, and prevents bloated commit histories.

## How It Works

### 1. Change Detection
- Uses the existing `useChangedState` hook which leverages `findDifferentState` utility
- New `useChangedFiles` hook extracts specific file change information:
  - `tokenSets`: Array of token set names that have changed
  - `themes`: Boolean indicating if themes file has changed  
  - `metadata`: Boolean indicating if metadata file has changed

### 2. Feature Flag Control
- New feature flag `selectiveFileSync` controls when selective sync is enabled
- Works in conjunction with existing `multiFileSync` flag
- Both flags must be enabled for selective sync to work

### 3. Push Dialog Integration
- `PushDialog` component now includes changed files information
- `usePushDialog` hook updated to pass changed files through push operation
- Only includes changed files for Git providers when feature flag is enabled

### 4. Storage Provider Updates
- Updated all Git storage providers (GitHub, GitLab, Bitbucket, ADO)
- Each provider checks for `changedFiles` parameter and `multiFileEnabled` flag
- When both conditions are met, only pushes files that have actually changed
- Falls back to original behavior (push all files) when conditions aren't met

## Code Changes

### New Files
- `src/hooks/useChangedFiles.ts` - Hook to extract changed files information

### Modified Files
- `src/app/store/remoteTokens.tsx` - Extended `PushOverrides` type
- `src/app/hooks/usePushDialog.tsx` - Added support for changed files parameter  
- `src/app/components/PushDialog.tsx` - Integrated changed files detection
- `src/app/store/providers/github/github.tsx` - Added selective sync logic
- `src/app/store/providers/gitlab/gitlab.tsx` - Added selective sync logic
- `src/app/store/providers/bitbucket/bitbucket.tsx` - Added selective sync logic
- `src/app/store/providers/ado/ado.tsx` - Added selective sync logic
- `flags.d.ts` - Added `selectiveFileSync` feature flag

## Benefits

1. **Performance**: Only changed files are written to remote, reducing sync time
2. **Cleaner History**: Commits only include files that actually changed
3. **Reduced Conflicts**: Fewer files touched means lower chance of merge conflicts
4. **Better Reviews**: Easier to review changes when only modified files are included
5. **Backward Compatible**: Falls back to original behavior when feature flag is disabled

## Feature Flag Configuration

The feature requires two flags to be enabled:
- `multiFileSync`: Enables multi-file sync capability (existing)
- `selectiveFileSync`: Enables selective file pushing (new)

## Usage

When enabled, the system will automatically detect which files have changed and only push those files during sync operations. Users don't need to take any additional action - the behavior is transparent but more efficient.