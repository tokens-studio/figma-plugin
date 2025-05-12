import { writeSharedPluginData } from '../writeSharedPluginData';
import { getUTF16StringSize } from '@/utils/getUTF16StringSize';
import { splitIntoChunks } from '@/utils/splitIntoChunks';

// Mock dependencies
jest.mock('@/utils/getUTF16StringSize');
jest.mock('@/utils/splitIntoChunks');

describe('writeSharedPluginData', () => {
  // Mock Figma node
  const mockNode = {
    setSharedPluginData: jest.fn(),
    getSharedPluginData: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should clear data when value is null', async () => {
    await writeSharedPluginData('namespace', 'values', null, mockNode as unknown as BaseNode);

    expect(mockNode.setSharedPluginData).toHaveBeenCalledWith('namespace', 'values', '');
    expect(mockNode.setSharedPluginData).toHaveBeenCalledWith('namespace', 'values_meta', '');
  });

  it('should clear chunks when value is null and chunks exist', async () => {
    // Mock metadata indicating chunked storage
    mockNode.getSharedPluginData.mockReturnValueOnce(JSON.stringify({
      type: 'chunked',
      count: 2,
    }));

    await writeSharedPluginData('namespace', 'values', null, mockNode as unknown as BaseNode);

    expect(mockNode.setSharedPluginData).toHaveBeenCalledWith('namespace', 'values_chunk_0', '');
    expect(mockNode.setSharedPluginData).toHaveBeenCalledWith('namespace', 'values_chunk_1', '');
  });

  it('should store data directly when size is within limit', async () => {
    const testValue = 'test value';

    // Mock size check to return a small size
    (getUTF16StringSize as jest.Mock).mockReturnValueOnce(1000);

    await writeSharedPluginData('namespace', 'values', testValue, mockNode as unknown as BaseNode);

    // Should set metadata for single storage
    expect(mockNode.setSharedPluginData).toHaveBeenCalledWith(
      'namespace',
      'values_meta',
      JSON.stringify({ type: 'single' }),
    );

    // Should store the data directly
    expect(mockNode.setSharedPluginData).toHaveBeenCalledWith('namespace', 'values', testValue);
  });

  it('should chunk data when size exceeds limit', async () => {
    const testValue = 'large test value';
    const chunks = ['chunk1', 'chunk2'];

    // Mock size check to return a large size
    (getUTF16StringSize as jest.Mock).mockReturnValueOnce(100 * 1024);

    // Mock chunk splitting
    (splitIntoChunks as jest.Mock).mockReturnValueOnce(chunks);

    await writeSharedPluginData('namespace', 'values', testValue, mockNode as unknown as BaseNode);

    // Should set metadata for chunked storage
    expect(mockNode.setSharedPluginData).toHaveBeenCalledWith(
      'namespace',
      'values_meta',
      JSON.stringify({ type: 'chunked', count: 2 }),
    );

    // Should store each chunk
    expect(mockNode.setSharedPluginData).toHaveBeenCalledWith('namespace', 'values_chunk_0', 'chunk1');
    expect(mockNode.setSharedPluginData).toHaveBeenCalledWith('namespace', 'values_chunk_1', 'chunk2');

    // Should clear the main key
    expect(mockNode.setSharedPluginData).toHaveBeenCalledWith('namespace', 'values', '');
  });

  it('should clean up obsolete chunks', async () => {
    const testValue = 'updated value';
    const chunks = ['chunk1']; // Only one chunk now

    // Mock size check to return a large size
    (getUTF16StringSize as jest.Mock).mockReturnValueOnce(100 * 1024);

    // Mock chunk splitting
    (splitIntoChunks as jest.Mock).mockReturnValueOnce(chunks);

    // Mock metadata indicating there were previously 2 chunks
    mockNode.getSharedPluginData.mockReturnValueOnce(JSON.stringify({
      type: 'chunked',
      count: 2,
    }));

    await writeSharedPluginData('namespace', 'values', testValue, mockNode as unknown as BaseNode);

    // Should clean up the obsolete chunk
    expect(mockNode.setSharedPluginData).toHaveBeenCalledWith('namespace', 'values_chunk_1', '');
  });
});
