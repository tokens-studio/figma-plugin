import { tokensSharedDataHandler } from './SharedDataHandler';

describe('SharedDataHandler', () => {
  const mockSetSharedPluginData = jest.fn();
  const mockGetSharedPluginData = jest.fn();
  const mockGetSharedPluginDataKeys = jest.fn();

  const node = {
    id: '1:2',
    name: 'Rectangle 1',
    setSharedPluginData: mockSetSharedPluginData,
    getSharedPluginData: mockGetSharedPluginData,
    getSharedPluginDataKeys: mockGetSharedPluginDataKeys,
  } as unknown as BaseNode;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call setSharedPluginData', () => {
    tokensSharedDataHandler.set(node, 'key', 'value');
    expect(mockSetSharedPluginData).toBeCalledWith('tokens', 'key', 'value');
  });

  it('should return getSharedPluginDataKeys', () => {
    tokensSharedDataHandler.keys(node);
    expect(mockGetSharedPluginDataKeys).toBeCalledWith('tokens');
  });

  it('should return no keys when Figma cannot read plugin data from a stale node', () => {
    mockGetSharedPluginDataKeys.mockImplementation(() => {
      throw new Error('getSharedPluginDataKeys: The node with id "I1;2" does not exist');
    });

    expect(tokensSharedDataHandler.keys(node)).toEqual([]);
  });

  it('should return no shared plugin data when Figma cannot read from a stale node', () => {
    mockGetSharedPluginData.mockImplementation(() => {
      throw new Error('getSharedPluginData: The node with id "I1;2" does not exist');
    });

    expect(tokensSharedDataHandler.get(node, 'key')).toBe('');
  });
});
