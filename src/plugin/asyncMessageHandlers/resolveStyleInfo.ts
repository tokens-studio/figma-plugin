import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export const resolveStyleInfo: AsyncMessageChannelHandlers[AsyncMessageTypes.RESOLVE_STYLE_INFO] = async (msg) => {
  const allLocalStyles = [
    ...figma.getLocalPaintStyles(),
    ...figma.getLocalEffectStyles(),
    ...figma.getLocalTextStyles(),
  ];

  const resolvedValues = await Promise.all(
    msg.styleIds.map(async (id) => {
      const styleKeyMatch = id.match(/^S:([a-zA-Z0-9_-]+),/);
      if (styleKeyMatch) {
        try {
          const remoteStyle = await figma.importStyleByKeyAsync(styleKeyMatch[1]);
          return {
            id,
            key: remoteStyle.key,
            name: remoteStyle.name,
          };
        } catch (err) {
          console.error(err);
        }
      }

      const styleMatch = allLocalStyles.find((style) => style.id === id);
      if (styleMatch) {
        return {
          id,
          key: styleMatch.key,
          name: styleMatch.name,
        };
      }

      return { id };
    }),
  );

  return {
    resolvedValues,
  };
};
