import { TokenTypes } from '@/constants/TokenTypes';
import { mockImportStyleByKeyAsync, mockImportVariableByKeyAsync } from '../../tests/__mocks__/figmaMock';
import { TokenValueRetriever } from './TokenValueRetriever';

describe('TokenValueRetriever imports', () => {
  it('imports one variable key once for concurrent token references', async () => {
    const retriever = new TokenValueRetriever();
    retriever.initiate({
      tokens: [
        { name: 'primary', type: TokenTypes.COLOR, value: '#ff0000' },
        { name: 'alias', type: TokenTypes.COLOR, value: '#ff0000' },
      ],
      variableReferences: new Map([
        ['primary', 'shared-key'],
        ['alias', 'shared-key'],
      ]),
    });
    const variable = { id: 'VariableID:1', key: 'shared-key' };
    mockImportVariableByKeyAsync.mockResolvedValueOnce(variable);

    const results = await Promise.all([
      retriever.getVariableReference('primary'),
      retriever.getVariableReference('alias'),
    ]);
    expect(results).toEqual([variable, variable]);
    expect(await retriever.getVariableReference('alias')).toBe(variable);
    expect(mockImportVariableByKeyAsync).toHaveBeenCalledTimes(1);
  });

  it('logs failed variable imports and retries on the next request', async () => {
    const retriever = new TokenValueRetriever();
    retriever.initiate({
      tokens: [{ name: 'primary', type: TokenTypes.COLOR, value: '#ff0000' }],
      variableReferences: new Map([['primary', 'shared-key']]),
    });
    const errorSpy = jest.spyOn(console, 'log').mockImplementation();
    const variable = { id: 'VariableID:1', key: 'shared-key' };
    mockImportVariableByKeyAsync.mockRejectedValueOnce(new Error('Unavailable')).mockResolvedValueOnce(variable);

    expect(await retriever.getVariableReference('primary')).toBeNull();
    expect(await retriever.getVariableReference('primary')).toBe(variable);
    expect(mockImportVariableByKeyAsync).toHaveBeenCalledTimes(2);
    expect(errorSpy).toHaveBeenCalledWith('error importing variable', expect.any(Error));
    errorSpy.mockRestore();
  });

  it('shares pending style imports and retries failures', async () => {
    const retriever = new TokenValueRetriever();
    mockImportStyleByKeyAsync.mockResolvedValueOnce({ id: 'S:shared,1:1' });

    expect(await Promise.all([retriever.importStyleByKey('shared'), retriever.importStyleByKey('shared')])).toEqual([
      'S:shared,1:1',
      'S:shared,1:1',
    ]);
    expect(await retriever.importStyleByKey('shared')).toBe('S:shared,1:1');
    expect(mockImportStyleByKeyAsync).toHaveBeenCalledTimes(1);

    mockImportStyleByKeyAsync
      .mockRejectedValueOnce(new Error('Unavailable'))
      .mockResolvedValueOnce({ id: 'S:other,2:2' });
    await expect(retriever.importStyleByKey('other')).rejects.toThrow('Unavailable');
    await expect(retriever.importStyleByKey('other')).resolves.toBe('S:other,2:2');
    expect(mockImportStyleByKeyAsync).toHaveBeenCalledTimes(3);
  });
});
