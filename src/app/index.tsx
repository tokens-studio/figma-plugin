import 'core-js/stable';
import 'regenerator-runtime/runtime';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './assets/fonts/jetbrainsmono.css';
import './styles/main.css';
import * as Sentry from '@sentry/react';
import {initializeAnalytics} from '../utils/analytics';
import App from './components/App';
import {TokenProvider} from './store/TokenContext';
import Heading from './components/Heading';

initializeAnalytics();

Sentry.init({
    dsn: 'https://26bac1a4b1ba4d91bc9420d10d95bb3e@o386310.ingest.sentry.io/5220409',
    release: `figma-tokens@${process.env.npm_package_version}`,
    environment: process.env.ENVIRONMENT,
});

function ErrorFallback({error}) {
    return (
        <div className="flex items-center flex-col text-center justify-center space-y-4 h-full">
            <Heading>Something went wrong!</Heading>
            <div className="space-y-2">
                <div className="text-xs text-gray-600">{error.message}</div>
                <div className="text-xs text-gray-600">Restart the plugin and try again.</div>
            </div>
        </div>
    );
}

ReactDOM.render(
    <Sentry.ErrorBoundary fallback={ErrorFallback}>
        <TokenProvider>
            <App />
        </TokenProvider>
    </Sentry.ErrorBoundary>,
    document.getElementById('app')
);
