import { resolveTokenValues } from './tokenHelpers';

const singleShadowToken = {
  type: 'boxShadow',
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
  type: 'boxShadow',
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
  { name: 'shadow.single', ...singleShadowToken },
  { name: 'shadow.multiple', ...multipleShadowToken },
  { name: 'opacity.40', value: '40%' },
  { name: 'border-radius.7', value: '24px' },
  {
    name: 'composition.single',
    type: 'composition',
    value: {
      property: 'opacity',
      value: '{opacity.40}'
    }
  },
  {
    name: 'composition.multiple',
    type: 'composition',
    value: [
      {
        property: 'opacity',
        value: '{opacity.40}'
      },
      {
        property: 'borderRadius',
        value: '{border-radius.7}'
      },
    ]
  },
  {
    name: 'composition.alias',
    type: 'composition',
    value: {
      property: 'fill',
      value: '{colors.red.500}'
    }
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
      property: 'opacity',
      value: '40%'
    },
    rawValue: {
      property: 'opacity',
      value: '{opacity.40}'
    }
  },
  {
    name: 'composition.multiple',
    type: 'composition',
    value: [
      {
        property: 'opacity',
        value: '40%'
      },
      {
        property: 'borderRadius',
        value: '24px'
      },
    ],
    rawValue: [
      {
        property: 'opacity',
        value: '{opacity.40}'
      },
      {
        property: 'borderRadius',
        value: '{border-radius.7}'
      }
    ]
  },
  {
    name: 'composition.alias',
    type: 'composition',
    value: {
      property: 'fill',
      value: '#ff0000'
    },
    rawValue: {
      property: 'fill',
      value: '{colors.red.500}'
    }
  },
];
describe('resolveTokenValues', () => {
  it('resolves all values it can resolve', () => {
    expect(resolveTokenValues(tokens)).toEqual(output);
  });
});
