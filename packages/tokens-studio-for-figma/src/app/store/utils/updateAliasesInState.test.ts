import { updateAliasesInState } from './updateAliasesInState';

describe('updateAliasesInState', () => {
  it('should update aliases in state', () => {
    const tokens = {
      core: [
        {
          name: 'alias1',
          value: '{oldValue}',
        },
        {
          name: 'alias2',
          value: {
            prop1: '{oldValue}',
            prop2: '{oldValue}',
            prop3: '{oldValue.foo.bar}',
            prop4: '{foo.oldValue.bar}',
          },
        },
        {
          name: 'alias3',
          value: [{
            x: '{oldValue}', y: '{oldValue.foo.bar}',
          }],
        },
      ],
    };

    const data = {
      oldName: 'oldValue',
      newName: 'newValue',
    };

    const expectedTokens = {
      core: [
        {
          name: 'alias1',
          value: '{newValue}',
        },
        {
          name: 'alias2',
          value: {
            prop1: '{newValue}',
            prop2: '{newValue}',
            prop3: '{oldValue.foo.bar}',
            prop4: '{foo.oldValue.bar}',
          },
        },
        {
          name: 'alias3',
          value: [{
            x: '{newValue}', y: '{oldValue.foo.bar}',
          }],
        },
      ],
    };

    const { updatedTokens } = updateAliasesInState(tokens, data);

    expect(updatedTokens).toEqual(expectedTokens);
  });

  it('should not update aliases in state if oldName is not found', () => {
    const tokens = {
      core: [
        {
          name: 'alias1',
          value: '{oldValue}',
        },
      ],
    };

    const data = {
      oldName: 'nonExistentValue',
      newName: 'newValue',
    };

    const expectedTokens = {
      core: [
        {
          name: 'alias1',
          value: '{oldValue}',
        },
      ],
    };

    const { updatedTokens } = updateAliasesInState(tokens, data);

    expect(updatedTokens).toEqual(expectedTokens);
  });
});
