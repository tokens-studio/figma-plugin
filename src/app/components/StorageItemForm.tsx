import React from 'react';
import GitForm from './StorageItemForm/GitForm';
import ADOForm from './StorageItemForm/ADOForm';
import JSONBinForm from './StorageItemForm/JSONBinForm';
import URLForm from './StorageItemForm/URLForm';
import { StorageTypeFormValues } from '@/types/StorageType';
import { StorageProviderType } from '@/constants/StorageProviderType';
import SupernovaForm from './StorageItemForm/SupernovaForm';

type Props = {
  values: StorageTypeFormValues<true>
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onCancel: () => void;
  onSubmit: (values: StorageTypeFormValues<false>) => void;
  isNew?: boolean;
  hasErrored?: boolean;
};

export default function StorageItemForm({
  isNew = false, onChange, onSubmit, onCancel, values, hasErrored,
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
        />
      );
    }
    default: {
      return null;
    }
  }
}
