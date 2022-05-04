import React, { useState, useCallback } from 'react';
import {
  DndProvider, useDrop, useDrag, DropTargetMonitor,
} from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { XYCoord } from 'dnd-core';
import debounce from 'lodash.debounce';
import { TokensIcon, LinkBreak2Icon } from '@radix-ui/react-icons';
import { useUIDSeed } from 'react-uid';
import { ShadowTokenSingleValue } from '@/types/propertyTypes';
import { checkIfContainsAlias } from '@/utils/alias';
import { findReferences } from '@/utils/findReferences';
import IconMinus from '@/icons/minus.svg';
import IconPlus from '@/icons/plus.svg';
import IconGrabber from '@/icons/grabber.svg';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import { EditTokenObject } from '../store/models/uiState';
import Heading from './Heading';
import IconButton from './IconButton';
import ColorPicker from './ColorPicker';
import Select from './Select';
import Box from './Box';
import ResolvedValueBox from './ResolvedValueBox';
import DownshiftInput from './DownshiftInput';
import { StyledIconDisclosure, StyledInputSuffix } from './StyledInputSuffix'
import { TokenBoxshadowValue } from '@/types/values';
interface DragItem {
  index: number;
  id: string;
  type: string;
};

enum ItemTypes {
  CARD = 'card',
};

const newToken: ShadowTokenSingleValue = {
  x: '0', y: '0', blur: '0', spread: '0', color: '#000000', type: 'dropShadow',
};

const propertyTypes = {
  x: 'sizing',
  y: 'sizing',
  blur: 'sizing',
  spread: 'sizing',
  color: 'color',
};

