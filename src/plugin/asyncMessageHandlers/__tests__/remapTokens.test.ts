import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { defaultNodeManager } from '../../NodeManager';
import { remapTokens } from '../remapTokens';
import { UpdateMode } from '@/constants/UpdateMode';
import { TokenTypes } from '@/constants/TokenTypes';
import { AnyTokenList } from '@/types/tokens';
import { Properties } from '@/constants/Properties';

describe('remapTokens', () => {
  const mockSetSharedPluginData = jest.fn();
  const tokens = [
    {
      internal__Parent: 'global',
      name: 'color.amber.800',
      rawValue: '#92400e',
      type: TokenTypes.COLOR,
      value: '#92400e',
    },
    {
      internal__Parent: 'global',
      name: 'color.red.400',
      rawValue: '#f87171',
      type: TokenTypes.COLOR,
      value: '#f87171',
    },
    {
      internal__Parent: 'global',
      name: 'border-radius.7',
      rawValue: '34px',
      type: TokenTypes.BORDER_RADIUS,
      value: '34px',
    },
    {
      internal__Parent: 'global',
      name: 'border-width.4',
      rawValue: '10px',
      type: TokenTypes.BORDER_WIDTH,
      value: '10px',
    },
    {
      internal__Parent: 'global',
      name: 'opacity.80',
      rawValue: '80%',
      type: TokenTypes.OPACITY,
      value: '80%',
    },
    {
      internal__Parent: 'global',
      name: 'composition.old',
      rawValue: {
        fill: '#ffffff',
        opacity: '50%',
      },
      type: TokenTypes.OPACITY,
      value: {
        fill: '#ffffff',
        opacity: '50%',
      },
    },
    {
      internal__Parent: 'global',
      name: 'composition.new',
      rawValue: {
        fill: '#000000',
        opacity: '80%',
      },
      type: TokenTypes.OPACITY,
      value: {
        fill: '#000000',
        opacity: '80%',
      },
    },
  ] as AnyTokenList;
  const findNodesSpy = jest.spyOn(defaultNodeManager, 'findBaseNodesWithData');
  it('should update plugin data', async () => {
    findNodesSpy.mockImplementationOnce(() => Promise.resolve([
      {
        id: '295:3',
        node: {
          id: '295:3',
          setSharedPluginData: mockSetSharedPluginData,
        } as unknown as BaseNode,
        tokens: {
          borderRadius: 'border-radius.7',
          borderWidth: 'border-width.4',
          fill: 'color.red.400',
          opacity: 'opacity.80',
        },
      },
    ]));

    await remapTokens({
      type: AsyncMessageTypes.REMAP_TOKENS,
      oldName: 'color.red.400',
      newName: 'color.amber.800',
      updateMode: UpdateMode.SELECTION,
      category: Properties.fill,
      tokens,
    });

    expect(mockSetSharedPluginData).toBeCalledWith('tokens', 'fill', '"color.amber.800"');
  });

  it('should update plugin data with old tokens when remapping composition token', async () => {
    findNodesSpy.mockImplementationOnce(() => Promise.resolve([
      {
        id: '295:3',
        node: {
          id: '295:3',
          setSharedPluginData: mockSetSharedPluginData,
        } as unknown as BaseNode,
        tokens: {
          borderRadius: 'border-radius.7',
          borderWidth: 'border-width.4',
          fill: 'color.red.400',
          opacity: 'opacity.80',
          composition: 'composition.old',
        },
      },
    ]));

    await remapTokens({
      type: AsyncMessageTypes.REMAP_TOKENS,
      oldName: 'composition.old',
      newName: 'composition.new',
      updateMode: UpdateMode.SELECTION,
      category: Properties.composition,
      tokens,
    });

    expect(mockSetSharedPluginData).toBeCalledWith('tokens', 'composition', '"composition.new"');
  });

  it('should update plugin data with empty values when updateMode is not selection', async () => {
    findNodesSpy.mockImplementationOnce(() => Promise.resolve([
      {
        id: '295:3',
        node: {
          id: '295:3',
          setSharedPluginData: mockSetSharedPluginData,
        } as unknown as BaseNode,
        tokens: {
          borderRadius: 'border-radius.7',
          borderWidth: 'border-width.4',
          fill: 'color.red.400',
          opacity: 'opacity.80',
          composition: 'composition.old',
        },
      },
    ]));

    await remapTokens({
      type: AsyncMessageTypes.REMAP_TOKENS,
      oldName: 'composition.old',
      newName: 'composition.new',
      updateMode: UpdateMode.PAGE,
      category: Properties.composition,
      tokens,
    });

    expect(mockSetSharedPluginData).toBeCalledWith('tokens', 'composition', '"composition.new"');
  });
});
