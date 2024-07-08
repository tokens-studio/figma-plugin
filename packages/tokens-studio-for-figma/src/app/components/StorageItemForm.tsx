import React from 'react';
import { Button } from '@tokens-studio/ui';
import GitForm from './StorageItemForm/GitForm';
import ADOForm from './StorageItemForm/ADOForm';
import JSONBinForm from './StorageItemForm/JSONBinForm';
import URLForm from './StorageItemForm/URLForm';
import GenericVersionedForm from './StorageItemForm/GenericVersioned';
import BitbucketForm from './StorageItemForm/BitbucketForm';

import { ChangeEventHandler } from './StorageItemForm/types';
import { StorageTypeFormValues } from '@/types/StorageType';
import { StorageProviderType } from '@/constants/StorageProviderType';
import SupernovaForm from './StorageItemForm/SupernovaForm';
import TokensStudioForm from './StorageItemForm/TokensStudioForm';
import WebSocketForm from './StorageItemForm/WebSocketForm';

type Props = {
  values: StorageTypeFormValues<true>;
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
    case StorageProviderType.GITHUB:
    case StorageProviderType.GITLAB: {
      return (
        <GitForm
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
          values={values}
          hasErrored={hasErrored}
          errorMessage={errorMessage}
        />
      );
    }
    case StorageProviderType.BITBUCKET: {
      return (
        <BitbucketForm
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
          values={values}
          hasErrored={hasErrored}
          errorMessage={errorMessage}
        />
      );
    }
    case StorageProviderType.ADO: {
      return (
        <ADOForm
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
          values={values}
          hasErrored={hasErrored}
          errorMessage={errorMessage}
        />
      );
    }
    case StorageProviderType.URL: {
      return (
        <URLForm
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
          values={values}
          hasErrored={hasErrored}
          errorMessage={errorMessage}
        />
      );
    }
    case StorageProviderType.GENERIC_VERSIONED_STORAGE: {
      return (
        <GenericVersionedForm
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
          values={values}
          hasErrored={hasErrored}
          errorMessage={errorMessage}
        />
      );
    }
    case StorageProviderType.JSONBIN: {
      return (
        <JSONBinForm
          isNew={isNew}
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
          values={values}
          hasErrored={hasErrored}
          errorMessage={errorMessage}
        />
      );
    }
    case StorageProviderType.SUPERNOVA: {
      return (
        <SupernovaForm
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
          values={values}
          hasErrored={hasErrored}
          errorMessage={errorMessage}
        />
      );
    }
    case StorageProviderType.TOKENS_STUDIO: {
      return (
        <TokensStudioForm
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
          values={values}
          hasErrored={hasErrored}
          errorMessage={errorMessage}
        />
      );
    }
    case StorageProviderType.WEB_SOCKET: {
      return (
        <WebSocketForm
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
          values={values}
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
