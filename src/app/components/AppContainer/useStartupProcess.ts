import {
  useMemo,
} from 'react';
import { useDispatch, useStore } from 'react-redux';
import { useLDClient } from 'launchdarkly-react-client-sdk';
import { StartupMessage } from '@/types/AsyncMessages';
import { useProcess } from '@/hooks';
import { ApplicationInitSteps } from './ApplicationInitSteps';
import { Dispatch, RootState } from '@/app/store';
import {
  addLicenseFactory, savePluginDataFactory, getLdFlagsFactory, saveStorageInforamationFactory, pullTokensFactory,
} from './startupProcessSteps';
import useStorage from '@/app/store/useStorage';
import { useFlags } from '../LaunchDarkly';
import useConfirm from '@/app/hooks/useConfirm';
import useRemoteTokens from '@/app/store/remoteTokens';

export function useStartupProcess(params: StartupMessage) {
  const ldClient = useLDClient();
  const store = useStore<RootState>();
  const dispatch = useDispatch<Dispatch>();
  const useStorageResult = useStorage();
  const useConfirmResult = useConfirm();
  const useRemoteTokensResult = useRemoteTokens();
  const flags = useFlags();

  const startupProcess = useProcess<ApplicationInitSteps>(useMemo(() => ([
    {
      key: ApplicationInitSteps.SAVE_PLUGIN_DATA,
      fn: savePluginDataFactory(dispatch, params),
    },
    {
      key: ApplicationInitSteps.ADD_LICENSE,
      fn: addLicenseFactory(dispatch, params),
    },
    {
      key: ApplicationInitSteps.GET_LD_FLAGS,
      fn: getLdFlagsFactory(store, ldClient, params),
    },
    {
      key: ApplicationInitSteps.SAVE_STORAGE_INFORMATION,
      fn: saveStorageInforamationFactory(dispatch, params, useStorageResult),
    },
    {
      key: ApplicationInitSteps.PULL_TOKENS,
      fn: pullTokensFactory(store, dispatch, flags, params, useConfirmResult, useRemoteTokensResult),
    },
  ]), [
    params,
    store,
    ldClient,
    useStorageResult,
    flags,
    dispatch,
    useConfirmResult,
    useRemoteTokensResult,
  ]));

  return startupProcess;
}
