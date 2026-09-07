import { TokenTypes } from '@/constants/TokenTypes';
import { convertTokenTypeToVariableType } from './convertTokenTypeToVariableType';

describe('convertTokenTypeToVariableType', () => {
  it('maps duration to TIMING', () => {
    expect(convertTokenTypeToVariableType(TokenTypes.DURATION, '200ms')).toBe('TIMING');
  });

  it('maps cubicBezier to EASING', () => {
    expect(convertTokenTypeToVariableType(TokenTypes.CUBIC_BEZIER, '0.4, 0, 0.2, 1')).toBe('EASING');
  });

  it('maps color to COLOR', () => {
    expect(convertTokenTypeToVariableType(TokenTypes.COLOR, '#fff')).toBe('COLOR');
  });

  it('maps boolean to BOOLEAN', () => {
    expect(convertTokenTypeToVariableType(TokenTypes.BOOLEAN, 'true')).toBe('BOOLEAN');
  });

  it('maps text and font families to STRING', () => {
    expect(convertTokenTypeToVariableType(TokenTypes.TEXT, 'Hello')).toBe('STRING');
    expect(convertTokenTypeToVariableType(TokenTypes.FONT_FAMILIES, 'Inter')).toBe('STRING');
  });

  it('maps sizing and dimension to FLOAT', () => {
    expect(convertTokenTypeToVariableType(TokenTypes.SIZING, '16')).toBe('FLOAT');
    expect(convertTokenTypeToVariableType(TokenTypes.DIMENSION, '16')).toBe('FLOAT');
  });

  it('promotes numeric font weights to FLOAT', () => {
    expect(convertTokenTypeToVariableType(TokenTypes.FONT_WEIGHTS, '400')).toBe('FLOAT');
    expect(convertTokenTypeToVariableType(TokenTypes.FONT_WEIGHTS, 'Regular')).toBe('STRING');
  });
});
