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
import { TokenBoxshadowValue } from '@/types/values';
import ColorPicker from './ColorPicker';
import SingleBoxShadowDownShiftInput from './SingleBoxShadowDownShiftInput';
import { BoxShadowTypes } from '@/constants/BoxShadowTypes';

interface DragItem {
  index: number;
  id: string;
  type: string;
}

enum ItemTypes {
  CARD = 'card',
}

const propertyTypes = {
  x: 'sizing',
  y: 'sizing',
  blur: 'sizing',
  spread: 'sizing',
  color: 'color',
};

export const newTokenValue: TokenBoxshadowValue = {
  x: '0', y: '0', blur: '0', spread: '0', color: '#000000', type: BoxShadowTypes.INNER_SHADOW,
};

export default function SingleBoxShadowInput({
  value,
  isMultiple = false,
  shadowItem,
  index,
  handleBoxShadowValueChange,
  onRemove,
  id,
  resolvedTokens,
  onSubmit,
}: {
  value?: TokenBoxshadowValue | TokenBoxshadowValue[]
  isMultiple?: boolean;
  shadowItem?: TokenBoxshadowValue;
  index: number;
  handleBoxShadowValueChange: (shadow: TokenBoxshadowValue | TokenBoxshadowValue[]) => void;
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
      values.splice(index, 1, { ...value[index], [property]: newValue });
      handleBoxShadowValueChange(values);
    } else {
      handleBoxShadowValueChange({
        ...newTokenValue,
        ...value,
        [property]: newValue,
      });
    }
  }, [index, value, handleBoxShadowValueChange]);

  const onTypeChange = React.useCallback((newValue: BoxShadowTypes) => {
    if (newValue !== BoxShadowTypes.DROP_SHADOW && newValue !== BoxShadowTypes.INNER_SHADOW) return;
    if (Array.isArray(value)) {
      const values = [...value];
      values.splice(index, 1, { ...value[index], type: newValue });
      handleBoxShadowValueChange(values);
    } else {
      handleBoxShadowValueChange({
        ...newTokenValue,
        ...value,
        type: newValue,
      });
    }
  }, [index, value, handleBoxShadowValueChange]);

  const handleBoxshadowValueDownShiftInputChange = React.useCallback((newInputValue: string, property: string) => {
    if (Array.isArray(value)) {
      const values = [...value];
      values.splice(index, 1, { ...value[index], [property]: newInputValue });
      handleBoxShadowValueChange(values);
    } else {
      handleBoxShadowValueChange({
        ...newTokenValue,
        ...value,
        [property]: newInputValue,
      });
    }
  }, [index, value, handleBoxShadowValueChange]);

  const exchangeBoxshadowValue = React.useCallback((newValue: TokenBoxshadowValue | TokenBoxshadowValue[]) => {
    handleBoxShadowValueChange(newValue);
  }, [handleBoxShadowValueChange]);

  const onColorChange = React.useCallback((color: string) => {
    if (Array.isArray(value)) {
      const values = [...value];
      values.splice(index, 1, { ...value[index], color: color.trim() });
      handleBoxShadowValueChange(values);
    } else {
      handleBoxShadowValueChange({
        ...newTokenValue,
        ...value,
        color,
      });
    }
  }, [index, value, handleBoxShadowValueChange]);

  const onMoveDebounce = React.useCallback((dragIndex: number, hoverIndex: number) => {
    const values = value;
    if (Array.isArray(values)) {
      const dragItem = values[dragIndex];
      values.splice(dragIndex, 1);
      values.splice(hoverIndex, 0, dragItem);
    }
    exchangeBoxshadowValue(values ?? []);
  }, [value, exchangeBoxshadowValue]);

  const onMove = debounce(onMoveDebounce, 300);

  const handleRemove = React.useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  const ref = React.useRef<HTMLDivElement>(null);

  interface DropCollectedProps {
    handlerId: string;
  }

  const [{ handlerId }, drop] = useDrop<DragItem, DropTargetMonitor, DropCollectedProps>({
    accept: ItemTypes.CARD,
    collect: (monitor: DropTargetMonitor) => ({
      handlerId: monitor.getHandlerId()?.toString() ?? 'default-dnd-handler-id',
    }),
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

  // TODO: Check this... AI fixed it..
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: {
      type: ItemTypes.CARD,
      id,
      index,
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  // TODO: i18n: remove isMultiple logic? - doesn't seem to need a translaton

  return (
    <Box css={{
      display: 'flex', flexDirection: 'column', gap: '$2', opacity: isDragging ? 0 : 1,
    }}
    >

      <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} ref={ref}>
        {isMultiple && (
          <Box css={{ display: 'flex', width: '$8' }}>
            <IconButton
              tooltip="Click to drag"
              icon={<IconGrabber />}
              data-handler-id={handlerId}
              variant="invisible"
              size="small"
            />
          </Box>
        )}
        <Stack justify="end" css={{ width: '100%' }}>
          <ToggleGroup type="single" value={shadowItem?.type ?? newTokenValue.type} onValueChange={onTypeChange}>
            <ToggleGroup.Item iconOnly={false} value="innerShadow">{t('shadow.inner')}</ToggleGroup.Item>
            <ToggleGroup.Item iconOnly={false} value="dropShadow">{t('shadow.drop')}</ToggleGroup.Item>
          </ToggleGroup>
        </Stack>
        {isMultiple && (
          <IconButton
            tooltip={t('shadow.removeThisShadow')}
            data-testid="button-shadow-remove-multiple"
            onClick={handleRemove}
            icon={<IconMinus />}
            variant="invisible"
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
              <SingleBoxShadowDownShiftInput
                name={key}
                key={`boxshadow-input-${seed(index)}-${seed(keyIndex)}`}
                value={String(
                  shadowItem?.[key as keyof typeof propertyTypes]
                  ?? newTokenValue[key as keyof typeof newTokenValue],
                )}
                type={propertyTypes[key as keyof typeof propertyTypes]}
                resolvedTokens={resolvedTokens}
                handleChange={onChange}
                setInputValue={handleBoxshadowValueDownShiftInputChange}
                handleToggleInputHelper={handleToggleInputHelper}
                onSubmit={onSubmit}
              />
              {inputHelperOpen && key === 'color' && (
                <ColorPicker value={shadowItem?.[key] || newTokenValue?.[key]} onChange={onColorChange} />
              )}
            </>
          ))
        }
      </Box>
    </Box>
  );
}
