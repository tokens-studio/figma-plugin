import 'core-js/stable';
import 'regenerator-runtime/runtime';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './assets/fonts/jetbrainsmono.css';
import './styles/main.css';
import mixpanel from './mixpanel';
import App from './components/App';
import {TokenProvider} from './store/TokenContext';

mixpanel.init('7188054c3b084e6aa9db44ab9bf52747', {
    disable_cookie: true,
    disable_persistence: true,
    api_host: 'https://api-eu.mixpanel.com',
});

ReactDOM.render(
    <TokenProvider>
        <App />
    </TokenProvider>,
    document.getElementById('react-page')
);
