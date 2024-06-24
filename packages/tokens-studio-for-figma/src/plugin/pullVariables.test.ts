import pullVariables from './pullVariables';

import * as notifiers from './notifiers';

describe('pullStyles', () => {
  const notifyStyleValuesSpy = jest.spyOn(notifiers, 'notifyVariableValues');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  global.figma = {
    ui: {
      postMessage: jest.fn(),
    },
    clientStorage: {
      getAsync: jest.fn().mockImplementation((key) => {
        if (key === 'uiSettings') {
          return Promise.resolve(JSON.stringify({ baseFontSize: 16 }));
        }
        return Promise.resolve(null);
      })
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
        {
          name: 'Number1',
          remote: false,
          description: '',
          resolvedType: 'FLOAT',
          valuesByMode: {
            '1:0': 24,
            '1:1': 24,
            '1:2': 24,
            '1:3': 24,
          }
        },
        {
          name: 'Number2',
          remote: false,
          description: '',
          resolvedType: 'FLOAT',
          valuesByMode: {
            '1:0': 16,
            '1:1': 16,
            '1:2': 16,
            '1:3': 16,
          }
        },
      ]),
    },
  };

  it('pulls variables without no dimension options', async () => {
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
      numbers: [
        {
          description: '',
          name: 'Number1',
          parent: 'Collection 1/Default',
          type: 'number',
          value: 24
        },
        {
          description: '',
          name: 'Number1',
          parent: 'Collection 1/Dark',
          type: 'number',
          value: 24
        },
        {
          description: '',
          name: 'Number1',
          parent: 'Collection 1/Light',
          type: 'number',
          value: 24
        },
        {
          description: '',
          name: 'Number1',
          parent: 'Collection 1/Custom',
          type: 'number',
          value: 24
        },
        {
          description: '',
          name: 'Number2',
          parent: 'Collection 1/Default',
          type: 'number',
          value: 16
        },
        {
          description: '',
          name: 'Number2',
          parent: 'Collection 1/Dark',
          type: 'number',
          value: 16
        },
        {
          description: '',
          name: 'Number2',
          parent: 'Collection 1/Light',
          type: 'number',
          value: 16
        },
        {
          description: '',
          name: 'Number2',
          parent: 'Collection 1/Custom',
          type: 'number',
          value: 16
        }
      ]
    });
  });

  it('pulls variables with Convert numbers to dimensions option', async () => {
    await pullVariables({ useDimensions: true, useRem: false });

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
      dimensions: [
        {
          description: '',
          name: 'Number1',
          parent: 'Collection 1/Default',
          type: 'dimension',
          value: '24px'
        },
        {
          description: '',
          name: 'Number1',
          parent: 'Collection 1/Dark',
          type: 'dimension',
          value: '24px'
        },
        {
          description: '',
          name: 'Number1',
          parent: 'Collection 1/Light',
          type: 'dimension',
          value: '24px'
        },
        {
          description: '',
          name: 'Number1',
          parent: 'Collection 1/Custom',
          type: 'dimension',
          value: '24px'
        },
        {
          description: '',
          name: 'Number2',
          parent: 'Collection 1/Default',
          type: 'dimension',
          value: '16px'
        },
        {
          description: '',
          name: 'Number2',
          parent: 'Collection 1/Dark',
          type: 'dimension',
          value: '16px'
        },
        {
          description: '',
          name: 'Number2',
          parent: 'Collection 1/Light',
          type: 'dimension',
          value: '16px'
        },
        {
          description: '',
          name: 'Number2',
          parent: 'Collection 1/Custom',
          type: 'dimension',
          value: '16px'
        }
      ]
    });
  });

  it('pulls variables with Use rem for dimension values option', async () => {
    await pullVariables({ useDimensions: false, useRem: true });

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
      dimensions: [
        {
          description: '',
          name: 'Number1',
          parent: 'Collection 1/Default',
          type: 'dimension',
          value: '1.5rem'
        },
        {
          description: '',
          name: 'Number1',
          parent: 'Collection 1/Dark',
          type: 'dimension',
          value: '1.5rem'
        },
        {
          description: '',
          name: 'Number1',
          parent: 'Collection 1/Light',
          type: 'dimension',
          value: '1.5rem'
        },
        {
          description: '',
          name: 'Number1',
          parent: 'Collection 1/Custom',
          type: 'dimension',
          value: '1.5rem'
        },
        {
          description: '',
          name: 'Number2',
          parent: 'Collection 1/Default',
          type: 'dimension',
          value: '1rem'
        },
        {
          description: '',
          name: 'Number2',
          parent: 'Collection 1/Dark',
          type: 'dimension',
          value: '1rem'
        },
        {
          description: '',
          name: 'Number2',
          parent: 'Collection 1/Light',
          type: 'dimension',
          value: '1rem'
        },
        {
          description: '',
          name: 'Number2',
          parent: 'Collection 1/Custom',
          type: 'dimension',
          value: '1rem'
        }
      ]
    });
  });

  it('pulls variables with dimensions in rem if both options are selected', async () => {
    await pullVariables({ useDimensions: true, useRem: true });

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
      dimensions: [
        {
          description: '',
          name: 'Number1',
          parent: 'Collection 1/Default',
          type: 'dimension',
          value: '1.5rem'
        },
        {
          description: '',
          name: 'Number1',
          parent: 'Collection 1/Dark',
          type: 'dimension',
          value: '1.5rem'
        },
        {
          description: '',
          name: 'Number1',
          parent: 'Collection 1/Light',
          type: 'dimension',
          value: '1.5rem'
        },
        {
          description: '',
          name: 'Number1',
          parent: 'Collection 1/Custom',
          type: 'dimension',
          value: '1.5rem'
        },
        {
          description: '',
          name: 'Number2',
          parent: 'Collection 1/Default',
          type: 'dimension',
          value: '1rem'
        },
        {
          description: '',
          name: 'Number2',
          parent: 'Collection 1/Dark',
          type: 'dimension',
          value: '1rem'
        },
        {
          description: '',
          name: 'Number2',
          parent: 'Collection 1/Light',
          type: 'dimension',
          value: '1rem'
        },
        {
          description: '',
          name: 'Number2',
          parent: 'Collection 1/Custom',
          type: 'dimension',
          value: '1rem'
        }
      ]
    });
  });
});
