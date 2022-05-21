import { destructureCompositionToken, mapValuesToTokens, returnValueToLookFor } from './node';

const singleShadowToken = {
  type: 'boxShadow',
  description: 'the one with one shadow',
  value: {
    type: 'dropShadow',
    color: '#ff0000',
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
      color: '#ff000080',
      x: 0,
      y: 0,
      blur: 2,
      spread: 4,
    },
    {
      type: 'dropShadow',
      color: '#ff000066',
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

const tokens = new Map([
  ['global.colors.blue',
    {
      name: 'global.colors.blue',
      type: 'color' as const,
      value: '#0000ff',
    },
  ],
  ['global.composition.singleProperty',
    {
      name: 'global.composition.singleProperty',
      type: 'composition' as const,
      value: {
        property: 'opacity',
        value: '40%',
      },
      rawValue: {
        property: 'opacity',
        value: '{opacity.40}',
      },
    },
  ],
  ['global.composition.multipleProperty',
    {
      name: 'global.composition.multipleProperty',
      type: 'composition' as const,
      value: [
        {
          property: 'opacity',
          value: '40%',
        },
        {
          property: 'borderRadius',
          value: '24px',
        },
      ],
      rawValue: [
        {
          property: 'opacity',
          value: '{opacity.40}',
        },
        {
          property: 'borderRadius',
          value: '{borde-radius.7}',
        },
      ],
    },
  ],
  ['global.composition.containSingleBoxshadow',
    {
      name: 'global.composition.containSingleBoxshadow',
      type: 'composition' as const,
      value:
      {
        property: 'boxShadow',
        value: '[object Object]',
      },
      rawValue:
      {
        property: 'boxShadow',
        value: '{global.shadow.single}',
      },
    },
  ],
  ['global.composition.containMultiBoxshadow',
    {
      name: 'global.composition.containMultiBoxshadow',
      type: 'composition' as const,
      value: {
        property: 'boxShadow',
        value: '[object Object]',
      },
      rawValue:
      {
        property: 'boxShadow',
        value: '{global.shadow.multiple}',
      },
    },
  ],
  ['global.shadow.single',
    {
      ...singleShadowToken,
      name: 'shadow.single',
      rawValue: singleShadowToken.value,
      value: singleShadowToken.value,
    },
  ],
  ['global.shadow.multiple',
    {
      ...multipleShadowToken,
      name: 'shadow.multiple',
      rawValue: multipleShadowToken.value,
      value: multipleShadowToken.value,
    },
  ],
]);

const values = [
  { fill: 'global.colors.blue' },
  { composition: 'global.composition.singleProperty' },
  { composition: 'global.composition.multipleProperty' },
  { composition: 'global.composition.containSingleBoxshadow' },
  { composition: 'global.composition.containMultiBoxshadow' },
  { boxShadow: 'global.shadow.single' },
  { boxShadow: 'global.shadow.multiple' },
];

const mappedTokens = [
  { fill: '#0000ff' },
  {
    composition: [{ property: 'opacity', value: '40%' }],
  },
  {
    composition: [
      { property: 'opacity', value: '40%' },
      { property: 'borderRadius', value: '24px' },
    ],
  },
  {
    composition: [{ property: 'boxShadow', value: singleShadowToken.value }],
  },
  {
    composition: [{ property: 'boxShadow', value: multipleShadowToken.value }],
  },
  {
    boxShadow: singleShadowToken.value,
  },
  {
    boxShadow: multipleShadowToken.value,
  },
];

const applyProperties = [
  { fill: '#0000ff' },
  { opacity: '40%' },
  { opacity: '40%', borderRadius: '24px' },
  { boxShadow: singleShadowToken.value },
  { boxShadow: multipleShadowToken.value },
  { boxShadow: singleShadowToken.value },
  { boxShadow: multipleShadowToken.value },
];

describe('mapValuesToTokens', () => {
  it('maps values to tokens', () => {
    values.map((value, index) => {
      expect(mapValuesToTokens(tokens, value)).toEqual(mappedTokens[index]);
    });
  });
});

describe('destructureCompositionToken', () => {
  it('return properties in compositionToken', () => {
    mappedTokens.map((token, index) => {
      expect(destructureCompositionToken(token)).toEqual(applyProperties[index]);
    });
  });
});

describe('returnValueToLookFor', () => {
  it('returns value that were looking for', () => {
    const tokens = [
      {
        key: 'tokenName',
        input: {
          description: 'my description',
          value: '#ff0000',
          name: 'colors.red.500',
        },
        output: 'name',
      },
      {
        key: 'description',
        input: {
          description: 'my description',
          value: '#ff0000',
          name: 'colors.red.500',
        },
        output: 'description',
      },
      {
        key: 'tokenValue',
        input: {
          description: 'my description',
          value: '#ff0000',
          name: 'colors.red.500',
        },
        output: 'rawValue',
      },
      {
        key: 'tokenValue',
        input: '#ff0000',
        output: 'rawValue',
      },
      {
        key: 'value',
        input: '$colors.blue.500',
        output: 'value',
      },
      {
        key: 'size',
        input: {
          description: 'my description',
          value: '12',
          name: 'sizing.small',
        },
        output: 'value',
      },
    ];
    tokens.forEach((token) => {
      expect(returnValueToLookFor(token.key)).toEqual(token.output);
    });
  });
});
