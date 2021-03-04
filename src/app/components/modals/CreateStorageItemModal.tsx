import React from 'react';
import Modal from '../Modal';
import Heading from '../Heading';
import StorageItemForm from '../StorageItemForm';
import {useTokenDispatch, useTokenState} from '../../store/TokenContext';

import {createNewBin} from '../../store/remoteTokens';

export default function EditStorageItemModal({isOpen, onClose, onSuccess}) {
    const {tokenData, localApiState} = useTokenState();
    const {setApiData, setStorageType, setLoading} = useTokenDispatch();

    const [hasErrored, setHasErrored] = React.useState(false);
    const [formFields, setFormFields] = React.useState({id: '', name: '', secret: ''});

    const handleCreateNewClick = async () => {
        setLoading(true);
        setHasErrored(false);
        const response = await createNewBin({
            provider: localApiState.provider,
            secret: formFields.secret,
            tokens: tokenData.reduceToValues(),
            name: formFields.name,
            updatedAt: tokenData.getUpdatedAt(),
            setApiData,
            setStorageType,
        });
        if (response) {
            onSuccess();
        } else {
            setHasErrored(true);
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        setFormFields({...formFields, [e.target.name]: e.target.value});
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleCreateNewClick();
    };

    return (
        <Modal isOpen={isOpen} close={() => onClose(false)}>
            <div className="space-y-4">
                <Heading>Add new credentials</Heading>
                <StorageItemForm
                    isNew
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    handleCancel={() => onClose(false)}
                    values={formFields}
                    hasErrored={hasErrored}
                />
            </div>
        </Modal>
    );
}
