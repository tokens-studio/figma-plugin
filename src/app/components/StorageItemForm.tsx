import React from 'react';
import {useSelector} from 'react-redux';
import {StorageProviderType} from 'Types/api';
import {RootState} from '../store';
import GitHubForm from './StorageItemForm/GitHubForm';
import JSONBinForm from './StorageItemForm/JSONBinForm';
import URLForm from './StorageItemForm/URLForm';

export default function StorageItemForm({isNew = false, handleChange, handleSubmit, handleCancel, values, hasErrored}) {
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
        case StorageProviderType.URL: {
            return (
                <URLForm
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
