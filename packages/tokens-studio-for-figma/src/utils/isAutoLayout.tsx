export const isAutoLayout = (node: SceneNode) => 'layoutMode' in node && typeof node.layoutMode !== 'undefined';
