import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { ValuesProperty, IsCompressedProperty } from '@/figmaStorage';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';

export const createLivingDocumentation: AsyncMessageChannelHandlers[AsyncMessageTypes.CREATE_LIVING_DOCUMENTATION] = async (msg) => {
  const isCompressed = await IsCompressedProperty.read(figma.root) ?? false;
  const values = await ValuesProperty.read(figma.root, isCompressed);
  if (!values) return;
  const { tokenSet, startsWith } = msg;
  const tokens = values[tokenSet]?.filter((t) => t.name.startsWith(startsWith));
  if (!tokens) return;
  const [template] = figma.currentPage.selection;
  if (!template || !('clone' in template)) {
    figma.notify('Select a template node first');
    return;
  }

  const container = figma.createFrame();
  container.layoutMode = 'VERTICAL';
  container.itemSpacing = 16;
  container.primaryAxisSizingMode = 'AUTO';
  container.counterAxisSizingMode = 'AUTO';
  container.paddingLeft = 32;
  container.paddingRight = 32;
  container.paddingTop = 32;
  container.paddingBottom = 32;

  for (const token of tokens) {
    const clone = template.clone();
    if ('name' in clone && 'appendChild' in clone) {
      console.log('cloning', token.name);

      const allNodes = clone.findAll((_n) => true);

      const placeholders = allNodes.filter((n) => n.name.startsWith('__'));
      // Now apply changes to all placeholders
      placeholders.forEach((node) => {
        const prop = node.name.replace(/^__/, '');
        console.log('applying', prop, token.name, 'to node:', node.name);

        node.setSharedPluginData(SharedPluginDataNamespaces.TOKENS, prop, JSON.stringify(token.name));
      });
      container.appendChild(clone as SceneNode);
    }
  }

  figma.currentPage.appendChild(container);
};
