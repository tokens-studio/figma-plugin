import { defaultBaseFontSize } from '@/constants/defaultBaseFontSize';
import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
import setEffectValuesOnTarget from './setEffectValuesOnTarget';
import { defaultTokenValueRetriever } from './TokenValueRetriever';

const singleShadowTokenValue = {
  type: BoxShadowTypes.DROP_SHADOW,
  color: '#00000080',
  x: 0,
  y: 0,
  blur: 10,
  spread: 0,
};

const singleShadowToken: SingleToken = {
  name: 'shadow.large',
  type: TokenTypes.BOX_SHADOW,
  description: 'the one with one shadow',
  value: singleShadowTokenValue,
  resolvedValueWithReferences: singleShadowTokenValue,
};

const multipleShadowTokenValue = [
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
];

const multipleShadowToken: SingleToken = {
  name: 'shadow.xlarge',
  type: TokenTypes.BOX_SHADOW,
  description: 'the one with multiple shadow',
  value: multipleShadowTokenValue,
  resolvedValueWithReferences: multipleShadowTokenValue,
};

const mixedShadowTokenValue = [
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
];

const mixedShadowToken: SingleToken = {
  name: 'shadow.mixed',
  type: TokenTypes.BOX_SHADOW,
  description: 'the one with mixed shadows',
  value: mixedShadowTokenValue,
  resolvedValueWithReferences: mixedShadowTokenValue,
};

const tokens = [singleShadowToken, multipleShadowToken, mixedShadowToken];

describe('setEffectValuesOnTarget', () => {
  let rectangleNodeMock: RectangleNode;

  beforeEach(() => {
    defaultTokenValueRetriever.initiate({
      tokens,
    });
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
    await setEffectValuesOnTarget(rectangleNodeMock, singleShadowToken.name, defaultBaseFontSize);
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
    await setEffectValuesOnTarget(rectangleNodeMock, multipleShadowToken.name, defaultBaseFontSize);
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
          showShadowBehindNode: true,
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
          showShadowBehindNode: true,
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
    await setEffectValuesOnTarget(rectangleNodeMock, mixedShadowToken.name, defaultBaseFontSize);
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
          showShadowBehindNode: true,
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
          showShadowBehindNode: true,
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
    await setEffectValuesOnTarget(rectangleNodeMock, mixedShadowToken.name, defaultBaseFontSize);
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
          showShadowBehindNode: true,
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
          showShadowBehindNode: true,
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
