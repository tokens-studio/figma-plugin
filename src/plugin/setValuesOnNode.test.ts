import { GetThemeInfoMessageResult } from '@/types/AsyncMessages';
import { getAllFigmaStyleMaps } from '@/utils/getAllFigmaStyleMaps';
import setValuesOnNode from './setValuesOnNode';

describe('setValuesOnNode', () => {
  let textNodeMock: RectangleNode;
  let frameNodeMock: FrameNode;
  beforeEach(() => {
    textNodeMock = {
      cornerRadius: 3,
      bottomLeftRadius: 3,
      bottomRightRadius: 3,
      topLeftRadius: 3,
      topRightRadius: 3,
    } as RectangleNode;
    frameNodeMock = {
      paddingBottom: 3,
      paddingLeft: 3,
      paddingRight: 3,
      paddingTop: 3,
    } as FrameNode;
  });
  const data = {
    borderRadius: 'border-radius.3',
  };
  const figmaStyleMaps = {} as ReturnType<typeof getAllFigmaStyleMaps>;
  const themeInfo = {} as Omit<GetThemeInfoMessageResult, 'type'>;

  it('should apply all border when borderRadius token has one value', async () => {
    const borderRadiusTokenWithOneValue = {
      borderRadius: '10px',
    };
    await setValuesOnNode(textNodeMock, borderRadiusTokenWithOneValue, data, figmaStyleMaps, themeInfo);
    expect(textNodeMock).toEqual({
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
    await setValuesOnNode(textNodeMock, borderRadiusTokenWithTwoValue, data, figmaStyleMaps, themeInfo);
    expect(textNodeMock).toEqual({
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
    await setValuesOnNode(textNodeMock, borderRadiusTokenWithThreeValue, data, figmaStyleMaps, themeInfo);
    expect(textNodeMock).toEqual({
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
    await setValuesOnNode(textNodeMock, borderRadiusTokenWithFourValue, data, figmaStyleMaps, themeInfo);
    expect(textNodeMock).toEqual({
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
    await setValuesOnNode(textNodeMock, borderRadiusTokenWithFiveValue, data, figmaStyleMaps, themeInfo);
    expect(textNodeMock).toEqual({
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
    await setValuesOnNode(frameNodeMock, spacingTokenWithOneValue, data, figmaStyleMaps, themeInfo);
    expect(frameNodeMock).toEqual({
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
    await setValuesOnNode(frameNodeMock, spacingTokenWithTwoValue, data, figmaStyleMaps, themeInfo);
    expect(frameNodeMock).toEqual({
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
    await setValuesOnNode(frameNodeMock, spacingTokenWithThreeValue, data, figmaStyleMaps, themeInfo);
    expect(frameNodeMock).toEqual({
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
    await setValuesOnNode(frameNodeMock, spacingTokenWithFourValue, data, figmaStyleMaps, themeInfo);
    expect(frameNodeMock).toEqual({
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
    await setValuesOnNode(frameNodeMock, spacingTokenWithFiveValue, data, figmaStyleMaps, themeInfo);
    expect(frameNodeMock).toEqual({
      paddingBottom: 3,
      paddingLeft: 3,
      paddingRight: 3,
      paddingTop: 3,
    });
  });
});
