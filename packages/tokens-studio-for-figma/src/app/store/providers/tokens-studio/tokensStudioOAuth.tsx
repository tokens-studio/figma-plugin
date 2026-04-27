import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import compact from 'just-compact';
import { Dispatch, store } from '@/app/store';
import useConfirm from '@/app/hooks/useConfirm';
import { notifyToUI } from '@/plugin/notifiers';
import {
  activeThemeSelector,
  themesListSelector,
  tokensSelector,
  usedTokenSetSelector,
  editProhibitedSelector,
  localApiStateSelector,
} from '@/selectors';
import { useChangedState } from '@/hooks/useChangedState';
import { isEqual } from '@/utils/isEqual';
import { StorageTypeCredentials } from '@/types/StorageType';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { RemoteResponseData } from '../../../../types/RemoteResponseData';
import { fetchProjectDataRest } from '../../../../utils/tokensStudio/fetchProjectDataRest';
import { fetchBranchesListRest } from '../../../../utils/tokensStudio/fetchBranchesListRest';
import { useAuthStore } from '../../useAuthStore';
import { OAuthService } from '../../../services/OAuthService';
import { applyTokenSetOrder } from '@/utils/tokenset';
import { TOKENS_STUDIO_APP_URL } from '@/constants/TokensStudio';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';
import {
  createTokenRest,
  updateTokenRest,
  deleteTokenRest,
  createTokenSetRest,
  updateTokenSetRest,
  deleteTokenSetRest,
  createThemeGroupRest,
  updateThemeGroupRest,
  deleteThemeGroupRest,
  createThemeOptionRest,
  updateThemeOptionRest,
  deleteThemeOptionRest,
} from '../../../../utils/tokensStudio/restApi';

type TokensStudioOAuthCredentials = Extract<StorageTypeCredentials, { provider: StorageProviderType.TOKENS_STUDIO_OAUTH }>;

interface PushToTokensStudioOAuth {
  context: TokensStudioOAuthCredentials;
  action: string;
  data: any;
  successCallback?: (result: any) => void;
}

export const pushToTokensStudioOAuth = async ({
  context, action, data, successCallback,
}: PushToTokensStudioOAuth) => {
  const { oauthTokens } = useAuthStore.getState();
  if (!oauthTokens?.accessToken) return;

  const studioUrl = TOKENS_STUDIO_APP_URL;
  const apiBaseUrl = OAuthService.getApiBaseUrl(studioUrl);
  const { id: projectId, branch, changeSetId } = context;
  let result: any;

  try {
    switch (action) {
      case 'CREATE_TOKEN':
        result = await createTokenRest(oauthTokens.accessToken, apiBaseUrl, projectId, data, branch, changeSetId);
        break;
      case 'EDIT_TOKEN':
        result = await updateTokenRest(oauthTokens.accessToken, apiBaseUrl, projectId, data.id, data, branch, changeSetId);
        break;
      case 'DELETE_TOKEN':
        result = await deleteTokenRest(oauthTokens.accessToken, apiBaseUrl, projectId, data.id, branch, changeSetId);
        break;
      case 'CREATE_TOKEN_SET':
        result = await createTokenSetRest(oauthTokens.accessToken, apiBaseUrl, projectId, data, branch, changeSetId);
        break;
      case 'UPDATE_TOKEN_SET': {
        if (data.id) {
          result = await updateTokenSetRest(oauthTokens.accessToken, apiBaseUrl, projectId, data.id, data, branch, changeSetId);
        }
        break;
      }
      case 'DELETE_TOKEN_SET':
        if (data.id) {
          result = await deleteTokenSetRest(oauthTokens.accessToken, apiBaseUrl, projectId, data.id, branch, changeSetId);
        }
        break;
      case 'CREATE_THEME_GROUP':
        result = await createThemeGroupRest(oauthTokens.accessToken, apiBaseUrl, projectId, data, branch, changeSetId);
        break;
      case 'UPDATE_THEME_GROUP': {
        const { id, ...themeGroupData } = data;
        if (id) {
          result = await updateThemeGroupRest(oauthTokens.accessToken, apiBaseUrl, projectId, id, themeGroupData, branch, changeSetId);
        }
        break;
      }
      case 'DELETE_THEME_GROUP':
        if (data.id) {
          result = await deleteThemeGroupRest(oauthTokens.accessToken, apiBaseUrl, projectId, data.id, branch, changeSetId);
        }
        break;
      case 'CREATE_THEME':
        result = await createThemeOptionRest(oauthTokens.accessToken, apiBaseUrl, projectId, data, branch, changeSetId);
        break;
      case 'UPDATE_THEME': {
        const { id, ...themeOptionData } = data;
        if (id) {
          result = await updateThemeOptionRest(oauthTokens.accessToken, apiBaseUrl, projectId, id, themeOptionData, branch, changeSetId);
        }
        break;
      }
      case 'DELETE_THEME':
        if (data.id) {
          result = await deleteThemeOptionRest(oauthTokens.accessToken, apiBaseUrl, projectId, data.id, branch, changeSetId);
        }
        break;
      default:
        console.warn('Unknown REST action', action);
    }
    if (successCallback) successCallback(result);
    return result;
  } catch (error) {
    console.error('Failed to push to Tokens Studio OAuth via REST:', error);
    notifyToUI(`Failed to sync: ${error instanceof Error ? error.message : 'Unknown error'}`, { error: true });
    return null;
  }
};

