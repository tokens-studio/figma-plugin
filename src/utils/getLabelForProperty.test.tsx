import React from 'react';
import {
  IconFontSize, IconLetterSpacing, IconLineHeight, IconParagraphIndent, IconParagraphSpacing, IconTextCase, IconTextDecoration,
} from '@/icons';
import { getLabelForProperty } from './getLabelForProperty';

describe('getLabelForProperty', () => {
  it('returns icons for icon properties', () => {
    expect(getLabelForProperty('lineHeight')).toEqual(<IconLineHeight />);
    expect(getLabelForProperty('fontSize')).toEqual(<IconFontSize />);
    expect(getLabelForProperty('letterSpacing')).toEqual(<IconLetterSpacing />);
    expect(getLabelForProperty('paragraphSpacing')).toEqual(<IconParagraphSpacing />);
    expect(getLabelForProperty('paragraphIndent')).toEqual(<IconParagraphIndent />);
    expect(getLabelForProperty('textDecoration')).toEqual(<IconTextDecoration />);
    expect(getLabelForProperty('textCase')).toEqual(<IconTextCase />);
  });
  it('returns labels for label properties that need conversion', () => {
    expect(getLabelForProperty('fontFamily')).toEqual('Font');
    expect(getLabelForProperty('fontWeight')).toEqual('Weight');
    expect(getLabelForProperty('width')).toEqual('Width');
    expect(getLabelForProperty('style')).toEqual('Style');
    expect(getLabelForProperty('blur')).toEqual('blur');
    expect(getLabelForProperty('lighten')).toEqual('Amount (0-1)');
    expect(getLabelForProperty('darken')).toEqual('Amount (0-1)');
    expect(getLabelForProperty('mix')).toEqual('Ratio (0-1)');
    expect(getLabelForProperty('alpha')).toEqual('Opacity (0-1)');
  });
});
