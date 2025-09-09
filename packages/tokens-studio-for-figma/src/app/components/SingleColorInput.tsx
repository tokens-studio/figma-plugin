import React from 'react';
import {
  useDrop, useDrag, DropTargetMonitor,
} from 'react-dnd';
import { useUIDSeed } from 'react-uid';
import { XYCoord } from 'dnd-core';
import debounce from 'lodash.debounce';
import { useTranslation } from 'react-i18next';
import {
  Box, IconButton, Stack, ToggleGroup,
} from '@tokens-studio/ui';
import IconMinus from '@/icons/minus.svg';
import IconGrabber from '@/icons/grabber.svg';
import { ResolveTokenValuesResult } from '@/utils/tokenHelpers';
import ColorPicker from './ColorPicker';
import DownshiftInput from './DownshiftInput';
import { TokenTypes } from '@/constants/TokenTypes';
import { ColorPickerTrigger } from './ColorPickerTrigger';

interface DragItem {
  index: number;
  id: string;
  type: string;
}

enum ItemTypes {
  CARD = 'card',
}

export const newTokenValue = '#000000';

export default function SingleColorInput({
  value,
  isMultiple = false,
  colorItem,
  index,
  handleColorValueChange,
  onRemove,
  id,
  resolvedTokens,
  onSubmit,
}: {
  value?: string | string[]
  isMultiple?: boolean;
  colorItem?: string;
  index: number;
  handleColorValueChange: (color: string | string[]) => void;
  onRemove: (index: number) => void;
  id?: string;
  resolvedTokens: ResolveTokenValuesResult[];
  onSubmit: () => void
}) {
  const seed = useUIDSeed();
  const [inputHelperOpen, setInputHelperOpen] = React.useState<boolean>(false);
  const { t } = useTranslation(['tokens']);
  const handleToggleInputHelper = React.useCallback(() => setInputHelperOpen(!inputHelperOpen), [inputHelperOpen]);

  const onChange = React.useCallback((property: string, newValue: string) => {
    if (Array.isArray(value)) {
      const values = [...value];
      values.splice(index, 1, newValue);
      handleColorValueChange(values);
    } else {
      handleColorValueChange(newValue);
    }
  }, [index, value, handleColorValueChange]);

  const handleColorDownShiftInputChange = React.useCallback((newInputValue: string) => {
    if (Array.isArray(value)) {
      const values = [...value];
      values.splice(index, 1, newInputValue);
      handleColorValueChange(values);
    } else {
      handleColorValueChange(newInputValue);
    }
  }, [index, value, handleColorValueChange]);

  const debouncedOnChange = debounce(onChange, 300);

  const [, drop] = useDrop<DragItem, void, { handlerId: string | symbol | null }>({
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

      if (Array.isArray(value)) {
        const newColors = [...value];
        const draggedItem = newColors[dragIndex];
        newColors.splice(dragIndex, 1);
        newColors.splice(hoverIndex, 0, draggedItem);
        handleColorValueChange(newColors);
      }

      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.CARD,
    item: () => ({ id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const ref = React.useRef<HTMLDivElement>(null);
  drag(drop(ref));

  const opacity = isDragging ? 0 : 1;
  const currentValue = React.useMemo(() => (Array.isArray(value) ? value[index] : value), [value, index]);

  return (
    <div ref={preview} style={{ opacity }}>
      <Box ref={ref} css={{ display: 'flex', gap: '$2', alignItems: 'flex-start' }}>
        <Stack direction="column" gap={2} css={{ width: '100%' }}>
          <Box css={{ display: 'flex', gap: '$2', alignItems: 'center' }}>
            {isMultiple && (
              <Box css={{ display: 'flex', gap: '$1' }}>
                <IconButton
                  variant="invisible"
                  icon={<IconGrabber />}
                  style={{ cursor: 'move' }}
                  size="small"
                />
                <IconButton
                  variant="invisible"
                  onClick={() => onRemove(index)}
                  icon={<IconMinus />}
                  size="small"
                />
              </Box>
            )}
            <Box css={{ flexGrow: 1 }}>
              <DownshiftInput
                value={currentValue || ''}
                type={TokenTypes.COLOR}
                resolvedTokens={resolvedTokens}
                handleChange={onChange}
                setInputValue={handleColorDownShiftInputChange}
                placeholder="#000000, hsla(), rgba() or {alias}"
                prefix={(
                  <ColorPickerTrigger onClick={handleToggleInputHelper} background={String(currentValue || '')} />
                )}
                suffix
                onSubmit={onSubmit}
              />
            </Box>
          </Box>
        </Stack>
      </Box>
      {inputHelperOpen && (
        <ColorPicker value={currentValue || ''} onChange={handleColorDownShiftInputChange} />
      )}
    </div>
  );
}