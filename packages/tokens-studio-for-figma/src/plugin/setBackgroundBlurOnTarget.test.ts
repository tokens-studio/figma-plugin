import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';
import { TokenTypes } from '@/constants/TokenTypes';
import { defaultTokenValueRetriever } from './TokenValueRetriever';
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

  describe('variable binding', () => {
    const mockVariable = { id: 'var:123', name: 'blur/background' };
    const boundEffect = {
      type: 'BACKGROUND_BLUR',
      visible: true,
      radius: 3,
      boundVariables: { radius: { type: 'VARIABLE_ALIAS', id: 'var:123' } },
    };

    beforeEach(() => {
      defaultTokenValueRetriever.applyVariablesStylesOrRawValue = ApplyVariablesStylesOrRawValues.VARIABLES_STYLES;
      defaultTokenValueRetriever.getVariableReference = jest.fn().mockResolvedValue(mockVariable);
      (figma.variables.setBoundVariableForEffect as jest.Mock) = jest.fn().mockReturnValue(boundEffect);
    });

    afterEach(() => {
      defaultTokenValueRetriever.applyVariablesStylesOrRawValue = ApplyVariablesStylesOrRawValues.RAW_VALUES;
    });

    it('binds variable to radius when tokenName is provided and variables mode is active', async () => {
      await setBackgroundBlurOnTarget(rectangleNodeMock, dimensionToken, '16px', 'blur.background');

      expect(defaultTokenValueRetriever.getVariableReference).toHaveBeenCalledWith('blur.background');
      expect(figma.variables.setBoundVariableForEffect).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'BACKGROUND_BLUR', radius: 3 }),
        'radius',
        mockVariable,
      );
      expect(rectangleNodeMock.effects[0]).toEqual(expect.objectContaining({
        boundVariables: { radius: { type: 'VARIABLE_ALIAS', id: 'var:123' } },
      }));
    });

    it('does not bind variable when tokenName is not provided', async () => {
      await setBackgroundBlurOnTarget(rectangleNodeMock, dimensionToken, '16px');

      expect(defaultTokenValueRetriever.getVariableReference).not.toHaveBeenCalled();
      expect(figma.variables.setBoundVariableForEffect).not.toHaveBeenCalled();
    });

    it('does not bind variable when applyVariablesStylesOrRawValue is not VARIABLES_STYLES', async () => {
      defaultTokenValueRetriever.applyVariablesStylesOrRawValue = ApplyVariablesStylesOrRawValues.RAW_VALUES;

      await setBackgroundBlurOnTarget(rectangleNodeMock, dimensionToken, '16px', 'blur.background');

      expect(defaultTokenValueRetriever.getVariableReference).not.toHaveBeenCalled();
    });

    it('falls back to raw value when variable reference is not found', async () => {
      defaultTokenValueRetriever.getVariableReference = jest.fn().mockResolvedValue(undefined);

      await setBackgroundBlurOnTarget(rectangleNodeMock, dimensionToken, '16px', 'blur.background');

      expect(figma.variables.setBoundVariableForEffect).not.toHaveBeenCalled();
      expect(rectangleNodeMock.effects[0]).toEqual({
        type: 'BACKGROUND_BLUR',
        visible: true,
        radius: 3,
      });
    });

    it('falls back gracefully when setBoundVariableForEffect throws', async () => {
      (figma.variables.setBoundVariableForEffect as jest.Mock).mockImplementation(() => {
        throw new Error('Figma API error');
      });

      await setBackgroundBlurOnTarget(rectangleNodeMock, dimensionToken, '16px', 'blur.background');

      expect(rectangleNodeMock.effects[0]).toEqual({
        type: 'BACKGROUND_BLUR',
        visible: true,
        radius: 3,
      });
    });
  });
});
