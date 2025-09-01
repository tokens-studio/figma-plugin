import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { bulkRemapTokens } from '../bulkRemapTokens';
import { defaultNodeManager } from '../../NodeManager';
import { UpdateMode } from '@/constants/UpdateMode';

describe('bulkRemapTokens', () => {
  const findNodesSpy = jest.spyOn(defaultNodeManager, 'findBaseNodesWithData');
  const mockSetSharedPluginData = jest.fn();

  it('should be able to replace all matching token names with new token name', async () => {
    findNodesSpy.mockImplementationOnce(() => Promise.resolve([
      {
        id: '295:3',
        node: {
          id: '295:3',
          setSharedPluginData: mockSetSharedPluginData,
        } as unknown as BaseNode,
        tokens: {
          borderRadius: 'old.border-radius',
          fill: 'old.slate.400',
          sizing: 'old-size.450',
          spacing: 'something-else.foobar',
        },
      },
      {
        id: '295:4',
        node: {
          id: '295:4',
          setSharedPluginData: mockSetSharedPluginData,
        } as unknown as RectangleNode,
        tokens: {
          fill: 'old.red.500',
          sizing: 'old-size.1600',
        },
      },
      {
        id: '295:5',
        node: {
          id: '295:5',
          setSharedPluginData: mockSetSharedPluginData,
        } as unknown as TextNode,
        tokens: {
          fill: 'old-color.gray.300',
        },
      },
    ]));
    await bulkRemapTokens({
      type: AsyncMessageTypes.BULK_REMAP_TOKENS,
      oldName: 'old',
      newName: 'new',
      updateMode: UpdateMode.SELECTION,
      useRegex: false,
    });

    expect(mockSetSharedPluginData).toHaveBeenCalledTimes(6);
    expect(mockSetSharedPluginData.mock.calls[0]).toEqual(['tokens', 'borderRadius', '"new.border-radius"']);
    expect(mockSetSharedPluginData.mock.calls[5]).toEqual(['tokens', 'fill', '"new-color.gray.300"']);
  });

  it('should be able to replace all matching token names with new token name using regex', async () => {
    findNodesSpy.mockImplementationOnce(() => Promise.resolve([
      {
        id: '295:3',
        node: {
          id: '295:3',
          setSharedPluginData: mockSetSharedPluginData,
        } as unknown as BaseNode,
        tokens: {
          borderRadius: 'old.border-radius',
          fill: 'old.slate.400',
          sizing: 'old-size.450',
          spacing: 'something-else.foobar',
        },
      },
      {
        id: '295:4',
        node: {
          id: '295:4',
          setSharedPluginData: mockSetSharedPluginData,
        } as unknown as RectangleNode,
        tokens: {
          fill: 'old.red.500',
          sizing: 'old-size.1600',
        },
      },
      {
        id: '295:5',
        node: {
          id: '295:5',
          setSharedPluginData: mockSetSharedPluginData,
        } as unknown as TextNode,
        tokens: {
          fill: 'old-color.gray.300',
        },
      },
    ]));
    await bulkRemapTokens({
      type: AsyncMessageTypes.BULK_REMAP_TOKENS,
      oldName: '/old-size.*/g',
      newName: 'new-size.1000',
      updateMode: UpdateMode.SELECTION,
      useRegex: true,
    });

    expect(mockSetSharedPluginData).toHaveBeenCalledTimes(2);
    expect(mockSetSharedPluginData.mock.calls[0]).toEqual(['tokens', 'sizing', '"new-size.1000"']);
    expect(mockSetSharedPluginData.mock.calls[1]).toEqual(['tokens', 'sizing', '"new-size.1000"']);
  });

  it('should treat patterns as literal strings when regex mode is disabled', async () => {
    findNodesSpy.mockImplementationOnce(() => Promise.resolve([
      {
        id: '295:8',
        node: {
          id: '295:8',
          setSharedPluginData: mockSetSharedPluginData,
        } as unknown as BaseNode,
        tokens: {
          pattern1: 'old-size.*',
          pattern2: 'old-size.large',
          pattern3: 'old-size.medium',
        },
      },
    ]));
    await bulkRemapTokens({
      type: AsyncMessageTypes.BULK_REMAP_TOKENS,
      oldName: 'old-size.*',
      newName: 'new-size.all',
      updateMode: UpdateMode.SELECTION,
      useRegex: false,
    });

    // Should only match the exact "old-size.*" string, not treat it as a regex pattern
    expect(mockSetSharedPluginData).toHaveBeenCalledTimes(1);
    expect(mockSetSharedPluginData.mock.calls[0]).toEqual(['tokens', 'pattern1', '"new-size.all"']);
  });

  it('should treat patterns as regex when regex mode is enabled', async () => {
    findNodesSpy.mockImplementationOnce(() => Promise.resolve([
      {
        id: '295:9',
        node: {
          id: '295:9',
          setSharedPluginData: mockSetSharedPluginData,
        } as unknown as BaseNode,
        tokens: {
          pattern1: 'old-size.*',
          pattern2: 'old-size.large',
          pattern3: 'old-size.medium',
        },
      },
    ]));
    await bulkRemapTokens({
      type: AsyncMessageTypes.BULK_REMAP_TOKENS,
      oldName: 'old-size.*',
      newName: 'new-size.all',
      updateMode: UpdateMode.SELECTION,
      useRegex: true,
    });

    // Should match all three patterns when treated as regex
    expect(mockSetSharedPluginData).toHaveBeenCalledTimes(3);
    expect(mockSetSharedPluginData.mock.calls[0]).toEqual(['tokens', 'pattern1', '"new-size.all"']);
    expect(mockSetSharedPluginData.mock.calls[1]).toEqual(['tokens', 'pattern2', '"new-size.all"']);
    expect(mockSetSharedPluginData.mock.calls[2]).toEqual(['tokens', 'pattern3', '"new-size.all"']);
  });

  it('should handle special regex characters in literal string matching', async () => {
    findNodesSpy.mockImplementationOnce(() => Promise.resolve([
      {
        id: '295:6',
        node: {
          id: '295:6',
          setSharedPluginData: mockSetSharedPluginData,
        } as unknown as BaseNode,
        tokens: {
          borderRadius: 'size..border',
          fill: 'size.border',
          sizing: 'size...spacing',
          spacing: 'other.token',
        },
      },
    ]));
    await bulkRemapTokens({
      type: AsyncMessageTypes.BULK_REMAP_TOKENS,
      oldName: '..',
      newName: '.',
      updateMode: UpdateMode.SELECTION,
      useRegex: false,
    });

    // Should only match the exact ".." pattern, not treat it as regex
    expect(mockSetSharedPluginData).toHaveBeenCalledTimes(2);
    expect(mockSetSharedPluginData.mock.calls[0]).toEqual(['tokens', 'borderRadius', '"size.border"']);
    expect(mockSetSharedPluginData.mock.calls[1]).toEqual(['tokens', 'sizing', '"size..spacing"']);
  });

  it('should handle other special regex characters as literal strings', async () => {
    findNodesSpy.mockImplementationOnce(() => Promise.resolve([
      {
        id: '295:7',
        node: {
          id: '295:7',
          setSharedPluginData: mockSetSharedPluginData,
        } as unknown as BaseNode,
        tokens: {
          pattern1: 'color[main]',
          pattern2: 'color.main',
          pattern3: 'size*large',
          pattern4: 'size+medium',
          pattern5: 'border?solid',
          pattern6: 'border-solid',
        },
      },
    ]));
    await bulkRemapTokens({
      type: AsyncMessageTypes.BULK_REMAP_TOKENS,
      oldName: '[main]',
      newName: '.primary',
      updateMode: UpdateMode.SELECTION,
      useRegex: false,
    });

    // Should only match the exact "[main]" pattern, not treat it as regex character class
    expect(mockSetSharedPluginData).toHaveBeenCalledTimes(1);
    expect(mockSetSharedPluginData.mock.calls[0]).toEqual(['tokens', 'pattern1', '"color.primary"']);
  });
});
