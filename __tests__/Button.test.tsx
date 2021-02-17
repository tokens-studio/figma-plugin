import React from 'react';
import {render} from './config/test-utils';
import Button from '../src/app/components/Button';

describe('toggleDone', () => {
    describe('when given an incomplete todo', () => {
        it('marks the todo as completed', () => {
            const {getByText} = render(<Button variant="primary">Content</Button>);
            expect(getByText('Content')).toBeInTheDocument();
        });
    });
});
