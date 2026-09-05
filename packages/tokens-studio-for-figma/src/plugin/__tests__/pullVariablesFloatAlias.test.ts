import pullVariables from '../pullVariables';
import * as notifiers from '../notifiers';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

// A FLOAT variable whose value is a VARIABLE_ALIAS (not a raw number).
// Regression coverage for a pullVariables path that previously gated the
// dimension branch on `endsWith('px') || endsWith('rem')` — aliases have no
// suffix and were misrouted to `number`, flipping token types on re-import.
jest.mock('../getVariablesWithoutZombies', () => ({
  getVariablesWithoutZombies: jest.fn().mockResolvedValue([
    {
      name: 'Spacing.base',
      remote: false,
      resolvedType: 'FLOAT',
      variableCollectionId: 'coll1',
      valuesByMode: {
        '1:0': { type: 'VARIABLE_ALIAS', id: 'target-id' },
      },
    },
  ]),
}));

describe('pullVariables — FLOAT alias under useDimensions', () => {
  const notifyStyleValuesSpy = jest.spyOn(notifiers, 'notifyVariableValues').mockImplementation(() => {});

  beforeAll(() => {
    AsyncMessageChannel.PluginInstance.connect();
    AsyncMessageChannel.PluginInstance.handle(
      AsyncMessageTypes.GET_THEME_INFO,
      async () => ({
        type: AsyncMessageTypes.GET_THEME_INFO,
        activeTheme: {},
        themes: [],
      }),
    );
  });

  beforeEach(() => {
    notifyStyleValuesSpy.mockClear();

    global.figma = {
      clientStorage: { getAsync: jest.fn().mockResolvedValue(JSON.stringify({ baseFontSize: 16 })) },
      variables: {
        getLocalVariableCollectionsAsync: jest.fn().mockResolvedValue([
          {
            id: 'coll1',
            name: 'Sizing',
            modes: [{ name: 'Default', modeId: '1:0' }],
          },
        ]),
        getVariableCollectionByIdAsync: jest.fn().mockResolvedValue({
          id: 'coll1',
          name: 'Sizing',
          modes: [{ name: 'Default', modeId: '1:0' }],
        }),
        getVariableById: jest.fn().mockReturnValue({ id: 'target-id', name: 'spacing/small' }),
      },
    } as any;
  });

  it('imports aliased FLOAT variables as dimension when useDimensions is on', async () => {
    await pullVariables({ useDimensions: 'true', useRem: false }, [], false);

    const payload = notifyStyleValuesSpy.mock.calls[0][0];

    // The aliased FLOAT must land in `dimensions` with type: 'dimension',
    // not in `numbers`. Its value is the alias reference token, not a suffixed string.
    expect(payload.dimensions).toEqual([
      expect.objectContaining({
        name: 'Spacing.base',
        type: 'dimension',
        value: '{spacing.small}',
      }),
    ]);
    expect(payload.numbers ?? []).toEqual([]);
  });

  it('imports aliased FLOAT variables as dimension when useRem is on', async () => {
    await pullVariables({ useDimensions: false, useRem: 'true' }, [], false);

    const payload = notifyStyleValuesSpy.mock.calls[0][0];
    expect(payload.dimensions).toEqual([
      expect.objectContaining({ name: 'Spacing.base', type: 'dimension' }),
    ]);
    expect(payload.numbers ?? []).toEqual([]);
  });
});
