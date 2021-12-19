/* eslint-disable jsx-a11y/label-has-associated-control */
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Checkbox from './Checkbox';
import Heading from './Heading';
import { RootState, Dispatch } from '../store';
import Label from './Label';

function SyncSettings() {
  const { ignoreFirstPartForStyles } = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch<Dispatch>();

  const handleIgnoreChange = (bool) => {
    dispatch.settings.setIgnoreFirstPartForStyles(bool);
  };

  return (
    <div className="flex flex-col flex-grow">
      <div className="p-4 space-y-4 border-b">
        <div className="space-y-4">
          <Heading>Styles</Heading>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ignoreFirstPartForStyles"
                checked={ignoreFirstPartForStyles}
                defaultChecked={ignoreFirstPartForStyles}
                onCheckedChange={handleIgnoreChange}
              />
              <Label htmlFor="ignoreFirstPartForStyles">Ignore first part of token name for styles</Label>
            </div>
            <div className="text-xs">
              If active a token named
              {' '}
              <code className="p-1 -m-1 font-bold">colors.primary.500</code>
              {' '}
              will
              become a color style of name
              <code className="p-1 -m-1 font-bold">primary/500</code>
              . Since
              Version 53 you no longer need to prepend type to token names.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SyncSettings;
