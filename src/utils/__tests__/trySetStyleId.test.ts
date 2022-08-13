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

  it('should try to set a remote fill style', async () => {
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

  it('should try to set a remote stroke style', async () => {
    mockImportStyleByKeyAsync.mockImplementation(() => (
      Promise.resolve({
        id: 'S:1234,1:1',
      })
    ));

    const node = { strokeStyleId: '' } as unknown as RectangleNode;
    expect(await trySetStyleId(node, 'stroke', 'S:1234,')).toBe(true);
    expect(mockImportStyleByKeyAsync).toBeCalledWith('1234');
    expect(node.strokeStyleId).toEqual('S:1234,1:1');
  });

  it('should try to set a remote text style', async () => {
    mockImportStyleByKeyAsync.mockImplementation(() => (
      Promise.resolve({
        id: 'S:1234,1:1',
      })
    ));

    const node = { textStyleId: '' } as unknown as TextNode;
    expect(await trySetStyleId(node, 'text', 'S:1234,')).toBe(true);
    expect(mockImportStyleByKeyAsync).toBeCalledWith('1234');
    expect(node.textStyleId).toEqual('S:1234,1:1');
  });

  it('should try to set a remote effect style', async () => {
    mockImportStyleByKeyAsync.mockImplementation(() => (
      Promise.resolve({
        id: 'S:1234,1:1',
      })
    ));

    const node = { effectStyleId: '' } as unknown as RectangleNode;
    expect(await trySetStyleId(node, 'effect', 'S:1234,')).toBe(true);
    expect(mockImportStyleByKeyAsync).toBeCalledWith('1234');
    expect(node.effectStyleId).toEqual('S:1234,1:1');
  });

  it('should try to set the local style if the style match is invalid', async () => {
    const node = { effectStyleId: '' } as unknown as RectangleNode;
    expect(await trySetStyleId(node, 'effect', 'S:1234')).toBe(true);
    expect(mockImportStyleByKeyAsync).toBeCalledTimes(0);
    expect(node.effectStyleId).toEqual('S:1234');
  });

  it('should not do anything for invalid parameters', async () => {
    const node = { } as unknown as TextNode;
    expect(await trySetStyleId(node, 'effect', 'S:1234,')).toBe(false);
  });

  it('should try to set a remote fill style but receive a local one', async () => {
    mockImportStyleByKeyAsync.mockImplementation(() => (
      Promise.resolve({
        id: 'S:1234,1:1',
      })
    ));

    const node = new Proxy(
      { fillStyleId: '' } as unknown as RectangleNode,
      {
        set(target, property, value) {
          return Reflect.set(target, property, value.replace(/\d:\d$/, ''));
        },
      },
    );
    expect(await trySetStyleId(node, 'fill', 'S:1234,')).toBe(true);
    expect(mockImportStyleByKeyAsync).toBeCalledWith('1234');
    expect(node.fillStyleId).toEqual('S:1234,');
  });

  it('should try to set a remote stroke style but receive a local one', async () => {
    mockImportStyleByKeyAsync.mockImplementation(() => (
      Promise.resolve({
        id: 'S:1234,1:1',
      })
    ));

    const node = new Proxy(
      { strokeStyleId: '' } as unknown as RectangleNode,
      {
        set(target, property, value) {
          return Reflect.set(target, property, value.replace(/\d:\d$/, ''));
        },
      },
    );
    expect(await trySetStyleId(node, 'stroke', 'S:1234,')).toBe(true);
    expect(mockImportStyleByKeyAsync).toBeCalledWith('1234');
    expect(node.strokeStyleId).toEqual('S:1234,');
  });

  it('should try to set a remote effect style but receive a local one', async () => {
    mockImportStyleByKeyAsync.mockImplementation(() => (
      Promise.resolve({
        id: 'S:1234,1:1',
      })
    ));

    const node = new Proxy(
      { effectStyleId: '' } as unknown as RectangleNode,
      {
        set(target, property, value) {
          return Reflect.set(target, property, value.replace(/\d:\d$/, ''));
        },
      },
    );
    expect(await trySetStyleId(node, 'effect', 'S:1234,')).toBe(true);
    expect(mockImportStyleByKeyAsync).toBeCalledWith('1234');
    expect(node.effectStyleId).toEqual('S:1234,');
  });

  it('should try to set a remote text style but receive a local one', async () => {
    mockImportStyleByKeyAsync.mockImplementation(() => (
      Promise.resolve({
        id: 'S:1234,1:1',
      })
    ));

    const node = new Proxy(
      { textStyleId: '' } as unknown as TextNode,
      {
        set(target, property, value) {
          return Reflect.set(target, property, value.replace(/\d:\d$/, ''));
        },
      },
    );
    expect(await trySetStyleId(node, 'text', 'S:1234,')).toBe(true);
    expect(mockImportStyleByKeyAsync).toBeCalledWith('1234');
    expect(node.textStyleId).toEqual('S:1234,');
  });
});
