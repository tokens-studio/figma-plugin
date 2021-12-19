import {SingleTokenObject} from '@/types/tokens';
import setEffectValuesOnTarget from './setEffectValuesOnTarget';

const singleShadowToken: SingleTokenObject = {
    name: 'shadow.large',
    type: 'boxShadow',
    description: 'the one with one shadow',
    value: {
        type: 'dropShadow',
        color: '#00000080',
        x: 0,
        y: 0,
        blur: 10,
        spread: 0,
    },
};

const multipleShadowToken: SingleTokenObject = {
    name: 'shadow.xlarge',
    type: 'boxShadow',
    description: 'the one with multiple shadow',
    value: [
        {
            type: 'dropShadow',
            color: '#00000080',
            x: 0,
            y: 0,
            blur: 2,
            spread: 4,
        },
        {
            type: 'dropShadow',
            color: '#000000',
            x: 0,
            y: 4,
            blur: 4,
            spread: 4,
        },
        {
            type: 'dropShadow',
            color: '#000000',
            x: 0,
            y: 8,
            blur: 16,
            spread: 4,
        },
    ],
};
const mixedShadowToken: SingleTokenObject = {
    name: 'shadow.mixed',
    type: 'boxShadow',
    description: 'the one with mixed shadows',
    value: [
        {
            type: 'innerShadow',
            color: '#00000080',
            x: 0,
            y: 0,
            blur: 2,
            spread: 4,
        },
        {
            type: 'dropShadow',
            color: '#000000',
            x: 0,
            y: 4,
            blur: 4,
            spread: 4,
        },
        {
            type: 'dropShadow',
            color: '#000000',
            x: 0,
            y: 8,
            blur: 16,
            spread: 4,
        },
    ],
};

describe('setEffectValuesOnTarget', () => {
    let rectangleNodeMock: RectangleNode;

    beforeEach(() => {
        rectangleNodeMock = {
            type: 'RECTANGLE',
            fills: [],
            effects: [],
        };
    });

    it('sets single shadow token', async () => {
        await setEffectValuesOnTarget(rectangleNodeMock, singleShadowToken);
        expect(rectangleNodeMock).toEqual({
            ...rectangleNodeMock,
            effects: [
                {
                    type: 'DROP_SHADOW',
                    blendMode: 'NORMAL',
                    visible: true,
                    color: {
                        a: 0.5,
                        r: 0,
                        g: 0,
                        b: 0,
                    },
                    offset: {x: 0, y: 0},
                    radius: 10,
                    spread: 0,
                },
            ],
        });
    });

    it('sets multiple shadow tokens', async () => {
        await setEffectValuesOnTarget(rectangleNodeMock, multipleShadowToken);
        expect(rectangleNodeMock).toEqual({
            ...rectangleNodeMock,
            effects: [
                {
                    type: 'DROP_SHADOW',
                    blendMode: 'NORMAL',
                    visible: true,
                    color: {
                        a: 0.5,
                        r: 0,
                        g: 0,
                        b: 0,
                    },
                    offset: {x: 0, y: 0},
                    radius: 2,
                    spread: 4,
                },
                {
                    type: 'DROP_SHADOW',
                    blendMode: 'NORMAL',
                    visible: true,
                    color: {
                        a: 1,
                        r: 0,
                        g: 0,
                        b: 0,
                    },
                    offset: {x: 0, y: 4},
                    radius: 4,
                    spread: 4,
                },
                {
                    type: 'DROP_SHADOW',
                    blendMode: 'NORMAL',
                    visible: true,
                    color: {
                        a: 1,
                        r: 0,
                        g: 0,
                        b: 0,
                    },
                    offset: {x: 0, y: 8},
                    radius: 16,
                    spread: 4,
                },
            ],
        });
    });

    it('sets mixed shadow tokens', async () => {
        await setEffectValuesOnTarget(rectangleNodeMock, mixedShadowToken);
        expect(rectangleNodeMock).toEqual({
            ...rectangleNodeMock,
            effects: [
                {
                    type: 'INNER_SHADOW',
                    blendMode: 'NORMAL',
                    visible: true,
                    color: {
                        a: 0.5,
                        r: 0,
                        g: 0,
                        b: 0,
                    },
                    offset: {x: 0, y: 0},
                    radius: 2,
                    spread: 4,
                },
                {
                    type: 'DROP_SHADOW',
                    blendMode: 'NORMAL',
                    visible: true,
                    color: {
                        a: 1,
                        r: 0,
                        g: 0,
                        b: 0,
                    },
                    offset: {x: 0, y: 4},
                    radius: 4,
                    spread: 4,
                },
                {
                    type: 'DROP_SHADOW',
                    blendMode: 'NORMAL',
                    visible: true,
                    color: {
                        a: 1,
                        r: 0,
                        g: 0,
                        b: 0,
                    },
                    offset: {x: 0, y: 8},
                    radius: 16,
                    spread: 4,
                },
            ],
        });
    });
});
