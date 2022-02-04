import updateStyles from './updateStyles';
import * as updateColorStyles from './updateColorStyles';
import * as updateTextStyles from './updateTextStyles';
import * as updateEffectStyles from './updateEffectStyles';

describe('updateStyles', () => {
  const colorSpy = jest.spyOn(updateColorStyles, 'default');
  const textSpy = jest.spyOn(updateTextStyles, 'default');
  const effectSpy = jest.spyOn(updateEffectStyles, 'default');

  it('returns if no values are given', () => {
    updateStyles([{ name: 'borderRadius.small', value: '3', type: 'borderRadius' }]);
    expect(colorSpy).not.toHaveBeenCalled();
    expect(textSpy).not.toHaveBeenCalled();
    expect(effectSpy).not.toHaveBeenCalled();
  });

  it('calls update functions with correct tokens when all tokens are given', () => {
    const colorTokens = [
      {
        name: 'primary.500',
        value: '#ff0000',
        type: 'color',
      },
    ];

    const typographyTokens = [
      {
        name: 'heading.h1',
        value: {
          fontFamily: 'Inter',
          fontWeight: 'Regular',
          fontSize: 24,
        },
        type: 'typography',
      },
    ];

    const effectTokens = [
      {
        name: 'shadow.large',
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
    ];

    updateStyles([...typographyTokens, ...colorTokens, ...effectTokens]);
    expect(colorSpy).toHaveBeenCalledWith(
      colorTokens.map((t) => ({
        ...t,
        name: t.name.replace('.', '/'),
      })),
      false,
    );
    expect(textSpy).toHaveBeenCalledWith(
      typographyTokens.map((t) => ({
        ...t,
        name: t.name.replace('.', '/'),
      })),
      false,
    );
    expect(effectSpy).toHaveBeenCalledWith(
      effectTokens.map((t) => ({
        ...t,
        name: t.name.replace('.', '/'),
      })),
      false,
    );
  });

  it('calls update functions with correct tokens for color tokens', () => {
    const colorTokens = [
      {
        name: 'primary.500',
        value: '#ff0000',
        type: 'color',
      },
    ];

    updateStyles(colorTokens);
    expect(colorSpy).toHaveBeenCalledWith(
      colorTokens.map((t) => ({
        ...t,
        name: t.name.replace('.', '/'),
      })),
      false,
    );
    expect(textSpy).not.toHaveBeenCalled();
    expect(effectSpy).not.toHaveBeenCalled();
  });

  it('calls update functions with correct tokens for text tokens', () => {
    const typographyTokens = [
      {
        name: 'heading.h1',
        value: {
          fontFamily: 'Inter',
          fontWeight: 'Regular',
          fontSize: 24,
        },
        type: 'typography',
      },
    ];

    updateStyles(typographyTokens);
    expect(textSpy).toHaveBeenCalledWith(
      typographyTokens.map((t) => ({
        ...t,
        name: t.name.replace('.', '/'),
      })),
      false,
    );
    expect(colorSpy).not.toHaveBeenCalled();
    expect(effectSpy).not.toHaveBeenCalled();
  });

  it('calls update functions with correct tokens for effect tokens', () => {
    const effectTokens = [
      {
        name: 'shadow.large',
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
    ];

    updateStyles(effectTokens);
    expect(effectSpy).toHaveBeenCalledWith(
      effectTokens.map((t) => ({
        ...t,
        name: t.name.replace('.', '/'),
      })),
      false,
    );
    expect(colorSpy).not.toHaveBeenCalled();
    expect(textSpy).not.toHaveBeenCalled();
  });
});
