import * as React from 'react';
import {useTokenState, useTokenDispatch} from '../store/TokenContext';
import Icon from './Icon';
import Tooltip from './Tooltip';
import {pullRemoteTokens} from '../store/remoteTokens';
import TokenData from './TokenData';
import {StorageProviderType} from '../../types/api';

const TabButton = ({name, label, active, setActive, first = false}) => (
    <button
        type="button"
        className={`px-2 py-4 text-xxs focus:outline-none focus:shadow-none font-medium cursor-pointer hover:text-black
        ${active === name ? 'text-black' : 'text-gray-500'}
        ${first ? 'pl-4' : ''}`}
        name="text"
        onClick={() => setActive(name)}
    >
        {label}
    </button>
);

const Navbar = ({active, setActive}) => {
    const {colorMode, storageType, api} = useTokenState();
    const {toggleColorMode, pullStyles, setLoading, setTokenData} = useTokenDispatch();

    const handlePull = async () => {
        setLoading(true);
        const updatedTokens = await pullRemoteTokens(api);
        setTokenData(new TokenData(updatedTokens), updatedTokens.updatedAt);
        setLoading(false);
    };

    return (
        <div className="sticky top-0 navbar bg-white flex items-center justify-between z-1 border-b border-gray-200">
            <div>
                <TabButton first name="tokens" label="Tokens" active={active} setActive={setActive} />
                <TabButton name="json" label="JSON" active={active} setActive={setActive} />
                <TabButton name="inspector" label="Inspect" active={active} setActive={setActive} />
                <TabButton name="settings" label="Settings" active={active} setActive={setActive} />
            </div>
            <div>
                {storageType.provider !== StorageProviderType.LOCAL && (
                    <Tooltip label={`Pull from ${storageType.provider}`}>
                        <button onClick={handlePull} type="button" className="button button-ghost">
                            <Icon name="refresh" />
                        </button>
                    </Tooltip>
                )}
                <Tooltip variant="right" label="Import Styles">
                    <button className="button button-ghost" type="button" onClick={pullStyles}>
                        <Icon name="import" />
                    </button>
                </Tooltip>
                <Tooltip variant="right" label={colorMode ? 'Disable Color UI' : 'Enable Color UI'}>
                    <button className="button button-ghost" type="button" onClick={toggleColorMode}>
                        <Icon name={colorMode ? 'blend' : 'blendempty'} />
                    </button>
                </Tooltip>
            </div>
        </div>
    );
};

export default Navbar;
