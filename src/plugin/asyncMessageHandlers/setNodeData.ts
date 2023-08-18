import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { tokenArrayGroupToMap } from '@/utils/tokenArrayGroupToMap';
import { defaultNodeManager } from '../NodeManager';
import { sendPluginValues } from '../pluginData';
import { updatePluginDataAndNodes } from '../updatePluginDataAndNodes';

export const setNodeData: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_NODE_DATA] = async (msg) => {
  try {
    if (figma.currentPage.selection.length) {
      const tokensMap = tokenArrayGroupToMap(msg.tokens);
      const nodes = await defaultNodeManager.update(figma.currentPage.selection);
      await updatePluginDataAndNodes({
        entries: nodes, values: msg.values, tokensMap, settings: msg.settings,
      });
      await sendPluginValues({
        nodes: figma.currentPage.selection,
        shouldSendSelectionValues: false,
      });
    }
  } catch (e) {
    console.error(e);
  }
};

// function buildPropertiesMapForToken(tokens: Map<string, AnyTokenList>) {
//  // we have a map of tokens. we need to build this so all that's left for us later is to check all the tokens stored on a node, and .get that one for the property it's stored on.
//  // for example, fill: colors.red would fetch the final value of the token colors.red and add this to the object under the fill key.
//  // when we have composition: styles.card, we would fetch the token called styles.card (the real value), and apply { fill: bg.default, border: border.muted, radius: radii.small }
//  // then when we are applying the individual values we would just need to lookup the value for the key on the object. this should be far more performant

//  const tokenPropertyMap: Record<string, Record<string, string>> = {};
//   tokens.forEach((token) => {
//     Object.entries(token.rawValue).forEach(([property, value]) => {
//       if (token.type === TokenTypes.COMPOSITION) {
//         Object.entries(token.rawValue).forEach(([property, value]) => {
//           // Assign the actual value of a composition token property to the applied values
//           tokenPropertyMap[property as CompositionTokenProperty] = value;
//           // If we're dealing with border tokens we want to extract the color part to be applied (we can only apply color on the whole border, not individual sides)
//           if (typeof value === 'object' && ['border', 'borderTop', 'borderRight', 'borderBottom', 'borderLeft'].includes(property) && 'color' in value && typeof value.color === 'string') {
//             acc.borderColor = value.color;
//           }
//         });
//       }
//       if (!tokenPropertyMap[property]) {
//         tokenPropertyMap[property] = {};
//       }
//       tokenPropertyMap[property][token.id] = value;
//     });
//   }
// }
