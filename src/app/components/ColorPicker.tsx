import * as React from 'react';
import {RgbaColorPicker, RgbaColor} from 'react-colorful';
import {parseToRgb, toColorString} from 'polished';

type Props = {
    value: string;
    onChange: (color: string) => void;
};

const ColorPicker: React.FC<Props> = ({value, onChange}) => {
    const rgba = React.useMemo(() => {
        const parsed = parseToRgb(value || '#000000');
        return {
            r: parsed.red,
            g: parsed.green,
            b: parsed.blue,
            a: 'alpha' in parsed ? parsed.alpha : 1,
        };
    }, [value]);

    const handleChange = React.useCallback(
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

    return (
        <div className="color-picker">
            <RgbaColorPicker color={rgba} onChange={handleChange} />
        </div>
    );
};

export default ColorPicker;
