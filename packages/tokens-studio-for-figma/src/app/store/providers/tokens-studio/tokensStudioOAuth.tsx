import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import compact from 'just-compact';
import { Dispatch } from '@/app/store';
import useConfirm from '@/app/hooks/useConfirm';
import { notifyToUI } from '@/plugin/notifiers';
import {
  activeThemeSelector,
  storeTokenIdInJsonEditorSelector,
  localApiStateSelector,
  themesListSelector,
  tokensSelector,
  usedTokenSetSelector,
} from '@/selectors';
import { isEqual } from '@/utils/isEqual';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';
import { StorageProviderType } from '@/constants/StorageProviderType';
import usePushDialog from '../../../hooks/usePushDialog';
import { RemoteResponseData } from '../../../../types/RemoteResponseData';
import { ErrorMessages } from '../../../../constants/ErrorMessages';
import { PushOverrides } from '../../remoteTokens';
import { fetchProjectDataRest } from '../../../../utils/tokensStudio/fetchProjectDataRest';
import { fetchBranchesListRest } from '../../../../utils/tokensStudio/fetchBranchesListRest';
import { useAuthStore } from '../../useAuthStore';
import { OAuthService } from '../../../services/OAuthService';
import { applyTokenSetOrder } from '@/utils/tokenset';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';

type TokensStudioOAuthCredentials = Extract<StorageTypeCredentials, { provider: StorageProviderType.TOKENS_STUDIO_OAUTH }>;

export function useTokensStudioOAuth() {
  const tokens = useSelector(tokensSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const themes = useSelector(themesListSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const dispatch = useDispatch<Dispatch>();
  const localApiState = useSelector(localApiStateSelector);
  const { pushDialog, closePushDialog } = usePushDialog();
  const { confirm } = useConfirm();
  const { t } = useTranslation(['sync']);

  const pullTokensFromTokensStudioOAuth = useCallback(
    async (context: TokensStudioOAuthCredentials): Promise<RemoteResponseData | null> => {
      const { oauthTokens } = useAuthStore.getState();

      if (oauthTokens?.accessToken) {
        const studioUrl = 'production.tokens.studio';
        const apiBaseUrl = OAuthService.getApiBaseUrl(studioUrl);
        const projectData = await fetchProjectDataRest(oauthTokens.accessToken, apiBaseUrl, context.id, context.branch || 'main');
        if (projectData) {
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
        const studioUrl = 'production.tokens.studio';
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

  return useMemo(
    () => ({
      syncTokensWithTokensStudioOAuth,
      pullTokensFromTokensStudioOAuth,
      fetchBranchesForTokensStudio,
    }),
    [syncTokensWithTokensStudioOAuth, pullTokensFromTokensStudioOAuth, fetchBranchesForTokensStudio],
  );
}
