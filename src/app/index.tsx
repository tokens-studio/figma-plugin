import 'core-js/stable';
import 'regenerator-runtime/runtime';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './assets/fonts/jetbrainsmono.css';
import './styles/main.css';
import {initializeAnalytics} from '../utils/analytics';
import App from './components/App';
import {TokenProvider} from './store/TokenContext';

initializeAnalytics();

ReactDOM.render(
    <TokenProvider>
        <App />
    </TokenProvider>,
    document.getElementById('react-page')
);
