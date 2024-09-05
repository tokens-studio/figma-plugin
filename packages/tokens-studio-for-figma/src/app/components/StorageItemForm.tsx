import React from 'react';
import { AVAILABLE_PROVIDERS } from '@sync-providers/constants';
import GitForm from './StorageItemForm/GitForm';
import ADOForm from './StorageItemForm/ADOForm';
import JSONBinForm from './StorageItemForm/JSONBinForm';
import URLForm from './StorageItemForm/URLForm';
import GenericVersionedForm from './StorageItemForm/GenericVersioned';
import BitbucketForm from './StorageItemForm/BitbucketForm';

import { ChangeEventHandler } from './StorageItemForm/types';
import { StorageProviderType, StorageTypeFormValues } from '@/types/StorageType';
import SupernovaForm from './StorageItemForm/SupernovaForm';
import TokensStudioForm from './StorageItemForm/TokensStudioForm';

type Props = {
  values: Extract<StorageTypeFormValues<true>, { provider: StorageProviderType.URL }>;
  onChange: ChangeEventHandler;
  onCancel: () => void;
  onSubmit: (values: StorageTypeFormValues<false>) => void;
  isNew?: boolean;
  hasErrored?: boolean;
  errorMessage?: string;
};

export default function StorageItemForm({
  isNew = false, onChange, onSubmit, onCancel, values, hasErrored, errorMessage,
}: Props) {
  switch (values.provider) {
    case AVAILABLE_PROVIDERS.GITHUB:
    case AVAILABLE_PROVIDERS.GITLAB: {
      return (
        <GitForm
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
          values={values as unknown as Extract<StorageTypeFormValues<true>, { provider: StorageProviderType.GITHUB | StorageProviderType.GITLAB }>}
          hasErrored={hasErrored}
          errorMessage={errorMessage}
        />
      );
    }
    case AVAILABLE_PROVIDERS.BITBUCKET: {
      return (
        <BitbucketForm
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
          values={values as unknown as Extract<StorageTypeFormValues<true>, { provider: StorageProviderType.BITBUCKET }>}
          hasErrored={hasErrored}
          errorMessage={errorMessage}
        />
      );
    }
    case AVAILABLE_PROVIDERS.ADO: {
      return (
        <ADOForm
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
          values={values as unknown as Extract<StorageTypeFormValues<true>, { provider: StorageProviderType.ADO }>}
          hasErrored={hasErrored}
          errorMessage={errorMessage}
        />
      );
    }
    case AVAILABLE_PROVIDERS.URL: {
      return (
        <URLForm
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
          values={values as Extract<StorageTypeFormValues<true>, { provider: StorageProviderType.URL }>}
          hasErrored={hasErrored}
          errorMessage={errorMessage}
        />
      );
    }
    case AVAILABLE_PROVIDERS.GENERIC_VERSIONED_STORAGE: {
      return (
        <GenericVersionedForm
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
          values={values as unknown as Extract<StorageTypeFormValues<true>, { provider: StorageProviderType.GENERIC_VERSIONED_STORAGE }>}
          hasErrored={hasErrored}
          errorMessage={errorMessage}
        />
      );
    }
    case AVAILABLE_PROVIDERS.JSONBIN: {
      return (
        <JSONBinForm
          isNew={isNew}
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
          values={values as unknown as Extract<StorageTypeFormValues<true>, { provider: StorageProviderType.JSONBIN }>}
          hasErrored={hasErrored}
          errorMessage={errorMessage}
        />
      );
    }
    case AVAILABLE_PROVIDERS.SUPERNOVA: {
      return (
        <SupernovaForm
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
          values={values as unknown as Extract<StorageTypeFormValues<true>, { provider: StorageProviderType.SUPERNOVA }>}
          hasErrored={hasErrored}
          errorMessage={errorMessage}
        />
      );
    }
    case AVAILABLE_PROVIDERS.TOKENS_STUDIO: {
      return (
        <TokensStudioForm
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
          values={values as unknown as Extract<StorageTypeFormValues<true>, { provider: StorageProviderType.TOKENS_STUDIO }>}
          hasErrored={hasErrored}
          errorMessage={errorMessage}
        />
      );
    }
    default: {
      return null;
    }
  }
}
