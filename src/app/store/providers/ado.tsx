import { useDispatch, useSelector } from 'react-redux';
import * as GitApi from 'azure-devops-node-api/GitApi';
import * as GitInterfaces from 'azure-devops-node-api/interfaces/GitInterfaces';
import { Dispatch, RootState } from '@/app/store';
import { MessageToPluginTypes } from '@/types/messages';
import convertTokensToObject from '@/utils/convertTokensToObject';
import useConfirm from '@/app/hooks/useConfirm';
import usePushDialog from '@/app/hooks/usePushDialog';
import IsJSONString from '@/utils/isJSONString';
import { ContextObject } from '@/types/api';
import { notifyToUI, postToFigma } from '../../../plugin/notifiers';
import { FeatureFlags } from '@/utils/featureFlags';
import { AnyTokenSet, TokenValues } from '@/types/tokens';
import { decodeBase64 } from '@/utils/string';
import { featureFlagsSelector, localApiStateSelector, tokensSelector } from '@/selectors';

// export function getADOCreatePullRequestUrl(id: string, branchName: string) {
//   return `https://github.com/${id}/compare/${branchName}?expand=1`;
// }

export const getADOCreatePullRequestUrl = (id: string, branch: string): string => '';

const addNewADOCredentials = async (context: ContextObject): Promise<TokenValues | null> => {};
const syncTokensWithADO = async (context: ContextObject): Promise<TokenValues | null> => {};
const pullTokensFromADO = async (context: ContextObject, receivedFeatureFlags?: FeatureFlags | undefined): Promise<{
  values: any;
} | null> => {};
const pushTokensToADO = async (context: ContextObject): Promise<{}> => {};

const syncTokensADO = asy

export const useADO = () => {
  async function addNewADOCredentials(context: ContextObject): Promise<TokenValues | null> {
    let { raw: rawTokenObj } = getTokenObj();

    const data = await syncTokensADO(context);
    if (data) {
      postToFigma({
        type: MessageToPluginTypes.CREDENTIALS,
        ...context,
      });
      if (data?.values) {
        dispatch.tokenState.setLastSyncedState(JSON.stringify(data.values, null, 2));
        dispatch.tokenState.setTokenData(data);
        rawTokenObj = data.values;
      } else {
        notifyToUI('No tokens stored on remote');
      }
    } else {
      return null;
    }

    return {
      values: rawTokenObj,
    };
  }
  return {
    addNewADOCredentials,
    syncTokensWithADO,
    pullTokensFromADO,
    pushTokensToADO,
  };
};
