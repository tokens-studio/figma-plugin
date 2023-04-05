import React from 'react';
import { RgbaColorPicker, RgbaColor } from 'react-colorful';
import { parseToRgb, parseToHsl, toColorString } from 'polished';
import Input from '../Input';
import Button from '../Button';
import Stack from '../Stack';

enum InputMode {
  RGBA = 'rgba',
  HSLA = 'hsla',
}

type Rgba = {
  r: number;
  g: number;
  b: number;
  a: number;
};

type Hsla = {
  h: number;
  s: number;
  l: number;
  a: number;
};

type Props = {
  value?: string;
  onChange: (color: string) => void;
};

const DEFAULT_RGBA = Object.freeze({
  r: 0, g: 0, b: 0, a: 1,
});
const DEFAULT_HSLA = Object.freeze({
  h: 0, s: 0, l: 0, a: 1,
});
const PROPS: Omit<React.ComponentProps<typeof Input>, 'name'> = {
  full: true,
  type: 'number',
};

const roundTo = (input: number, precision: number) => {
  const factor = 10 ** precision;
  return Math.round((input + Number.EPSILON) * factor) / factor;
};

const hexToRgbaColor = (value: string) => {
  try {
    const parsed = parseToRgb(value || '#000000');
    return {
      r: Math.round(parsed.red),
      g: Math.round(parsed.green),
      b: Math.round(parsed.blue),
      a: 'alpha' in parsed ? roundTo(parsed.alpha, 2) : 1,
    };
  } catch (err) {
    console.error(err);
    return { ...DEFAULT_RGBA };
  }
};

const hexToHslaColor = (value: string) => {
  try {
    const parsed = parseToHsl(value || '#000000');
    return {
      h: Math.round(parsed.hue),
      s: Math.round(parsed.saturation * 100),
      l: Math.round(parsed.lightness * 100),
      a: 'alpha' in parsed ? roundTo(parsed.alpha, 2) : 1,
    };
  } catch (err) {
    console.error(err);
    return { ...DEFAULT_HSLA };
  }
};

const ColorPicker: React.FC<Props> = ({ value = '#000000', onChange }) => {
  const [inputMode, setInputMode] = React.useState(InputMode.RGBA);
  const [internalValue, setInternalValue] = React.useState(value);
  const [rgba, setRgba] = React.useState<Rgba>(hexToRgbaColor(value));
  const [hsla, setHsla] = React.useState<Hsla>(hexToHslaColor(value));

  const handlePickerChange = React.useCallback(
    (inputValue: RgbaColor) => {
      const hex = toColorString({
        red: inputValue.r,
        green: inputValue.g,
        blue: inputValue.b,
        alpha: inputValue.a,
      });
      setHsla(hexToHslaColor(hex));
      setRgba(hexToRgbaColor(hex));
      setInternalValue(hex);
      onChange(hex);
    },
    [onChange],
  );

  const handleColorPartValueChange = React.useCallback(
    (part: keyof typeof rgba | keyof typeof hsla, val: number) => {
      if (part === 'r' || part === 'g' || part === 'b' || (part === 'a' && inputMode === InputMode.RGBA)) {
        const hex = toColorString({
          red: part === 'r' ? val : rgba.r,
          green: part === 'g' ? val : rgba.g,
          blue: part === 'b' ? val : rgba.b,
          alpha: part === 'a' ? val : rgba.a,
        });
        setRgba({ ...rgba, [part]: val });
        setHsla(hexToHslaColor(hex));
        setInternalValue(hex);
        onChange(hex);
      } else if (part === 'h' || part === 's' || part === 'l' || (part === 'a' && inputMode === InputMode.HSLA)) {
        const hex = toColorString({
          hue: part === 'h' ? val : hsla.h,
          saturation: (part === 's' ? val : hsla.s) / 100,
          lightness: (part === 'l' ? val : hsla.l) / 100,
          alpha: part === 'a' ? val : hsla.a,
        });
        setHsla({ ...hsla, [part]: val });
        setRgba(hexToRgbaColor(hex));
        setInternalValue(hex);
        onChange(hex);
      }
    },
    [rgba, hsla, inputMode, onChange],
  );

  const handleRedChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => handleColorPartValueChange('r', event.currentTarget.valueAsNumber),
    [handleColorPartValueChange],
  );

  const handleGreenChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => handleColorPartValueChange('g', event.currentTarget.valueAsNumber),
    [handleColorPartValueChange],
  );

  const handleBlueChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => handleColorPartValueChange('b', event.currentTarget.valueAsNumber),
    [handleColorPartValueChange],
  );

  const handleHueChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => handleColorPartValueChange('h', event.currentTarget.valueAsNumber),
    [handleColorPartValueChange],
  );

  const handleSaturationChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => handleColorPartValueChange('s', event.currentTarget.valueAsNumber),
    [handleColorPartValueChange],
  );

  const handleLightnessChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => handleColorPartValueChange('l', event.currentTarget.valueAsNumber),
    [handleColorPartValueChange],
  );

  const handleAlphaChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => handleColorPartValueChange('a', event.currentTarget.valueAsNumber),
    [handleColorPartValueChange],
  );

  const handleInputModeToggle = React.useCallback(() => {
    setInputMode(inputMode === InputMode.RGBA ? InputMode.HSLA : InputMode.RGBA);
  }, [inputMode]);

  React.useEffect(() => {
    if (value !== internalValue) {
      setInternalValue(value);
      setRgba(hexToRgbaColor(value));
      setHsla(hexToHslaColor(value));
    }
  }, [value, internalValue]);

  return (
    <Stack direction="column" gap={1} css={{ marginTop: '$2' }}>
      <div className="color-picker">
        <RgbaColorPicker color={rgba} onChange={handlePickerChange} />
      </div>
      <Stack direction="row" gap={1}>
        {inputMode === InputMode.RGBA && (
        <Stack direction="row" gap={1}>
          <Input {...PROPS} min={0} max={255} name="r" value={rgba.r} onChange={handleRedChange} />
          <Input {...PROPS} min={0} max={255} name="g" value={rgba.g} onChange={handleGreenChange} />
          <Input {...PROPS} min={0} max={255} name="b" value={rgba.b} onChange={handleBlueChange} />
          <Input
            {...PROPS}
            min={0}
            max={1}
            step="0.01"
            name="a"
            value={rgba.a}
            onChange={handleAlphaChange}
          />
        </Stack>
        )}
        {inputMode === InputMode.HSLA && (
        <Stack direction="row" gap={1}>
          <Input {...PROPS} min={0} max={360} name="h" value={hsla.h} onChange={handleHueChange} />
          <Input {...PROPS} min={0} max={100} name="s" value={hsla.s} onChange={handleSaturationChange} />
          <Input {...PROPS} min={0} max={100} name="l" value={hsla.l} onChange={handleLightnessChange} />
          <Input
            {...PROPS}
            step="0.01"
            min={0}
            max={1}
            name="a"
            value={hsla.a}
            onChange={handleAlphaChange}
          />
        </Stack>
        )}
        <Button variant="secondary" size="small" onClick={handleInputModeToggle}>
          {inputMode === InputMode.RGBA ? 'RGB(A)' : 'HSL(A)'}
        </Button>
      </Stack>
    </Stack>
  );
};

export default ColorPicker;
