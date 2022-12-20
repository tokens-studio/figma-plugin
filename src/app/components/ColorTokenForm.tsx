import React, { useCallback } from 'react';
import { useUIDSeed } from 'react-uid';
import IconPlus from '@/icons/plus.svg';
import IconMinus from '@/icons/minus.svg';
import { EditTokenObject } from '@/types/tokens';
import Heading from './Heading';
import IconButton from './IconButton';
import Box from './Box';
import { TokenTypes } from '@/constants/TokenTypes';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import DownshiftInput from './DownshiftInput';
import ColorPicker from './ColorPicker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
} from './DropdownMenu';
import { checkIfContainsAlias, getAliasValue } from '@/utils/alias';
import { DropdownMenuRadioElement } from './DropdownMenuRadioElement';
import IconToggleableDisclosure from './IconToggleableDisclosure';
import { StyledPrefix, StyledInput } from './Input';
import { getLabelForProperty } from '@/utils/getLabelForProperty';

const operations = ['Lighten', 'Darken', 'Mix', 'Alpha'];
const colorSpaces = ['LCH', 'sRGB', 'P3'];

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
  const [operationMenuOpened, setOperationMenuOpened] = React.useState(false);
  const [colorSpaceMenuOpened, setColorSpaceMenuOpened] = React.useState(false);
  const [currentOperation, setCurrentOperation] = React.useState(operations[0]);
  const [currentColorSpace, setCurrentColorSpace] = React.useState(colorSpaces[0]);
  const handleToggleInputHelper = React.useCallback(() => {
    setInputHelperOpen(!inputHelperOpen);
  }, [inputHelperOpen]);

  const handleColorValueChange = React.useCallback((color: string) => {
    handleColorDownShiftInputChange(color);
  }, [handleColorDownShiftInputChange]);

  const addModify = useCallback(() => {
  }, [internalEditToken]);

  const removeToken = useCallback(() => {
  }, [internalEditToken]);

  const handleOperationToggleMenu = useCallback(() => {
    setOperationMenuOpened(!operationMenuOpened);
  }, [operationMenuOpened]);

  const handleColorSpaceToggleMenu = useCallback(() => {
    setColorSpaceMenuOpened(!colorSpaceMenuOpened);
  }, [colorSpaceMenuOpened]);

  const onOperationSelected = useCallback((operation: string) => {
    setCurrentOperation(operation);
  }, []);

  const onColorSpaceSelected = useCallback((colorSpace: string) => {
    setCurrentColorSpace(colorSpace);
  }, []);

  const handleModifyValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  }, []);

  const getIconComponent = React.useMemo(() => getLabelForProperty(currentOperation), [currentOperation]);

  return (
    <>
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
      <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Heading size="xsmall">Modify</Heading>
        <IconButton
          tooltip="Add a new modify"
          dataCy="button-add-new-modify"
          onClick={addModify}
          icon={<IconPlus />}
        />
        <IconButton
          tooltip="Remove this style"
          dataCy="button-style-remove-multiple"
          onClick={removeToken}
          icon={<IconMinus />}
        />
      </Box>
      <Box css={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '$3',
        '& > .relative ': {
          flex: '2',
        },
      }}
      >
        <DropdownMenu open={operationMenuOpened} onOpenChange={handleOperationToggleMenu}>
          <DropdownMenuTrigger
            data-cy="colortokenform-operation-selector"
            bordered
            css={{
              flex: 1, height: '$10', display: 'flex', justifyContent: 'space-between',
            }}
          >
            <span>{currentOperation || 'Choose a operation'}</span>
            <IconToggleableDisclosure />
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={2} className="content scroll-container" css={{ maxHeight: '$dropdownMaxHeight' }}>
            <DropdownMenuRadioGroup value={currentOperation}>
              {operations.map((operation, index) => <DropdownMenuRadioElement key={`operation-${seed(index)}`} item={operation} index={index} itemSelected={onOperationSelected} />)}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu open={colorSpaceMenuOpened} onOpenChange={handleColorSpaceToggleMenu}>
          <DropdownMenuTrigger
            data-cy="colortokenform-colorspace-selector"
            bordered
            css={{
              flex: 1, height: '$10', display: 'flex', justifyContent: 'space-between',
            }}
          >
            <span>{currentColorSpace || 'Choose a color space'}</span>
            <IconToggleableDisclosure />
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={2} className="content scroll-container" css={{ maxHeight: '$dropdownMaxHeight' }}>
            <DropdownMenuRadioGroup value={currentColorSpace}>
              {colorSpaces.map((colorSpace, index) => <DropdownMenuRadioElement key={`colorspace-${seed(index)}`} item={colorSpace} index={index} itemSelected={onColorSpaceSelected} />)}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </Box>
      <Box css={{ display: 'flex', position: 'relative', width: '100%' }} className="input">
        <StyledPrefix isText>{getIconComponent}</StyledPrefix>
        <StyledInput />
      </Box>
      {checkIfContainsAlias(internalEditToken.value) && (
      <div className="flex p-2 mt-2 font-mono text-gray-700 bg-gray-100 border-gray-300 rounded text-xxs itms-center">
        {internalEditToken.type === 'color' ? (
          <div className="w-4 h-4 mr-1 border border-gray-200 rounded" style={{ background: String(resolvedValue) }} />
        ) : null}
        {resolvedValue?.toString()}
      </div>
      )}
    </>
  );
}
