/* eslint-disable jsx-a11y/label-has-associated-control */
import * as React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useDebouncedCallback} from 'use-debounce';
import Heading from './Heading';
import {RootState, Dispatch} from '../store';
import Input from './Input';

const SyncSettings = () => {
    const settings = useSelector((state: RootState) => state.settings);
    const dispatch = useDispatch<Dispatch>();

    const debouncedChange = useDebouncedCallback(() => {
        dispatch.settings.triggerWindowChange();
    }, 1000);

    const handleSizeChange = (e) => {
        const value = Number(e.target.value.trim());
        if (!Number.isNaN(value)) {
            dispatch.settings.setWindowSize({
                ...settings.uiWindow,
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

    return (
        <div className="flex flex-col flex-grow">
            <div className="p-4 space-y-4 border-b">
                <div className="space-y-4">
                    <Heading>Window size</Heading>
                    <div className="flex flex-row space-x-2">
                        <Input
                            full
                            label="Width"
                            value={settings.uiWindow.width}
                            onChange={handleSizeChange}
                            type="text"
                            name="width"
                            required
                        />
                        <Input
                            full
                            label="Height"
                            value={settings.uiWindow.height}
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
                            value={settings.depth}
                            onChange={handleDepthChange}
                            type="text"
                            name="depth"
                            required
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SyncSettings;
