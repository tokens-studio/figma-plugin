import { TokenTypes } from '@/constants/TokenTypes';
import setBackgroundBlurOnTarget from './setBackgroundBlurOnTarget';

const shadowEffect = {
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
};

const previousBlur = {
  type: 'BACKGROUND_BLUR',
  radius: 10,
  visible: true,
};

const dimensionToken = {
  name: 'backgroundBlur.3',
  type: TokenTypes.DIMENSION,
  value: '3px',
};

describe('setBackgroundBlurOnTarget', () => {
  let shadowNodeMock: RectangleNode;
  let rectangleNodeMock: RectangleNode;
  let existingBlurNodeMock: RectangleNode;
  let combinedMock: RectangleNode;

  beforeEach(() => {
    shadowNodeMock = {
      type: 'RECTANGLE',
      fills: [],
      effects: [shadowEffect],
    } as unknown as RectangleNode;
    rectangleNodeMock = {
      type: 'RECTANGLE',
      fills: [],
      effects: [],
    } as unknown as RectangleNode;
    existingBlurNodeMock = {
      type: 'RECTANGLE',
      fills: [],
      effects: [previousBlur],
    } as unknown as RectangleNode;
    combinedMock = {
      type: 'RECTANGLE',
      fills: [],
      effects: [shadowEffect, previousBlur],
    } as unknown as RectangleNode;
  });

  it('sets background blur token on plain layer', async () => {
    await setBackgroundBlurOnTarget(rectangleNodeMock, dimensionToken);
    expect(rectangleNodeMock).toEqual({
      ...rectangleNodeMock,
      effects: [
        {
          type: 'BACKGROUND_BLUR',
          visible: true,
          radius: 3,
        },
      ],
    });
  });

  it('overwrites existing blur', async () => {
    await setBackgroundBlurOnTarget(existingBlurNodeMock, dimensionToken);
    expect(existingBlurNodeMock).toEqual({
      ...existingBlurNodeMock,
      effects: [
        {
          type: 'BACKGROUND_BLUR',
          visible: true,
          radius: 3,
        },
      ],
    });
  });

  it('overwrites existing blur even when used in combination with others', async () => {
    await setBackgroundBlurOnTarget(combinedMock, dimensionToken);
    expect(combinedMock).toEqual({
      ...combinedMock,
      effects: [
        shadowEffect,
        {
          type: 'BACKGROUND_BLUR',
          visible: true,
          radius: 3,
        },
      ],
    });
  });

  it('appends to already existing layer with shadows', async () => {
    await setBackgroundBlurOnTarget(shadowNodeMock, dimensionToken);
    expect(shadowNodeMock).toEqual({
      ...shadowNodeMock,
      effects: [
        shadowEffect,
        {
          type: 'BACKGROUND_BLUR',
          visible: true,
          radius: 3,
        },
      ],
    });
  });
});
