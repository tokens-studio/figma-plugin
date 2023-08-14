import { TokenTypes } from '@/constants/TokenTypes';
import { resolveTokenValues } from './tokenHelpers';

const singleShadowToken = {
  type: TokenTypes.BOX_SHADOW,
  description: 'the one with one shadow',
  value: {
    type: 'dropShadow',
    color: '{colors.red.500}',
    x: 0,
    y: 0,
    blur: 10,
    spread: 0,
  },
};

const multipleShadowToken = {
  type: TokenTypes.BOX_SHADOW,
  description: 'the one with multiple shadow',
  value: [
    {
      type: 'dropShadow',
      color: 'rgba({colors.red.500}, 0.5)',
      x: 0,
      y: 0,
      blur: 2,
      spread: 4,
    },
    {
      type: 'dropShadow',
      color: '{theme.accent.subtle}',
      x: 0,
      y: 4,
      blur: 4,
      spread: 4,
    },
    {
      type: 'dropShadow',
      color: '#000000',
      x: 0,
      y: 8,
      blur: 16,
      spread: 4,
    },
  ],
};

const resolvedTypographyToken = {
  type: TokenTypes.TYPOGRAPHY,
  value: {
    fontFamily: 'IBM Plex Serif',
    fontWeight: 'bold',
    fontSize: '{size.25}',
    lineHeight: 0,
    letterSpacing: 0,
    paragraphSpacing: 0,
    textCase: 'uppercase',
    textDecoration: 'none',
  },
};

const unResolvedTypographyToken = {
  type: TokenTypes.TYPOGRAPHY,
  value: {
    fontFamily: 'IBM Plex Serif',
    fontWeight: 'bold',
    fontSize: '{size.0}',
    lineHeight: 0,
    letterSpacing: 0,
    paragraphSpacing: 0,
    textCase: 'uppercase',
    textDecoration: 'none',
  },
};

const unResolvedSingleShadowToken = {
  type: TokenTypes.BOX_SHADOW,
  description: 'the one with one shadow',
  value: {
    type: 'dropShadow',
    color: '{colors.blue.500}',
    x: 0,
    y: 0,
    blur: 10,
    spread: 0,
  },
};

const unResolvedMultipleShadowToken = {
  type: TokenTypes.BOX_SHADOW,
  description: 'the one with multiple shadow',
  value: [
    {
      type: 'dropShadow',
      color: 'rgba({colors.blue.500}, 0.5)',
      x: 0,
      y: 0,
      blur: 2,
      spread: 4,
    },
    {
      type: 'dropShadow',
      color: '{theme.accent.subtle}',
      x: 0,
      y: 4,
      blur: 4,
      spread: 4,
    },
    {
      type: 'dropShadow',
      color: '#000000',
      x: 0,
      y: 8,
      blur: 16,
      spread: 4,
    },
  ],
};

const tokens = [
  { name: 'foo', value: 3 },
  { name: 'bar', value: '{foo}' },
  { name: 'boo', value: '{baz}' },
  { name: 'math', value: '{foo} * 2' },
  { name: 'mathWrong', value: '{foo} * {boo}' },
  { name: 'colors.red.500', value: '#ff0000' },
  { name: 'opacity.default', value: '0.2 + 0.2' },
  { name: 'opacity.full', value: '{opacity.default} + 0.6' },
  { name: 'theme.accent.default', value: 'rgba({colors.red.500}, 0.5)' },
  { name: 'theme.accent.subtle', value: 'rgba({colors.red.500}, {opacity.default})' },
  { name: 'theme.accent.deep', value: 'rgba({theme.accent.default}, {opacity.full})' },
  { name: 'spacing.xs', value: '{spacing.xs}' },
  { name: 'shadow.single', ...singleShadowToken },
  { name: 'shadow.multiple', ...multipleShadowToken },
  { name: 'opacity.40', value: '40%' },
  { name: 'border-radius.7', value: '24px' },
  {
    name: 'composition.single',
    type: 'composition',
    value: {
      opacity: '{opacity.40}',
    },
  },
  {
    name: 'composition.multiple',
    type: 'composition',
    value: {
      opacity: '{opacity.40}',
      borderRadius: '{border-radius.7}',
    },
  },
  {
    name: 'composition.alias',
    type: 'composition',
    value: {
      fill: '{colors.red.500}',
    },
  },
  { name: 'size.25', value: '2px' },
  { name: 'typography.resolved', ...resolvedTypographyToken },
  { name: 'typography.unResolved', ...unResolvedTypographyToken },
  { name: 'shadow.unResolvedSingle', ...unResolvedSingleShadowToken },
  { name: 'shadow.unResolvedMultiple', ...unResolvedMultipleShadowToken },
  {
    name: 'shadow.shadowAlias',
    value: '{shadow.single}',
    description: 'the one with a nested shadow alias',
    type: TokenTypes.BOX_SHADOW,
  },
  {
    name: 'colors.modify',
    value: '#00a2ba',
    $extensions: {
      'studio.tokens': {
        modify: {
          type: 'darken',
          value: '0.3',
          space: 'srgb',
        },
      },
    },
    description: 'color with modifier',
    type: TokenTypes.COLOR,
  },
  {
    name: 'colors.white',
    value: '#00a2ba',
    description: 'color with modifier',
    type: TokenTypes.COLOR,
  },
  {
    name: 'colors.alias-modify',
    value: '$colors.white',
    $extensions: {
      'studio.tokens': {
        modify: {
          type: 'darken',
          value: '0.3',
          space: 'srgb',
        },
      },
    },
    description: 'color with alias modifier',
    type: TokenTypes.COLOR,
  },
];

