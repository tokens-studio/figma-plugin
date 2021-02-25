import * as React from 'react';
import '../styles/main.css';
import JSONEditor from './JSONEditor';
import Settings from './Settings';
import Inspector from './Inspector';
import Tokens from './Tokens';
import StartScreen from './StartScreen';
import Heading from './Heading';
import Navbar from './Navbar';
import {goToNodeId} from './utils';
import LoadingBar from './LoadingBar';
import Footer from './Footer';
import Initiator from './Initiator';

const App = () => {
    const [active, setActive] = React.useState('start');
    const [remoteComponents, setRemoteComponents] = React.useState([]);

    return (
        <>
            <Initiator setActive={setActive} setRemoteComponents={setRemoteComponents} />
            <LoadingBar />
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
                    {active === 'start' && <StartScreen setActive={setActive} />}
                    {active === 'tokens' && <Tokens />}
                    {active === 'json' && <JSONEditor />}
                    {active === 'settings' && <Settings />}
                    {active === 'inspector' && <Inspector />}
                </div>
                <Footer active={active} />
            </div>
        </>
    );
};

export default App;
