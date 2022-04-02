import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from '@/app/store';
import { StorageProviderType } from '@/types/api';
import { MessageToPluginTypes } from '@/types/messages';
import { TokenStore, TokenValues } from '@/types/tokens';
import convertTokensToObject from '@/utils/convertTokensToObject';
import { notifyToUI, postToFigma } from '../../../plugin/notifiers';
import { compareUpdatedAt } from '../../components/utils';
import * as pjs from '../../../../package.json';
import useStorage from '../useStorage';

async function readTokensFromJSONBin({ secret, id }): Promise<TokenValues | null> {
  const response = await fetch(`https://api.jsonbin.io/v3/b/${id}/latest`, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': secret,
      'X-Bin-Meta': false,
    },
  });

  if (response.ok) {
    return response.json();
  }
  notifyToUI('There was an error connecting, check your sync settings', { error: true });
  return null;
}

async function writeTokensToJSONBin({ secret, id, tokenObj }): Promise<TokenValues | null> {
  const response = await fetch(`https://api.jsonbin.io/v3/b/${id}`, {
    method: 'PUT',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    body: tokenObj,
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': secret,
    },
  });

  if (response.ok) {
    const res = await response.json();
    notifyToUI('Updated Remote');
    return res;
  }
  notifyToUI('Error updating remote', { error: true });
  return null;
}

export async function updateJSONBinTokens({
  tokens, context, updatedAt, oldUpdatedAt = null,
}) {
  const { id, secret } = context;
  try {
    const tokenObj = JSON.stringify(
      {
        version: pjs.plugin_version,
        updatedAt,
        values: convertTokensToObject(tokens),
      },
      null,
      2,
    );

    if (oldUpdatedAt) {
      const remoteTokens = await readTokensFromJSONBin({ secret, id });
      const comparison = await compareUpdatedAt(oldUpdatedAt, remoteTokens.updatedAt);
      if (comparison === 'remote_older') {
        writeTokensToJSONBin({ secret, id, tokenObj });
      } else {
        // Tell the user to choose between:
        // A) Pull Remote values and replace local changes
        // B) Overwrite Remote changes
        notifyToUI('Error updating tokens as remote is newer, please update first', { error: true });
      }
    } else {
      writeTokensToJSONBin({ secret, id, tokenObj });
    }
  } catch (e) {
    console.log('Error updating jsonbin', e);
  }
}

export function useJSONbin() {
  const dispatch = useDispatch<Dispatch>();
  const { setStorageType } = useStorage();
  const { tokens } = useSelector((state: RootState) => state.tokenState);

  async function createNewJSONBin(context): Promise<TokenValues> {
    const { secret, name, updatedAt } = context;
    const response = await fetch('https://api.jsonbin.io/v3/b', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      body: JSON.stringify({
        version: pjs.plugin_version,
        updatedAt,
        values: {
          options: {},
        },
      }),
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': secret,
        'X-Bin-Name': name,
        versioning: 'false',
      },
    });
    if (response.ok) {
      const jsonBinData = await response.json();
      dispatch.uiState.setApiData({
        id: jsonBinData.metadata.id,
        name,
        secret,
        provider: StorageProviderType.JSONBIN,
      });
      updateJSONBinTokens({
        tokens,
        context: {
          id: jsonBinData.metadata.id,
          secret,
        },
        updatedAt,
      });
      postToFigma({
        type: MessageToPluginTypes.CREDENTIALS,
        id: jsonBinData.metadata.id,
        name,
        secret,
        provider: StorageProviderType.JSONBIN,
      });
      dispatch.uiState.setProjectURL(`https://jsonbin.io/${jsonBinData.metadata.id}`);

      return jsonBinData.metadata.id;
    }
    notifyToUI('Something went wrong. See console for details', { error: true });
    return null;
  }

  // Read tokens from JSONBin

  async function pullTokensFromJSONBin(context): Promise<TokenStore | null> {
    const { id, secret, name } = context;

    if (!id && !secret) return null;

    try {
      const jsonBinData = await readTokensFromJSONBin({ id, secret });
      dispatch.uiState.setProjectURL(`https://jsonbin.io/${id}`);

      if (jsonBinData) {
        postToFigma({
          type: MessageToPluginTypes.CREDENTIALS,
          id,
          name,
          secret,
          provider: StorageProviderType.JSONBIN,
        });
        if (jsonBinData?.values) {
          dispatch.tokenState.setEditProhibited(false);

          return {
            version: jsonBinData.version,
            updatedAt: jsonBinData.updatedAt,
            values: jsonBinData.values,
          };
        }
        notifyToUI('No tokens stored on remote', { error: true });
      }

      return null;
    } catch (e) {
      notifyToUI('Error fetching from JSONbin, check console (F12)', { error: true });
      console.log('Error:', e);
      return null;
    }
  }

  async function addJSONBinCredentials(context): Promise<TokenStore | null> {
    const tokenValues = await pullTokensFromJSONBin(context);

    if (tokenValues) {
      dispatch.uiState.setApiData(context);
      setStorageType({
        provider: context,
        shouldSetInDocument: true,
      });
      dispatch.tokenState.setLastSyncedState(JSON.stringify(tokenValues.values, null, 2));
      dispatch.tokenState.setTokenData(tokenValues);
    }

    return tokenValues;
  }

  return {
    addJSONBinCredentials,
    pullTokensFromJSONBin,
    createNewJSONBin,
  };
}
