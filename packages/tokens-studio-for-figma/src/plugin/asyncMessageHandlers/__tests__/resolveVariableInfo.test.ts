import {
  mockGetLocalVariableCollectionsAsync, mockGetLocalVariablesAsync, mockImportVariableByKeyAsync,
} from '../../../../tests/__mocks__/figmaMock';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { resolveVariableInfo } from '../resolveVariableInfo';

describe('AttachLocalVariablesToTheme', () => {
  it('first try to find matching local variables and then find remote variables and finally return all matching variables', async () => {
    const variableIds = [
      '12345',
      '23456',
      '34567',
    ];
    const mockLocalVariables = [
      {
        id: 'VariableID:1234',
        key: '12345',
        variableCollectionId: 'VariableCollectionId:12:12345',
        name: 'fg/default',
      },
      {
        id: 'VariableID:1235',
        key: '23456',
        variableCollectionId: 'VariableCollectionId:23:23456',
        name: 'fg/muted',
      },
      {
        id: 'VariableID:2345',
        key: '45678',
        variableCollectionId: 'VariableCollectionId:23:23456',
        name: 'fg/background',
      },
    ];
    const mockLocalVariableCollections = [
      {
        id: 'VariableCollectionId:12:12345',
        name: 'fg/default',
      },
      {
        id: 'VariableCollectionId:23:23456',
        name: 'fg/muted',
      },
    ];
    const mockRemoveVariable = {
      id: 'VariableID:3456',
      key: '34567',
      variableCollectionId: 'VariableCollectionId:23:23456',
      name: 'fg/subtle',
    };
    mockGetLocalVariablesAsync.mockImplementationOnce(() => Promise.resolve(mockLocalVariables));
    mockGetLocalVariableCollectionsAsync.mockImplementationOnce(() => Promise.resolve(mockLocalVariableCollections));
    mockImportVariableByKeyAsync.mockImplementationOnce(() => mockRemoveVariable);
    expect(await resolveVariableInfo({
      type: AsyncMessageTypes.RESOLVE_VARIABLE_INFO,
      variableIds,
    })).toEqual({
      resolvedValues: {
        12345: {
          key: '12345',
          name: 'fg/default',
        },
        23456: {
          key: '23456',
          name: 'fg/muted',
        },
        34567: {
          key: '34567',
          name: 'fg/subtle',
        },
      },
    });
    expect(mockImportVariableByKeyAsync).toBeCalledTimes(1);
  });
});
