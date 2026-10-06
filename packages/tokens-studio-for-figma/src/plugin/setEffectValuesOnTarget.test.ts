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

  it('sets the description on a style target when it differs, and does not rewrite it again', async () => {
    let descriptionSetCount = 0;
    let storedDescription = '';
    const effectStyleMock = {
      type: 'EFFECT',
      effects: [],
    } as unknown as EffectStyle;
    Object.defineProperty(effectStyleMock, 'description', {
      get: () => storedDescription,
      set: (v: string) => {
        storedDescription = v;
        descriptionSetCount += 1;
      },
    });

    await setEffectValuesOnTarget(effectStyleMock, singleShadowToken.name, defaultBaseFontSize);
    expect(effectStyleMock.description).toEqual(singleShadowToken.description);
    expect(descriptionSetCount).toBe(1);

    // Re-exporting the identical description must not write it again, otherwise
    // Figma marks the style as modified even though nothing changed.
    await setEffectValuesOnTarget(effectStyleMock, singleShadowToken.name, defaultBaseFontSize);
    expect(descriptionSetCount).toBe(1);
  });

  it('does not rewrite effects on a second export with the same token', async () => {
    await setEffectValuesOnTarget(rectangleNodeMock, singleShadowToken.name, defaultBaseFontSize);
    const effectsAfterFirstExport = rectangleNodeMock.effects;

    await setEffectValuesOnTarget(rectangleNodeMock, singleShadowToken.name, defaultBaseFontSize);

    // Same array reference — re-exporting an unchanged token must not touch the style,
    // otherwise Figma marks it as modified and it shows up as "ready to publish" again.
    expect(rectangleNodeMock.effects).toBe(effectsAfterFirstExport);
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
