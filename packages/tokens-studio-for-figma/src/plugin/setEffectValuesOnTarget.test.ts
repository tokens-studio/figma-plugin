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

// DTCG shadows use offsetX/offsetY and inset instead of x/y and type
const dtcgShadowTokenValue = [
  {
    color: '#00000080',
    offsetX: 2,
    offsetY: '4px',
    blur: 8,
    spread: 0,
    inset: true,
  },
  {
    type: BoxShadowTypes.DROP_SHADOW,
    color: '#000000',
    offsetX: 0,
    offsetY: 6,
    blur: 12,
    spread: 1,
  },
];

const dtcgShadowToken = {
  name: 'shadow.dtcg',
  type: TokenTypes.BOX_SHADOW,
  value: dtcgShadowTokenValue,
  resolvedValueWithReferences: dtcgShadowTokenValue,
} as unknown as SingleToken;

const missingOffsetShadowTokenValue = {
  type: BoxShadowTypes.DROP_SHADOW,
  color: '#000000',
  blur: 4,
  spread: 0,
};

const missingOffsetShadowToken = {
  name: 'shadow.missingOffset',
  type: TokenTypes.BOX_SHADOW,
  value: missingOffsetShadowTokenValue,
  resolvedValueWithReferences: missingOffsetShadowTokenValue,
} as unknown as SingleToken;

const tokens = [singleShadowToken, multipleShadowToken, mixedShadowToken, dtcgShadowToken, missingOffsetShadowToken];

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

  it('reads DTCG offsetX/offsetY and inset', async () => {
    await setEffectValuesOnTarget(rectangleNodeMock, dtcgShadowToken.name, defaultBaseFontSize);
    expect(rectangleNodeMock.effects).toEqual([
      expect.objectContaining({
        type: 'DROP_SHADOW', offset: { x: 0, y: 6 }, radius: 12, spread: 1,
      }),
      expect.objectContaining({
        type: 'INNER_SHADOW', offset: { x: 2, y: 4 }, radius: 8, spread: 0,
      }),
    ]);
  });

  it('treats missing offsets as 0 instead of leaving the effects empty', async () => {
    await setEffectValuesOnTarget(rectangleNodeMock, missingOffsetShadowToken.name, defaultBaseFontSize);
    expect(rectangleNodeMock.effects).toEqual([
      expect.objectContaining({
        type: 'DROP_SHADOW', offset: { x: 0, y: 0 }, radius: 4, spread: 0,
      }),
    ]);
  });
});
