import {
  useEffect,
  useMemo,
} from 'react';
import { useDispatch, useStore } from 'react-redux';
import { useLDClient } from 'launchdarkly-react-client-sdk';
import { LDClient } from 'launchdarkly-js-client-sdk';
import { StartupMessage } from '@/types/AsyncMessages';
import { useProcess } from '@/hooks';
import { ApplicationInitSteps } from './ApplicationInitSteps';
import { Dispatch, RootState } from '@/app/store';
import {
  savePluginDataFactory, getLdFlags, saveStorageInformationFactory, pullTokensFactory,
} from './startupProcessSteps';
import useStorage from '@/app/store/useStorage';
import { useFlags } from '../LaunchDarkly';
import useConfirm from '@/app/hooks/useConfirm';
import useRemoteTokens from '@/app/store/remoteTokens';
import { useLicenseKey } from './startupProcessSteps/useLicenseKey';

let ldClientPromiseResolver: (client: LDClient) => void;
const ldClientPromise = new Promise<LDClient>((resolve) => {
  ldClientPromiseResolver = resolve;
});

export function useStartupProcess(params: StartupMessage) {
  const ldClient = useLDClient();
  const store = useStore<RootState>();
  const dispatch = useDispatch<Dispatch>();
  const useStorageResult = useStorage();
  const useConfirmResult = useConfirm();
  const useRemoteTokensResult = useRemoteTokens();
  const flags = useFlags();
  console.log('Flags', flags);
  const { initiateLicenseKey } = useLicenseKey();

  const startupProcess = useProcess<ApplicationInitSteps>(useMemo(() => ([
    {
      key: ApplicationInitSteps.SAVE_PLUGIN_DATA,
      fn: savePluginDataFactory(dispatch, params),
    },
    {
      key: ApplicationInitSteps.ADD_LICENSE,
      fn: async () => await initiateLicenseKey(params),
    },
    {
      key: ApplicationInitSteps.GET_LD_FLAGS,
      fn: async () => await getLdFlags(store, ldClientPromise, params),
    },
    {
      key: ApplicationInitSteps.SAVE_STORAGE_INFORMATION,
      fn: saveStorageInformationFactory(dispatch, params, useStorageResult),
    },
    {
      key: ApplicationInitSteps.PULL_TOKENS,
      fn: pullTokensFactory(store, dispatch, flags, params, useConfirmResult, useRemoteTokensResult),
    },
  // disabling as we don't want some of those deps to trigger the process
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ]), [params, store, flags]));

  useEffect(() => {
    if (ldClient) {
      ldClientPromiseResolver(ldClient);
    }
  }, [ldClient]);

  return startupProcess;
}
