import * as React from 'react';
import {useSelector} from 'react-redux';
import JSONEditor from './JSONEditor';
import SyncSettings from './SyncSettings';
import Inspector from './Inspector';
import Tokens from './Tokens';
import StartScreen from './StartScreen';
import Heading from './Heading';
import Navbar from './Navbar';
import {goToNodeId} from './utils';
import LoadingBar from './LoadingBar';
import Footer from './Footer';
import Initiator from './Initiator';
import Changelog from './Changelog';
import {RootState} from '../store';

const App = () => {
    const [remoteComponents, setRemoteComponents] = React.useState([]);
    const activeTab = useSelector((state: RootState) => state.base.activeTab);

    return (
        <>
            <Initiator setRemoteComponents={setRemoteComponents} />
            <LoadingBar />
            <div className="h-full flex flex-col">
                <div className="flex-grow flex flex-col">
                    {activeTab !== 'start' && <Navbar />}
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
                    {activeTab === 'start' && <StartScreen />}
                    {activeTab === 'tokens' && <Tokens />}
                    {activeTab === 'json' && <JSONEditor />}
                    {activeTab === 'inspector' && <Inspector />}
                    {activeTab === 'syncsettings' && <SyncSettings />}
                </div>
                <Footer />
                <Changelog />
            </div>
        </>
    );
};

export default App;
