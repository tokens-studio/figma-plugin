import React, { useState, useCallback } from 'react';
import compact from 'just-compact';
import {
  DndProvider, useDrop, useDrag, DropTargetMonitor,
} from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { XYCoord } from 'dnd-core';
import debounce from 'lodash.debounce';
import { TokensIcon, LinkBreak2Icon } from '@radix-ui/react-icons';
import { useUIDSeed } from 'react-uid';
import { checkIfContainsAlias } from '@/utils/alias';
import { findReferences } from '@/utils/findReferences';
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
import { TokenBoxshadowValue } from '@/types/values';
import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
import { EditTokenObject } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';

const newTokenValue: TokenBoxshadowValue = {
  x: '0', y: '0', blur: '0', spread: '0', color: '#000000', type: BoxShadowTypes.DROP_SHADOW,
};

enum ItemTypes {
  CARD = 'card',
}
interface DragItem {
  index: number;
  id: string;
  type: string;
}

type EditTokenType = Extract<EditTokenObject, { type: TokenTypes.BOX_SHADOW }>;

type Props = {
  id: string;
  value: EditTokenType['value'];
  isMultiple?: boolean;
  shadowItem?: TokenBoxshadowValue;
  index: number;
  handleBoxShadowChange: (shadow: TokenBoxshadowValue | TokenBoxshadowValue[]) => void;
  onRemove?: (index: number) => void;
};

function SingleShadowInput({
  value,
  isMultiple = false,
  shadowItem,
  index,
  handleBoxShadowChange,
  onRemove,
  id,
}: Props) {
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (Array.isArray(value)) {
      const values = value;
      const newShadow = { ...value[index], [e.target.name]: e.target.value };
      values.splice(index, 1, newShadow);

      handleBoxShadowChange(values);
    } else if (value && typeof value !== 'string') {
      handleBoxShadowChange({ ...value, [e.target.name]: e.target.value });
    }
  }, [index, value, handleBoxShadowChange]);

  const onMoveDebounce = useCallback((dragIndex: number, hoverIndex: number) => {
    const values = value;
    if (Array.isArray(values)) {
      const dragItem = values[dragIndex];
      values.splice(dragIndex, 1);
      values.splice(hoverIndex, 0, dragItem);
      handleBoxShadowChange(values);
    }
  }, [value, handleBoxShadowChange]);

  const onMove = useCallback(debounce(onMoveDebounce, 300), [value, onChange]);

  const handleRemove = useCallback(() => {
    if (onRemove) {
      onRemove(index);
    }
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
        <Select css={{ flexGrow: 1 }} value={shadowItem?.type ?? newTokenValue.type} id="type" onChange={onChange}>
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
        <TokenInput label="X" value={shadowItem?.x ?? newTokenValue.x} onChange={onChange} type="text" name="x" required />
        <TokenInput label="Y" value={shadowItem?.y ?? newTokenValue.y} onChange={onChange} type="text" name="y" required />
        <TokenInput label="Blur" value={shadowItem?.blur ?? newTokenValue.blur} onChange={onChange} type="text" name="blur" required />
        <TokenInput
          label="Spread"
          value={shadowItem?.spread ?? newTokenValue.x}
          onChange={onChange}
          type="text"
          name="spread"
          required
        />
        <TokenInput
          label="Color"
          value={shadowItem?.color ?? newTokenValue.color}
          onChange={onChange}
          type="text"
          name="color"
          required
        />
      </Box>
    </Box>
  );
}

export default function BoxShadowInput({
  handleBoxShadowChange,
  handleBoxShadowChangeByAlias,
  resolvedTokens,
  internalEditToken,
}: {
  handleBoxShadowChange: (shadow: TokenBoxshadowValue | TokenBoxshadowValue[]) => void;
  handleBoxShadowChangeByAlias: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resolvedTokens: ResolveTokenValuesResult[]
  internalEditToken: EditTokenType;
}) {
  const seed = useUIDSeed();
  const isAliasMode = (internalEditToken.value && typeof internalEditToken.value === 'string');
  const [mode, setMode] = useState(isAliasMode ? 'alias' : 'input');
  const [alias, setAlias] = useState('');

  const handleMode = React.useCallback(() => {
    const changeMode = (mode === 'input') ? 'alias' : 'input';
    setMode(changeMode);
    setAlias('');
  }, [mode]);

  const selectedToken = React.useMemo(() => {
    const search = findReferences(typeof internalEditToken.value === 'string' ? internalEditToken.value : '');
    if (search && search.length > 0) {
      const nameToLookFor = search[0].slice(1, search[0].length - 1);
      const foundToken = resolvedTokens.find((t) => t.name === nameToLookFor);
      if (foundToken) return foundToken;
    }
    return null;
  }, [internalEditToken, resolvedTokens]);

  const addShadow = React.useCallback(() => {
    if (Array.isArray(internalEditToken.value)) {
      handleBoxShadowChange([...internalEditToken.value, newTokenValue]);
    } else if (typeof internalEditToken.value !== 'string') {
      handleBoxShadowChange(compact([internalEditToken.value, newTokenValue]));
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
                  />
                ))
              ) : (
                typeof internalEditToken.value === 'object' && (
                  <SingleShadowInput
                    handleBoxShadowChange={handleBoxShadowChange}
                    id="0"
                    index={0}
                    value={internalEditToken.value}
                    shadowItem={internalEditToken.value}
                  />
                )
              )}
            </DndProvider>
          ) : (
            <Box css={{ display: 'flex', flexDirection: 'column', gap: '$2' }}>
              <Input
                required
                full
                label="aliasName"
                onChange={handleBoxShadowChangeByAlias}
                type="text"
                name="value"
                placeholder="Alias name"
                value={typeof internalEditToken.value === 'string' ? internalEditToken.value : ''}
              />
              {(
                isAliasMode
                && selectedToken
                && typeof internalEditToken.value === 'string'
                && checkIfContainsAlias(internalEditToken.value)
              ) && (
                <ResolvedValueBox
                  alias={alias}
                  selectedToken={selectedToken}
                />
              )}
            </Box>
          )
        }
      </Box>
    </div>
  );
}
