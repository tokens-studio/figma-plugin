import 'core-js/stable';
import 'regenerator-runtime/runtime';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './assets/fonts/jetbrainsmono.css';
import './styles/main.css';
import {ErrorBoundary} from 'react-error-boundary';
import {Provider} from 'react-redux';
import {initializeAnalytics} from '../utils/analytics';
import App from './components/App';
import {TokenProvider} from './store/TokenContext';
import Heading from './components/Heading';
import {store} from './store';

initializeAnalytics();

function ErrorFallback({error}) {
    return (
        <div className="flex items-center flex-col text-center justify-center space-y-4 h-full">
            <Heading>Something went wrong!</Heading>
            <div>
                <div className="text-xs text-gray-600">{error.message}</div>
                <div className="text-xs text-gray-600">Restart the plugin and try again.</div>
            </div>
        </div>
    );
}
ReactDOM.render(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Provider store={store}>
            <TokenProvider>
                <App />
            </TokenProvider>
        </Provider>
    </ErrorBoundary>,
    document.getElementById('app')
);
