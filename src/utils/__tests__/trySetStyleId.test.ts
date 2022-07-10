import { trySetStyleId } from '../trySetStyleId';
import { mockImportStyleByKeyAsync } from '../../../tests/__mocks__/figmaMock';

describe('trySetStyleId', () => {
  beforeEach(() => {
    mockImportStyleByKeyAsync.mockImplementation(() => Promise.reject());
  });

  it('should try to set a local fill style', async () => {
    const node = { fillStyleId: '' } as unknown as RectangleNode;
    expect(await trySetStyleId(node, 'fill', 'S:1234,')).toBe(true);
    expect(node.fillStyleId).toEqual('S:1234,');
  });

  it('should try to set a local stroke style', async () => {
    const node = { strokeStyleId: '' } as unknown as RectangleNode;
    expect(await trySetStyleId(node, 'stroke', 'S:1234,')).toBe(true);
    expect(node.strokeStyleId).toEqual('S:1234,');
  });

  it('should try to set a local text style', async () => {
    const node = { textStyleId: '' } as unknown as TextNode;
    expect(await trySetStyleId(node, 'text', 'S:1234,')).toBe(true);
    expect(node.textStyleId).toEqual('S:1234,');
  });

  it('should try to set a local effect style', async () => {
    const node = { effectStyleId: '' } as unknown as RectangleNode;
    expect(await trySetStyleId(node, 'effect', 'S:1234,')).toBe(true);
    expect(node.effectStyleId).toEqual('S:1234,');
  });

  it('should try to set a remote style', async () => {
    mockImportStyleByKeyAsync.mockImplementation(() => (
      Promise.resolve({
        id: 'S:1234,1:1',
      })
    ));

    const node = { fillStyleId: '' } as unknown as RectangleNode;
    expect(await trySetStyleId(node, 'fill', 'S:1234,')).toBe(true);
    expect(mockImportStyleByKeyAsync).toBeCalledWith('1234');
    expect(node.fillStyleId).toEqual('S:1234,1:1');
  });
});
