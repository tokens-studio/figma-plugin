import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import compact from 'just-compact';
import { Dispatch } from '@/app/store';
import useConfirm from '@/app/hooks/useConfirm';
import { notifyToUI } from '@/plugin/notifiers';
import {
  activeThemeSelector,
  themesListSelector,
  tokensSelector,
  usedTokenSetSelector,
  editProhibitedSelector,
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

type TokensStudioOAuthCredentials = Extract<StorageTypeCredentials, { provider: StorageProviderType.TOKENS_STUDIO_OAUTH }>;

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

  const pullTokensFromTokensStudioOAuth = useCallback(
    async (context: TokensStudioOAuthCredentials): Promise<RemoteResponseData | null> => {
      const { oauthTokens } = useAuthStore.getState();

      if (oauthTokens?.accessToken) {
        const studioUrl = TOKENS_STUDIO_APP_URL;
        const apiBaseUrl = OAuthService.getApiBaseUrl(studioUrl);
        const projectData = await fetchProjectDataRest(oauthTokens.accessToken, apiBaseUrl, context.id, context.branch || 'main');
        if (projectData) {
          if (projectData.hasExceededPaginationLimit) {
            notifyToUI('Maximum limit of 10,000 tokens reached. Some tokens may be missing.', { error: true });
          }
          const sortedTokens = applyTokenSetOrder(
            projectData.tokens as any,
            projectData.tokenSetOrder,
          );
          return {
            status: 'success',
            tokens: sortedTokens,
            themes: projectData.themes,
            metadata: {
              tokenSetOrder: projectData.tokenSetOrder,
              tokenSetsData: projectData.tokenSets as any,
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
              dispatch.tokenState.setEditProhibited(true);
              notifyToUI('Pulled tokens from Tokens Studio OAuth');
            }
          } else {
            // Even if it didn't change, we still want it read only
            dispatch.tokenState.setEditProhibited(true);
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

      if (hasChanges && !editProhibited) {
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

        if (projectData && projectData.tokens) {
          if (projectData.hasExceededPaginationLimit) {
            notifyToUI('Maximum limit of 10,000 tokens reached. Some tokens may be missing.', { error: true });
          }
          const { tokens: newTokens, themes: newThemes, tokenSetOrder } = projectData;

          dispatch.tokenState.setTokenData({
            values: newTokens as any,
            themes: newThemes,
            activeTheme: {},
            hasChangedRemote: false,
          });

          dispatch.tokenState.setRemoteData({
            tokens: newTokens as any,
            themes: newThemes,
            metadata: { tokenSetOrder },
          });

          const stringifiedRemoteTokens = JSON.stringify(compact([newTokens, newThemes, TokenFormat.format]), null, 2);
          dispatch.tokenState.setLastSyncedState(stringifiedRemoteTokens);
          dispatch.tokenState.setEditProhibited(true);

          notifyToUI('Successfully loaded project tokens', { error: false });
        } else {
          notifyToUI('Project has no tokens or could not load tokens.', { error: true });
          throw new Error('Project has no tokens or could not load tokens.');
        }
      } catch (error) {
        console.error('Failed to load project tokens:', error);
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
    }),
    [syncTokensWithTokensStudioOAuth, pullTokensFromTokensStudioOAuth, fetchBranchesForTokensStudio, loadProjectTokens],
  );
}
