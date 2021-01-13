import * as React from 'react';
import Heading from './Heading';
import Button from './Button';
import {useTokenDispatch} from '../store/TokenContext';
import Input from './Input';
import {initializeWithThemerData} from './utils';
import {setTokenData} from '../../plugin/node';
import TokenData from './TokenData';

const StartScreen = ({setActive}) => {
    const {setDefaultTokens, setLoading, setApiData} = useTokenDispatch();
    const [apiID, setApiID] = React.useState('');
    const [apiSecret, setApiSecret] = React.useState('');
    const onSetDefaultTokens = () => {
        setActive('tokens');
        setDefaultTokens();
        setLoading(false);
    };

    const handleApiSecretChange = (e) => {
        setApiSecret(e.target.value);
    };
    const handleApiIDChange = (e) => {
        setApiID(e.target.value);
    };
    const handleSyncClick = () => {
        setApiData({id: apiID, secret: apiSecret});
        const values = initializeWithThemerData(apiID, apiSecret);
        if (values) {
            setActive('tokens');
            setTokenData(new TokenData(values));
            setLoading(false);
        }
    };
    return (
        <div className="my-auto h-auto space-y-4 p-4">
            <Heading size="small">Welcome to Figma Tokens.</Heading>
            <div className="text-xs">
                Making design tokens a single source of truth for designers and developers using Figma. Design tokens
                are an integral part of any design system - this plugin enhances Figma Styles by a variety of other
                features.
            </div>
            <div className="space-x-2 flex justify-between">
                <Button
                    href="https://blog.prototypr.io/making-design-tokens-a-single-source-of-truth-for-figma-tool-76618abdeb88"
                    size="large"
                    variant="secondary"
                >
                    Learn more
                </Button>
                <Button size="large" variant="primary" onClick={onSetDefaultTokens}>
                    Configure Tokens
                </Button>
            </div>
            <div className="space-x-2 flex justify-between">
                <Input
                    full
                    label="API Secret"
                    value={apiSecret}
                    onChange={handleApiSecretChange}
                    type="text"
                    name="apiSecret"
                    required
                />
                <Input
                    full
                    label="API ID"
                    value={apiID}
                    onChange={handleApiIDChange}
                    type="text"
                    name="apiUrl"
                    required
                />
                <Button size="large" variant="primary" onClick={handleSyncClick}>
                    Set Sync
                </Button>
            </div>
        </div>
    );
};

export default StartScreen;
