import React, { useState } from 'react';
import { TokensIcon, LinkBreak2Icon } from '@radix-ui/react-icons';
import { useUIDSeed } from 'react-uid';
import { useTranslation } from 'react-i18next';
import {
  IconButton, Heading, Select, Button,
} from '@tokens-studio/ui';
import { styled } from '@/stitches.config';
import { EditTokenObject } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';
import { TokenGradientStop, TokenGradientValue } from '@/types/values';
import { ResolveTokenValuesResult } from '@/utils/tokenHelpers';
import { checkIfContainsAlias, getAliasValue } from '@/utils/alias';
import { findReferences } from '@/utils/findReferences';
import { gradientTokenToCss, isGradientTokenValue } from '@/utils/color';
import IconMinus from '@/icons/minus.svg';
import Box from './Box';
import Stack from './Stack';
import Input from './Input';
import Text from './Text';
import DownshiftInput from './DownshiftInput';
import ColorPicker from './ColorPicker';
import ResolvedTokenDisplay from './ResolvedTokenDisplay';
import GradientStopBar from './GradientStopBar';
import { ColorPickerTrigger } from './ColorPickerTrigger';

// The gradient value is a flat open object — only a subset of the geometry
// properties applies per kind: linear → angle/start/end, radial → center/
// radius/shape, conic → center/startAngle, diamond → center/size. Field
// visibility is hard-coded per kind, mirroring Studio's GradientEditor.vue.

type EditTokenType = Extract<EditTokenObject, { type: TokenTypes.GRADIENT }>;

export const DEFAULT_GRADIENT_VALUE: TokenGradientValue = {
  kind: 'linear',
  angle: 180,
  stops: [
    { color: '#000000', position: 0 },
    { color: '#ffffff', position: 1 },
  ],
};

const GRADIENT_KINDS = [
  { value: 'linear', label: 'Linear' },
  { value: 'radial', label: 'Radial' },
  { value: 'conic', label: 'Conic' },
  { value: 'diamond', label: 'Diamond' },
];

const RADIAL_SHAPES = [
  { value: 'circle', label: 'Circle' },
  { value: 'ellipse', label: 'Ellipse' },
];

const POINT_DEFAULTS: Record<string, { x: number; y: number }> = {
  start: { x: 0, y: 0.5 },
  end: { x: 1, y: 0.5 },
  center: { x: 0.5, y: 0.5 },
};

const StyledPreview = styled('div', {
  position: 'relative',
  width: '100%',
  height: '80px',
  borderRadius: '$small',
  overflow: 'hidden',
});

const StyledCheckerboard = styled('div', {
  position: 'absolute',
  inset: 0,
  borderRadius: 'inherit',
  backgroundImage: 'repeating-conic-gradient($colors$borderMuted 0% 25%, transparent 0% 50%)',
  backgroundSize: '8px 8px',
});

const StyledPreviewFill = styled('div', {
  position: 'absolute',
  inset: 0,
  borderRadius: 'inherit',
});

const StyledStopListItem = styled('div', {
  padding: '$3',
  cursor: 'pointer',
  '& + &': {
    borderTop: '1px solid $borderMuted',
  },
  variants: {
    selected: {
      true: {
        backgroundColor: '$bgSubtle',
      },
      false: {
        '&:hover': {
          backgroundColor: '$bgSubtle',
        },
      },
    },
  },
});

function GradientNumberInput({
  name,
  label,
  value,
  placeholder,
  onChange,
}: {
  name: string;
  label: string;
  value: number | undefined;
  placeholder?: string;
  onChange: (name: string, value: number) => void;
}) {
  const handleChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
    onChange(event.target.name, Number(event.target.value) || 0);
  }, [onChange]);

  return (
    <Input
      full
      name={name}
      label={label}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={handleChange}
      type="number"
      step="any"
    />
  );
}

