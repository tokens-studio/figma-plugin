import React, { useState, useCallback } from 'react';
import {
  DndProvider, useDrop, useDrag, DropTargetMonitor,
} from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { XYCoord } from 'dnd-core';
import { debounce } from 'lodash';
import { TokensIcon, LinkBreak2Icon } from '@radix-ui/react-icons';
import { ShadowTokenSingleValue } from '@/types/propertyTypes';
import { checkIfContainsAlias } from '@/utils/alias';
import IconMinus from '@/icons/minus.svg';
import IconPlus from '@/icons/plus.svg';
import IconGrabber from '@/icons/grabber.svg';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import Heading from './Heading';
import IconButton from './IconButton';
import TokenInput from './TokenInput';
import Select from './Select';
import Box from './Box';
import Input from './Input';
import ResolvedValueBox from './ResolvedValueBox';
import { findReferences } from '@/utils/findReferences';

interface DragItem {
  index: number;
  id: string;
  type: string;
}

enum ItemTypes {
  CARD = 'card',
}

function SingleShadowInput({
  value,
  isMultiple = false,
  shadowItem,
  index,
  setValue,
  onRemove,
  id,
}: {
  value: ShadowTokenSingleValue | ShadowTokenSingleValue[];
  isMultiple?: boolean;
  shadowItem: ShadowTokenSingleValue;
  index: number;
  setValue: (shadow: ShadowTokenSingleValue | ShadowTokenSingleValue[]) => void;
  onRemove: (index: number) => void;
  id: string;
}) {
  const onChange = (e) => {
    if (Array.isArray(value)) {
      const values = value;
      const newShadow = { ...value[index], [e.target.name]: e.target.value };
      values.splice(index, 1, newShadow);

      setValue(values);
    } else {
      setValue({ ...value, [e.target.name]: e.target.value });
    }
  };

  const onMoveDebounce = (dragIndex, hoverIndex) => {
    const values = value;
    const dragItem = values[dragIndex];
    values.splice(dragIndex, 1);
    values.splice(hoverIndex, 0, dragItem);
    onChange({ ...value, value: values });
  };
  const onMove = useCallback(debounce(onMoveDebounce, 300), [value]);

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
          <Box css={{ display: 'flex', width: '$space$8' }}>
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
            onClick={() => onRemove(index)}
            icon={<IconMinus />}
          />
        )}
      </Box>
      <Box css={{
        display: 'flex', flexDirection: 'column', gap: '$2', paddingLeft: isMultiple ? '$8' : '0',
      }}
      >
        <TokenInput label="X" value={shadowItem.x} onChange={onChange} type="text" name="x" required />
        <TokenInput label="Y" value={shadowItem.y} onChange={onChange} type="text" name="y" required />
        <TokenInput label="Blur" value={shadowItem.blur} onChange={onChange} type="text" name="blur" required />
        <TokenInput
          label="Spread"
          value={shadowItem.spread}
          onChange={onChange}
          type="text"
          name="spread"
          required
        />
        <TokenInput
          label="Color"
          value={shadowItem.color}
          onChange={onChange}
          type="text"
          name="color"
          required
        />
      </Box>
    </Box>
  );
}

const newToken: ShadowTokenSingleValue = {
  x: '0', y: '0', blur: '0', spread: '0', color: '#000000', type: 'dropShadow',
};

export default function BoxShadowInput({
  value,
  setValue,
  resolvedTokens,
}: {
  value: ShadowTokenSingleValue | ShadowTokenSingleValue[];
  setValue: (shadow: ShadowTokenSingleValue | ShadowTokenSingleValue[]) => void;
  resolvedTokens: ResolveTokenValuesResult[]
}) {
  const [mode, setMode] = useState('input');
  const [alias, setAlias] = useState('');

  const addShadow = () => {
    if (Array.isArray(value)) {
      setValue([...value, newToken]);
    } else {
      setValue([value, newToken]);
    }
  };

  const removeShadow = (index) => {
    if (Array.isArray(value)) {
      setValue(value.filter((_, i) => i !== index));
    }
  };

  const handleMode = () => {
    setMode((mode === 'input') ? 'alias' : 'input');
    setAlias('');
    setValue(newToken);
  };

  const handleAliasChange = (e) => {
    const specifiedAlias = findReferences(e.target.value);
    if (specifiedAlias) {
      const [search] = specifiedAlias;
      const nameToLookFor = search.slice(1, search.length - 1);
      const selectedToken = resolvedTokens.find((t) => t.name === nameToLookFor);
      setValue(selectedToken ? selectedToken.value : '');
    }
    setAlias(e.target.value);
  };

  return (
    <div>
      <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Heading size="small">Shadow</Heading>
        <Box>
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
            )
          }
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
              {Array.isArray(value) ? (
                value.map((token, index) => (
                  <SingleShadowInput
                    isMultiple
                    value={value}
                    setValue={setValue}
                    shadowItem={token}
                    index={index}
                    id={index}
                    key={`single-shadow-${index}`}
                    onRemove={removeShadow}
                  />
                ))
              ) : (
                <SingleShadowInput
                  setValue={setValue}
                  index={0}
                  value={value}
                  shadowItem={value}
                />
              )}
            </DndProvider>
          ) : (
            <Box css={{
              display: 'flex', flexDirection: 'column', gap: '$2',
            }}
            >
              <Input
                required
                full
                label="aliasName"
                onChange={(e) => handleAliasChange(e)}
                type="text"
                name="aliasName"
                placeholder="Alias name"
              />
              {
                checkIfContainsAlias(alias) && (
                  <ResolvedValueBox
                    alias={alias}
                    resolvedTokens={resolvedTokens}
                    setValue={setValue}
                  />
                )
              }
            </Box>
          )
        }
      </Box>
    </div>
  );
}
