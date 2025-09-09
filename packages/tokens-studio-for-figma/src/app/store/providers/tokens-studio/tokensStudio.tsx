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
import { TokensStudioTokenStorage } from '../../../../storage/TokensStudioTokenStorage'; // todo
import usePushDialog from '../../../hooks/usePushDialog';
import { RemoteResponseData } from '../../../../types/RemoteResponseData';
import { ErrorMessages } from '../../../../constants/ErrorMessages';
import { PushOverrides } from '../../remoteTokens';
import { categorizeError } from '@/utils/error/categorizeError';
import { RemoteTokenStorageMetadata } from '@/storage/RemoteTokenStorage';
import { applyTokenSetOrder } from '@/utils/tokenset';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';

type TokensStudioCredentials = Extract<StorageTypeCredentials, { provider: StorageProviderType.TOKENS_STUDIO }>;
type TokensStudioFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.TOKENS_STUDIO }>;

export type TokensStudioAction =
  | 'CREATE_TOKEN'
  | 'EDIT_TOKEN'
  | 'DELETE_TOKEN'
  | 'CREATE_TOKEN_SET'
  | 'UPDATE_TOKEN_SET'
  | 'DELETE_TOKEN_SET'
  | 'UPDATE_TOKEN_SET_ORDER'
  | 'CREATE_THEME_GROUP'
  | 'UPDATE_THEME_GROUP'
  | 'DELETE_THEME_GROUP';

interface PushToTokensStudio {
  context: TokensStudioCredentials;
  action: TokensStudioAction;
  data: any;
  metadata?: RemoteTokenStorageMetadata['tokenSetsData'];
  successCallback?: () => void;
}

let storageClientObject;

const getStorageClient = (context: TokensStudioCredentials) => {
  if (!storageClientObject) {
    storageClientObject = new TokensStudioTokenStorage(context.id, context.orgId, context.secret, context.baseUrl);
    return storageClientObject;
  }

  storageClientObject.setContext(context.id, context.orgId, context.secret, context.baseUrl);
  return storageClientObject;
};

export const pushToTokensStudio = async ({
  context, action, data, metadata, successCallback,
}: PushToTokensStudio) => {
  const storageClient = getStorageClient(context);

  storageClient.push({
    action,
    data,
    metadata,
    successCallback,
  });
};