export function alignObjectKeys<T extends Record<string, any>>(obj: T, template: T, isSelectedTokenSets: boolean = false): T {
  if (!obj || !template || typeof obj !== 'object' || typeof template !== 'object') return obj;

  const aligned: any = Array.isArray(obj) ? [] : {};

  // Copy keys that exist in template exactly in template's order
  Object.keys(template).forEach((key) => {
    if (key in obj) {
      if (
        typeof obj[key] === 'object'
        && obj[key] !== null
        && typeof template[key] === 'object'
        && template[key] !== null
      ) {
        aligned[key] = alignObjectKeys(obj[key], template[key], key === 'selectedTokenSets');
      } else {
        aligned[key] = obj[key];
      }
    } else if (isSelectedTokenSets && template[key] === 'disabled') {
      aligned[key] = 'disabled';
    }
  });

  // Append any extra keys from obj at the end
  Object.keys(obj).forEach((key) => {
    if (!(key in aligned)) {
      if (isSelectedTokenSets && obj[key] === 'disabled') {
        return;
      }
      aligned[key] = obj[key];
    }
  });

  return aligned;
}

export function useTokensStudioOAuth() {
  const tokens = useSelector(tokensSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const themes = useSelector(themesListSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const dispatch = useDispatch<Dispatch>();
  const { confirm } = useConfirm();
  const { t } = useTranslation(['sync', 'branch', 'general']);
  const { hasChanges } = useChangedState();
  const editProhibited = useSelector(editProhibitedSelector);
  const localApiState = useSelector(localApiStateSelector);

  const pullTokensFromTokensStudioOAuth = useCallback(
    async (context: TokensStudioOAuthCredentials): Promise<RemoteResponseData | null> => {
      const { oauthTokens } = useAuthStore.getState();

      if (oauthTokens?.accessToken) {
        const studioUrl = TOKENS_STUDIO_APP_URL;
        const apiBaseUrl = OAuthService.getApiBaseUrl(studioUrl);
        const projectData = await fetchProjectDataRest(oauthTokens.accessToken, apiBaseUrl, context.id, context.branch || 'main');
        if (projectData) {
          // dispatch.tokenState.setEditProhibited(true);
          if (projectData.hasExceededPaginationLimit) {
            notifyToUI('Maximum limit of 10,000 tokens reached. Some tokens may be missing.', { error: true });
          }
          const sortedTokens = applyTokenSetOrder(
            projectData.tokens as any,
            projectData.tokenSetOrder,
          );
          const { themes } = store.getState().tokenState;
          const alignedThemes = projectData.themes.map((remoteTheme) => {
            const localTheme = themes.find((t) => t.id === remoteTheme.id);
            return localTheme ? alignObjectKeys(remoteTheme, localTheme) : remoteTheme;
          });

          return {
            status: 'success',
            tokens: sortedTokens,
            themes: alignedThemes,
            metadata: {
              tokenSetOrder: projectData.tokenSetOrder,
              tokenSetsData: projectData.tokenSets as any,
              themeGroupsData: projectData.themeGroups as any,
              changeSetId: projectData.changeSetId,
            },
          };
        }
        return {
          status: 'failure',
          errorMessage: 'Failed to fetch project data from REST API',
        };
      }
      return {
        status: 'failure',
        errorMessage: 'OAuth token missing',
      };
    },
    [],
  );

  const fetchBranchesForTokensStudio = useCallback(
    async (context: TokensStudioOAuthCredentials): Promise<string[] | null> => {
      const { oauthTokens } = useAuthStore.getState();

      if (oauthTokens?.accessToken) {
        const studioUrl = TOKENS_STUDIO_APP_URL;
        const apiBaseUrl = OAuthService.getApiBaseUrl(studioUrl);
        const branches = await fetchBranchesListRest(oauthTokens.accessToken, apiBaseUrl, context.id);
        return branches;
      }
      return null;
    },
    [],
  );

  const pushTokensToTokensStudioOAuth = useCallback(
    async (_context: TokensStudioOAuthCredentials): Promise<RemoteResponseData> => {
      // For now, OAuth REST sync is primarily driven by individual actions in tokenState.tsx.
      // A full 'push' (like Git) might be implemented later if needed,
      // but the requirement is to sync back when a token is changed.
      // We return success here to satisfy the remoteTokens.tsx push flow if triggered.
      const result: RemoteResponseData = {
        status: 'success',
        tokens,
        themes,
        metadata: {},
      };
      return result;
    },
    [tokens, themes],
  );

  const syncTokensWithTokensStudioOAuth = useCallback(
    async (context: TokensStudioOAuthCredentials): Promise<RemoteResponseData> => {
      try {
        const data = await pullTokensFromTokensStudioOAuth(context);

        if (!data || data.status === 'failure') {
          throw new Error(data?.errorMessage || 'Failed to sync with Tokens Studio');
        }

        if (data) {
          if (
            !isEqual(data.tokens, tokens)
                        || !isEqual(data.themes, themes)
                        || !isEqual(data.metadata?.tokenSetOrder ?? Object.keys(tokens), Object.keys(tokens))
          ) {
            const confirmResult = await confirm({
              text: t('pullFrom', { provider: 'Tokens Studio OAuth' }),
              description: t('pullConfirmDescription', { provider: 'Tokens Studio OAuth' }),
            });
            if (confirmResult) {
              const sortedValues = applyTokenSetOrder(data.tokens, data.metadata?.tokenSetOrder);
              dispatch.tokenState.setTokenData({
                values: sortedValues,
                themes: data.themes,
                activeTheme,
                usedTokenSet,
                hasChangedRemote: true,
              });
              dispatch.tokenState.setRemoteData({
                tokens: sortedValues,
                themes: data.themes,
                metadata: data.metadata,
              });
              const stringifiedRemoteTokens = JSON.stringify(compact([data.tokens, data.themes, TokenFormat.format]), null, 2);
              dispatch.tokenState.setLastSyncedState(stringifiedRemoteTokens);
              dispatch.tokenState.setCollapsedTokenSets([]);
              // dispatch.tokenState.setEditProhibited(true);
              notifyToUI('Pulled tokens from Tokens Studio OAuth');
            }
          } else {
            // Even if it didn't change, we still want it read only
            // dispatch.tokenState.setEditProhibited(true);
          }
        }

        return {
          status: 'success',
          tokens: data.tokens,
          themes: data.themes,
          metadata: data.metadata ?? {},
        };
      } catch (e) {
        console.error('error syncing with Tokens Studio OAuth', e);
        const message = e instanceof Error ? e.message : 'Unknown error during sync';
        notifyToUI(message, { error: true });
        return {
          status: 'failure',
          errorMessage: message,
        };
      }
    },
    [confirm, dispatch, activeTheme, tokens, themes, usedTokenSet, pullTokensFromTokensStudioOAuth, t],
  );

  const loadProjectTokens = useCallback(
    async (projectId: string, branch?: string) => {
      const { oauthTokens, activeOrganization } = useAuthStore.getState();
      if (!oauthTokens || !activeOrganization) return;

      if (hasChanges && !editProhibited && localApiState?.provider !== StorageProviderType.LOCAL) {
        const confirmResult = await confirm({
          text: t('unSavedChanges', { ns: 'branch' }) as string,
          description: t('ifYouCreate', { ns: 'branch' }) as string,
          confirmAction: t('discardChanges', { ns: 'branch' }) as string,
          cancelAction: t('cancel', { ns: 'general' }) as string,
        });
        if (confirmResult === false) {
          throw new Error('User cancelled pull');
        }
      }

      useAuthStore.setState({ isLoading: true });

      const studioUrl = TOKENS_STUDIO_APP_URL;
      const apiBaseUrl = OAuthService.getApiBaseUrl(studioUrl);

      try {
        const projectData = await fetchProjectDataRest(
          oauthTokens.accessToken,
          apiBaseUrl,
          projectId,
          branch || 'main',
        );

        if (projectData) {
          if (projectData.hasExceededPaginationLimit) {
            notifyToUI('Maximum limit of 10,000 tokens reached. Some tokens may be missing.', { error: true });
          }
          const { tokens: newTokens, themes: newThemes, tokenSetOrder } = projectData;

          const { themes } = store.getState().tokenState;
          const alignedNewThemes = newThemes.map((remoteTheme) => {
            const localTheme = themes.find((t) => t.id === remoteTheme.id);
            return localTheme ? alignObjectKeys(remoteTheme, localTheme) : remoteTheme;
          });

          dispatch.tokenState.setTokenData({
            values: (newTokens || {}) as any,
            themes: alignedNewThemes,
            activeTheme: {},
            hasChangedRemote: false,
          });

          dispatch.tokenState.setRemoteData({
            tokens: (newTokens || {}) as any,
            themes: alignedNewThemes,
            metadata: { tokenSetOrder },
          });

          const stringifiedRemoteTokens = JSON.stringify(compact([newTokens, alignedNewThemes, TokenFormat.format]), null, 2);
          dispatch.tokenState.setLastSyncedState(stringifiedRemoteTokens);
          // dispatch.tokenState.setEditProhibited(true);

          dispatch.uiState.setLastError(null);

          const hasTokens = newTokens && Object.keys(newTokens).length > 0;
          const message = hasTokens ? 'Successfully loaded project tokens' : 'Successfully loaded tokens, but there are no tokens in the selected project';
          notifyToUI(message, { error: false });
        } else {
          dispatch.uiState.setLastError({ type: 'other', message: 'Could not load project data.' });
          notifyToUI('Could not load project data.', { error: true });
          throw new Error('Could not load project data.');
        }
      } catch (error) {
        console.error('Failed to load project tokens:', error);
        if ((error as any).code === 'variables_source_of_truth') {
          const message = 'This feature is not available for projects using variables as source of truth';
          dispatch.uiState.setLastError({ type: 'other', message });
          notifyToUI(message, { error: true });
        } else {
          const message = error instanceof Error ? error.message : 'Could not load project data.';
          dispatch.uiState.setLastError({ type: 'other', message });
          notifyToUI(message, { error: true });
        }
        throw error; // Rethrow so caller can catch it and avoid silent failures
      } finally {
        useAuthStore.setState({ isLoading: false });
      }
    },
    [dispatch],
  );

  return useMemo(
    () => ({
      syncTokensWithTokensStudioOAuth,
      pullTokensFromTokensStudioOAuth,
      fetchBranchesForTokensStudio,
      loadProjectTokens,
      pushTokensToTokensStudioOAuth,
    }),
    [syncTokensWithTokensStudioOAuth, pullTokensFromTokensStudioOAuth, fetchBranchesForTokensStudio, loadProjectTokens, pushTokensToTokensStudioOAuth],
  );
}
