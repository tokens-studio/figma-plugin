import updateEffectStyles from '../updateEffectStyles';
import { TokenTypes } from '@/constants/TokenTypes';
import { mockCreateEffectStyle, mockGetLocalEffectStyles } from '../../../tests/__mocks__/figmaMock';
import { BoxShadowTypes } from '@/constants/BoxShadowTypes';

describe('updateEffectStyles', () => {
  const baseFontSize = '16';
  it('Can create styles', () => {
    const createdStyle = {
      id: '1234',
      name: 'shadows/lg',
      effects: [],
    };
    mockCreateEffectStyle.mockImplementationOnce(() => createdStyle);

    updateEffectStyles(
      [{
        name: 'shadows.lg',
        value: {
          type: BoxShadowTypes.DROP_SHADOW,
          x: 0,
          y: 0,
          blur: 10,
          spread: 0,
          color: '#000000',
        },
        type: TokenTypes.BOX_SHADOW,
        path: 'shadows/lg',
        styleId: '',
      }],
      baseFontSize,
      true,
    );

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

  it('Can find style by styleId and update an existing style', () => {
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

    updateEffectStyles(
      [{
        name: 'shadows.lg',
        value: {
          type: BoxShadowTypes.DROP_SHADOW,
          x: 0,
          y: 0,
          blur: 100,
          spread: 0,
          color: '#000000',
        },
        type: TokenTypes.BOX_SHADOW,
        path: 'shadows/lg',
        styleId: '1234',
      }],
      baseFontSize,
      true,
    );

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

  it('Can find style by name and update an existing style', () => {
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

    updateEffectStyles(
      [{
        name: 'shadows.lg',
        value: {
          type: BoxShadowTypes.DROP_SHADOW,
          x: 0,
          y: 0,
          blur: 100,
          spread: 0,
          color: '#000000',
        },
        type: TokenTypes.BOX_SHADOW,
        path: 'shadows/lg',
        styleId: '',
      }],
      baseFontSize,
      true,
    );

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
});
