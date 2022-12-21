import React from 'react';
import {
  IconFontSize, IconLetterSpacing, IconParagraphSpacing, IconLineHeight, IconTextCase, IconTextDecoration, IconParagraphIndent,
} from '@/icons';

// write a function that maps a key to a react component and returns that component or the text label
export function getLabelForProperty(key: string): React.ReactElement | string {
  switch (key) {
    case 'fontSize': {
      return <IconFontSize />;
    }
    case 'letterSpacing': {
      return <IconLetterSpacing />;
    }
    case 'lineHeight': {
      return <IconLineHeight />;
    }
    case 'paragraphSpacing': {
      return <IconParagraphSpacing />;
    }
    case 'paragraphIndent': {
      return <IconParagraphIndent />;
    }
    case 'textDecoration': {
      return <IconTextDecoration />;
    }
    case 'textCase': {
      return <IconTextCase />;
    }
    case 'fontFamily': {
      return 'Font';
    }
    case 'fontWeight': {
      return 'Weight';
    }
    case 'width': {
      return 'Width';
    }
    case 'style': {
      return 'Style';
    }
    case 'lighten': {
      return 'Amount';
    }
    case 'darken': {
      return 'Amount';
    }
    case 'mix': {
      return 'Ratio';
    }
    case 'alpha': {
      return 'Opacity';
    }
    default: {
      return key;
    }
  }
}
