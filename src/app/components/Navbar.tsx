import * as React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {track} from '@/utils/analytics';
import {useTokenState} from '../store/TokenContext';
import Icon from './Icon';
import Tooltip from './Tooltip';
import useRemoteTokens from '../store/remoteTokens';
import {StorageProviderType} from '../../../types/api';
import {RootState, Dispatch} from '../store';

const TabButton = ({name, label, first = false}) => {
    const activeTab = useSelector((state: RootState) => state.base.activeTab);
    const dispatch = useDispatch<Dispatch>();

    const onClick = () => {
        track('Switched tab', {from: activeTab, to: name});
        dispatch.base.setActiveTab(name);
    };

    return (
        <button
            data-cy={`navitem-${name}`}
            type="button"
            className={`px-2 py-4 text-xxs focus:outline-none focus:shadow-none font-medium cursor-pointer focus:text-black hover:text-black
        ${activeTab === name ? 'text-black' : 'text-gray-500'}
        ${first ? 'pl-4' : ''}`}
            name="text"
            onClick={onClick}
        >
            {label}
        </button>
    );
};

const transformProviderName = (provider) => {
    switch (provider) {
        case StorageProviderType.JSONBIN:
            return 'JSONBin.io';
        case StorageProviderType.ARCADE:
            return 'Arcade';
        default:
            return provider;
    }
};

const Navbar = () => {
    const {storageType, projectURL} = useTokenState();
    const {pullTokens} = useRemoteTokens();

    return (
        <div className="sticky top-0 navbar bg-white flex items-center justify-between z-1 border-b border-gray-200">
            <div>
                <TabButton first name="tokens" label="Tokens" />
                <TabButton name="inspector" label="Inspect" />
                <TabButton name="syncsettings" label="Sync" />
                <TabButton name="settings" label="Settings" />
            </div>
            <div className="flex flex-row items-center">
                {storageType.provider !== StorageProviderType.LOCAL && (
                    <>
                        {projectURL && (
                            <Tooltip variant="right" label={`Go to ${transformProviderName(storageType.provider)}`}>
                                <a href={projectURL} target="_blank" rel="noreferrer" className="button button-ghost">
                                    <Icon name="library" />
                                </a>
                            </Tooltip>
                        )}
                        <Tooltip variant="right" label={`Pull from ${transformProviderName(storageType.provider)}`}>
                            <button onClick={pullTokens} type="button" className="button button-ghost">
                                <Icon name="refresh" />
                            </button>
                        </Tooltip>
                    </>
                )}
            </div>
        </div>
    );
};

export default Navbar;