const output = [
  {
    name: 'foo',
    rawValue: 3,
    value: 3,
  },
  {
    name: 'bar',
    rawValue: '{foo}',
    value: 3,
  },
  {
    failedToResolve: true,
    name: 'boo',
    rawValue: '{baz}',
    value: '{baz}',
  },
  {
    name: 'math',
    rawValue: '{foo} * 2',
    value: 6,
  },
  {
    failedToResolve: true,
    name: 'mathWrong',
    rawValue: '{foo} * {boo}',
    value: '3 * {baz}',
  },
  {
    name: 'colors.red.500',
    rawValue: '#ff0000',
    value: '#ff0000',
  },
  {
    name: 'opacity.default',
    rawValue: '0.2 + 0.2',
    value: 0.4,
  },
  {
    name: 'opacity.full',
    rawValue: '{opacity.default} + 0.6',
    value: 1,
  },
  {
    name: 'theme.accent.default',
    rawValue: 'rgba({colors.red.500}, 0.5)',
    value: '#ff000080',
  },
  {
    name: 'theme.accent.subtle',
    rawValue: 'rgba({colors.red.500}, {opacity.default})',
    value: '#ff000066',
  },
  {
    name: 'theme.accent.deep',
    rawValue: 'rgba({theme.accent.default}, {opacity.full})',
    value: '#ff0000',
  },
  {
    failedToResolve: true,
    name: 'spacing.xs',
    rawValue: '{spacing.xs}',
    value: '{spacing.xs}',
  },
  {
    ...singleShadowToken,
    name: 'shadow.single',
    rawValue: singleShadowToken.value,
    value: {
      ...singleShadowToken.value,
      color: '#ff0000',
    },
  },
  {
    ...multipleShadowToken,
    name: 'shadow.multiple',
    rawValue: multipleShadowToken.value,
    value: [
      {
        ...multipleShadowToken.value[0],
        color: '#ff000080',
      },
      {
        ...multipleShadowToken.value[1],
        color: '#ff000066',
      },
      {
        ...multipleShadowToken.value[2],
        color: '#000000',
      },
    ],
  },
  {
    name: 'opacity.40',
    rawValue: '40%',
    value: '40%',
  },
  {
    name: 'border-radius.7',
    rawValue: '24px',
    value: '24px',
  },
  {
    name: 'composition.single',
    type: 'composition',
    value: {
      opacity: '40%',
    },
    rawValue: {
      opacity: '{opacity.40}',
    },
  },
  {
    name: 'composition.multiple',
    type: 'composition',
    value: {
      opacity: '40%',
      borderRadius: '24px',
    },
    rawValue: {
      opacity: '{opacity.40}',
      borderRadius: '{border-radius.7}',
    },
  },
  {
    name: 'composition.alias',
    type: 'composition',
    value: {
      fill: '#ff0000',
    },
    rawValue: {
      fill: '{colors.red.500}',
    },
  },
  {
    name: 'size.25',
    rawValue: '2px',
    value: '2px',
  },
  {
    ...resolvedTypographyToken,
    name: 'typography.resolved',
    value: {
      ...resolvedTypographyToken.value,
      fontSize: '2px',
    },
    rawValue: resolvedTypographyToken.value,
  },
  {
    ...unResolvedTypographyToken,
    failedToResolve: true,
    name: 'typography.unResolved',
    rawValue: unResolvedTypographyToken.value,
    value: unResolvedTypographyToken.value,
  },
  {
    ...unResolvedSingleShadowToken,
    failedToResolve: true,
    name: 'shadow.unResolvedSingle',
    rawValue: unResolvedSingleShadowToken.value,
    value: {
      ...unResolvedSingleShadowToken.value,
    },
  },
  {
    ...unResolvedMultipleShadowToken,
    failedToResolve: true,
    name: 'shadow.unResolvedMultiple',
    rawValue: unResolvedMultipleShadowToken.value,
    value: [
      {
        ...unResolvedMultipleShadowToken.value[0],
      },
      {
        ...unResolvedMultipleShadowToken.value[1],
        color: '#ff000066',
      },
      {
        ...unResolvedMultipleShadowToken.value[2],
        color: '#000000',
      },
    ],
  },
  {
    ...singleShadowToken,
    description: 'the one with a nested shadow alias',
    name: 'shadow.shadowAlias',
    rawValue: '{shadow.single}',
    value: {
      ...singleShadowToken.value,
      color: '#ff0000',
    },
  },
  {
    $extensions: {
      'studio.tokens': {
        modify: {
          space: 'srgb',
          type: 'darken',
          value: '0.3',
        },
      },
    },
    description: 'color with modifier',
    name: 'colors.modify',
    rawValue: '#00a2ba',
    type: 'color',
    value: '#007182',
  },
  {
    description: 'color with modifier',
    name: 'colors.white',
    rawValue: '#00a2ba',
    type: 'color',
    value: '#00a2ba',
  },
  {
    $extensions: {
      'studio.tokens': {
        modify: {
          space: 'srgb',
          type: 'darken',
          value: '0.3',
        },
      },
    },
    description: 'color with alias modifier',
    name: 'colors.alias-modify',
    rawValue: '$colors.white',
    type: 'color',
    value: '#007182',
  },

];
describe('resolveTokenValues', () => {
  it('resolves all values it can resolve', () => {
    expect(resolveTokenValues(tokens)).toEqual(output);
  });
});