function GradientStopItem({
  index,
  stop,
  resolvedColor,
  selected,
  canRemove,
  resolvedTokens,
  onSelect,
  onColorChange,
  onNumberChange,
  onRemove,
  onSubmit,
}: {
  index: number;
  stop: TokenGradientStop;
  resolvedColor: string;
  selected: boolean;
  canRemove: boolean;
  resolvedTokens: ResolveTokenValuesResult[];
  onSelect: (index: number) => void;
  onColorChange: (index: number, color: string) => void;
  onNumberChange: (index: number, property: 'position' | 'midpoint', value: number) => void;
  onRemove: (index: number) => void;
  onSubmit: () => void;
}) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const handleSelect = React.useCallback(() => onSelect(index), [index, onSelect]);
  const handleRemove = React.useCallback(() => onRemove(index), [index, onRemove]);
  const handleToggleColorPicker = React.useCallback(() => setColorPickerOpen(!colorPickerOpen), [colorPickerOpen]);

  const handleColorInputChange = React.useCallback((property: string, value: string) => {
    onColorChange(index, value);
  }, [index, onColorChange]);

  const handleColorDownShiftInputChange = React.useCallback((newInputValue: string) => {
    onColorChange(index, newInputValue);
  }, [index, onColorChange]);

  const handleColorPickerChange = React.useCallback((color: string) => {
    onColorChange(index, color);
  }, [index, onColorChange]);

  const handleNumberInputChange = React.useCallback((name: string, value: number) => {
    onNumberChange(index, name as 'position' | 'midpoint', value);
  }, [index, onNumberChange]);

  return (
    <StyledStopListItem selected={selected} onClick={handleSelect} data-testid={`gradient-stop-item-${index}`}>
      <Stack direction="column" gap={2}>
        <Stack direction="row" justify="between" align="center">
          <Text muted size="xsmall">{`Stop ${index + 1}`}</Text>
          {canRemove && (
            <IconButton
              tooltip="Remove stop"
              data-testid={`gradient-stop-remove-${index}`}
              onClick={handleRemove}
              icon={<IconMinus />}
              variant="invisible"
              size="small"
            />
          )}
        </Stack>
        <DownshiftInput
          name="color"
          value={stop.color}
          type={TokenTypes.COLOR}
          resolvedTokens={resolvedTokens}
          handleChange={handleColorInputChange}
          setInputValue={handleColorDownShiftInputChange}
          placeholder="#000000, hsla() or {alias}"
          prefix={<ColorPickerTrigger onClick={handleToggleColorPicker} background={resolvedColor} />}
          suffix
          onSubmit={onSubmit}
        />
        {colorPickerOpen && (
          <ColorPicker value={resolvedColor} onChange={handleColorPickerChange} />
        )}
        <Stack direction="row" gap={2}>
          <GradientNumberInput
            name="position"
            label="Position"
            value={stop.position}
            placeholder="0"
            onChange={handleNumberInputChange}
          />
          <GradientNumberInput
            name="midpoint"
            label="Midpoint"
            value={stop.midpoint}
            placeholder="0.5"
            onChange={handleNumberInputChange}
          />
        </Stack>
      </Stack>
    </StyledStopListItem>
  );
}

