import React, { useCallback } from 'react';
import {
  DndProvider, useDrop, useDrag, DropTargetMonitor,
} from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { XYCoord } from 'dnd-core';
import { debounce } from 'lodash';
import { CompositionTokenSingleValue } from '@/types/propertyTypes';
import { checkIfContainsAlias, getAliasValue } from '@/utils/alias';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';

import IconMinus from '@/icons/minus.svg';
import IconPlus from '@/icons/plus.svg';
import IconGrabber from '@/icons/grabber.svg';

import Heading from './Heading';
import IconButton from './IconButton';
import TokenInput from './TokenInput';
import Select from './Select';
import Box from './Box';
import Input from './Input';

interface DragItem {
  index: number;
  id: string;
  type: string;
}

enum ItemTypes {
  CARD = 'card',
}

function SingleStyleInput({
  value,
  isMultiple = false,
  index,
  id,
  styleItem,
  resolvedTokens,
  tokenType,
  setValue,
  onRemove,
}: {
  value: CompositionTokenSingleValue | CompositionTokenSingleValue[];
  isMultiple?: boolean;
  index: number;
  id: string;
  shadowItem: CompositionTokenSingleValue;
  resolvedTokens: ResolveTokenValuesResult[];
  tokenType: string;
  setValue: (property: CompositionTokenSingleValue | CompositionTokenSingleValue[]) => void;
  onRemove: (index: number) => void;
}) {
  const resolvedValue = React.useMemo(() => {
    if (styleItem) {
      console.log('styleI', styleItem);
      return typeof styleItem.value === 'object'
        ? null
        : getAliasValue(styleItem.value, resolvedTokens);
    }
    return null;
  }, [styleItem, resolvedTokens]);

  const onChange = (e) => {
    if (Array.isArray(value)) {
      const values = value;
      const newStyle = { ...value[index], [e.target.name]: e.target.value };
      values.splice(index, 1, newStyle);

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

  const [{ isDragging }, drag, preview] = useDrag({
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
      display: 'flex', flexDirection: 'column', gap: '$2',
    }}
    >
      <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {isMultiple && (
          <Box css={{ display: 'flex', width: '$space$8' }}>
            <IconButton tooltip="Click to drag" icon={<IconGrabber />} data-handler-id={handlerId} />
          </Box>
        )}
        <Input
          label="property"
          type="text"
          name="property"
          value={styleItem.property}
          onChange={onChange}
          full
          required
        />
        <Input
          label="value"
          type="text"
          name="value"
          value={styleItem.value}
          onChange={onChange}
          full
          required
        />
        {checkIfContainsAlias(styleItem.value) && (
        <div className="flex p-2 mt-2 font-mono text-gray-700 bg-gray-100 border-gray-300 rounded text-xxs itms-center">
          {tokenType === 'color' ? (
            <div
              className="w-4 h-4 mr-1 border border-gray-200 rounded"
              style={{ background: resolvedValue }}
            />
          ) : null}
          {resolvedValue}
        </div>
        )}
        {isMultiple && (
          <IconButton
            tooltip="Remove this style"
            dataCy="button-style-remove-multiple"
            onClick={() => onRemove(index)}
            icon={<IconMinus />}
          />
        )}
      </Box>
    </Box>

  );
}

const newToken: CompositionTokenSingleValue = {
  property: '', value: '',
};

export default function CompositionTokenForm({
  value,
  setValue,
  resolvedTokens,
  tokenType,
}: {
  value: CompositionTokenSingleValue | CompositionTokenSingleValue[];
  setValue: (style: CompositionTokenSingleValue | CompositionTokenSingleValue[]) => void;
  resolvedTokens: ResolveTokenValuesResult[];
  tokenType: string
}) {
  const addStyle = () => {
    if (Array.isArray(value)) {
      setValue([...value, newToken]);
    } else {
      setValue([value, newToken]);
    }
  };

  const removeStyle = (index) => {
    if (Array.isArray(value)) {
      setValue(value.filter((_, i) => i !== index));
    }
  };

  return (
    <div>
      <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Heading size="small">Composition Tokens</Heading>
        <IconButton
          tooltip="Add another style"
          dataCy="button-style-add-multiple"
          onClick={addStyle}
          icon={<IconPlus />}
        />
      </Box>
      <Box css={{ display: 'flex', flexDirection: 'column', gap: '$4' }}>
        <DndProvider backend={HTML5Backend}>
          {Array.isArray(value) ? (
            value.map((style, index) => (
              <SingleStyleInput
                value={value}
                isMultiple
                index={index}
                styleItem={style}
                id={index}
                key={`single-style-${index}`}
                resolvedTokens={resolvedTokens}
                tokenType={tokenType}
                setValue={setValue}
                onRemove={(index) => removeStyle(index)}
              />
            ))
          ) : (
            <SingleStyleInput
              setValue={setValue}
              styleItem={value}
              index={0}
              value={value}
              resolvedTokens={resolvedTokens}
              tokenType={tokenType}
            />
          )}
        </DndProvider>
      </Box>
    </div>
  );
}
