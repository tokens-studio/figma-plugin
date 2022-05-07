import React from 'react';
import {
  useDrop, useDrag, DropTargetMonitor,
} from 'react-dnd';
import { XYCoord } from 'dnd-core';
import debounce from 'lodash.debounce';
import IconMinus from '@/icons/minus.svg';
import IconGrabber from '@/icons/grabber.svg';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import IconButton from './IconButton';
import ColorPicker from './ColorPicker';
import Select from './Select';
import Box from './Box';
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

const propertyTypes = {
  x: 'sizing',
  y: 'sizing',
  blur: 'sizing',
  spread: 'sizing',
  color: 'color',
};

export default function SingleBoxShadowInput({
  value,
  isMultiple = false,
  shadowItem,
  index,
  handleBoxShadowChange,
  onRemove,
  id,
  resolvedTokens,
}: {
  value: TokenBoxshadowValue | TokenBoxshadowValue[];
  isMultiple?: boolean;
  shadowItem: TokenBoxshadowValue;
  index: number;
  handleBoxShadowChange: (shadow: TokenBoxshadowValue | TokenBoxshadowValue[]) => void;
  onRemove: (index: number) => void;
  id?: string;
  resolvedTokens: ResolveTokenValuesResult[];
}) {
  const defalutShowAutoSuggest = React.useMemo(() => {
    if (shadowItem && typeof shadowItem === 'object') {
      return Object.entries(shadowItem).map(() => {
        return false;
      }, {});
    }
    return [false];
  }, [shadowItem]);

  const [showAutoSuggest, setShowAutoSuggest] = React.useState<Array<boolean>>(defalutShowAutoSuggest);
  const [inputHelperOpen, setInputHelperOpen] = React.useState<boolean>(false);

  const handleToggleInputHelper = React.useCallback(() => setInputHelperOpen(!inputHelperOpen), [inputHelperOpen]);

  const handleAutoSuggest = React.useCallback((keyIndex: number) => (() => changeAutoSuggest(keyIndex)), []);

  const changeAutoSuggest = React.useCallback((index: number) => {
    const newShowAutoSuggest = [...showAutoSuggest];
    newShowAutoSuggest[index] = !newShowAutoSuggest[index];
    setShowAutoSuggest(newShowAutoSuggest);
  }, [showAutoSuggest]);

  const handleCloseAutoSuggest = React.useCallback((keyIndex: number) => (() => closeAutoSuggest(keyIndex)), []);

  const closeAutoSuggest = React.useCallback((index: number) => {
    const newShowAutoSuggest = [...showAutoSuggest];
    newShowAutoSuggest[index] = false;
    setShowAutoSuggest(newShowAutoSuggest);
  }, []);

  const onChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (Array.isArray(value)) {
      const values = value;
      const newShadow = { ...value[index], [e.target.name]: e.target.value };
      values.splice(index, 1, newShadow);

      handleBoxShadowChange(values);
    } else {
      handleBoxShadowChange({ ...value, [e.target.name]: e.target.value });
    }
  }, [index, value, shadowItem]);

  const exchangeBoxshadowValue = React.useCallback((value: TokenBoxshadowValue | TokenBoxshadowValue[]) => {
    handleBoxShadowChange(value);
  }, [handleBoxShadowChange, value]);

  const onColorChange = React.useCallback((color: string) => {
    if (Array.isArray(value)) {
      const values = value;
      const newShadow = { ...value[index], color };
      values.splice(index, 1, newShadow);

      handleBoxShadowChange(values);
    } else {
      handleBoxShadowChange({ ...value, color });
    }
  }, [index, value, shadowItem]);

  const handleBoxshadowDownShiftInputChange = React.useCallback((newInputValue: string, property: string) => {
    if (Array.isArray(value)) {
      const values = value;
      const newShadow = { ...value[index], [property]: newInputValue };
      values.splice(index, 1, newShadow);

      handleBoxShadowChange(values);
    } else {
      handleBoxShadowChange({ ...value, [property]: newInputValue });
    }
  }, [index, value, shadowItem]);

  const onMoveDebounce = React.useCallback((dragIndex: number, hoverIndex: number) => {
    const values = value;
    if (Array.isArray(values)) {
      const dragItem = values[dragIndex];
      values.splice(dragIndex, 1);
      values.splice(hoverIndex, 0, dragItem);
    }
    exchangeBoxshadowValue(values);
  }, [value, exchangeBoxshadowValue]);

  const onMove = React.useCallback(debounce(onMoveDebounce, 300), [value, onChange]);

  const handleRemove = React.useCallback(() => {
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
          Object.keys(propertyTypes).map((key, keyIndex) => (
            <>
              <DownshiftInput
                name={key}
                key={`boxshadow-input-${index}-${keyIndex}`}
                value={String(shadowItem[key as keyof typeof propertyTypes])}
                type={propertyTypes[key as keyof typeof propertyTypes]}
                label={key}
                showAutoSuggest={showAutoSuggest[keyIndex]}
                resolvedTokens={resolvedTokens}
                handleChange={onChange}
                setShowAutoSuggest={handleCloseAutoSuggest(keyIndex)}
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
                  <StyledInputSuffix type="button" onClick={handleAutoSuggest(keyIndex)}>
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
          ))
        }
      </Box>
    </Box>
  );
};
