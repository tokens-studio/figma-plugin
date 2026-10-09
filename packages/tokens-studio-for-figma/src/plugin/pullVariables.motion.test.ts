import pullVariables from './pullVariables';
import * as notifiers from './notifiers';
import { TokenTypes } from '@/constants/TokenTypes';

jest.mock('./getVariablesWithoutZombies', () => ({
  getVariablesWithoutZombies: jest.fn().mockResolvedValue([
    {
      name: 'motion/duration/fast',
      remote: false,
      resolvedType: 'TIMING',
      variableCollectionId: 'coll1',
      valuesByMode: {
        '1:0': 0.2,
        '1:1': 0.15,
      },
    },
    {
      name: 'motion/duration/alias',
      remote: false,
      resolvedType: 'TIMING',
      variableCollectionId: 'coll1',
      valuesByMode: {
        '1:0': { type: 'VARIABLE_ALIAS', id: 'aliasId' },
        '1:1': 0.3,
      },
    },
    {
      name: 'motion/easing/standard',
      remote: false,
      resolvedType: 'EASING',
      variableCollectionId: 'coll1',
      valuesByMode: {
        '1:0': {
          type: 'CUSTOM_CUBIC_BEZIER',
          easingFunctionCubicBezier: {
            x1: 0.4, y1: 0, x2: 0.2, y2: 1,
          },
        },
        '1:1': { type: 'EASE_IN_AND_OUT' },
      },
    },
    {
      name: 'motion/easing/spring',
      remote: false,
      resolvedType: 'EASING',
      variableCollectionId: 'coll1',
      valuesByMode: {
        '1:0': { type: 'GENTLE', easingFunctionSpring: { bounce: 0.2 } },
        '1:1': { type: 'LINEAR' },
      },
    },
  ]),
}));

jest.mock('@/AsyncMessageChannel', () => ({
  AsyncMessageChannel: {
    PluginInstance: {
      message: jest.fn().mockResolvedValue({ themes: [] }),
    },
  },
}));

global.figma = {
  ui: {
    postMessage: jest.fn(),
  },
  clientStorage: {
    getAsync: jest.fn().mockResolvedValue(null),
  },
  variables: {
    getLocalVariableCollectionsAsync: jest.fn().mockResolvedValue([]),
    getVariableCollectionByIdAsync: jest.fn().mockResolvedValue({
      id: 'coll1',
      name: 'Motion',
      modes: [
        { name: 'Default', modeId: '1:0' },
        { name: 'Reduced', modeId: '1:1' },
      ],
    }),
    getVariableById: jest.fn().mockReturnValue({ name: 'motion/duration/base', id: 'aliasId' }),
  },
} as any;

describe('pullVariables motion variables', () => {
  const notifyVariableValuesSpy = jest.spyOn(notifiers, 'notifyVariableValues');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('imports TIMING variables as duration tokens and EASING variables as cubicBezier tokens', async () => {
    await pullVariables({ useDimensions: false, useRem: false }, [], false);

    expect(notifyVariableValuesSpy).toHaveBeenCalledWith({
      durations: [
        {
          name: 'motion.duration.fast', value: '200ms', type: TokenTypes.DURATION, parent: 'Motion/Default',
        },
        {
          name: 'motion.duration.fast', value: '150ms', type: TokenTypes.DURATION, parent: 'Motion/Reduced',
        },
        {
          name: 'motion.duration.alias', value: '{motion.duration.base}', type: TokenTypes.DURATION, parent: 'Motion/Default',
        },
        {
          name: 'motion.duration.alias', value: '300ms', type: TokenTypes.DURATION, parent: 'Motion/Reduced',
        },
      ],
      cubicBeziers: [
        {
          name: 'motion.easing.standard', value: '0.4, 0, 0.2, 1', type: TokenTypes.CUBIC_BEZIER, parent: 'Motion/Default',
        },
        {
          name: 'motion.easing.standard', value: '0.42, 0, 0.58, 1', type: TokenTypes.CUBIC_BEZIER, parent: 'Motion/Reduced',
        },
        // Spring easing in Default mode has no cubic-bezier form and is skipped.
        {
          name: 'motion.easing.spring', value: '0, 0, 1, 1', type: TokenTypes.CUBIC_BEZIER, parent: 'Motion/Reduced',
        },
      ],
    }, []);
  });

  it('normalizes alias names the same way as variable names', async () => {
    (figma.variables.getVariableById as jest.Mock).mockReturnValue({ name: 'motion / duration / base', id: 'aliasId' });
    await pullVariables({ useDimensions: false, useRem: false }, [], false);

    const { durations } = notifyVariableValuesSpy.mock.calls[0][0];
    expect(durations).toContainEqual(expect.objectContaining({ name: 'motion.duration.alias', value: '{motion.duration.base}' }));
  });

  it('skips aliases whose target variable cannot be resolved', async () => {
    (figma.variables.getVariableById as jest.Mock).mockReturnValue(null);
    await pullVariables({ useDimensions: false, useRem: false }, [], false);

    const { durations } = notifyVariableValuesSpy.mock.calls[0][0];
    expect(durations.filter((t) => t.name === 'motion.duration.alias')).toEqual([
      expect.objectContaining({ value: '300ms', parent: 'Motion/Reduced' }),
    ]);
  });
});
