import React from 'react';
import {useSelector} from 'react-redux';
import {StorageProviderType} from '../../../types/api';
import {RootState} from '../store';
import GitHubForm from './StorageItemForm/GitHubForm';
import JSONBinForm from './StorageItemForm/JSONBinForm';

export default function EditStorageItemForm({
    isNew = false,
    handleChange,
    handleSubmit,
    handleCancel,
    values,
    hasErrored,
}) {
    const {localApiState} = useSelector((state: RootState) => state.uiState);

    switch (localApiState.provider) {
        case StorageProviderType.GITHUB: {
            return (
                <GitHubForm
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    handleCancel={handleCancel}
                    values={values}
                    hasErrored={hasErrored}
                />
            );
        }
        default: {
            return (
                <JSONBinForm
                    isNew={isNew}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    handleCancel={handleCancel}
                    values={values}
                    hasErrored={hasErrored}
                />
            );
        }
    }
}
