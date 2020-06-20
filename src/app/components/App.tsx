import * as React from 'react';
import '../styles/main.css';
import objectPath from 'object-path';
import JSON5 from 'json5';
import JSONEditor from './JSONEditor';
import Inspector from './Inspector';
import Tokens from './Tokens';
import StartScreen from './StartScreen';
import Heading from './Heading';
import Navbar from './Navbar';
import Icon from './Icon';

interface SelectionValue {
    borderRadius: string | undefined;
    horizontalPadding: string | undefined;
    verticalPadding: string | undefined;
    itemSpacing: string | undefined;
}

// interface Target {
//     property: string | undefined;
//     name: string | undefined;
// }

const goToNodeId = (id) => {
    parent.postMessage(
        {
            pluginMessage: {
                type: 'gotonode',
                id,
            },
        },
        '*'
    );
};

const App = () => {
    const [disabled, setDisabled] = React.useState(false);
    const [selectionValues, setSelectionValues] = React.useState<SelectionValue>({} as SelectionValue);
    // const [target, setTarget] = React.useState<Target>({} as Target);
    const [active, setActive] = React.useState('start');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [remoteComponents, setRemoteComponents] = React.useState([]);
    const [tokens, setTokens] = React.useState({});

    const [stringTokens, setStringTokens] = React.useState(JSON.stringify(tokens, null, 4));

    React.useEffect(() => {
        let newTokensFromString;
        try {
            newTokensFromString = JSON5.parse(stringTokens);
            setError('');
        } catch (e) {
            console.log({e}, stringTokens);
            setError('Invalid JSON');
        }
        if (newTokensFromString) {
            setTokens(newTokensFromString);
        }
    }, [stringTokens]);

    const onUpdate = () => {
        setLoading(true);
        setTimeout(() => {
            parent.postMessage(
                {
                    pluginMessage: {
                        type: 'update',
                        values: selectionValues,
                        tokens,
                    },
                },
                '*'
            );
        }, 100);
    };

    const onSetNodeData = (data = {}) => {
        setLoading(true);
        setTimeout(() => {
            parent.postMessage(
                {
                    pluginMessage: {
                        type: 'set-node-data',
                        values: {
                            ...selectionValues,
                            ...data,
                        },
                        tokens,
                    },
                },
                '*'
            );
        }, 100);
    };

    const removeTokenValues = () => {
        setLoading(true);
        setTimeout(() => {
            parent.postMessage(
                {
                    pluginMessage: {
                        type: 'remove-node-data',
                    },
                },
                '*'
            );
        }, 100);
    };

    const createStyles = () => {
        setTimeout(() => {
            parent.postMessage(
                {
                    pluginMessage: {
                        type: 'create-styles',
                        tokens,
                    },
                },
                '*'
            );
        }, 100);
    };

    const onInitiate = () => {
        parent.postMessage({pluginMessage: {type: 'initiate'}}, '*');
    };

    function setSingleTokenValue({name, token}) {
        const obj = tokens;
        objectPath.set(obj, name, token);
        setStringTokens(JSON5.stringify(obj, null, 2));
    }

    function handlesetStringTokens(val) {
        setStringTokens(val);
    }

    function setPluginValue(value) {
        setSelectionValues((prevState) => {
            const newPluginValue = {
                ...prevState,
                ...value,
            };
            onSetNodeData(newPluginValue);
            return {...newPluginValue};
        });
    }

    React.useEffect(() => {
        onInitiate();
        window.onmessage = (event) => {
            const {type, values} = event.data.pluginMessage;
            if (type === 'selection') {
                setDisabled(false);
                if (values) {
                    setSelectionValues(values);
                } else {
                    setSelectionValues({} as SelectionValue);
                }
            } else if (type === 'noselection') {
                setDisabled(true);
                setSelectionValues({} as SelectionValue);
            } else if (type === 'remotecomponents') {
                setLoading(false);
                setRemoteComponents(values.remotes);
            } else if (type === 'tokenvalues') {
                setLoading(false);
                if (values) {
                    setStringTokens(JSON.stringify(values, null, 2));
                    setActive('tokens');
                }
            }
        };
    }, []);

    return (
        <>
            {loading && (
                <div className="fixed w-full z-20">
                    <div className="flex items-center space-x-2 bg-gray-300 p-2 rounded m-2">
                        <div className="inline-flex rotate">
                            <Icon name="loading" />
                        </div>
                        <div className="font-bold text-xxs">Hold on, updating...</div>
                    </div>
                </div>
            )}
            <div className="h-full flex flex-col">
                <div className="flex-grow flex flex-col space-y-4 p-4">
                    {active !== 'start' && <Navbar active={active} setActive={setActive} />}
                    {remoteComponents.length > 0 && (
                        <div>
                            <Heading size="small">Unable to update remote components</Heading>
                            {remoteComponents.map((comp) => (
                                <button
                                    type="button"
                                    className="p-2 text-xxs font-bold bg-gray-100"
                                    onClick={() => goToNodeId(comp.id)}
                                >
                                    {comp.id}
                                </button>
                            ))}
                        </div>
                    )}
                    {active === 'start' && !loading && (
                        <StartScreen setActive={setActive} setStringTokens={setStringTokens} />
                    )}
                    {active === 'tokens' && (
                        <Tokens
                            disabled={disabled}
                            setSingleTokenValue={setSingleTokenValue}
                            setPluginValue={setPluginValue}
                            tokens={tokens}
                            onUpdate={onUpdate}
                            selectionValues={selectionValues}
                            createStyles={createStyles}
                        />
                    )}
                    {active === 'json' && (
                        <JSONEditor
                            handlesetStringTokens={handlesetStringTokens}
                            stringTokens={stringTokens}
                            error={error}
                            onUpdate={onUpdate}
                        />
                    )}
                    {active === 'inspector' && (
                        <Inspector
                            tokens={tokens}
                            removeTokenValues={removeTokenValues}
                            selectionValues={selectionValues}
                        />
                    )}
                </div>
                <div className="p-4 flex-shrink-0 flex items-center justify-between">
                    <div className="text-gray-600 text-xxs">Figma Tokens 0.1.0</div>
                    <div className="text-gray-600 text-xxs">
                        <a
                            className="flex items-center"
                            href="https://github.com/six7/figma-tokens"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <span className="mr-1">Feedback / Issues</span>
                            <Icon name="github" />
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default App;
