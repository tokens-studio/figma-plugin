import { updateModify } from './updateModify';

describe('updateModify', () => {
  it('should update the modify property in the token', () => {
    const token = {
      name: 'token1',
      $extensions: {
        'studio.tokens': {
          modify: {
            value: '{oldValue}',
            prop2: '{oldValue}',
          },
        },
      },
    };

    const data = {
      oldName: 'oldValue',
      newName: 'newValue',
    };

    const expectedToken = {
      name: 'token1',
      $extensions: {
        'studio.tokens': {
          modify: {
            value: '{newValue}',
            prop2: '{newValue}',
          },
        },
      },
    };

    const updatedToken = updateModify(token, data);

    expect(updatedToken).toEqual(expectedToken);
  });

  it('should not update the modify property if it does not exist', () => {
    const token = {
      name: 'token1',
    };

    const data = {
      oldName: 'oldValue',
      newName: 'newValue',
    };

    const expectedToken = {
      name: 'token1',
    };

    const updatedToken = updateModify(token, data);

    expect(updatedToken).toEqual(expectedToken);
  });

  it('should not update the modify property if oldName is not found', () => {
    const token = {
      name: 'token1',
      $extensions: {
        'studio.tokens': {
          modify: {
            prop1: ['oldValue'],
            prop2: ['oldValue'],
          },
        },
      },
    };

    const data = {
      oldName: 'nonExistentValue',
      newName: 'newValue',
    };

    const expectedToken = {
      name: 'token1',
      $extensions: {
        'studio.tokens': {
          modify: {
            prop1: ['oldValue'],
            prop2: ['oldValue'],
          },
        },
      },
    };

    const updatedToken = updateModify(token, data);

    expect(updatedToken).toEqual(expectedToken);
  });
});
