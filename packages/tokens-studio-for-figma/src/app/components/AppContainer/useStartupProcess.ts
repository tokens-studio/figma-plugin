import {
  useMemo,
} from 'react';
import { useDispatch, useStore } from 'react-redux';
import { StartupMessage } from '@/types/AsyncMessages';
import { useProcess } from '@/hooks';
import { ApplicationInitSteps } from './ApplicationInitSteps';
import { Dispatch, RootState } from '@/app/store';
import {
  addLicenseFactory, savePluginDataFactory, saveStorageInformationFactory, pullTokensFactory, migrateRemoveAdditionalHeadersFactory,
} from './startupProcessSteps';
import useStorage from '@/app/store/useStorage';
import useConfirm from '@/app/hooks/useConfirm';
import useRemoteTokens from '@/app/store/remoteTokens';

export function useStartupProcess(params: StartupMessage) {
  const store = useStore<RootState>();
  const dispatch = useDispatch<Dispatch>();
  const useStorageResult = useStorage();
  const useConfirmResult = useConfirm();
  const useRemoteTokensResult = useRemoteTokens();

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
      key: ApplicationInitSteps.MIGRATE_REMOVE_ADDITIONAL_HEADERS,
      fn: migrateRemoveAdditionalHeadersFactory(dispatch, params),
    },
    {
      key: ApplicationInitSteps.SAVE_STORAGE_INFORMATION,
      fn: saveStorageInformationFactory(dispatch, params, useStorageResult),
    },
    {
      key: ApplicationInitSteps.PULL_TOKENS,
      fn: pullTokensFactory(store, dispatch, params, useConfirmResult, useRemoteTokensResult),
    },
  // disabling as we don't want some of those deps to trigger the process
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ]), [params, store]));

  return startupProcess;
}
