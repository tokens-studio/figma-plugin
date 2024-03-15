import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { Dispatch } from '@/app/store';
import { notifyToUI } from '@/plugin/notifiers';
import {
  activeThemeSelector,
  storeTokenIdInJsonEditorSelector,
  localApiStateSelector,
  themesListSelector,
  tokensSelector,
  usedTokenSetSelector,
} from '@/selectors';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { TokensStudioTokenStorage } from '../../../../storage/TokensStudioTokenStorage'; // todo
import usePushDialog from '../../../hooks/usePushDialog';
import { RemoteResponseData } from '../../../../types/RemoteResponseData';
import { ErrorMessages } from '../../../../constants/ErrorMessages';
import { PushOverrides } from '../../remoteTokens';
import { RemoteTokenStorageMetadata } from '@/storage/RemoteTokenStorage';

type TokensStudioCredentials = Extract<StorageTypeCredentials, { provider: StorageProviderType.TOKENS_STUDIO }>;
type TokensStudioFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.TOKENS_STUDIO }>;

export type TokensStudioAction = 'CREATE_TOKEN' | 'EDIT_TOKEN' | 'DELETE_TOKEN';

interface PushToTokensStudio {
  context: TokensStudioCredentials;
  action: TokensStudioAction;
  data: any;
  metadata?: RemoteTokenStorageMetadata['tokenSetsData'];
}

export const pushToTokensStudio = async ({ context, action, data, metadata }: PushToTokensStudio) => {
  const storageClient = new TokensStudioTokenStorage(context.id, context.secret);

  return storageClient.push({
    action,
    data,
    metadata,
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

  const storageClientFactory = useCallback((context: TokensStudioCredentials) => {
    const storageClient = new TokensStudioTokenStorage(context.id, context.secret);
    return storageClient;
  }, []);

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
          return content;
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
        dispatch.tokenState.setTokenData({
          values: data.tokens,
          themes: data.themes,
          activeTheme,
          usedTokenSet,
        });
        dispatch.tokenState.setCollapsedTokenSets([]);
        return {
          status: 'success',
          tokens: data.tokens,
          // TODO: Add support for resolvers which are our theme configs
          themes: [],
          metadata: data.metadata ?? {},
        };
      } catch (e) {
        notifyToUI('Error syncing with Tokens Studio, check credentials', { error: true });
        return {
          status: 'failure',
          errorMessage: JSON.stringify(e),
        };
      }
    },
    [activeTheme, dispatch.tokenState, storageClientFactory, usedTokenSet],
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