export default function GradientTokenForm({
  internalEditToken,
  resolvedTokens,
  handleGradientValueChange,
  handleGradientAliasValueChange,
  handleDownShiftInputChange,
  onSubmit,
}: {
  internalEditToken: EditTokenType;
  resolvedTokens: ResolveTokenValuesResult[];
  handleGradientValueChange: (newValue: TokenGradientValue) => void;
  handleGradientAliasValueChange: (property: string, value: string) => void;
  handleDownShiftInputChange: (newInputValue: string) => void;
  onSubmit: () => void;
}) {
  const seed = useUIDSeed();
  const { t } = useTranslation(['tokens']);
  const isAliasMode = internalEditToken.value && typeof internalEditToken.value === 'string';
  const [mode, setMode] = useState(isAliasMode ? 'alias' : 'input');
  const [alias, setAlias] = useState('');
  const [selectedStopIndex, setSelectedStopIndex] = useState(0);

  const gradientValue = React.useMemo<TokenGradientValue>(() => (
    isGradientTokenValue(internalEditToken.value) ? internalEditToken.value : DEFAULT_GRADIENT_VALUE
  ), [internalEditToken.value]);

  const currentKind = gradientValue.kind ?? 'linear';
  const stops = React.useMemo(() => (Array.isArray(gradientValue.stops) ? gradientValue.stops : []), [gradientValue.stops]);

  const selectedToken = React.useMemo(() => {
    const search = findReferences(typeof internalEditToken.value === 'string' ? internalEditToken.value : '');
    if (search && search.length > 0) {
      const foundToken = resolvedTokens.find((token) => token.name === search[0]);
      if (foundToken) return foundToken;
    }
    return null;
  }, [internalEditToken, resolvedTokens]);

  const handleMode = React.useCallback(() => {
    if (mode === 'alias' && typeof internalEditToken.value === 'string') {
      handleGradientValueChange(
        isGradientTokenValue(selectedToken?.rawValue) ? selectedToken?.rawValue as TokenGradientValue : DEFAULT_GRADIENT_VALUE,
      );
    }
    setMode(mode === 'input' ? 'alias' : 'input');
    setAlias('');
  }, [mode, internalEditToken.value, selectedToken, handleGradientValueChange]);

  // CSS color per stop so references like {color.brand.500} render resolved
  const stopCssColors = React.useMemo(() => stops.map((stop) => {
    if (typeof stop.color === 'string' && stop.color.startsWith('{')) {
      const aliasValue = getAliasValue(stop.color, resolvedTokens);
      return aliasValue ? String(aliasValue) : '#888888';
    }
    return stop.color || '#000000';
  }), [stops, resolvedTokens]);

  const previewCss = React.useMemo(() => gradientTokenToCss({
    ...gradientValue,
    stops: stops.map((stop, index) => ({ ...stop, color: stopCssColors[index] })),
  }), [gradientValue, stops, stopCssColors]);

  const handleGeometryChange = React.useCallback((name: string, value: number) => {
    if (name.includes('.')) {
      const [pointField, axis] = name.split('.');
      const existing = (gradientValue as unknown as Record<string, { x: number; y: number } | undefined>)[pointField]
        ?? POINT_DEFAULTS[pointField]
        ?? { x: 0.5, y: 0.5 };
      handleGradientValueChange({ ...gradientValue, [pointField]: { ...existing, [axis]: value } });
    } else {
      handleGradientValueChange({ ...gradientValue, [name]: value });
    }
  }, [gradientValue, handleGradientValueChange]);

  const handleKindChange = React.useCallback((kind: string) => {
    handleGradientValueChange({ ...gradientValue, kind });
  }, [gradientValue, handleGradientValueChange]);

  const handleShapeChange = React.useCallback((shape: string) => {
    handleGradientValueChange({ ...gradientValue, shape });
  }, [gradientValue, handleGradientValueChange]);

  const updateStops = React.useCallback((newStops: TokenGradientStop[]) => {
    handleGradientValueChange({ ...gradientValue, stops: newStops });
  }, [gradientValue, handleGradientValueChange]);

  const handleStopColorChange = React.useCallback((index: number, color: string) => {
    updateStops(stops.map((stop, i) => (i === index ? { ...stop, color } : stop)));
  }, [stops, updateStops]);

  const handleStopNumberChange = React.useCallback((index: number, property: 'position' | 'midpoint', value: number) => {
    updateStops(stops.map((stop, i) => (i === index ? { ...stop, [property]: value } : stop)));
  }, [stops, updateStops]);

  const handleStopPositionDrag = React.useCallback((index: number, position: number) => {
    updateStops(stops.map((stop, i) => (i === index ? { ...stop, position } : stop)));
  }, [stops, updateStops]);

  const handleAddStop = React.useCallback((position: number) => {
    // Pick a color from the nearest stop
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    const before = sorted.filter((stop) => stop.position <= position).pop();
    const after = sorted.find((stop) => stop.position >= position);
    const color = before?.color ?? after?.color ?? '#888888';
    const newStops = [...stops, { color, position }];
    setSelectedStopIndex(newStops.length - 1);
    updateStops(newStops);
  }, [stops, updateStops]);

  const handleAddStopAtEnd = React.useCallback(() => {
    const last = stops[stops.length - 1];
    const maxPosition = stops.length > 0 ? Math.max(...stops.map((stop) => stop.position)) : 0;
    const newStops = [...stops, { color: last?.color ?? '#888888', position: Math.min(maxPosition + 0.1, 1) }];
    setSelectedStopIndex(newStops.length - 1);
    updateStops(newStops);
  }, [stops, updateStops]);

  const handleRemoveStop = React.useCallback((index: number) => {
    if (stops.length <= 2) return;
    const newStops = stops.filter((_, i) => i !== index);
    setSelectedStopIndex(Math.min(selectedStopIndex, newStops.length - 1));
    updateStops(newStops);
  }, [stops, selectedStopIndex, updateStops]);

  // Keep selection in bounds when stops shrink
  React.useEffect(() => {
    if (selectedStopIndex >= stops.length) {
      setSelectedStopIndex(Math.max(0, stops.length - 1));
    }
  }, [stops.length, selectedStopIndex]);

  return (
    <Stack direction="column" gap={2}>
      <Stack direction="row" gap={2} justify="between" align="center">
        <Heading size="small">{t('value')}</Heading>
        {mode === 'input' ? (
          <IconButton
            tooltip={t('reference-mode')}
            data-testid="mode-change-button"
            onClick={handleMode}
            icon={<TokensIcon />}
            variant="invisible"
            size="small"
          />
        ) : (
          <IconButton
            tooltip={t('input-mode')}
            data-testid="mode-change-button"
            onClick={handleMode}
            icon={<LinkBreak2Icon />}
            variant="invisible"
            size="small"
          />
        )}
      </Stack>
      {mode === 'input' ? (
        <Stack direction="column" gap={3}>
          <StyledPreview>
            <StyledCheckerboard />
            <StyledPreviewFill style={{ background: previewCss }} data-testid="gradient-preview" />
          </StyledPreview>

          <Select value={currentKind} onValueChange={handleKindChange}>
            <Select.Trigger data-testid="gradient-kind-selector" label="Gradient Type" value={GRADIENT_KINDS.find((kind) => kind.value === currentKind)?.label ?? currentKind} />
            <Select.Content>
              {GRADIENT_KINDS.map((kind) => (
                <Select.Item key={kind.value} value={kind.value}>{kind.label}</Select.Item>
              ))}
            </Select.Content>
          </Select>

          {currentKind === 'linear' && (
            <GradientNumberInput
              name="angle"
              label="Angle"
              value={gradientValue.angle ?? 180}
              placeholder="180"
              onChange={handleGeometryChange}
            />
          )}

          {(currentKind === 'radial' || currentKind === 'conic' || currentKind === 'diamond') && (
            <Stack direction="row" gap={2}>
              <GradientNumberInput
                name="center.x"
                label="Center X"
                value={gradientValue.center?.x ?? 0.5}
                placeholder="0.5"
                onChange={handleGeometryChange}
              />
              <GradientNumberInput
                name="center.y"
                label="Center Y"
                value={gradientValue.center?.y ?? 0.5}
                placeholder="0.5"
                onChange={handleGeometryChange}
              />
            </Stack>
          )}

          {currentKind === 'radial' && (
            <Stack direction="row" gap={2} align="end">
              <Box css={{ flexGrow: 1 }}>
                <GradientNumberInput
                  name="radius"
                  label="Radius"
                  value={gradientValue.radius ?? 0.5}
                  placeholder="0.5"
                  onChange={handleGeometryChange}
                />
              </Box>
              <Box css={{ flexGrow: 1 }}>
                <Select value={gradientValue.shape ?? 'circle'} onValueChange={handleShapeChange}>
                  <Select.Trigger data-testid="gradient-shape-selector" label="Shape" value={RADIAL_SHAPES.find((shape) => shape.value === (gradientValue.shape ?? 'circle'))?.label ?? gradientValue.shape} />
                  <Select.Content>
                    {RADIAL_SHAPES.map((shape) => (
                      <Select.Item key={shape.value} value={shape.value}>{shape.label}</Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </Box>
            </Stack>
          )}

          {currentKind === 'conic' && (
            <GradientNumberInput
              name="startAngle"
              label="Start Angle"
              value={gradientValue.startAngle ?? 0}
              placeholder="0"
              onChange={handleGeometryChange}
            />
          )}

          {currentKind === 'diamond' && (
            <GradientNumberInput
              name="size"
              label="Size"
              value={gradientValue.size ?? 0.75}
              placeholder="0.75"
              onChange={handleGeometryChange}
            />
          )}

          <Stack direction="column" gap={2}>
            <Text muted size="xsmall">Color Stops</Text>
            <GradientStopBar
              stops={stops}
              selectedIndex={selectedStopIndex}
              cssColors={stopCssColors}
              onSelectStop={setSelectedStopIndex}
              onStopPositionChange={handleStopPositionDrag}
              onAddStop={handleAddStop}
            />
          </Stack>

          {stops.length > 0 && (
            <Box css={{ border: '1px solid $borderMuted', borderRadius: '$small', overflow: 'hidden' }}>
              {stops.map((stop, index) => (
                <GradientStopItem
                  key={`gradient-stop-${seed(index)}`}
                  index={index}
                  stop={stop}
                  resolvedColor={stopCssColors[index]}
                  selected={index === selectedStopIndex}
                  canRemove={stops.length > 2}
                  resolvedTokens={resolvedTokens}
                  onSelect={setSelectedStopIndex}
                  onColorChange={handleStopColorChange}
                  onNumberChange={handleStopNumberChange}
                  onRemove={handleRemoveStop}
                  onSubmit={onSubmit}
                />
              ))}
            </Box>
          )}

          <Button variant="secondary" size="small" onClick={handleAddStopAtEnd} data-testid="gradient-add-stop">
            Add Stop
          </Button>

          {currentKind === 'linear' && (
            <Box css={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '$3',
              border: '1px solid $borderMuted',
              borderRadius: '$small',
              padding: '$3',
            }}
            >
              <Stack direction="column" gap={2}>
                <Text muted size="xsmall">Start Point</Text>
                <Stack direction="row" gap={2}>
                  <GradientNumberInput
                    name="start.x"
                    label="X"
                    value={gradientValue.start?.x ?? 0}
                    placeholder="0"
                    onChange={handleGeometryChange}
                  />
                  <GradientNumberInput
                    name="start.y"
                    label="Y"
                    value={gradientValue.start?.y ?? 0.5}
                    placeholder="0.5"
                    onChange={handleGeometryChange}
                  />
                </Stack>
              </Stack>
              <Stack direction="column" gap={2}>
                <Text muted size="xsmall">End Point</Text>
                <Stack direction="row" gap={2}>
                  <GradientNumberInput
                    name="end.x"
                    label="X"
                    value={gradientValue.end?.x ?? 1}
                    placeholder="1"
                    onChange={handleGeometryChange}
                  />
                  <GradientNumberInput
                    name="end.y"
                    label="Y"
                    value={gradientValue.end?.y ?? 0.5}
                    placeholder="0.5"
                    onChange={handleGeometryChange}
                  />
                </Stack>
              </Stack>
            </Box>
          )}
        </Stack>
      ) : (
        <Stack direction="column" gap={2}>
          <DownshiftInput
            value={!isAliasMode ? '' : String(internalEditToken.value)}
            type={internalEditToken.type}
            label={internalEditToken.schema.property}
            inlineLabel
            resolvedTokens={resolvedTokens}
            initialName={internalEditToken.initialName}
            handleChange={handleGradientAliasValueChange}
            setInputValue={handleDownShiftInputChange}
            placeholder={t('valueOrAlias')}
            suffix
            onSubmit={onSubmit}
          />
          {isAliasMode
            && typeof internalEditToken.value === 'string'
            && checkIfContainsAlias(internalEditToken.value) && (
              <ResolvedTokenDisplay alias={alias} selectedToken={selectedToken} />
          )}
        </Stack>
      )}
    </Stack>
  );
}
