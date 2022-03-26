import { useDispatch } from 'react-redux';
import { Dispatch } from '@/app/store';
import { StorageProviderType } from '@/types/api';
import { MessageToPluginTypes } from '@/types/messages';
import { TokenProps } from '@/types/tokens';
import { notifyToUI, postToFigma } from '../../../plugin/notifiers';

async function readTokensFromURL({ secret, id }): Promise<TokenProps> | null {
  let customHeaders = secret;
  const defaultHeaders = {
    Accept: 'application/json',
  };
  try {
    customHeaders = JSON.parse(secret);
  } finally {
    const headers = {
      ...defaultHeaders,
      ...customHeaders,
    };
    const response = await fetch(id, {
      method: 'GET',
      headers,
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
    notifyToUI('There was an error connecting, check your sync settings', { error: true });
    return null;
  }
}

export default function useURL() {
  const dispatch = useDispatch<Dispatch>();

  // Read tokens from URL
  async function pullTokensFromURL(context): Promise<TokenProps> | null {
    const { id, secret, name } = context;

    if (!id && !secret) return;

    try {
      const data = await readTokensFromURL({ id, secret });
      dispatch.uiState.setProjectURL(id);

      if (data) {
        postToFigma({
          type: MessageToPluginTypes.CREDENTIALS,
          id,
          name,
          secret,
          provider: StorageProviderType.URL,
        });
        if (data) {
          const tokenObj = {
            values: data,
          };
          dispatch.tokenState.setTokenData(tokenObj);
          dispatch.tokenState.setEditProhibited(true);
          return tokenObj;
        }

        notifyToUI('No tokens stored on remote', { error: true });
      }
    } catch (e) {
      notifyToUI('Error fetching from URL, check console (F12)', { error: true });
      console.log('Error:', e);
    }
  }
  return {
    pullTokensFromURL,
  };
}
