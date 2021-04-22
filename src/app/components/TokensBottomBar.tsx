import {track} from '@/utils/analytics';
import * as React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Dispatch, RootState} from '../store';

import Button from './Button';

export default function TokensBottomBar() {
    const {updatePageOnly} = useSelector((state: RootState) => state.settings);
    const {setUpdatePageOnly} = useDispatch<Dispatch>().settings;
    const {updateDocument} = useDispatch<Dispatch>().tokenState;

    const handleUpdate = async () => {
        track('Update Tokens');
        updateDocument();
    };

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white flex justify-between items-center p-2 border-t border-gray-200">
            <div className="switch flex items-center">
                <input
                    className="switch__toggle"
                    type="checkbox"
                    id="updatemode"
                    checked={updatePageOnly}
                    onChange={() => setUpdatePageOnly(!updatePageOnly)}
                />
                <label className="switch__label text-xs" htmlFor="updatemode">
                    Update this page only
                </label>
            </div>
            <Button variant="primary" size="large" onClick={handleUpdate}>
                Update {updatePageOnly ? 'page' : 'document'}
            </Button>
        </div>
    );
}
