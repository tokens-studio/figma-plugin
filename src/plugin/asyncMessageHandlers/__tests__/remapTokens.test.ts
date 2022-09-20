import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { defaultNodeManager } from '../../NodeManager';
import { updatePluginData } from '@/plugin/pluginData';
import { remapTokens } from '../remapTokens';
import { Properties } from '@/constants/Properties';
import { UpdateMode } from '@/constants/UpdateMode';
jest.mock('@/plugin/pluginData', (() => ({
  updatePluginData: jest.fn(),
})));

describe('bulkRemap', () => {
  const findNodesSpy = jest.spyOn(defaultNodeManager, 'findNodesWithData');
  it('should be to replace all matching token names with new token name', async () => {
    // const tokens = [
    //   {
    //     internal__Parent: "global",
    //     name: "color.amber.800",
    //     rawValue: "#92400e",
    //     type: TokenTypes.COLOR,
    //     value: "#92400e",
    //   },
    //   {
    //     internal__Parent: "global",
    //     name: "color.red.400",
    //     rawValue: "#f87171",
    //     type: TokenTypes.COLOR,
    //     value: "#f87171",
    //   },
    //   {
    //     internal__Parent: "global",
    //     name: "border-radius.7",
    //     rawValue: "34px",
    //     type: TokenTypes.BORDER_RADIUS,
    //     value: "34px",
    //   },
    //   {
    //     internal__Parent: "global",
    //     name: "border-width.4",
    //     rawValue: "10px",
    //     type: TokenTypes.BORDER_WIDTH,
    //     value: "10px",
    //   },
    //   {
    //     internal__Parent: "global",
    //     name: "opacity.80",
    //     rawValue: "80%",
    //     type: TokenTypes.OPACITY,
    //     value: "80%",
    //   },
    // ];

    findNodesSpy.mockImplementationOnce(() => Promise.resolve([
      {
        hash: '9c7e97584a40179e12c9e2c75d34f80e66fe6f64',
        id: '295:3',
        node: {
          id: '295:3',
        } as RectangleNode,
        tokens: {
          borderRadius: "border-radius.7",
          borderWidth: "border-width.4",
          fill: "color.red.400",
          opacity: "opacity.80",
        }
      },
    ]));

    await remapTokens({
      type: AsyncMessageTypes.REMAP_TOKENS,
      oldName: "color.red.400",
      newName: "color.amber.800",
      updateMode: UpdateMode.SELECTION,
      category: Properties.fill,
      tokens: []
    });

    expect(updatePluginData).toBeCalledWith({
      entries: [{
        hash: '9c7e97584a40179e12c9e2c75d34f80e66fe6f64',
        id: '295:3',
        node: {
          id: '295:3',
        } as RectangleNode,
        tokens: {
          borderRadius: "border-radius.7",
          borderWidth: "border-width.4",
          fill: "color.amber.800",
          opacity: "opacity.80",
        }
      }],
      values: {
        fill: 'color.amber.800',
      },
      shouldOverride: true,
    })
  });
});
