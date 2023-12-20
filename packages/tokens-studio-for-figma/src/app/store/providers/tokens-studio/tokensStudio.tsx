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
import { saveLastSyncedState } from '../../../../utils/saveLastSyncedState';
import { RemoteResponseData } from '../../../../types/RemoteResponseData';
import { ErrorMessages } from '../../../../constants/ErrorMessages';
import { applyTokenSetOrder } from '../../../../utils/tokenset';

type TokensStudioCredentials = Extract<StorageTypeCredentials, { provider: StorageProviderType.TOKENS_STUDIO }>;
type TokensStudioFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.TOKENS_STUDIO }>;

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
    async (context: TokensStudioCredentials): Promise<RemoteResponseData> => {
      const storage = await storageClientFactory(context);

      const content = await storage.retrieve();
      if (content?.status === 'failure') {
        return {
          status: 'failure',
          errorMessage: content?.errorMessage,
        };
      }

      // if (
      //   content
      //   && isEqual(content.tokens, tokens)
      //   && isEqual(content.themes, themes)
      //   && isEqual(content.metadata?.tokenSetOrder ?? Object.keys(tokens), Object.keys(tokens))
      // ) {
      //   notifyToUI('Nothing to commit');
      //   return {
      //     status: 'success',
      //     tokens,
      //     themes,
      //     metadata: {},
      //   };
      // }

      dispatch.uiState.setLocalApiState({ ...context });
      const pushSettings = await pushDialog();
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
          saveLastSyncedState(dispatch, tokens, themes, metadata);
          dispatch.uiState.setLocalApiState({ ...localApiState } as TokensStudioCredentials);
          dispatch.uiState.setApiData({ ...context });
          dispatch.tokenState.setTokenData({
            values: tokens,
            themes,
            usedTokenSet,
            activeTheme,
          });

          pushDialog('success');
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
    [dispatch, storageClientFactory, pushDialog, closePushDialog, tokens, themes, localApiState, usedTokenSet, activeTheme],
  );

  const pullTokensFromTokensStudio = useCallback(async (context: TokensStudioCredentials): Promise<RemoteResponseData | null> => {
    console.log('Pulling tokens', context);
    const storage = storageClientFactory(context);

    try {
      console.log('TRying to retrieve');
      const content = await storage.retrieve();
      console.log('CONTENT', content);
      if (content?.status === 'failure') {
        return {
          status: 'failure',
          errorMessage: content.errorMessage,
        };
      }
      if (content) {
        // If we didn't get a tokenSetOrder from metadata, use the order of the token sets as they appeared
        const sortedTokens = applyTokenSetOrder(content.tokens, content.metadata?.tokenSetOrder ?? Object.keys(content.tokens));

        return {
          ...content,
          tokens: sortedTokens,
        };
      }
    } catch (e) {
      return {
        status: 'failure',
        errorMessage: ErrorMessages.SUPERNOVA_CREDENTIAL_ERROR,
      };
    }
    return null;
  }, [
    storageClientFactory,
  ]);

  async function validateCredentials(context: TokensStudioCredentials): Promise<RemoteResponseData> {
    try {
      const data = await pullTokensFromTokensStudio(context);
      console.log('DATA AFTER VAL', data);
      if (!data) {
        throw new Error();
      }
      return {
        status: 'success',
        tokens: {},
        themes: [],
        metadata: {},
      };
    } catch (e) {
      console.log(e);
      throw new Error(JSON.stringify(e));
    }
  }

  // Function to initially check auth and sync tokens with Tokens Studio
  const syncTokensWithTokensStudio = useCallback(
    async (context: TokensStudioCredentials): Promise<RemoteResponseData> => {
      try {
        return (await validateCredentials(context)) as any;
      } catch (e) {
        notifyToUI('Error syncing with Tokens Studio, check credentials', { error: true });
        return {
          status: 'failure',
          errorMessage: JSON.stringify(e),
        };
      }
    },
    [pushTokensToTokensStudio],
  );

  const addNewTokensStudioCredentials = useCallback(
    async (context: TokensStudioFormValues): Promise<RemoteResponseData> => {
      const data = await syncTokensWithTokensStudio(context);
      if (!data) {
        return {
          status: 'failure',
          errorMessage: 'Error syncing tokens',
        };
      }
      if (data.status === 'success') {
        AsyncMessageChannel.ReactInstance.message({
          type: AsyncMessageTypes.CREDENTIALS,
          credential: context,
        });
        if (!data.tokens) {
          notifyToUI('No tokens stored on remote');
        }
      } else {
        return {
          status: 'failure',
          errorMessage: data.errorMessage,
        };
      }
      return {
        status: 'success',
        tokens: data.tokens ?? tokens,
        themes: data.themes ?? themes,
        metadata: {},
      };
    },
    [syncTokensWithTokensStudio, tokens, themes, dispatch.tokenState, usedTokenSet, activeTheme],
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