function SingleShadowInput({
  value,
  isMultiple = false,
  shadowItem,
  index,
  handleBoxShadowChange,
  onRemove,
  id,
  resolvedTokens,
  handleToggleInputHelper,
  inputHelperOpen
}: {
  value: TokenBoxshadowValue | TokenBoxshadowValue[];
  isMultiple?: boolean;
  shadowItem: TokenBoxshadowValue;
  index: number;
  handleBoxShadowChange: (shadow: TokenBoxshadowValue | TokenBoxshadowValue[]) => void;
  onRemove: (index: number) => void;
  id: string;
  resolvedTokens: ResolveTokenValuesResult[];
  handleToggleInputHelper: () => void;
  inputHelperOpen: boolean;
}) {
  const defalutShowAutoSuggest = React.useMemo(() => {
    if (shadowItem && typeof shadowItem === 'object') {
      return Object.entries(shadowItem).map((property) => {
        return false;
      }, {});
    }
    return [false];
  }, [shadowItem]);

  const [showAutoSuggest, setShowAutoSuggest] = React.useState<Array<boolean>>(defalutShowAutoSuggest);

  const handleAutoSuggest = React.useCallback((index: number) => {
    const newShowAutoSuggest = [...showAutoSuggest];
    newShowAutoSuggest[index] = !newShowAutoSuggest[index];
    setShowAutoSuggest(newShowAutoSuggest);
  }, [showAutoSuggest]);

  const closeAutoSuggest = React.useCallback((index: number) => {
    const newShowAutoSuggest = [...showAutoSuggest];
    newShowAutoSuggest[index] = false;
    setShowAutoSuggest(newShowAutoSuggest);
  }, []);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (Array.isArray(value)) {
      const values = value;
      const newShadow = { ...value[index], [e.target.name]: e.target.value };
      values.splice(index, 1, newShadow);

      handleBoxShadowChange(values);
    } else {
      handleBoxShadowChange({ ...value, [e.target.name]: e.target.value });
    }
  }, [index, value, shadowItem]);

  const onColorChange = useCallback((color: string) => {
    if (Array.isArray(value)) {
      const values = value;
      const newShadow = { ...value[index], color };
      values.splice(index, 1, newShadow);

      handleBoxShadowChange(values);
    } else {
      handleBoxShadowChange({ ...value, color });
    }
  }, [index, value, shadowItem]);

  const handleBoxshadowDownShiftInputChange = useCallback((newInputValue: string, property: string) => {
    if (Array.isArray(value)) {
      const values = value;
      const newShadow = { ...value[index], [property]: newInputValue };
      values.splice(index, 1, newShadow);

      handleBoxShadowChange(values);
    } else {
      handleBoxShadowChange({ ...value, [property]: newInputValue });
    }
  }, [index, value, shadowItem])

  const onMoveDebounce = useCallback((dragIndex: number, hoverIndex: number) => {
    const values = value;
    const dragItem = values[dragIndex];
    values.splice(dragIndex, 1);
    values.splice(hoverIndex, 0, dragItem);
    onChange({ ...value, value: values });
  }, [value, onChange]);

  const onMove = useCallback(debounce(onMoveDebounce, 300), [value, onChange]);

  const handleRemove = useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  const ref = React.useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      const clientOffset = monitor.getClientOffset();

      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onMove(dragIndex, hoverIndex);

      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    item: {
      type: ItemTypes.CARD,
      item: () => ({ id, index }),
      index,
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <Box css={{
      display: 'flex', flexDirection: 'column', gap: '$2', opacity: isDragging ? 0 : 1,
    }}
    >
      <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} ref={ref}>
        {isMultiple && (
          <Box css={{ display: 'flex', width: '$8' }}>
            <IconButton tooltip="Click to drag" icon={<IconGrabber />} data-handler-id={handlerId} />
          </Box>
        )}
        <Select css={{ flexGrow: 1 }} value={shadowItem.type} id="type" onChange={onChange}>
          <option value="innerShadow">Inner Shadow</option>
          <option value="dropShadow">Drop Shadow</option>
        </Select>
        {isMultiple && (
          <IconButton
            tooltip="Remove this shadow"
            dataCy="button-shadow-remove-multiple"
            onClick={handleRemove}
            icon={<IconMinus />}
          />
        )}
      </Box>
      <Box css={{
        display: 'flex', flexDirection: 'column', gap: '$2', paddingLeft: isMultiple ? '$8' : '0',
      }}
      >
        {
          Object.keys(propertyTypes).map((key, index) => {
            return (
              <>
                <DownshiftInput
                  name={key}
                  key={`boxshadow-input-${index}`}
                  value={shadowItem[key]}
                  type={propertyTypes[key]}
                  label={key}
                  showAutoSuggest={showAutoSuggest[index]}
                  resolvedTokens={resolvedTokens}
                  handleChange={onChange}
                  setShowAutoSuggest={() => closeAutoSuggest(index)}
                  setInputValue={(newInputValue: string) => handleBoxshadowDownShiftInputChange(newInputValue, key)}
                  placeholder={
                    key === 'color' ? '#000000, hsla(), rgba() or {alias}' : 'Value or {alias}'
                  }
                  prefix={
                    key === 'color' && (
                      <button
                        type="button"
                        className="block w-4 h-4 rounded-sm cursor-pointer shadow-border shadow-gray-300 focus:shadow-focus focus:shadow-primary-400"
                        style={{ background: shadowItem[key], fontSize: 0 }}
                        onClick={handleToggleInputHelper}
                      >
                        {shadowItem[key]}
                      </button>
                    )
                  }
                  suffix={(
                    <StyledInputSuffix type="button" onClick={() => handleAutoSuggest(index)}>
                      <StyledIconDisclosure />
                    </StyledInputSuffix>
                  )}
                />
                {
                  inputHelperOpen && key === 'color' && (
                    <ColorPicker value={shadowItem[key]} onChange={onColorChange} />
                  )
                }
              </>
            )
          })
        }
      </Box>
    </Box>
  );
};

