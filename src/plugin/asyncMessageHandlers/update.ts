import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { updateLocalTokensData } from '@/utils/figma';
import { findAll } from '@/utils/findAll';
import { tokenArrayGroupToMap } from '@/utils/tokenArrayGroupToMap';
import { updateNodes } from '../node';
import { defaultNodeManager } from '../NodeManager';
import { updatePluginData } from '../pluginData';
import updateStyles from '../updateStyles';

const memo: Record<string, string> = {};

async function getNewStyleId(styleId: string, styleIds: Record<string, string>, styleMap: Record<string, Record<string, string>>, newTheme: string) {
  if (!styleId) {
    console.log('exiting early');

    return null;
  }

  const normalizedStyleId = styleId.split(',')[0].concat(',');

  const tokenName = styleIds[normalizedStyleId];

  if (!tokenName) {
    console.warn(`${normalizedStyleId} not found`, {
      styleId, styleIds, styleMap, newTheme,
    });
    return null;
  }

  const newStyleToFetch = styleMap[tokenName][newTheme];

  if (!newStyleToFetch) {
    console.warn(`${tokenName} for theme ${newTheme} not found`);
    return null;
  }

  let actualStyleId = newStyleToFetch;

  if (memo.hasOwnProperty(newStyleToFetch)) {
    actualStyleId = memo[newStyleToFetch];
  } else {
    const styleKeyMatch = newStyleToFetch.match(/^S:([a-zA-Z0-9_-]+),/);
    if (styleKeyMatch) {
      actualStyleId = await new Promise<string>((resolve) => {
        figma.importStyleByKeyAsync(styleKeyMatch[1])
          .then((style) => resolve(style.id))
          .catch(() => resolve(newStyleToFetch));
      });
      memo[newStyleToFetch] = actualStyleId;
    }
  }

  const figmaStyle = figma.getStyleById(actualStyleId);
  console.log('Fetching style', newStyleToFetch, actualStyleId, figmaStyle);

  if (!figmaStyle) {
    console.warn(`figma style for ${tokenName} not found, ${newStyleToFetch}`);
    return null;
  }

  return figmaStyle.id;
}

async function applyTheme(node: BaseNode, styleIds: Record<string, string>, styleMap: Record<string, Record<string, string>>, newTheme: string) {
  try {
    switch (node.type) {
      case 'TEXT':
        {
          const newStrokeStyleId = await getNewStyleId(node.strokeStyleId as string, styleIds, styleMap, newTheme);
          const newEffectStyleId = await getNewStyleId(node.effectStyleId as string, styleIds, styleMap, newTheme);

          if (newStrokeStyleId) {
            node.strokeStyleId = newStrokeStyleId;
          }
          if (newEffectStyleId) {
            node.effectStyleId = newEffectStyleId;
          }

          if (node.fillStyleId !== figma.mixed) {
            const newFillStyleId = await getNewStyleId(node.fillStyleId as string, styleIds, styleMap, newTheme);
            if (newFillStyleId) {
              node.fillStyleId = newFillStyleId;
            }
          } else {
            node.getStyledTextSegments(['fillStyleId']).forEach(async (segment) => {
              const newFillStyleId = await getNewStyleId(segment.fillStyleId, styleIds, styleMap, newTheme);

              if (newFillStyleId) {
                node.setRangeFillStyleId(segment.start, segment.end, newFillStyleId);
              }
            });
          }
        }
        break;

      case 'ELLIPSE':
      case 'LINE':
      case 'POLYGON':
      case 'STAR':
      case 'RECTANGLE':
      case 'VECTOR':
        {
          const newFillStyleId = await getNewStyleId(node.fillStyleId as string, styleIds, styleMap, newTheme);
          const newStrokeStyleId = await getNewStyleId(node.strokeStyleId as string, styleIds, styleMap, newTheme);
          const newEffectStyleId = await getNewStyleId(node.effectStyleId as string, styleIds, styleMap, newTheme);
          if (newFillStyleId) {
            node.fillStyleId = newFillStyleId;
          }
          if (newStrokeStyleId) {
            node.strokeStyleId = newStrokeStyleId;
          }
          if (newEffectStyleId) {
            node.effectStyleId = newEffectStyleId;
          }
        }
        break;

      case 'COMPONENT':
      case 'INSTANCE':
      case 'FRAME':
        {
          const newFillStyleId = await getNewStyleId(node.fillStyleId as string, styleIds, styleMap, newTheme);
          const newStrokeStyleId = await getNewStyleId(node.strokeStyleId as string, styleIds, styleMap, newTheme);
          const newEffectStyleId = await getNewStyleId(node.effectStyleId as string, styleIds, styleMap, newTheme);

          if (newFillStyleId) {
            node.fillStyleId = newFillStyleId;
          }

          if (newStrokeStyleId) {
            node.strokeStyleId = newStrokeStyleId;
          }

          if (newEffectStyleId) {
            node.effectStyleId = newEffectStyleId;
          }

          await Promise.all(node.children.map((child) => applyTheme(child, styleIds, styleMap, newTheme)));
        }
        break;

      case 'BOOLEAN_OPERATION':
      case 'GROUP':
        await Promise.all(node.children.map((child) => applyTheme(child, styleIds, styleMap, newTheme)));
        break;

      default:
        break;
    }
  } catch (error) {
    console.error(error);
  }
}

