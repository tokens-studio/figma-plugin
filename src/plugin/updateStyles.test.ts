import updateStyles from './updateStyles';
import * as updateColorStyles from './updateColorStyles';
import * as updateTextStyles from './updateTextStyles';
import * as updateEffectStyles from './updateEffectStyles';
import { SingleToken } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';
import { AsyncMessageTypes, GetThemeInfoMessageResult } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { createStyles } from './asyncMessageHandlers';

type ExtendedSingleToken = SingleToken<true, { path: string }>;

describe('updateStyles', () => {
  const colorSpy = jest.spyOn(updateColorStyles, 'default');
  const textSpy = jest.spyOn(updateTextStyles, 'default');
  const effectSpy = jest.spyOn(updateEffectStyles, 'default');

  let disconnectAsyncMessageChannel = () => {};
  const mockGetThemeInfo = jest.fn(async (): Promise<GetThemeInfoMessageResult> => ({
    type: AsyncMessageTypes.GET_THEME_INFO,
    activeTheme: null,
    themes: [],
  }));

  beforeAll(() => {
    const disconnectPluginInstance = AsyncMessageChannel.PluginInstance.connect();
    const disconnectReactInstance = AsyncMessageChannel.ReactInstance.connect();
    AsyncMessageChannel.ReactInstance.handle(AsyncMessageTypes.GET_THEME_INFO, mockGetThemeInfo);
    AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.CREATE_STYLES, createStyles);
    disconnectAsyncMessageChannel = () => {
      disconnectPluginInstance();
      disconnectReactInstance();
    };
  });

  afterAll(() => {
    disconnectAsyncMessageChannel();
  });

  it('returns if no values are given', async () => {
    await AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.CREATE_STYLES,
      tokens: [{ name: 'borderRadius.small', value: '3', type: TokenTypes.BORDER_RADIUS }],
      settings: {},
    });
    expect(colorSpy).not.toHaveBeenCalled();
    expect(textSpy).not.toHaveBeenCalled();
    expect(effectSpy).not.toHaveBeenCalled();
  });

  it('calls update functions with correct tokens when all tokens are given', async () => {
    const colorTokens = [
      {
        name: 'primary.500',
        path: 'primary/500',
        value: '#ff0000',
        type: 'color',
      },
    ] as ExtendedSingleToken[];

    const typographyTokens = [
      {
        name: 'heading.h1',
        path: 'heading/h1',
        value: {
          fontFamily: 'Inter',
          fontWeight: 'Regular',
          fontSize: '24',
        },
        type: 'typography',
      },
    ] as ExtendedSingleToken[];

    const effectTokens = [
      {
        name: 'shadow.large',
        path: 'shadow/large',
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
      },
    ] as ExtendedSingleToken[];

    await updateStyles([...typographyTokens, ...colorTokens, ...effectTokens]);
    expect(colorSpy).toHaveBeenCalledWith(
      colorTokens,
      false,
    );
    expect(textSpy).toHaveBeenCalledWith(
      typographyTokens,
      false,
    );
    expect(effectSpy).toHaveBeenCalledWith(
      effectTokens,
      false,
    );
  });

  it('calls update functions with correct tokens for color tokens', async () => {
    const colorTokens = [
      {
        name: 'primary.500',
        path: 'primary/500',
        value: '#ff0000',
        type: 'color',
      },
    ] as ExtendedSingleToken[];

    await updateStyles(colorTokens);
    expect(colorSpy).toHaveBeenCalledWith(
      colorTokens,
      false,
    );
    expect(textSpy).not.toHaveBeenCalled();
    expect(effectSpy).not.toHaveBeenCalled();
  });

  it('calls update functions with correct tokens for text tokens', async () => {
    const typographyTokens = [
      {
        name: 'heading.h1',
        path: 'heading/h1',
        value: {
          fontFamily: 'Inter',
          fontWeight: 'Regular',
          fontSize: '24',
        },
        type: 'typography',
      },
    ] as ExtendedSingleToken[];

    await updateStyles(typographyTokens);
    expect(textSpy).toHaveBeenCalledWith(
      typographyTokens,
      false,
    );
    expect(colorSpy).not.toHaveBeenCalled();
    expect(effectSpy).not.toHaveBeenCalled();
  });

  it('calls update functions with correct tokens for effect tokens', async () => {
    const effectTokens = [
      {
        name: 'shadow.large',
        path: 'shadow/large',
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
      },
    ] as ExtendedSingleToken[];

    await updateStyles(effectTokens);
    expect(effectSpy).toHaveBeenCalledWith(
      effectTokens,
      false,
    );
    expect(colorSpy).not.toHaveBeenCalled();
    expect(textSpy).not.toHaveBeenCalled();
  });

  it('calls update functions with correct tokens and theme prefix', async () => {
    const colorTokens = [
      {
        name: 'primary.500',
        path: 'light/primary/500',
        value: '#ff0000',
        type: 'color',
      },
    ] as ExtendedSingleToken[];

    mockGetThemeInfo.mockImplementationOnce(() => (
      Promise.resolve({
        type: AsyncMessageTypes.GET_THEME_INFO,
        activeTheme: 'light',
        themes: [{
          id: 'light',
          name: 'light',
          selectedTokenSets: {},
        }],
      })
    ));

    await updateStyles([...colorTokens], false, {
      prefixStylesWithThemeName: true,
    });
    expect(colorSpy).toHaveBeenCalledWith(
      colorTokens,
      false,
    );
  });
});