export default function BoxShadowInput({
  handleBoxShadowChange,
  handleBoxShadowChangeByAlias,
  resolvedTokens,
  internalEditToken,
  handleToggleInputHelper,
  inputHelperOpen,
  showAliasModeAutoSuggest,
  setShowAliasModeAutoSuggest,
  handleAliasModeAutoSuggest,
  handleDownShiftInputChange,
}: {
  handleBoxShadowChange: (shadow: ShadowTokenSingleValue | ShadowTokenSingleValue[]) => void;
  handleBoxShadowChangeByAlias: (shadow: ShadowTokenSingleValue | ShadowTokenSingleValue[]) => void;
  resolvedTokens: ResolveTokenValuesResult[]
  internalEditToken: EditTokenObject;
  handleToggleInputHelper: () => void;
  inputHelperOpen: boolean;
  showAliasModeAutoSuggest: boolean;
  setShowAliasModeAutoSuggest: (show: boolean) => void;
  handleDownShiftInputChange: (newInputValue: string) => void;
  handleAliasModeAutoSuggest: () => void;
}) {
  const seed = useUIDSeed();
  const isInputMode = (typeof internalEditToken.value === 'object');
  const [mode, setMode] = useState(isInputMode ? 'input' : 'alias');
  const [alias, setAlias] = useState('');

  const handleMode = React.useCallback(() => {
    const changeMode = (mode === 'input') ? 'alias' : 'input';
    setMode(changeMode);
    setAlias('');
  }, [mode]);

  const selectedToken = React.useMemo(() => {
    const search = findReferences(String(internalEditToken.value));
    if (search && search.length > 0) {
      const nameToLookFor = search[0].slice(1, search[0].length - 1);
      const foundToken = resolvedTokens.find((t) => t.name === nameToLookFor);
      if (foundToken) return foundToken;
    }
    return null;
  }, [internalEditToken, resolvedTokens]);

  const addShadow = React.useCallback(() => {
    if (Array.isArray(internalEditToken.value)) {
      handleBoxShadowChange([...internalEditToken.value, newToken]);
    } else {
      handleBoxShadowChange([internalEditToken.value, newToken]);
    }
  }, [internalEditToken, handleBoxShadowChange]);

  const removeShadow = React.useCallback((index: number) => {
    if (Array.isArray(internalEditToken.value)) {
      handleBoxShadowChange(internalEditToken.value.filter((_, i) => i !== index));
    }
  }, [internalEditToken, handleBoxShadowChange]);

  return (
    <div>
      <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Heading size="small">Shadow</Heading>
        <Box css={{ display: 'flex' }}>
          {mode === 'input' ? (
            <IconButton
              tooltip="alias mode"
              dataCy="button-mode-change"
              onClick={handleMode}
              icon={<TokensIcon />}
            />
          ) : (
            <IconButton
              tooltip="input mode"
              dataCy="button-mode-change"
              onClick={handleMode}
              icon={<LinkBreak2Icon />}
            />
          )}
          <IconButton
            tooltip="Add another shadow"
            dataCy="button-shadow-add-multiple"
            onClick={addShadow}
            icon={<IconPlus />}
          />
        </Box>
      </Box>
      <Box css={{ display: 'flex', flexDirection: 'column', gap: '$4' }}>
        {
          mode === 'input' ? (
            <DndProvider backend={HTML5Backend}>
              {Array.isArray(internalEditToken.value) ? (
                internalEditToken.value.map((token, index) => (
                  <SingleShadowInput
                    isMultiple
                    value={internalEditToken.value}
                    handleBoxShadowChange={handleBoxShadowChange}
                    shadowItem={token}
                    index={index}
                    id={String(index)}
                    key={`single-shadow-${seed(index)}`}
                    onRemove={removeShadow}
                    resolvedTokens={resolvedTokens}
                    handleToggleInputHelper={handleToggleInputHelper}
                    inputHelperOpen={inputHelperOpen}
                  />
                ))
              ) : (
                <SingleShadowInput
                  handleBoxShadowChange={handleBoxShadowChange}
                  index={0}
                  value={internalEditToken.value}
                  shadowItem={internalEditToken.value}
                  resolvedTokens={resolvedTokens}
                  handleToggleInputHelper={handleToggleInputHelper}
                  inputHelperOpen={inputHelperOpen}
                />
              )}
            </DndProvider>
          ) : (
            <Box css={{
              display: 'flex', flexDirection: 'column', gap: '$2',
            }}
            >
              <DownshiftInput
                value={isInputMode ? '' : String(internalEditToken.value)}
                type={internalEditToken.type}
                label={internalEditToken.property}
                showAutoSuggest={showAliasModeAutoSuggest}
                resolvedTokens={resolvedTokens}
                handleChange={handleBoxShadowChangeByAlias}
                setShowAutoSuggest={setShowAliasModeAutoSuggest}
                setInputValue={handleDownShiftInputChange}
                placeholder={
                  internalEditToken.type === 'color' ? '#000000, hsla(), rgba() or {alias}' : 'Value or {alias}'
                }
                suffix={(
                  <StyledInputSuffix type="button" onClick={handleAliasModeAutoSuggest}>
                    <StyledIconDisclosure />
                  </StyledInputSuffix>
                )}
              />

              {
                !isInputMode && checkIfContainsAlias(String(internalEditToken.value)) && (
                  <ResolvedValueBox
                    alias={alias}
                    selectedToken={selectedToken}
                  />
                )
              }
            </Box>
          )
        }
      </Box>
    </div>
  );
};
