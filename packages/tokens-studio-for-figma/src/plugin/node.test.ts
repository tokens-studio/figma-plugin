import type { StorageProviderType } from '@sync-providers/types';
import { AVAILABLE_PROVIDERS } from '@sync-providers/constants';
import { mockRootSetSharedPluginData } from '../../tests/__mocks__/figmaMock';
import {
  mapValuesToTokens, returnValueToLookFor, saveStorageType, saveOnboardingExplainerSets, saveOnboardingExplainerInspect, saveOnboardingExplainerSyncProviders, destructureTokenForAlias,
} from './node';
import getOnboardingExplainer from '@/utils/getOnboardingExplainer';
import { TokenTypes } from '@/constants/TokenTypes';

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

const borderToken = {
  type: TokenTypes.BORDER,
  value: {
    color: '#ff0000',
    width: '12px',
    type: 'solid',
  },
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
        opacity: '40%',
      },
      rawValue: {
        opacity: '{opacity.40}',
      },
    },
  ],
  ['global.composition.multipleProperty',
    {
      name: 'global.composition.multipleProperty',
      type: 'composition' as const,
      value: {
        opacity: '40%',
        borderRadius: '24px',
      },
      rawValue: {
        opacity: '{opacity.40}',
        borderRadius: '{border-radius.7}',
      },
    },
  ],
  ['global.composition.containSingleBoxshadow',
    {
      name: 'global.composition.containSingleBoxshadow',
      type: 'composition' as const,
      value: {
        boxShadow: singleShadowToken.value,
      },
      rawValue: {
        boxShadow: '{global.shadow.single}',
      },
    },
  ],
  ['global.composition.containMultiBoxshadow',
    {
      name: 'global.composition.containMultiBoxshadow',
      type: 'composition' as const,
      value: {
        boxShadow: multipleShadowToken.value,
      },
      rawValue:
      {
        boxShadow: '{global.shadow.multiple}',
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
  ['global.border.general',
    {
      ...borderToken,
      name: 'border.general',
      rawValue: borderToken.value,
      value: borderToken.value,
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
  { border: 'global.border.general' },
];

const mappedTokens = [
  { fill: '#0000ff' },
  { opacity: '40%' },
  {
    opacity: '40%',
    borderRadius: '24px',
  },
  {
    boxShadow: singleShadowToken.value,
  },
  {
    boxShadow: multipleShadowToken.value,
  },
  {
    boxShadow: singleShadowToken.value,
  },
  {
    boxShadow: multipleShadowToken.value,
  },
  {
    border: borderToken.value,
    borderColor: borderToken.value.color,
  },
  {
    borderTop: borderToken.value,
    borderColor: borderToken.value.color,
  },
  {
    borderRight: borderToken.value,
    borderColor: borderToken.value.color,
  },
  {
    borderLeft: borderToken.value,
    borderColor: borderToken.value.color,
  },
  {
    borderBottom: borderToken.value,
    borderColor: borderToken.value.color,
  },
];

const applyTokens = [
  { fill: 'global.colors.blue' },
  { opacity: 'opacity.40' },
  {
    opacity: 'opacity.40',
    borderRadius: 'border-radius.7',
  },
  { boxShadow: 'global.shadow.single' },
  { boxShadow: 'global.shadow.multiple' },
  { boxShadow: 'global.shadow.single' },
  { boxShadow: 'global.shadow.multiple' },
  { border: 'global.border.general', borderColor: 'global.border.general' },
];

describe('mapValuesToTokens', () => {
  it('maps values to tokens', () => {
    values.forEach((value, index) => {
      expect(mapValuesToTokens(tokens, value)).toEqual(mappedTokens[index]);
    });
  });

  it('return rawValue with modifier', () => {
    const tokens = new Map([
      ['global.colors.mix',
        {
          name: 'global.colors.mix',
          type: 'color' as const,
          value: '#0000ff',
          rawValue: '#0000ff',
          $extensions: {
            'studio.tokens': {
              modify: {
                type: 'mix',
                value: 0.4,
                space: 'lch',
                color: '#0033ff',
              },
            },
          },
        },
      ],
      ['global.colors.lighten',
        {
          name: 'global.colors.lighten',
          type: 'color' as const,
          value: '#0000ff',
          rawValue: '#0000ff',
          $extensions: {
            'studio.tokens': {
              modify: {
                type: 'lighten',
                value: 0.4,
                space: 'lch',
              },
            },
          },
        },
      ],
    ]);

    const values = [
      { tokenValue: 'global.colors.lighten' },
      { tokenValue: 'global.colors.mix' },
    ];

    const output = [
      { tokenValue: '#0000ff / lighten(0.4) / lch' }, { tokenValue: '#0000ff / mix(#0033ff, 0.4) / lch' },
    ];

    values.forEach((value, index) => {
      expect(mapValuesToTokens(tokens, value)).toEqual(output[index]);
    });
  });
});

describe('destructureTokenForAlias', () => {
  it('return extract border color from border token', () => {
    values.forEach((value, index) => {
      expect(destructureTokenForAlias(tokens, value)).toEqual(applyTokens[index]);
    });
  });

  it('sould return border width from border token', () => {
    const values = {
      border: 'test',
      borderBottom: 'delete',
      borderLeft: 'delete',
      borderRight: 'delete',
      borderTop: 'delete'
    };
    const tokens = new Map([
      ['red', {
        name: 'red',
        rawValue: '#f00',
        type: TokenTypes.COLOR,
        value: '#f00'
      }],
      ['borderWidth.10px', {
        name: 'borderWidth.10px',
        rawValue: '10',
        type: TokenTypes.BORDER_WIDTH,
        value: 10
      }],
      ['test', {
        name: 'test',
        rawValue: {
          color: '{red}',
          style: 'solid',
          width: '{borderWidth.10px}'
        },
        resolvedValueWithReferences: {
          color: '{red}',
          style: 'solid',
          width: '{borderWidth.10px}'
        },
        type: TokenTypes.BORDER,
        value: {
          color: '#f00',
          width: 10,
          style: 'solid'
        }
      }]
    ]);
    expect(destructureTokenForAlias(tokens, values)).toEqual({
      border: 'test',
      borderBottom: 'delete',
      borderLeft: 'delete',
      borderRight: 'delete',
      borderTop: 'delete',
      borderColor: 'red',
      borderWidth: 'borderWidth.10px'
    });
  })
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

describe('storage type', () => {
  it('should save the storage type', () => {
    const apiContext = {
      id: 'gh',
      internalId: 'gh',
      provider: AVAILABLE_PROVIDERS.GITHUB as StorageProviderType.GITHUB,
      branch: 'main',
      filePath: 'data/tokens.json',
      name: 'Github',
      baseUrl: '',
    };

    saveStorageType(apiContext);

    expect(mockRootSetSharedPluginData).toBeCalledWith('tokens', 'storageType', JSON.stringify(apiContext));
  });
});

describe('onboarding explainer store', () => {
  it('should save the onboardingexplainersyncproviders', async () => {
    saveOnboardingExplainerSyncProviders(true);
    const data = await getOnboardingExplainer();
    expect(data.syncProviders).toEqual(true);
  });

  it('should save the onboardingexplainersets', async () => {
    saveOnboardingExplainerSets(true);
    const data = await getOnboardingExplainer();
    expect(data.sets).toEqual(true);
  });

  it('should save the onboardingexplainerinspect', async () => {
    saveOnboardingExplainerInspect(true);
    const data = await getOnboardingExplainer();
    expect(data.inspect).toEqual(true);
  });
});
