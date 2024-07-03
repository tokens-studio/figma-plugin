import { TokenFormatOptions, setFormat } from '@/plugin/TokenFormatStoreClass';
import { validateRenameGroupName, validateDuplicateGroupName, ErrorType } from './validateGroupName';

const tokens = {
  global: [{
    name: 'buttons.foo.default',
    type: 'color',
    value: '#0fa',
  }, {
    name: 'buttons.foo.primary',
    type: 'color',
    value: '#0af',
  }, {
    name: 'buttons.foo.secondary',
    type: 'color',
    value: '#a0f',
  }, {
    name: 'buttons.foo.superlongtokenname',
    type: 'color',
    value: '#0af',
  }, {
    name: 'buttons.default',
    type: 'sizing',
    value: '16',
  }, {
    name: 'buttons.primary',
    type: 'sizing',
    value: '12',
  }, {
    name: 'buttons.superlongtokenname',
    type: 'sizing',
    value: '16',
  }, {
    name: 'buttons2.default',
    type: 'color',
    value: '#0af',
  }],
  theme: [{
    name: 'buttons.test.test.default',
    type: 'color',
    value: '#0af',
  }, {
    name: 'buttons.test.test.primary',
    type: 'color',
    value: '#0af',
  }, {
    name: 'buttons.test.test.secondary',
    type: 'color',
    value: '#a0f',
  }, {
    name: 'buttons.test.test.superlongtokenname',
    type: 'color',
    value: '#0af',
  }],
};

const tokens2 = {
  global: [
    {
      name: 'buttons123.default',
      type: 'color',
      value: '#0fa',
    },
    {
      name: 'buttons123.primary',
      type: 'color',
      value: '#0af',
    },
    {
      name: 'buttons123.secondary',
      type: 'color',
      value: '#a0f',
    },
    {
      name: 'buttons123.superlongtokenname',
      type: 'color',
      value: '#0af',
    },
    {
      name: 'buttons.default',
      type: 'sizing',
      value: '16',
    },
    {
      name: 'buttons.primary',
      type: 'sizing',
      value: '12',
    },
    {
      name: 'buttons.superlongtokenname',
      type: 'sizing',
      value: '16',
    },
    {
      name: 'buttons2',
      type: 'sizing',
      value: '12',
    },
    {
      name: 'buttons3.test',
      type: 'spacing',
      value: '16',
    },
  ],
};

const tokens3 = {
  global: [
    {
      name: 'colors.red.100',
      type: 'color',
      value: '#0af',
    },
    {
      name: 'colors.red.bar',
      type: 'color',
      value: '#0fa',
    },
    {
      name: 'colors.foo.bar.100',
      type: 'color',
      value: '#f7fafc',
    },
    {
      name: 'colors.foo.bar.200',
      type: 'color',
      value: '#edf2f7',
    },
    {
      name: 'colors.foo.bar.300',
      type: 'color',
      value: '#e2e8f0',
    },
    {
      name: 'colors.foo.bar.400',
      type: 'color',
      value: '#cbd5e0',
    },
    {
      name: 'colors.foo.bar.500',
      type: 'color',
      value: '#a0aec0',
    },
    {
      name: 'colors.foo.bar.600',
      type: 'color',
      value: '#718096',
    },
    {
      name: 'colors.foo.bar.700',
      type: 'color',
      value: '#4a5568',
    },
    {
      name: 'colors.foo.bar.800',
      type: 'color',
      value: '#2d3748',
    },
    {
      name: 'colors.foo.bar.900',
      type: 'color',
      value: '#1a202c',
    },
  ],
};

