import { tokensSharedDataHandler } from './SharedDataHandler';

describe('SharedDataHandler', () => {
  const mockSetSharedPluginData = jest.fn();
  const mockGetSharedPluginDataKeys = jest.fn();

  const node = {
    name: 'Rectangle 1',
    setSharedPluginData: mockSetSharedPluginData,
    getSharedPluginDataKeys: mockGetSharedPluginDataKeys,
  } as unknown as BaseNode;

  it('should call setSharedPluginData', () => {
    tokensSharedDataHandler.set(node, 'key', 'value');
    expect(mockSetSharedPluginData).toBeCalledWith('tokens', 'key', 'value');
  });

  it('should return getSharedPluginDataKeys', () => {
    tokensSharedDataHandler.keys(node);
    expect(mockGetSharedPluginDataKeys).toBeCalledWith('tokens');
  });
});
