import {
  mockGetLocalVariableCollectionsAsync,
  mockGetLocalVariablesAsync,
} from '../../../../tests/__mocks__/figmaMock';
import { removeVariables } from '../removeVariables';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

describe('removeVariables', () => {
  const mockVariable = {
    id: 'VariableID:1234',
    key: 'abc123',
    name: 'color/primary',
    variableCollectionId: 'VariableCollectionId:1:1',
    remove: jest.fn(),
  };

  beforeEach(() => {
    mockVariable.remove.mockClear();
    mockGetLocalVariablesAsync.mockResolvedValue([mockVariable]);
    mockGetLocalVariableCollectionsAsync.mockResolvedValue([
      {
        id: 'VariableCollectionId:1:1',
        name: 'Collection',
        remote: false,
        modes: [{ name: 'Default', modeId: '1' }],
      },
    ]);
  });

  it('removes variables matching provided keys and returns their keys', async () => {
    const msg = { type: AsyncMessageTypes.REMOVE_VARIABLES, variableKeys: ['abc123'] };
    const result = await removeVariables(msg as any);
    expect(mockVariable.remove).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ variableKeys: ['abc123'] });
  });

  it('returns empty array and does not throw when no keys match', async () => {
    const msg = { type: AsyncMessageTypes.REMOVE_VARIABLES, variableKeys: ['nonexistent'] };
    const result = await removeVariables(msg as any);
    expect(mockVariable.remove).not.toHaveBeenCalled();
    expect(result).toEqual({ variableKeys: [] });
  });
});
