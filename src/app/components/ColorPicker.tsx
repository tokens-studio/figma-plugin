import * as React from 'react';
import {RgbaColorPicker, RgbaColor} from 'react-colorful';
import {parseToRgb, parseToHsl, toColorString} from 'polished';
import Input from './Input';
import Button from './Button';

enum InputMode {
    RGBA = 'rgba',
    HSLA = 'hsla',
}

type Props = {
    value: string;
    onChange: (color: string) => void;
};

const DEFAULT_RGBA = Object.freeze({r: 0, g: 0, b: 0, a: 1});
const DEFAULT_HSLA = Object.freeze({h: 0, s: 0, l: 0, a: 1});
const PROPS: Omit<React.ComponentProps<typeof Input>, 'name'> = {
    full: true,
    type: 'number',
};

const ColorPicker: React.FC<Props> = ({value, onChange}) => {
    const [inputMode, setInputMode] = React.useState(InputMode.RGBA);

    const rgba = React.useMemo(() => {
        try {
            const parsed = parseToRgb(value || '#000000');
            return {
                r: parsed.red,
                g: parsed.green,
                b: parsed.blue,
                a: 'alpha' in parsed ? parsed.alpha : 1,
            };
        } catch (err) {
            console.error(err);
            return {...DEFAULT_RGBA};
        }
    }, [value]);

    const hsla = React.useMemo(() => {
        try {
            const parsed = parseToHsl(value || '#000000');
            return {
                h: parsed.hue * 100,
                s: parsed.saturation * 100,
                l: parsed.lightness * 100,
                a: 'alpha' in parsed ? parsed.alpha : 1,
            };
        } catch (err) {
            console.error(err);
            return {...DEFAULT_HSLA};
        }
    }, [value]);

    console.log(hsla);

    const handlePickerChange = React.useCallback(
        (inputValue: RgbaColor) => {
            onChange(
                toColorString({
                    red: inputValue.r,
                    green: inputValue.g,
                    blue: inputValue.b,
                    alpha: inputValue.a,
                })
            );
        },
        [onChange]
    );

    const handleColorPartValueChange = React.useCallback(
        (part: keyof typeof rgba | keyof typeof hsla, val: number) => {
            if (part === 'r' || part === 'g' || part === 'b' || (part === 'a' && inputMode === InputMode.RGBA)) {
                onChange(
                    toColorString({
                        red: part === 'r' ? val : rgba.r,
                        green: part === 'g' ? val : rgba.g,
                        blue: part === 'b' ? val : rgba.b,
                        alpha: part === 'a' ? val : rgba.a,
                    })
                );
            } else if (part === 'h' || part === 's' || part === 'l' || (part === 'a' && inputMode === InputMode.HSLA)) {
                onChange(
                    toColorString({
                        hue: part === 'h' ? val / 100 : hsla.h,
                        saturation: part === 's' ? val / 100 : hsla.s,
                        lightness: part === 'l' ? val / 100 : hsla.l,
                        alpha: part === 'a' ? val : hsla.a,
                    })
                );
            }
        },
        [rgba, hsla, inputMode, onChange]
    );

    const handleRedChange = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) =>
            handleColorPartValueChange('r', event.currentTarget.valueAsNumber),
        [handleColorPartValueChange]
    );

    const handleGreenChange = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) =>
            handleColorPartValueChange('g', event.currentTarget.valueAsNumber),
        [handleColorPartValueChange]
    );

    const handleBlueChange = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) =>
            handleColorPartValueChange('b', event.currentTarget.valueAsNumber),
        [handleColorPartValueChange]
    );

    const handleHueChange = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) =>
            handleColorPartValueChange('h', event.currentTarget.valueAsNumber),
        [handleColorPartValueChange]
    );

    const handleSaturationChange = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) =>
            handleColorPartValueChange('s', event.currentTarget.valueAsNumber),
        [handleColorPartValueChange]
    );

    const handleLightnessChange = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) =>
            handleColorPartValueChange('l', event.currentTarget.valueAsNumber),
        [handleColorPartValueChange]
    );

    const handleAlphaChange = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) =>
            handleColorPartValueChange('a', event.currentTarget.valueAsNumber),
        [handleColorPartValueChange]
    );

    const handleInputModeToggle = React.useCallback(() => {
        setInputMode(inputMode === InputMode.RGBA ? InputMode.HSLA : InputMode.RGBA);
    }, [inputMode]);

    return (
        <div className="mt-2">
            <div className="color-picker rounded-sm border border-gray-300 font-sans mb-1">
                <RgbaColorPicker color={rgba} onChange={handlePickerChange} />
            </div>
            <div className="flex">
                {inputMode === InputMode.RGBA && (
                    <div className="grid gap-1 grid-cols-4 mr-1">
                        <Input {...PROPS} min={0} max={255} name="r" value={rgba.r} onChange={handleRedChange} />
                        <Input {...PROPS} min={0} max={255} name="g" value={rgba.g} onChange={handleGreenChange} />
                        <Input {...PROPS} min={0} max={255} name="b" value={rgba.b} onChange={handleBlueChange} />
                        <Input {...PROPS} min={0} max={1} name="a" value={rgba.a} onChange={handleAlphaChange} />
                    </div>
                )}
                {inputMode === InputMode.HSLA && (
                    <div className="grid gap-1 grid-cols-4 mr-1">
                        <Input {...PROPS} min={0} max={100} name="h" value={hsla.h} onChange={handleHueChange} />
                        <Input {...PROPS} min={0} max={100} name="s" value={hsla.s} onChange={handleSaturationChange} />
                        <Input {...PROPS} min={0} max={100} name="l" value={hsla.l} onChange={handleLightnessChange} />
                        <Input {...PROPS} min={0} max={1} name="a" value={hsla.a} onChange={handleAlphaChange} />
                    </div>
                )}
                <Button variant="secondary" size="small" onClick={handleInputModeToggle}>
                    {inputMode === InputMode.RGBA ? 'HSL(A)' : 'RGB(A)'}
                </Button>
            </div>
        </div>
    );
};

export default ColorPicker;
