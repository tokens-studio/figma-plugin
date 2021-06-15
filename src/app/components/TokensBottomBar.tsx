import {track} from '@/utils/analytics';
import * as React from 'react';
import {useDispatch} from 'react-redux';
import {Dispatch} from '../store';
import ApplySelector from './ApplySelector';

import Button from './Button';

export default function TokensBottomBar() {
    const {updateDocument} = useDispatch<Dispatch>().tokenState;

    const handleUpdate = async () => {
        track('Update Tokens');
        updateDocument();
    };

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white flex justify-between items-center p-2 border-t border-gray-200">
            <ApplySelector />
            <Button variant="primary" size="large" onClick={handleUpdate}>
                Update
            </Button>
        </div>
    );
}
