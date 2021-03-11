import React from 'react';
import {StorageProviderType} from '../../../types/api';
import Button from './Button';
import Input from './Input';
import {useTokenState} from '../store/TokenContext';

export default function EditStorageItemForm({
    isNew = false,
    handleChange,
    handleSubmit,
    handleCancel,
    values,
    hasErrored,
}) {
    const {localApiState} = useTokenState();

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input full label="Name" value={values.name} onChange={handleChange} type="text" name="name" required />
            <Input
                full
                label="Secret"
                value={values.secret}
                onChange={handleChange}
                type="text"
                name="secret"
                required
            />
            <Input
                full
                label={`ID${localApiState.provider === StorageProviderType.JSONBIN ? ' (optional)' : ''}`}
                value={values.id}
                onChange={handleChange}
                type="text"
                name="id"
                required={isNew ? localApiState.provider !== StorageProviderType.JSONBIN : true}
            />
            <div className="space-x-4">
                <Button variant="secondary" size="large" onClick={handleCancel}>
                    Cancel
                </Button>

                <Button variant="primary" type="submit" disabled={!values.secret && !values.name}>
                    Save
                </Button>
            </div>
            {hasErrored && (
                <div className="bg-red-200 text-red-700 rounded p-4 text-xs font-bold">
                    There was an error connecting. Check your credentials.
                </div>
            )}
        </form>
    );
}
