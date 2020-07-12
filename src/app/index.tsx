import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './components/App';
import {TokenProvider} from './store/TokenContext';

ReactDOM.render(
    <TokenProvider>
        <App />
    </TokenProvider>,
    document.getElementById('react-page')
);
