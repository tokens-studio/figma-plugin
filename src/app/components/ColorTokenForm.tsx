import React, { useCallback, useMemo } from 'react';
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
import { ColorModifier, MixModifier } from '@/types/Modifier';
import { ColorModifierTypes } from '@/constants/ColorModifierTypes';
import { ColorSpaceTypes } from '@/constants/ColorSpaceTypes';
import { modifyColor } from '@/utils/modifyColor';
import { convertModifiedColorToHex } from '@/utils/convertModifiedColorToHex';

const defaultValue = '0';

export default function ColorTokenForm({
  internalEditToken,
  resolvedTokens,
  resolvedValue,
  handleColorChange,
  handleColorDownShiftInputChange,
  handleColorModifyChange,
  handleRemoveColorModify,
}: {
  internalEditToken: Extract<EditTokenObject, { type: TokenTypes.COLOR }>;
  resolvedTokens: ResolveTokenValuesResult[];
  resolvedValue: ReturnType<typeof getAliasValue>
  handleColorChange: React.ChangeEventHandler;
  handleColorDownShiftInputChange: (newInputValue: string) => void;
  handleColorModifyChange: (newModify: ColorModifier) => void;
  handleRemoveColorModify: () => void;
}) {
  const seed = useUIDSeed();
  const [inputHelperOpen, setInputHelperOpen] = React.useState(false);
  const [inputMixHelperOpen, setInputMixHelperOpen] = React.useState(false);
  const [operationMenuOpened, setOperationMenuOpened] = React.useState(false);
  const [colorSpaceMenuOpened, setColorSpaceMenuOpened] = React.useState(false);
  const [modifyVisible, setModifyVisible] = React.useState(false);

  React.useEffect(() => {
    if (internalEditToken?.$extensions?.['studio.tokens']?.modify) {
      setModifyVisible(true);
    }
  }, [internalEditToken]);

  const resolvedMixValue = React.useMemo(() => {
    if (internalEditToken?.$extensions?.['studio.tokens']?.modify?.type === ColorModifierTypes.MIX && internalEditToken?.$extensions?.['studio.tokens']?.modify?.color) {
      return typeof internalEditToken?.$extensions?.['studio.tokens']?.modify?.color === 'string'
        ? getAliasValue(internalEditToken?.$extensions?.['studio.tokens']?.modify?.color, resolvedTokens)
        : null;
    }
    return null;
  }, [internalEditToken, resolvedTokens]);

  const modifiedColor = useMemo(() => {
    if (resolvedValue) {
      if (internalEditToken?.$extensions?.['studio.tokens']?.modify) {
        const modifierType = internalEditToken?.$extensions?.['studio.tokens']?.modify?.type;
        if (modifierType === ColorModifierTypes.LIGHTEN || modifierType === ColorModifierTypes.DARKEN || modifierType === ColorModifierTypes.ALPHA) {
          return modifyColor(String(resolvedValue), internalEditToken?.$extensions?.['studio.tokens']?.modify);
        }
        if (modifierType === ColorModifierTypes.MIX && resolvedMixValue) {
          return modifyColor(String(resolvedValue), { ...internalEditToken?.$extensions?.['studio.tokens']?.modify, color: String(resolvedMixValue) });
        }
        return resolvedValue;
      }
      return resolvedValue;
    }
    return null;
  }, [internalEditToken, resolvedValue, resolvedMixValue]);

  const displayColor = useMemo(() => {
    if (resolvedValue) {
      if (internalEditToken?.$extensions?.['studio.tokens']?.modify) {
        const modifierType = internalEditToken?.$extensions?.['studio.tokens']?.modify?.type;
        if (modifierType === ColorModifierTypes.LIGHTEN || modifierType === ColorModifierTypes.DARKEN || modifierType === ColorModifierTypes.ALPHA) {
          return convertModifiedColorToHex(String(resolvedValue), internalEditToken?.$extensions?.['studio.tokens']?.modify);
        }
        if (modifierType === ColorModifierTypes.MIX && resolvedMixValue) {
          return convertModifiedColorToHex(String(resolvedValue), { ...internalEditToken?.$extensions?.['studio.tokens']?.modify, color: String(resolvedMixValue) });
        }
        return resolvedValue;
      }
      return resolvedValue;
    }
    return null;
  }, [internalEditToken, resolvedValue, resolvedMixValue]);

  const handleToggleInputHelper = useCallback(() => {
    setInputHelperOpen(!inputHelperOpen);
  }, [inputHelperOpen]);

  const handleToggleMixInputHelper = useCallback(() => {
    setInputMixHelperOpen(!inputMixHelperOpen);
  }, [inputMixHelperOpen]);

  const handleColorValueChange = useCallback((color: string) => {
    handleColorDownShiftInputChange(color);
  }, [handleColorDownShiftInputChange]);

  const handleModifyChange = React.useCallback((newModify: ColorModifier) => {
    handleColorModifyChange(newModify);
  }, [handleColorModifyChange]);

  const addModify = useCallback(() => {
    handleModifyChange({
      type: ColorModifierTypes.LIGHTEN,
      value: defaultValue,
      space: ColorSpaceTypes.LCH,
    });
  }, [handleModifyChange]);

  const removeModify = useCallback(() => {
    setModifyVisible(false);
    handleRemoveColorModify();
  }, [handleRemoveColorModify]);

  const handleOperationToggleMenu = useCallback(() => {
    setOperationMenuOpened(!operationMenuOpened);
  }, [operationMenuOpened]);

  const handleColorSpaceToggleMenu = useCallback(() => {
    setColorSpaceMenuOpened(!colorSpaceMenuOpened);
  }, [colorSpaceMenuOpened]);

  const onOperationSelected = useCallback((operation: string) => {
    if (internalEditToken?.$extensions?.['studio.tokens']?.modify) {
      handleModifyChange({
        ...internalEditToken?.$extensions?.['studio.tokens']?.modify,
        type: operation,
      } as ColorModifier);
    }
  }, [internalEditToken, handleModifyChange]);

  const onColorSpaceSelected = useCallback((colorSpace: string) => {
    if (internalEditToken?.$extensions?.['studio.tokens']?.modify) {
      handleModifyChange({
        ...internalEditToken?.$extensions?.['studio.tokens']?.modify,
        space: colorSpace,
      } as ColorModifier);
    }
  }, [internalEditToken, handleModifyChange]);

  const handleModifyValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (internalEditToken?.$extensions?.['studio.tokens']?.modify) {
      handleModifyChange({
        ...internalEditToken?.$extensions?.['studio.tokens']?.modify,
        value: e.target.value.replace(/[^.\d]/g, '').replace(/^(\d*\.?)|(\d*)\.?/g, '$1$2').replace(/^\./, ''), // accept only number
      });
    }
  }, [internalEditToken, handleModifyChange]);

  const handleMixColorChange = useCallback((mixColor: string) => {
    if (internalEditToken?.$extensions?.['studio.tokens']?.modify) {
      handleModifyChange({
        ...internalEditToken?.$extensions?.['studio.tokens']?.modify,
        color: mixColor,
      } as MixModifier);
    }
  }, [internalEditToken, handleModifyChange]);

  const handleMixColorInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (internalEditToken?.$extensions?.['studio.tokens']?.modify) {
      handleModifyChange({
        ...internalEditToken?.$extensions?.['studio.tokens']?.modify,
        color: e.target.value,
      } as MixModifier);
    }
  }, [internalEditToken, handleModifyChange]);

  const getIconComponent = React.useMemo(() => getLabelForProperty(internalEditToken?.$extensions?.['studio.tokens']?.modify?.type || 'Amount'), [internalEditToken]);

  return (
    <>
      <DownshiftInput
        value={internalEditToken.value}
        type={TokenTypes.COLOR}
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
            style={{ background: String(resolvedValue), fontSize: 0 }}
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
        {
          !modifyVisible ? (
            <IconButton
              tooltip="Add a new modify"
              dataCy="button-add-new-modify"
              onClick={addModify}
              icon={<IconPlus />}
            />
          ) : (
            <IconButton
              tooltip="Remove the modify"
              dataCy="button-remove=modify"
              onClick={removeModify}
              icon={<IconMinus />}
            />
          )
        }
      </Box>
      {
        modifyVisible && (
          <>
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
                  <span>{internalEditToken?.$extensions?.['studio.tokens']?.modify?.type || 'Choose a operation'}</span>
                  <IconToggleableDisclosure />
                </DropdownMenuTrigger>
                <DropdownMenuContent sideOffset={2} className="content scroll-container" css={{ maxHeight: '$dropdownMaxHeight' }}>
                  <DropdownMenuRadioGroup value={internalEditToken?.$extensions?.['studio.tokens']?.modify?.type}>
                    {Object.values(ColorModifierTypes).map((operation, index) => <DropdownMenuRadioElement key={`operation-${seed(index)}`} item={operation} index={index} itemSelected={onOperationSelected} />)}
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
                  <span>{internalEditToken?.$extensions?.['studio.tokens']?.modify?.space || 'Choose a color space'}</span>
                  <IconToggleableDisclosure />
                </DropdownMenuTrigger>
                <DropdownMenuContent sideOffset={2} className="content scroll-container" css={{ maxHeight: '$dropdownMaxHeight' }}>
                  <DropdownMenuRadioGroup value={internalEditToken?.$extensions?.['studio.tokens']?.modify?.space}>
                    {Object.values(ColorSpaceTypes).map((colorSpace, index) => <DropdownMenuRadioElement key={`colorspace-${seed(index)}`} item={colorSpace} index={index} itemSelected={onColorSpaceSelected} />)}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </Box>
            {
              internalEditToken?.$extensions?.['studio.tokens']?.modify?.type === ColorModifierTypes.MIX && (
                <>
                  <DownshiftInput
                    value={internalEditToken?.$extensions?.['studio.tokens']?.modify?.color}
                    type={TokenTypes.COLOR}
                    resolvedTokens={resolvedTokens}
                    handleChange={handleMixColorInputChange}
                    setInputValue={handleMixColorChange}
                    placeholder="#000000, hsla(), rgba() or {alias}"
                    prefix={(
                      <button
                        type="button"
                        className="block w-4 h-4 rounded-sm cursor-pointer shadow-border shadow-gray-300 focus:shadow-focus focus:shadow-primary-400"
                        style={{ background: String(resolvedMixValue), fontSize: 0 }}
                        onClick={handleToggleMixInputHelper}
                      >
                        {internalEditToken?.$extensions?.['studio.tokens']?.modify?.color}
                      </button>
                    )}
                    suffix
                  />
                  {inputMixHelperOpen && (
                    <ColorPicker value={internalEditToken?.$extensions?.['studio.tokens']?.modify?.color} onChange={handleMixColorChange} />
                  )}
                </>
              )
            }
            <Box css={{ display: 'flex', position: 'relative', width: '100%' }} className="input">
              <StyledPrefix isText>{getIconComponent}</StyledPrefix>
              <StyledInput onChange={handleModifyValueChange} value={internalEditToken?.$extensions?.['studio.tokens']?.modify?.value} required />
            </Box>
          </>
        )
      }
      {(checkIfContainsAlias(internalEditToken.value) || internalEditToken?.$extensions?.['studio.tokens']?.modify) && (
      <div className="flex p-2 mt-2 font-mono text-gray-700 bg-gray-100 border-gray-300 rounded text-xxs itms-center">
        {internalEditToken.type === 'color' ? (
          <div className="w-4 h-4 mr-1 border border-gray-200 rounded" style={{ background: String(displayColor) }} />
        ) : null}
        {modifiedColor?.toString()}
      </div>
      )}
    </>
  );
}
