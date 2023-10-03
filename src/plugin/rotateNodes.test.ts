import { getCenterOfNode, resetNodeRotation, rotateNode } from './rotateNode';

describe('rotateNode', () => {
  let parent: FrameNode;
  let node: RectangleNode;
  let nodeToReset: RectangleNode;
  let nodeWithoutBounds: SceneNode;

  beforeEach(() => {
    nodeWithoutBounds = {
      id: '0',
    } as SceneNode;

    parent = {
      id: '1',
      name: 'Frame',
      type: 'FRAME',
      absoluteBoundingBox: {
        x: 100,
        y: 100,
        width: 500,
        height: 500,
      },
      rotation: 0,
      x: 100,
      y: 100,
    } as FrameNode;

    node = {
      id: '2',
      name: 'test',
      type: 'RECTANGLE',
      absoluteBoundingBox: {
        x: 200,
        y: 200,
        width: 100,
        height: 100,
      },
      parent,
      rotation: 0,
      x: 100,
      y: 100,
    } as RectangleNode;

    nodeToReset = {
      id: '2',
      name: 'test',
      type: 'RECTANGLE',
      absoluteBoundingBox: {
        x: 179.28932189941406,
        y: 179.28932189941406,
        width: 141.4213409423828,
        height: 141.4213409423828,
      },
      parent,
      rotation: 45,
      x: 79.28932189941406,
      y: 150,
    } as RectangleNode;
  });

  it('should get center of node', () => {
    const center = getCenterOfNode(node);
    expect(center).toEqual({ x: 150, y: 150 });
  });

  it('should reset node rotation', () => {
    resetNodeRotation(nodeToReset);
    expect(nodeToReset.rotation).toBe(0);
    // We can't test x and y because theres no mocks to reset the x/y of the node
    // They should go back to 100,100
  });

  it('should rotate node', () => {
    rotateNode(node, 45);
    expect(node.rotation).toBe(45);
  });

  it('should return undefined if node has no absoluteBoundingBox', () => {
    expect(getCenterOfNode(nodeWithoutBounds)).toBeUndefined();
  });

  it('should parse string angle', () => {
    // @ts-ignore next-line
    rotateNode(node, '45');
    expect(node.rotation).toBe(45);
  });
});
