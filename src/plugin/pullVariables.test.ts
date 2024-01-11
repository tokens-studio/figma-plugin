import pullVariables from './pullVariables';

import * as notifiers from './notifiers';

describe('pullStyles', () => {
  const notifyStyleValuesSpy = jest.spyOn(notifiers, 'notifyVariableValues');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  global.figma = {
    ui: {
      postMessage: jest.fn(),
    },
    variables: {
      getVariableCollectionById: jest.fn().mockReturnValue({
        id: 'VariableID:1:0',
        name: 'Collection 1',

        remote: false,
        modes: [
          { name: 'Default', modeId: '1:0' },
          { name: 'Dark', modeId: '1:1' },
          { name: 'Light', modeId: '1:2' },
          { name: 'Custom', modeId: '1:3' },
        ],
      }),
      getLocalVariables: jest.fn().mockReturnValue([
        {
          name: 'Color',
          remote: false,
          resolvedType: 'COLOR',
          description: '',
          valuesByMode: {
            '1:0': {
              r: 1, g: 1, b: 1, a: 1,
            },
            '1:1': {
              r: 0, g: 0, b: 0, a: 1,
            },
            '1:2': {
              r: 1, g: 0, b: 0, a: 1,
            },
            '1:3': {
              r: 0.729411780834198, g: 0.8549019694328308, b: 0.3333333432674408, a: 1,
            },
          },
          Id: 'VariableCollectionId:1:0',
        },
      ]),
    },
  };

  it('pulls variables', async () => {
    // @ts-ignore next-line
    await pullVariables({ useDimensions: false, useRem: false });

    expect(notifyStyleValuesSpy).toHaveBeenCalledWith({
      colors: [
        {
          description: '',
          name: 'Color',
          parent: 'Collection 1/Default',
          type: 'color',
          value: '#ffffff',
        },
        {
          description: '',
          name: 'Color',
          parent: 'Collection 1/Dark',
          type: 'color',
          value: '#000000',
        },
        {
          description: '',
          name: 'Color',
          parent: 'Collection 1/Light',
          type: 'color',
          value: '#ff0000',
        },
        {
          description: '',
          name: 'Color',
          parent: 'Collection 1/Custom',
          type: 'color',
          value: '#bada55',
        },
      ],
    });
  });
});
