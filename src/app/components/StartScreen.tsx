import * as React from 'react';
import JSON5 from 'json5';
import Heading from './Heading';
import Button from './Button';

const defaultJSON = {
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 32,
        xl: 96,
    },
    sizing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 32,
        xl: 96,
    },
    borderRadius: {
        sm: '4',
        lg: '8',
        xl: '16',
    },
    colors: {
        primary: '#18A0FB',
        indigo: '#5c6ac4',
        blue: '#007ace',
        red: '#de3618',
        grey: {
            '100': '#f5f5f5',
            '200': '#eeeeee',
            '300': '#e0e0e0',
            '400': '#bdbdbd',
            '500': '#9e9e9e',
            '600': '#757575',
            '700': '#616161',
            '800': '#424242',
            '900': '#212121',
        },
    },
    opacity: {
        low: '10%',
        md: '50%',
        high: '90%',
    },
};

const StartScreen = ({setActive, setStringTokens}) => {
    const setEmptyTokens = () => {
        setActive('json');
        setStringTokens(JSON5.stringify({}, null, 2));
    };
    const setDefaultTokens = () => {
        setActive('tokens');

        setStringTokens(JSON5.stringify(defaultJSON, null, 2));
    };
    return (
        <div className="my-auto h-auto space-y-4">
            <div>
                <Heading size="small">Welcome to</Heading>
                <Heading>Figma Tokens</Heading>
            </div>
            <div>
                A place to make Tokens A Single Source of Truth. Read more about it{' '}
                <a
                    href="https://blog.prototypr.io/making-design-tokens-a-single-source-of-truth-for-figma-tool-76618abdeb88"
                    target="_blank"
                    rel="noreferrer"
                >
                    here
                </a>
                .
            </div>
            <div className="space-y-2 p-4 bg-gray-300 rounded">
                <p>Seems like you don't have any tokens defined. Start by defining your tokens or use our preset.</p>
                <div className="space-x-2">
                    <Button size="large" variant="secondary" onClick={setEmptyTokens}>
                        Edit JSON
                    </Button>
                    <Button size="large" variant="primary" onClick={setDefaultTokens}>
                        Use Preset
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default StartScreen;
