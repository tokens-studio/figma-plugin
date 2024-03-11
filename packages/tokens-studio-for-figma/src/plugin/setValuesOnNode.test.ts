import { TokenTypes } from '@/constants/TokenTypes';
import { defaultTokenValueRetriever } from './TokenValueRetriever';
import setValuesOnNode from './setValuesOnNode';

describe('setValuesOnNode', () => {
  let textNodeMock: RectangleNode;
  let frameNodeMock: FrameNode;
  beforeEach(() => {
    defaultTokenValueRetriever.initiate({
      tokens: [{
        name: 'border-radius.3',
        value: '10px',
        type: TokenTypes.BORDER_RADIUS,
      }, {
        name: 'spacing.10',
        value: '10px',
        type: TokenTypes.SPACING,
      }],
    });
    textNodeMock = {
      cornerRadius: 3,
      bottomLeftRadius: 3,
      bottomRightRadius: 3,
      topLeftRadius: 3,
      topRightRadius: 3,
      id: '123:456',
    } as RectangleNode;
    frameNodeMock = {
      paddingBottom: 3,
      paddingLeft: 3,
      paddingRight: 3,
      paddingTop: 3,
      id: '123:457',
    } as FrameNode;
  });

  afterEach(() => {
    defaultTokenValueRetriever.clearCache();
  });

  const data = {
    borderRadius: 'border-radius.3',
    spacing: 'spacing.10',
  };

  it('should apply all border when borderRadius token has one value', async () => {
    const borderRadiusTokenWithOneValue = {
      borderRadius: '10px',
    };
    await setValuesOnNode({ node: textNodeMock, values: borderRadiusTokenWithOneValue, data });
    expect(textNodeMock).toEqual({
      ...textNodeMock,
      cornerRadius: 10,
      bottomLeftRadius: 3,
      bottomRightRadius: 3,
      topLeftRadius: 3,
      topRightRadius: 3,
    });
  });

  it('should apply two-value borderRadius token', async () => {
    const borderRadiusTokenWithTwoValue = {
      borderRadius: '10px 20px',
    };
    await setValuesOnNode({ node: textNodeMock, values: borderRadiusTokenWithTwoValue, data });
    expect(textNodeMock).toEqual({
      ...textNodeMock,
      cornerRadius: 3,
      bottomLeftRadius: 20,
      bottomRightRadius: 10,
      topLeftRadius: 10,
      topRightRadius: 20,
    });
  });

  it('should apply three-value borderRadius token', async () => {
    const borderRadiusTokenWithThreeValue = {
      borderRadius: '10px 20px 30px',
    };
    await setValuesOnNode({ node: textNodeMock, values: borderRadiusTokenWithThreeValue, data });
    expect(textNodeMock).toEqual({
      ...textNodeMock,
      cornerRadius: 3,
      bottomLeftRadius: 20,
      bottomRightRadius: 30,
      topLeftRadius: 10,
      topRightRadius: 20,
    });
  });

  it('should apply four-value borderRadius token', async () => {
    const borderRadiusTokenWithFourValue = {
      borderRadius: '10px 20px 30px 40px',
    };
    await setValuesOnNode({ node: textNodeMock, values: borderRadiusTokenWithFourValue, data });
    expect(textNodeMock).toEqual({
      ...textNodeMock,
      cornerRadius: 3,
      bottomLeftRadius: 40,
      bottomRightRadius: 30,
      topLeftRadius: 10,
      topRightRadius: 20,
    });
  });

  it('should not apply five-value borderRadius token', async () => {
    const borderRadiusTokenWithFiveValue = {
      borderRadius: '10px 20px 30px 40px 50px',
    };
    await setValuesOnNode({ node: textNodeMock, values: borderRadiusTokenWithFiveValue, data });
    expect(textNodeMock).toEqual({
      ...textNodeMock,
      cornerRadius: 3,
      bottomLeftRadius: 3,
      bottomRightRadius: 3,
      topLeftRadius: 3,
      topRightRadius: 3,
    });
  });

  it('should apply one-value spacing token', async () => {
    const spacingTokenWithOneValue = {
      spacing: '10px',
    };
    await setValuesOnNode({ node: frameNodeMock, values: spacingTokenWithOneValue, data });
    expect(frameNodeMock).toEqual({
      ...frameNodeMock,
      paddingBottom: 10,
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 10,
    });
  });

  it('should apply two-value spacing token', async () => {
    const spacingTokenWithTwoValue = {
      spacing: '10px 20px',
    };
    await setValuesOnNode({ node: frameNodeMock, values: spacingTokenWithTwoValue, data });
    expect(frameNodeMock).toEqual({
      ...frameNodeMock,
      paddingBottom: 10,
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 10,
    });
  });

  it('should apply three-value spacing token', async () => {
    const spacingTokenWithThreeValue = {
      spacing: '10px 20px 30px',
    };
    await setValuesOnNode({ node: frameNodeMock, values: spacingTokenWithThreeValue, data });
    expect(frameNodeMock).toEqual({
      ...frameNodeMock,
      paddingBottom: 30,
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 10,
    });
  });

  it('should apply four-value spacing token', async () => {
    const spacingTokenWithFourValue = {
      spacing: '10px 20px 30px 40px',
    };
    await setValuesOnNode({ node: frameNodeMock, values: spacingTokenWithFourValue, data });
    expect(frameNodeMock).toEqual({
      ...frameNodeMock,
      paddingBottom: 30,
      paddingLeft: 40,
      paddingRight: 20,
      paddingTop: 10,
    });
  });

  it('should not apply five-value spacing token', async () => {
    const spacingTokenWithFiveValue = {
      spacing: '10px 20px 30px 40px 50px',
    };
    await setValuesOnNode({ node: frameNodeMock, values: spacingTokenWithFiveValue, data });
    expect(frameNodeMock).toEqual({
      ...frameNodeMock,
      paddingBottom: 3,
      paddingLeft: 3,
      paddingRight: 3,
      paddingTop: 3,
    });
  });
});
