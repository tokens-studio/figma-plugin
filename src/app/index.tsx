import 'core-js/stable';
import 'regenerator-runtime/runtime';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './assets/fonts/jetbrainsmono.css';
import './styles/main.css';
import {ErrorBoundary} from 'react-error-boundary';
import {initializeAnalytics} from '../utils/analytics';
import App from './components/App';
import {TokenProvider, useTokenDispatch} from './store/TokenContext';
import Heading from './components/Heading';
import Button from './components/Button';

initializeAnalytics();

function ErrorFallback({error}) {
    const {setEmptyTokens} = useTokenDispatch();

    return (
        <div className="flex items-center flex-col text-center justify-center space-y-4 h-full">
            <Heading>Something went wrong!</Heading>
            <div>
                <div className="text-xs text-gray-600">{error.message}</div>
                <div className="text-xs text-gray-600">Restart the plugin and try again.</div>
                <Button variant="destructive" onClick={() => setEmptyTokens()}>
                    Reset all values
                </Button>
            </div>
        </div>
    );
}
ReactDOM.render(
    <TokenProvider>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <App />
        </ErrorBoundary>
    </TokenProvider>,
    document.getElementById('app')
);