describe('validateRenameGroupName', () => {
  const activeTokenSet = 'global';
  it('should allow renaming nested group name without overlap', () => {
    setFormat(TokenFormatOptions.DTCG);
    const type = 'color';
    const oldName = 'buttons.test';
    const newName = 'buttons';
    expect(validateRenameGroupName(tokens[activeTokenSet], type, oldName, newName)).toEqual(null);
  });
  it('should not allow renaming group to empty group name', () => {
    setFormat(TokenFormatOptions.DTCG);
    const type = 'color';
    const oldName = 'buttons.test';
    const newName = '';
    expect(validateRenameGroupName(tokens[activeTokenSet], type, oldName, newName)).toEqual({
      type: ErrorType.EmptyGroupName,
    });
  });
  it('should not allow renaming parent group that would result in token name overlap with group name', () => {
    setFormat(TokenFormatOptions.DTCG);
    const type = 'color';
    const oldName = 'colors.foo';
    const newName = 'colors.red';
    expect(validateRenameGroupName(tokens3[activeTokenSet], type, oldName, newName)).toEqual({
      type: ErrorType.OverlappingToken,
      foundOverlappingTokens: [{
        name: 'colors.red.bar',
        type: 'color',
        value: '#0fa',
      }],
    });
  });
  it('should not allow renaming group to existing group name with overlapping tokens', () => {
    setFormat(TokenFormatOptions.DTCG);
    const type = 'color';
    const oldName = 'buttons2';
    const newName = 'buttons';

    expect(validateRenameGroupName(tokens[activeTokenSet], type, oldName, newName)).toEqual({
      type: ErrorType.OverlappingGroup,
      possibleDuplicates: [{
        name: 'buttons.default',
        type: 'sizing',
        value: '16',
      }],
    });
  });
  it('should prevent overlapping token name with group name', () => {
    setFormat(TokenFormatOptions.DTCG);
    const type = 'color';
    const oldName = 'buttons2';
    const newName = 'buttons.default';
    expect(validateRenameGroupName(tokens[activeTokenSet], type, oldName, newName)).toEqual({
      type: ErrorType.OverlappingToken,
      foundOverlappingTokens: [{
        name: 'buttons.default',
        type: 'sizing',
        value: '16',
      }],
    });
  });
  it('should prevent overlapping tokens due to overlapping group name and token names', () => {
    setFormat(TokenFormatOptions.DTCG);
    const type = 'color';
    const oldName = 'buttons123';
    const newName = 'buttons';
    expect(validateRenameGroupName(tokens2[activeTokenSet], type, oldName, newName)).toEqual({
      type: ErrorType.OverlappingGroup,
      possibleDuplicates: [{
        name: 'buttons.default',
        type: 'sizing',
        value: '16',
      },
      {
        name: 'buttons.primary',
        type: 'sizing',
        value: '12',
      },
      {
        name: 'buttons.superlongtokenname',
        type: 'sizing',
        value: '16',
      }],
    });
  });
  it('should not allow renaming group with existing token name', () => {
    setFormat(TokenFormatOptions.DTCG);
    const type = 'color';
    const oldName = 'buttons123';
    const newName = 'buttons2';
    expect(validateRenameGroupName(tokens2[activeTokenSet], type, oldName, newName)).toEqual({
      type: ErrorType.OverlappingToken,
      foundOverlappingTokens: [{
        name: 'buttons2',
        type: 'sizing',
        value: '12',
      }],
    });
  });
  it('should allow renaming group to a group name that exists, but doesn\'t have overlapping tokens', () => {
    setFormat(TokenFormatOptions.DTCG);
    const type = 'color';
    const oldName = 'buttons123';
    const newName = 'buttons3';
    expect(validateRenameGroupName(tokens2[activeTokenSet], type, oldName, newName)).toEqual(null);
  });
});

