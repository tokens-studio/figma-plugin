import updateEffectStyles from '../updateEffectStyles';
import { TokenTypes } from '@/constants/TokenTypes';
import { mockCreateEffectStyle, mockGetLocalEffectStyles } from '../../../tests/__mocks__/figmaMock';
import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
import { defaultTokenValueRetriever } from '../TokenValueRetriever';
import { SingleBoxShadowToken } from '@/types/tokens';

type ExtendedShadowTokenArray = SingleBoxShadowToken<true, { path: string; styleId: string }>[];

describe('updateEffectStyles', () => {
  afterEach(() => {
    defaultTokenValueRetriever.clearCache();
  });
  const baseFontSize = '16';
  it('Can create styles', async () => {
    const createdStyle = {
      id: '1234',
      name: 'shadows/lg',
      effects: [],
    };
    mockCreateEffectStyle.mockImplementationOnce(() => createdStyle);

    const tokenValue = {
      type: BoxShadowTypes.DROP_SHADOW,
      x: 0,
      y: 0,
      blur: 10,
      spread: 0,
      color: '#000000',
    };

    const existingTokens: ExtendedShadowTokenArray = [{
      name: 'shadows.lg',
      value: tokenValue,
      resolvedValueWithReferences: tokenValue,
      type: TokenTypes.BOX_SHADOW,
      path: 'shadows/lg',
      styleId: '',
    }];

    defaultTokenValueRetriever.initiate({
      tokens: existingTokens,
    });

    await updateEffectStyles({
      effectTokens: existingTokens,
      baseFontSize,
      shouldCreate: true,
    });

    expect(createdStyle.effects).toEqual([
      {
        type: 'DROP_SHADOW',
        blendMode: 'NORMAL',
        color: {
          r: 0, g: 0, b: 0, a: 1,
        },
        offset: { x: 0, y: 0 },
        radius: 10,
        showShadowBehindNode: false,
        spread: 0,
        visible: true,
      },
    ]);
  });

  it('Can find style by styleId and update an existing style', async () => {
    const existingStyles = [
      {
        type: 'EFFECT',
        id: '1234',
        name: 'shadows/lg',
        effects: [{
          type: 'DROP_SHADOW',
          blendMode: 'NORMAL',
          color: {
            r: 0, g: 0, b: 0, a: 1,
          },
          offset: { x: 0, y: 0 },
          radius: 10,
          showShadowBehindNode: false,
          spread: 0,
          opacity: 1,
          visible: true,
        }],
      },
    ];
    mockGetLocalEffectStyles.mockImplementation(() => existingStyles);

    const tokenValue = {
      type: BoxShadowTypes.DROP_SHADOW,
      x: 0,
      y: 0,
      blur: 100,
      spread: 0,
      color: '#000000',
    };

    const existingTokens: ExtendedShadowTokenArray = [{
      name: 'shadows.lg',
      value: tokenValue,
      resolvedValueWithReferences: tokenValue,
      type: TokenTypes.BOX_SHADOW,
      path: 'shadows/lg',
      styleId: '1234',
    }];

    defaultTokenValueRetriever.initiate({
      tokens: existingTokens,
    });

    await updateEffectStyles({
      effectTokens: existingTokens,
      baseFontSize,
      shouldCreate: true,
    });

    expect(existingStyles[0].effects).toEqual([
      {
        type: 'DROP_SHADOW',
        blendMode: 'NORMAL',
        color: {
          r: 0, g: 0, b: 0, a: 1,
        },
        offset: { x: 0, y: 0 },
        radius: 100,
        showShadowBehindNode: false,
        spread: 0,
        visible: true,
      },
    ]);
  });

  it('Can find style by name and update an existing style', async () => {
    const tokenValue = {
      type: BoxShadowTypes.DROP_SHADOW,
      x: 0,
      y: 0,
      blur: 100,
      spread: 0,
      color: '#000000',
    };
    const existingTokens: ExtendedShadowTokenArray = [{
      name: 'shadows.lg',
      value: tokenValue,
      resolvedValueWithReferences: tokenValue,
      type: TokenTypes.BOX_SHADOW,
      path: 'shadows/lg',
      styleId: '',
    }];

    const existingStyles = [
      {
        type: 'EFFECT',
        id: '1234',
        name: 'shadows/lg',
        effects: [{
          type: 'DROP_SHADOW',
          blendMode: 'NORMAL',
          color: {
            r: 0, g: 0, b: 0, a: 1,
          },
          offset: { x: 0, y: 0 },
          radius: 10,
          showShadowBehindNode: false,
          spread: 0,
          opacity: 1,
          visible: true,
        }],
      },
    ];

    defaultTokenValueRetriever.initiate({
      tokens: existingTokens,
      styleReferences: new Map([['shadows/lg', '1234']]),
    });

    mockGetLocalEffectStyles.mockImplementation(() => existingStyles);

    await updateEffectStyles({
      effectTokens: existingTokens,
      baseFontSize,
      shouldCreate: true,
    });

    expect(existingStyles[0].effects).toEqual([
      {
        type: 'DROP_SHADOW',
        blendMode: 'NORMAL',
        color: {
          r: 0, g: 0, b: 0, a: 1,
        },
        offset: { x: 0, y: 0 },
        radius: 100,
        showShadowBehindNode: false,
        spread: 0,
        visible: true,
      },
    ]);
  });

  it('renames if option is true and style is found', async () => {
    const existingStyles = [
      {
        id: '1234',
        name: 'type/h1',
        effects: [{
          type: 'DROP_SHADOW',
          blendMode: 'NORMAL',
          color: {
            r: 0, g: 0, b: 0, a: 1,
          },
          offset: { x: 0, y: 0 },
          radius: 10,
          showShadowBehindNode: false,
          spread: 0,
          opacity: 1,
          visible: true,
        }],
      },
    ];
    mockGetLocalEffectStyles.mockImplementation(() => existingStyles);

    await updateEffectStyles(
      {
        effectTokens: [{
          name: 'shadows.large-RENAMED',
          value: {
            type: BoxShadowTypes.DROP_SHADOW,
            x: 0,
            y: 0,
            blur: 10,
            spread: 0,
            color: '#000000',
          },
          type: TokenTypes.BOX_SHADOW,
          path: 'shadows/large-RENAMED',
          styleId: '1234',
        }],
        baseFontSize: '16',
        shouldRename: true,
      },
    );

    expect(existingStyles[0].name).toEqual('shadows/large-RENAMED');
  });
});
