import React from 'react';
import GitForm from './StorageItemForm/GitForm';
import ADOForm from './StorageItemForm/ADOForm';
import JSONBinForm from './StorageItemForm/JSONBinForm';
import URLForm from './StorageItemForm/URLForm';
import { StorageTypeFormValues } from '@/types/StorageType';
import { StorageProviderType } from '@/constants/StorageProviderType';
import GenericVersionedForm from './StorageItemForm/GenericVersioned';

type Props = {
  values: StorageTypeFormValues<true>
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onCancel: () => void;
  onSubmit: (values: StorageTypeFormValues<false>) => void;
  isNew?: boolean;
  hasErrored?: boolean;
};

const getInitialValues = (values:StorageTypeFormValues<true>) => {
  switch (values.provider) {
    case StorageProviderType.GENERIC_VERSIONED_STORAGE:
      return {
        ...values,
        additionalHeaders: [],
      };

    default:
      return values;
  }
};

export default function StorageItemForm({
  isNew = false, onChange, onSubmit, onCancel, values, hasErrored,
}: Props) {
  if (isNew) {
    values = getInitialValues(values);
  }

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
    case StorageProviderType.GENERIC_VERSIONED_STORAGE: {
      return (
        <GenericVersionedForm
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
    default: {
      return null;
    }
  }
}
