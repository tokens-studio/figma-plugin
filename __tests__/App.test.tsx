import {render} from '@testing-library/react';
import React from 'react';
import App from '../src/app/components/App';

describe('toggleDone', () => {
    describe('when given an incomplete todo', () => {
        it('marks the todo as completed', () => {
            render(<App />);
            expect(App).toBe(true);
        });
    });
});
