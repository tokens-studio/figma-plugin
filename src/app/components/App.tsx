import * as React from 'react';
import '../styles/main.css';
import JSONEditor from './JSONEditor';
import Inspector from './Inspector';
import Tokens from './Tokens';
import StartScreen from './StartScreen';
import Heading from './Heading';
import Navbar from './Navbar';
import Icon from './Icon';
import * as pjs from '../../../package.json';
import {useTokenState} from '../store/TokenContext';
import TokenData from './TokenData';

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
    const [active, setActive] = React.useState('start');
    const [remoteComponents, setRemoteComponents] = React.useState([]);

    const {
        state,
        setTokenData,
        setLoading,
        setSelectionValues,
        resetSelectionValues,
        setTokensFromStyles,
    } = useTokenState();

    const onInitiate = () => {
        parent.postMessage({pluginMessage: {type: 'initiate'}}, '*');
    };

    React.useEffect(() => {
        onInitiate();
        window.onmessage = (event) => {
            const {type, values} = event.data.pluginMessage;
            switch (type) {
                case 'selection':
                    setDisabled(false);
                    if (values) {
                        setSelectionValues(values);
                    } else {
                        resetSelectionValues();
                    }
                    break;
                case 'noselection':
                    setDisabled(true);
                    resetSelectionValues();
                    break;
                case 'remotecomponents':
                    setLoading(false);
                    setRemoteComponents(values.remotes);
                    break;
                case 'tokenvalues':
                    setLoading(false);
                    if (values) {
                        setTokenData(new TokenData(values));
                        setActive('tokens');
                    }
                    break;
                case 'styles':
                    setLoading(false);
                    if (values) {
                        setTokensFromStyles(values);
                        setActive('tokens');
                    }
                    break;
                default:
                    break;
            }
        };
    }, []);

    return (
        <>
            {state.loading && (
                <div className="fixed w-full z-20">
                    <div className="flex items-center space-x-2 bg-gray-300 p-2 rounded m-2">
                        <div className="inline-flex rotate">
                            <Icon name="loading" />
                        </div>
                        <div className="font-medium text-xxs">Hold on, updating...</div>
                    </div>
                </div>
            )}
            <div className="h-full flex flex-col">
                <div className="flex-grow flex flex-col">
                    {active !== 'start' && <Navbar active={active} setActive={setActive} />}
                    {remoteComponents.length > 0 && (
                        <div className="p-4">
                            <Heading size="small">Unable to update remote components</Heading>
                            {remoteComponents.map((comp) => (
                                <button
                                    type="button"
                                    className="p-2 text-xxs font-medium bg-gray-100"
                                    onClick={() => goToNodeId(comp.id)}
                                >
                                    {comp.id}
                                </button>
                            ))}
                        </div>
                    )}
                    {active === 'start' && !state.loading && <StartScreen setActive={setActive} />}
                    {active === 'tokens' && <Tokens disabled={disabled} />}
                    {active === 'json' && <JSONEditor />}
                    {active === 'inspector' && <Inspector />}
                </div>
                <div className="p-4 flex-shrink-0 flex items-center justify-between">
                    <div className="text-gray-600 text-xxs">Figma Tokens {pjs.version}</div>
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
