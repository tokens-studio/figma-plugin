/* eslint-disable jsx-a11y/label-has-associated-control */
import * as React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useDebouncedCallback} from 'use-debounce';
import Heading from './Heading';
import {RootState, Dispatch} from '../store';
import Input from './Input';
import RadioButton from './RadioButton';

const SyncSettings = () => {
    const {uiWindow, depth, tokenType} = useSelector((state: RootState) => state.settings);
    const dispatch = useDispatch<Dispatch>();

    const debouncedChange = useDebouncedCallback(() => {
        dispatch.settings.triggerWindowChange();
    }, 1000);

    const handleSizeChange = (e) => {
        const value = Number(e.target.value.trim());
        if (!Number.isNaN(value)) {
            dispatch.settings.setWindowSize({
                ...uiWindow,
                [e.target.name]: value,
            });
            debouncedChange();
        }
    };
    const handleDepthChange = (e) => {
        const value = Number(e.target.value.trim());
        if (!Number.isNaN(value)) {
            dispatch.settings.setDepth(value);
        }
    };
    const handleTypeChange = (e) => {
        dispatch.settings.setTokenType(e.target.value);
    };

    return (
        <div className="flex flex-col flex-grow">
            <div className="p-4 space-y-4 border-b">
                <div className="space-y-4">
                    <Heading>Window size</Heading>
                    <div className="flex flex-row space-x-2">
                        <Input
                            full
                            label="Width"
                            value={uiWindow.width}
                            onChange={handleSizeChange}
                            type="text"
                            name="width"
                            required
                        />
                        <Input
                            full
                            label="Height"
                            value={uiWindow.height}
                            onChange={handleSizeChange}
                            type="text"
                            name="height"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <Heading>Token Depth</Heading>
                    <div className="flex flex-row space-x-2">
                        <Input
                            full
                            label="Depth"
                            value={depth}
                            onChange={handleDepthChange}
                            type="text"
                            name="depth"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <Heading>Token Type</Heading>
                    <div className="flex flex-row space-x-2">
                        <RadioButton
                            name="object"
                            value="object"
                            checked={tokenType === 'object'}
                            group="tokenType"
                            onChange={handleTypeChange}
                        >
                            Object
                        </RadioButton>
                        <RadioButton
                            name="array"
                            value="array"
                            checked={tokenType === 'array'}
                            group="tokenType"
                            onChange={handleTypeChange}
                        >
                            array
                        </RadioButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SyncSettings;
