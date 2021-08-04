import * as React from 'react';
import {useDebouncedCallback} from 'use-debounce';
import {useDispatch, useSelector} from 'react-redux';
import {RootState, Dispatch} from '../store';
import Input from './Input';

const TokenFilter = () => {
    const {tokenFilter} = useSelector((state: RootState) => state.uiState);
    const [tokenString, setTokenString] = React.useState(tokenFilter);
    const dispatch = useDispatch<Dispatch>();

    const debounced = useDebouncedCallback((value) => {
        dispatch.uiState.setTokenFilter(value);
    }, 250);

    const handleChange = (value) => {
        setTokenString(value);
        debounced(value);
    };

    return (
        <div className="flex flex-col flex-grow p-4">
            <Input
                full
                label="Filter tokens"
                placeholder="Filter on name"
                value={tokenString}
                onChange={(e) => handleChange(e.target.value)}
                type="search"
                name="filter"
            />
        </div>
    );
};

export default TokenFilter;