function swapStyles(styleIds: Record<string, string>, styleMap: Record<string, Record<string, string>>, newTheme: string) {
  const layers = findAll([figma.currentPage], false);
  console.log('Swapping styles');

  layers.forEach((layer) => {
    applyTheme(layer, styleIds, styleMap, newTheme);
  });
}

export const update: AsyncMessageChannelHandlers[AsyncMessageTypes.UPDATE] = async (msg) => {
  let receivedStyleIds: Record<string, string> = {};
  if (msg.tokenValues && msg.updatedAt) {
    await updateLocalTokensData({
      tokens: msg.tokenValues,
      themes: msg.themes,
      activeTheme: msg.activeTheme,
      usedTokenSets: msg.usedTokenSet,
      updatedAt: msg.updatedAt,
      checkForChanges: msg.checkForChanges ?? false,
    });
  }
  if (msg.settings.updateStyles && msg.tokens) {
    receivedStyleIds = await updateStyles(msg.tokens, false, msg.settings);
  }
  console.log('Updating', msg.themes, msg.tokenValues, msg.activeTheme);
  if (msg.tokens) {
    const tokensMap = tokenArrayGroupToMap(msg.tokens);
    const allWithData = await defaultNodeManager.findNodesWithData({
      updateMode: msg.settings.updateMode,
    });

    const mappedStyleReferences = msg.themes.reduce((acc, theme) => {
      if (theme.$figmaStyleReferences) {
        Object.entries(theme.$figmaStyleReferences).forEach(([styleName, styleId]) => {
          acc[styleName] = { ...acc[styleName], [theme.name]: styleId };
        });
      }
      return acc;
    }, {} as Record<string, Record<string, string>>);
    const allStyleIds = Object.entries(mappedStyleReferences).reduce((acc, [tokenName, mapping]) => {
      Object.values(mapping).forEach((styleId) => {
        acc[styleId] = tokenName;
      });
      return acc;
    }, {} as Record<string, string>);

    await updateNodes(allWithData, tokensMap, msg.settings);
    await updatePluginData({ entries: allWithData, values: {} });
    const activeTheme = msg.themes.find((theme) => theme.id === msg.activeTheme)?.name;
    if (activeTheme && msg.themes && allStyleIds && mappedStyleReferences) {
      await swapStyles(allStyleIds, mappedStyleReferences, activeTheme);
    }
  }

  return {
    styleIds: receivedStyleIds,
  };
};
