import {SingleTokenObject} from 'Types/tokens';
import filterMatchingStyles from './filterMatchingStyles';

describe('filterMatchingStyles', () => {
    const token: SingleTokenObject = {
        name: 'colors.blue.500',
        type: 'color',
        value: '#00f',
    };
    const styles: PaintStyle[] = [
        {
            name: 'colors/blue/500',
            paints: [],
            type: 'PAINT',
            id: '1',
            description: '',
            remote: false,
            key: '1',
            remove: null,
            getPublishStatusAsync: null,
        },
        {
            name: 'colors/blue / 500',
            paints: [],
            type: 'PAINT',
            id: '2',
            description: '',
            remote: false,
            key: '1',
            remove: null,
            getPublishStatusAsync: null,
        },
        {
            name: 'colors.blue.300',
            paints: [],
            type: 'PAINT',
            id: '3',
            description: '',
            remote: false,
            key: '1',
            remove: null,
            getPublishStatusAsync: null,
        },
    ];
    it('returns matching styles', () => {
        expect(filterMatchingStyles(token, styles)).toEqual(styles.slice(0, 2));
    });
});
