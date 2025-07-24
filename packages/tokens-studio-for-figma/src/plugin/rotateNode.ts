export const getCenterOfNode = (node: SceneNode) => {
  if (!node.absoluteBoundingBox) {
    return undefined;
  }
  const {
    x, y, width, height,
  } = node.absoluteBoundingBox;

  // Get x,y of parent
  let px = 0;
  let py = 0;

  if (node.parent && 'absoluteBoundingBox' in node.parent && node.parent.absoluteBoundingBox !== null) {
    px = node.parent.absoluteBoundingBox.x;
    py = node.parent.absoluteBoundingBox.y;
  }
  // Get diff of parent and child
  const dx = x - px;
  const dy = y - py;

  const cx = dx + width / 2;
  const cy = dy + height / 2;

  return { x: cx, y: cy };
};

export const resetNodeRotation = (node: SceneNode) => {
  const center = getCenterOfNode(node);
  if (center && 'rotation' in node && node.absoluteBoundingBox) {
    node.rotation = 0;
    const { width, height } = node.absoluteBoundingBox;
    node.x = center.x - width / 2;
    node.y = center.y - height / 2;
  }
};

export const rotateNode = (node: SceneNode, angle: number) => {
  if (typeof angle === 'string') {
    angle = parseInt(angle, 10);
  }
  if ('rotation' in node && node.absoluteBoundingBox) {
    const theta = angle * (Math.PI / 180);
    resetNodeRotation(node);
    const center = getCenterOfNode(node);

    node.rotation = angle;

    if (center) {
      const newx = Math.cos(theta) * node.x + node.y * Math.sin(theta) - center.y * Math.sin(theta) - center.x * Math.cos(theta) + center.x;

      const newy = -Math.sin(theta) * node.x + center.x * Math.sin(theta) + node.y * Math.cos(theta) - center.y * Math.cos(theta) + center.y;

      node.x = newx;
      node.y = newy;
    }
  }
};
