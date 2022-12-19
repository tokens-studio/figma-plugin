import React, { useCallback } from 'react';
import { useUIDSeed } from 'react-uid';
import IconPlus from '@/icons/plus.svg';
import IconMinus from '@/icons/minus.svg';
import { EditTokenObject } from '@/types/tokens';
import Heading from './Heading';
import IconButton from './IconButton';
import Box from './Box';
import SingleCompositionTokenForm from './SingleCompositionTokenForm';
import { TokenTypes } from '@/constants/TokenTypes';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import DownshiftInput from './DownshiftInput';
import ColorPicker from './ColorPicker';
import { checkIfContainsAlias, getAliasValue } from '@/utils/alias';

export default function ColorTokenForm({
  internalEditToken,
  resolvedTokens,
  resolvedValue,
  handleColorChange,
  handleColorDownShiftInputChange,
}: {
  internalEditToken: Extract<EditTokenObject, { type: TokenTypes.COLOR }>;
  resolvedTokens: ResolveTokenValuesResult[];
  resolvedValue: ReturnType<typeof getAliasValue>
  handleColorChange: React.ChangeEventHandler;
  handleColorDownShiftInputChange: (newInputValue: string) => void ;
}) {
  const seed = useUIDSeed();
  const [inputHelperOpen, setInputHelperOpen] = React.useState(false);

  const handleToggleInputHelper = React.useCallback(() => {
    setInputHelperOpen(!inputHelperOpen);
  }, [inputHelperOpen]);

  const handleColorValueChange = React.useCallback((color: string) => {
    handleColorDownShiftInputChange(color);
  }, [handleColorDownShiftInputChange]);

  const addToken = useCallback(() => {
  }, [internalEditToken]);

  const removeToken = useCallback((property: string) => {
  }, [internalEditToken]);

  return (
    <>
      <Box>
        <DownshiftInput
          value={internalEditToken.value}
          type={internalEditToken.type}
          label={internalEditToken.schema?.property}
          resolvedTokens={resolvedTokens}
          initialName={internalEditToken.initialName}
          handleChange={handleColorChange}
          setInputValue={handleColorDownShiftInputChange}
          placeholder="#000000, hsla(), rgba() or {alias}"
          prefix={(
            <button
              type="button"
              className="block w-4 h-4 rounded-sm cursor-pointer shadow-border shadow-gray-300 focus:shadow-focus focus:shadow-primary-400"
              style={{ background: internalEditToken.value, fontSize: 0 }}
              onClick={handleToggleInputHelper}
            >
              {internalEditToken.value}
            </button>
                )}
          suffix
        />

        {inputHelperOpen && (
          <ColorPicker value={internalEditToken.value} onChange={handleColorValueChange} />
        )}
        {checkIfContainsAlias(internalEditToken.value) && (
          <div className="flex p-2 mt-2 font-mono text-gray-700 bg-gray-100 border-gray-300 rounded text-xxs itms-center">
            {internalEditToken.type === 'color' ? (
              <div className="w-4 h-4 mr-1 border border-gray-200 rounded" style={{ background: String(resolvedValue) }} />
            ) : null}
            {resolvedValue?.toString()}
          </div>
        )}
      </Box>
      <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Heading size="small">Modify</Heading>
        <IconButton
          tooltip="Add a new modify"
          dataCy="button-add-new-modify"
          onClick={addToken}
          icon={<IconPlus />}
        />
      </Box>
      <Box css={{ display: 'flex', flexDirection: 'column', gap: '$4' }} />
    </>
  );
}
