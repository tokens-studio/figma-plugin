import React from 'react';
import Modal from '../Modal';
import Heading from '../Heading';
import {StorageProviderType} from '../../../types/api';
import {useTokenDispatch} from '../../store/TokenContext';
import EditStorageItemForm from '../EditStorageItemForm';

export default function EditStorageItemModal({
    isOpen,
    initialValue = {id: '', name: '', secret: ''},
    onClose,
    hasErrored = false,
    onSuccess,
}) {
    const {setLocalApiState, setApiData} = useTokenDispatch();
    const [formFields, setFormFields] = React.useState(initialValue);

    const handleChange = (e) => {
        console.log('changed', e);
        setFormFields({...formFields, [e.target.name]: e.target.value});
    };

    const onSubmit = () => {
        // Should behave differently when currently active
        setApiData(formFields);
        setLocalApiState({provider: StorageProviderType.LOCAL});
        onSuccess();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('submitted', e);
        onSubmit();
    };

    return (
        <Modal isOpen={isOpen} close={() => onClose(false)}>
            <div className="space-y-4">
                <Heading>Edit storage item</Heading>
                <EditStorageItemForm
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