export function useTokensStudio() {
  const tokens = useSelector(tokensSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const themes = useSelector(themesListSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const storeTokenIdInJsonEditor = useSelector(storeTokenIdInJsonEditorSelector);
  const dispatch = useDispatch<Dispatch>();
  const localApiState = useSelector(localApiStateSelector);
  const { pushDialog, closePushDialog } = usePushDialog();
  const { confirm } = useConfirm();
  const { t } = useTranslation(['sync']);

  const storageClientFactory = useCallback((context: TokensStudioCredentials) => {
    const storageClient = getStorageClient(context);
    return storageClient;
  }, []);

  const askUserIfPull = useCallback(async () => {
    const confirmResult = await confirm({
      text: t('pullFrom', { provider: 'Tokens Studio' }),
      description: t('pullConfirmDescription', { provider: 'Tokens Studio' }),
    });
    return confirmResult;
  }, [confirm, t]);

  const pushTokensToTokensStudio = useCallback(
    async (context: TokensStudioCredentials, overrides?: PushOverrides): Promise<RemoteResponseData> => {
      const storage = await storageClientFactory(context);

      dispatch.uiState.setLocalApiState({ ...context });
      const pushSettings = await pushDialog({ state: 'initial', overrides });
      if (pushSettings) {
        try {
          const metadata = {
            tokenSetOrder: Object.keys(tokens),
          };
          await storage.save(
            {
              themes,
              tokens,
              metadata,
            },
            {
              storeTokenIdInJsonEditor,
            },
          );
          dispatch.uiState.setLocalApiState({ ...localApiState } as TokensStudioCredentials);
          dispatch.uiState.setApiData({ ...context });
          dispatch.tokenState.setTokenData({
            values: tokens,
            themes,
            usedTokenSet,
            activeTheme,
            hasChangedRemote: true,
          });
          dispatch.tokenState.setRemoteData({
            tokens,
            themes,
            metadata,
          });
          const stringifiedRemoteTokens = JSON.stringify(compact([tokens, themes, TokenFormat.format]), null, 2);
          dispatch.tokenState.setLastSyncedState(stringifiedRemoteTokens);
          pushDialog({ state: 'success' });
          return {
            status: 'success',
            tokens,
            themes,
            metadata: {},
          };
        } catch (e: any) {
          closePushDialog();
          return {
            status: 'failure',
            errorMessage: (e as any).message,
          };
        }
      } else {
        return {
          status: 'success',
          tokens,
          themes,
          metadata: {},
        };
      }
    },
    [
      storageClientFactory,
      dispatch,
      pushDialog,
      tokens,
      themes,
      storeTokenIdInJsonEditor,
      localApiState,
      usedTokenSet,
      activeTheme,
      closePushDialog,
    ],
  );

  const pullTokensFromTokensStudio = useCallback(
    async (context: TokensStudioCredentials): Promise<RemoteResponseData | null> => {
      const storage = storageClientFactory(context);

      try {
        const content = await storage.retrieve();
        if (content?.status === 'failure') {
          return {
            status: 'failure',
            errorMessage: content.errorMessage,
          };
        }
        if (content) {
          const sortedTokens = applyTokenSetOrder(
            content.tokens,
            content.metadata?.tokenSetOrder ?? Object.keys(content.tokens),
          );
          return {
            ...content,
            tokens: sortedTokens,
          };
        }
      } catch (e) {
        return {
          status: 'failure',
          errorMessage: ErrorMessages.TOKENSSTUDIO_CREDENTIAL_ERROR,
        };
      }
      return null;
    },
    [storageClientFactory],
  );

  const syncTokensWithTokensStudio = useCallback(
    async (context: TokensStudioCredentials): Promise<RemoteResponseData> => {
      try {
        const storage = storageClientFactory(context);
        const data = await storage.retrieve();

        if (!data || data.status === 'failure') {
          throw new Error(data?.errorMessage);
        }

        if (data) {
          if (
            !isEqual(data.tokens, tokens)
            || !isEqual(data.themes, themes)
            || !isEqual(data.metadata?.tokenSetOrder ?? Object.keys(tokens), Object.keys(tokens))
          ) {
            const userDecision = await askUserIfPull();
            if (userDecision) {
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
              notifyToUI('Pulled tokens from Tokens Studio');
            }
          }
        }

        return {
          status: 'success',
          tokens: data.tokens,
          themes: data.themes,
          metadata: data.metadata ?? {},
        };
      } catch (e) {
        console.error('error syncing with Tokens Studio', e);

        const { message } = categorizeError(e, {
          provider: StorageProviderType.TOKENS_STUDIO,
          operation: 'sync',
          hasCredentials: true,
        });

        notifyToUI(message, { error: true });
        return {
          status: 'failure',
          errorMessage: message,
        };
      }
    },
    [askUserIfPull, dispatch, activeTheme, tokens, themes, usedTokenSet, storageClientFactory],
  );

  const addNewTokensStudioCredentials = useCallback(
    async (context: TokensStudioFormValues): Promise<RemoteResponseData> => {
      const data = await syncTokensWithTokensStudio(context);
      if (!data || data.status === 'failure') {
        return {
          status: 'failure',
          errorMessage: data.errorMessage,
        };
      }
      // TODO: I think we can refactor this for all providers and move this to remoteTokens and then remove individually
      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.CREDENTIALS,
        credential: context,
      });

      return {
        status: 'success',
        tokens: data.tokens ?? tokens,
        themes: data.themes ?? themes,
        metadata: {},
      };
    },
    [syncTokensWithTokensStudio, tokens, themes],
  );

  return useMemo(
    () => ({
      addNewTokensStudioCredentials,
      syncTokensWithTokensStudio,
      pushTokensToTokensStudio,
      pullTokensFromTokensStudio,
    }),
    [addNewTokensStudioCredentials, syncTokensWithTokensStudio, pushTokensToTokensStudio, pullTokensFromTokensStudio],
  );
}