describe('validateDuplicateGroupName', () => {
  it('should allow renaming group name if no overlapping tokens', () => {
    setFormat(TokenFormatOptions.DTCG);
    const activeTokenSet = 'theme';
    const type = 'color';
    const selectedTokenSets = ['global'];
    const oldName = 'buttons.test.test';
    const newName = 'buttons.test';
    expect(validateDuplicateGroupName(tokens, selectedTokenSets, activeTokenSet, type, oldName, newName)).toEqual(null);
  });
  it('should not allow renaming group name to empty group name', () => {
    setFormat(TokenFormatOptions.DTCG);
    const activeTokenSet = 'theme';
    const type = 'color';
    const selectedTokenSets = ['global'];
    const oldName = 'buttons.test.test';
    const newName = '';
    expect(validateDuplicateGroupName(tokens, selectedTokenSets, activeTokenSet, type, oldName, newName)).toEqual({
      type: ErrorType.EmptyGroupName,
    });
  });
  it('should not allow renaming nested group name with overlapping tokens', () => {
    setFormat(TokenFormatOptions.DTCG);
    const activeTokenSet = 'theme';
    const type = 'color';
    const selectedTokenSets = ['global'];
    const oldName = 'buttons.test.test';
    const newName = 'buttons';
    expect(validateDuplicateGroupName(tokens, selectedTokenSets, activeTokenSet, type, oldName, newName)).toEqual({
      possibleDuplicates: {
        global: [
          { name: 'buttons.default', type: 'sizing', value: '16' },
          { name: 'buttons.primary', type: 'sizing', value: '12' },
          { name: 'buttons.superlongtokenname', type: 'sizing', value: '16' },
        ],
      },
      type: ErrorType.OverlappingGroup,
    });
  });
  it('should allow renaming nested group name without overlapping tokens', () => {
    setFormat(TokenFormatOptions.DTCG);
    const activeTokenSet = 'global';
    const type = 'color';
    const selectedTokenSets = ['global'];
    const oldName = 'buttons';
    const newName = 'buttons.foo';
    expect(validateDuplicateGroupName(tokens, selectedTokenSets, activeTokenSet, type, oldName, newName)).toEqual(null);
  });
  it('should prevent overlapping token name with group name', () => {
    setFormat(TokenFormatOptions.DTCG);
    const activeTokenSet = 'global';
    const type = 'color';
    const selectedTokenSets = ['global'];
    const oldName = 'buttons2';
    const newName = 'buttons.default';
    expect(validateDuplicateGroupName(tokens, selectedTokenSets, activeTokenSet, type, oldName, newName)).toEqual({
      type: ErrorType.OverlappingToken,
      foundOverlappingTokens: {
        global: [{
          name: 'buttons.default',
          type: 'sizing',
          value: '16',
        }],
      },
    });
  });
  it('should prevent overlapping tokens due to overlapping group name and token names', () => {
    setFormat(TokenFormatOptions.DTCG);
    const activeTokenSet = 'global';
    const type = 'color';
    const selectedTokenSets = ['global'];
    const oldName = 'buttons123';
    const newName = 'buttons';
    expect(validateDuplicateGroupName(tokens2, selectedTokenSets, activeTokenSet, type, oldName, newName)).toEqual({
      type: ErrorType.OverlappingGroup,
      possibleDuplicates: {
        global: [{
          name: 'buttons.default',
          type: 'sizing',
          value: '16',
        },
        {
          name: 'buttons.primary',
          type: 'sizing',
          value: '12',
        },
        {
          name: 'buttons.superlongtokenname',
          type: 'sizing',
          value: '16',
        }],
      },
    });
  });
  it('should not allow duplicating group with existing token name', () => {
    setFormat(TokenFormatOptions.DTCG);
    const activeTokenSet = 'global';
    const type = 'color';
    const selectedTokenSets = ['global'];
    const oldName = 'buttons123';
    const newName = 'buttons2';
    expect(validateDuplicateGroupName(tokens2, selectedTokenSets, activeTokenSet, type, oldName, newName)).toEqual({
      type: ErrorType.OverlappingToken,
      foundOverlappingTokens: {
        global: [{
          name: 'buttons2',
          type: 'sizing',
          value: '12',
        }],
      },
    });
  });
  it('should allow renaming group to a group name that exists, but doesn\'t have overlapping tokens', () => {
    setFormat(TokenFormatOptions.DTCG);
    const activeTokenSet = 'global';
    const type = 'color';
    const selectedTokenSets = ['global'];
    const oldName = 'buttons123';
    const newName = 'buttons3';
    expect(validateDuplicateGroupName(tokens2, selectedTokenSets, activeTokenSet, type, oldName, newName)).toEqual(null);
  });
  it('should not allow renaming parent group that would result in token name overlap with group name', () => {
    setFormat(TokenFormatOptions.DTCG);
    const activeTokenSet = 'global';
    const selectedTokenSets = ['global'];
    const type = 'color';
    const oldName = 'colors.foo';
    const newName = 'colors.red';
    expect(validateDuplicateGroupName(tokens3, selectedTokenSets, activeTokenSet, type, oldName, newName)).toEqual({
      type: ErrorType.OverlappingToken,
      foundOverlappingTokens: {
        global: [{
          name: 'colors.red.bar',
          type: 'color',
          value: '#0fa',
        }],
      },
    });
  });
});
