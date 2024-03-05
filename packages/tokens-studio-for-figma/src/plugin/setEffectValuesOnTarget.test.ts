import { defaultBaseFontSize } from '@/constants/defaultBaseFontSize';
import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
import setEffectValuesOnTarget from './setEffectValuesOnTarget';

const singleShadowToken: SingleToken = {
  name: 'shadow.large',
  type: TokenTypes.BOX_SHADOW,
  description: 'the one with one shadow',
  value: {
    type: BoxShadowTypes.DROP_SHADOW,
    color: '#00000080',
    x: 0,
    y: 0,
    blur: 10,
    spread: 0,
  },
};

const multipleShadowToken: SingleToken = {
  name: 'shadow.xlarge',
  type: TokenTypes.BOX_SHADOW,
  description: 'the one with multiple shadow',
  value: [
    {
      type: BoxShadowTypes.DROP_SHADOW,
      color: '#00000080',
      x: 0,
      y: 0,
      blur: '2px',
      spread: 4,
    },
    {
      type: BoxShadowTypes.DROP_SHADOW,
      color: '#000000',
      x: 0,
      y: '4px',
      blur: 4,
      spread: 4,
    },
    {
      type: BoxShadowTypes.DROP_SHADOW,
      color: '#000000',
      x: '0px',
      y: 8,
      blur: 16,
      spread: '4px',
    },
  ],
};
const mixedShadowToken: SingleToken = {
  name: 'shadow.mixed',
  type: TokenTypes.BOX_SHADOW,
  description: 'the one with mixed shadows',
  value: [
    {
      type: BoxShadowTypes.INNER_SHADOW,
      color: '#00000080',
      x: 0,
      y: 0,
      blur: 2,
      spread: 4,
    },
    {
      type: BoxShadowTypes.DROP_SHADOW,
      color: '#000000',
      x: 0,
      y: 4,
      blur: 4,
      spread: 4,
    },
    {
      type: BoxShadowTypes.DROP_SHADOW,
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
      effects: [{
        type: 'DROP_SHADOW',
        blendMode: 'NORMAL',
        visible: true,
        color: {
          a: 0.5,
          r: 0,
          g: 0,
          b: 0,
        },
        offset: { x: 0, y: 0 },
        radius: 2,
        spread: 4,
        showShadowBehindNode: true,
      }],
    } as unknown as RectangleNode;
  });

  it('sets single shadow token', async () => {
    await setEffectValuesOnTarget(rectangleNodeMock, singleShadowToken, defaultBaseFontSize);
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
          offset: { x: 0, y: 0 },
          radius: 10,
          spread: 0,
          showShadowBehindNode: true,
        },
      ],
    });
  });

  it('sets multiple shadow tokens', async () => {
    await setEffectValuesOnTarget(rectangleNodeMock, multipleShadowToken, defaultBaseFontSize);
    expect(rectangleNodeMock).toEqual({
      ...rectangleNodeMock,
      effects: [
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
          offset: { x: 0, y: 8 },
          radius: 16,
          spread: 4,
          showShadowBehindNode: false,
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
          offset: { x: 0, y: 4 },
          radius: 4,
          spread: 4,
          showShadowBehindNode: false,
        },
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
          offset: { x: 0, y: 0 },
          radius: 2,
          spread: 4,
          showShadowBehindNode: true,
        },
      ],
    });
  });

  it('sets mixed shadow tokens', async () => {
    const rectangleNodeMockOriginal = rectangleNodeMock;
    await setEffectValuesOnTarget(rectangleNodeMock, mixedShadowToken, defaultBaseFontSize);
    expect(rectangleNodeMock).toEqual({
      ...rectangleNodeMockOriginal,
      effects: [
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
          offset: { x: 0, y: 8 },
          radius: 16,
          spread: 4,
          showShadowBehindNode: false,
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
          offset: { x: 0, y: 4 },
          radius: 4,
          spread: 4,
          showShadowBehindNode: false,
        },
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
          offset: { x: 0, y: 0 },
          radius: 2,
          spread: 4,
        },
      ],
    });
  });

  it('respects set show behind setting for mixed shadow tokens', async () => {
    const rectangleNodeMockOriginal = rectangleNodeMock;
    await setEffectValuesOnTarget(rectangleNodeMock, mixedShadowToken, defaultBaseFontSize);
    expect(rectangleNodeMock).toEqual({
      ...rectangleNodeMockOriginal,
      effects: [
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
          offset: { x: 0, y: 8 },
          radius: 16,
          spread: 4,
          showShadowBehindNode: false,
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
          offset: { x: 0, y: 4 },
          radius: 4,
          spread: 4,
          showShadowBehindNode: false,
        },
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
          offset: { x: 0, y: 0 },
          radius: 2,
          spread: 4,
        },
      ],
    });
  });
});
