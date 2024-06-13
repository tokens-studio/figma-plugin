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

// {

describe('validateRenameGroupName', () => {
  const activeTokenSet = 'global';
  it('should allow renaming nested group name without overlap', () => {
    setFormat(TokenFormatOptions.DTCG);
    const type = 'color';
    const oldName = 'buttons.test';
    const newName = 'buttons';
    expect(validateRenameGroupName(tokens[activeTokenSet], type, oldName, newName)).toEqual(null);
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
  it('prevent overlapping token name with group name', () => {
    setFormat(TokenFormatOptions.DTCG);
    const type = 'color';
    const oldName = 'buttons2';
    const newName = 'buttons.default';
    expect(validateRenameGroupName(tokens[activeTokenSet], type, oldName, newName)).toEqual({
      type: ErrorType.OverlappingToken,
      foundOverlappingToken: {
        name: 'buttons.default',
        type: 'sizing',
        value: '16',
      },
    });
  });
  it('prevent overlapping tokens due to overlapping group name and token names', () => {
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
      foundOverlappingToken: {
        name: 'buttons2',
        type: 'sizing',
        value: '12',
      },
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
  // it('should not allow renaming group to existing group name with overlapping tokens', () => {
  //   setFormat(TokenFormatOptions.DTCG);
  //   const activeTokenSet = 'global';
  //   const type = 'color';
  //   const selectedTokenSets = ['global'];
  //   const oldName = 'buttons2';
  //   const newName = 'buttons';

  //   expect(validateDuplicateGroupName(tokens, selectedTokenSets, activeTokenSet, type, oldName, newName)).toEqual({
  //     type: ErrorType.OverlappingGroup,
  //     possibleDuplicates: [{
  //       name: 'buttons.default',
  //       type: 'sizing',
  //       value: '16',
  //     }],
  //   });
  // });
  it('prevent overlapping token name with group name', () => {
    setFormat(TokenFormatOptions.DTCG);
    const activeTokenSet = 'global';
    const type = 'color';
    const selectedTokenSets = ['global'];
    const oldName = 'buttons2';
    const newName = 'buttons.default';
    expect(validateDuplicateGroupName(tokens, selectedTokenSets, activeTokenSet, type, oldName, newName)).toEqual({
      type: ErrorType.OverlappingToken,
      foundOverlappingToken: {
        global: {
          name: 'buttons.default',
          type: 'sizing',
          value: '16',
        },
      },
    });
  });
  // it('prevent overlapping tokens due to overlapping group name and token names', () => {
  //   setFormat(TokenFormatOptions.DTCG);
  //   const activeTokenSet = 'global';
  //   const type = 'color';
  //   const selectedTokenSets = ['global'];
  //   const oldName = 'buttons123';
  //   const newName = 'buttons';
  //   expect(validateDuplicateGroupName(tokens, selectedTokenSets, activeTokenSet, type, oldName, newName)).toEqual({
  //     type: ErrorType.OverlappingGroup,
  //     possibleDuplicates: [{
  //       name: 'buttons.default',
  //       type: 'sizing',
  //       value: '16',
  //     },
  //     {
  //       name: 'buttons.primary',
  //       type: 'sizing',
  //       value: '12',
  //     },
  //     {
  //       name: 'buttons.superlongtokenname',
  //       type: 'sizing',
  //       value: '16',
  //     }],
  //   });
  // });
  // it('should not allow renaming group with existing token name', () => {
  //   setFormat(TokenFormatOptions.DTCG);
  //   const activeTokenSet = 'global';
  //   const type = 'color';
  //   const selectedTokenSets = ['global'];
  //   const oldName = 'buttons123';
  //   const newName = 'buttons2';
  //   expect(validateDuplicateGroupName(tokens, selectedTokenSets, activeTokenSet, type, oldName, newName)).toEqual({
  //     type: ErrorType.OverlappingToken,
  //     foundOverlappingToken: {
  //       name: 'buttons2',
  //       type: 'sizing',
  //       value: '12',
  //     },
  //   });
  // });
  // it('should allow renaming group to a group name that exists, but doesn\'t have overlapping tokens', () => {
  //   setFormat(TokenFormatOptions.DTCG);
  //   const activeTokenSet = 'global';
  //   const type = 'color';
  //   const selectedTokenSets = ['global'];
  //   const oldName = 'buttons123';
  //   const newName = 'buttons3';
  //   expect(validateDuplicateGroupName(tokens, selectedTokenSets, activeTokenSet, type, oldName, newName)).toEqual(null);
  // });
});
