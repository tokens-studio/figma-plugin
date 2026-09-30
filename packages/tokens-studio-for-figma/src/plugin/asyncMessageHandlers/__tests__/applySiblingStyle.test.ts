import { applySiblingStyleId } from '../applySiblingStyle';
import { getNewStyleId } from '../getSiblingStyleId';

jest.mock('../getSiblingStyleId', () => ({
  getNewStyleId: jest.fn(),
}));

const mockedGetNewStyleId = getNewStyleId as jest.MockedFunction<typeof getNewStyleId>;

describe('applySiblingStyleId', () => {
  const styleIds = { 'S:abc,': 'color.primary' };
  const styleMap = { 'color.primary': { light: 'S:def,' } };
  const activeThemes = ['light'];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should swap fill, stroke and effect styles on a FRAME node', async () => {
    mockedGetNewStyleId
      .mockResolvedValueOnce('newFill')
      .mockResolvedValueOnce('newStroke')
      .mockResolvedValueOnce('newEffect');

    const node = {
      type: 'FRAME',
      fillStyleId: 'S:abc,',
      strokeStyleId: 'S:abc,',
      effectStyleId: 'S:abc,',
      children: [],
    } as unknown as BaseNode;

    await applySiblingStyleId(node, styleIds, styleMap, activeThemes);

    expect(mockedGetNewStyleId).toHaveBeenCalledTimes(3);
    expect((node as any).fillStyleId).toBe('newFill');
    expect((node as any).strokeStyleId).toBe('newStroke');
    expect((node as any).effectStyleId).toBe('newEffect');
  });

  it('should swap styles on a SLOT node and recurse into children', async () => {
    mockedGetNewStyleId
      .mockResolvedValueOnce('newFillSlot')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      // child calls
      .mockResolvedValueOnce('childFill')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const child = {
      type: 'RECTANGLE',
      fillStyleId: 'S:abc,',
      strokeStyleId: '',
      effectStyleId: '',
    } as unknown as BaseNode;

    const slotNode = {
      type: 'SLOT',
      fillStyleId: 'S:abc,',
      strokeStyleId: '',
      effectStyleId: '',
      children: [child],
    } as unknown as BaseNode;

    await applySiblingStyleId(slotNode, styleIds, styleMap, activeThemes);

    expect((slotNode as any).fillStyleId).toBe('newFillSlot');
    // Child was also processed
    expect((child as any).fillStyleId).toBe('childFill');
  });

  it('should recurse into SLOT children just like FRAME children', async () => {
    mockedGetNewStyleId.mockResolvedValue(null);

    const grandchild = {
      type: 'RECTANGLE',
      fillStyleId: '',
      strokeStyleId: '',
      effectStyleId: '',
    } as unknown as BaseNode;

    const child = {
      type: 'FRAME',
      fillStyleId: '',
      strokeStyleId: '',
      effectStyleId: '',
      children: [grandchild],
    } as unknown as BaseNode;

    const slotNode = {
      type: 'SLOT',
      fillStyleId: '',
      strokeStyleId: '',
      effectStyleId: '',
      children: [child],
    } as unknown as BaseNode;

    await applySiblingStyleId(slotNode, styleIds, styleMap, activeThemes);

    // 3 calls for slot + 3 for child frame + 3 for grandchild rectangle = 9
    expect(mockedGetNewStyleId).toHaveBeenCalledTimes(9);
  });

  it('should handle GROUP nodes by recursing into children', async () => {
    mockedGetNewStyleId.mockResolvedValue(null);

    const child = {
      type: 'RECTANGLE',
      fillStyleId: '',
      strokeStyleId: '',
      effectStyleId: '',
    } as unknown as BaseNode;

    const group = {
      type: 'GROUP',
      children: [child],
    } as unknown as BaseNode;

    await applySiblingStyleId(group, styleIds, styleMap, activeThemes);

    // 3 calls for the RECTANGLE child
    expect(mockedGetNewStyleId).toHaveBeenCalledTimes(3);
  });

  it('should not throw on unknown node types', async () => {
    const node = { type: 'UNKNOWN_TYPE' } as unknown as BaseNode;
    await expect(applySiblingStyleId(node, styleIds, styleMap, activeThemes)).resolves.not.toThrow();
  });

  it('waits for mixed-text style segments to finish swapping', async () => {
    let finishSegment: (style: string) => void = () => {};
    const swappedStyle = new Promise<string>((resolve) => { finishSegment = resolve; });
    let signalStarted: () => void = () => {};
    const started = new Promise<void>((resolve) => { signalStarted = resolve; });
    mockedGetNewStyleId.mockImplementation(async (styleId) => {
      if (styleId === 'S:abc,') {
        signalStarted();
        return swappedStyle;
      }
      return null;
    });
    const node = {
      type: 'TEXT',
      textStyleId: figma.mixed,
      fillStyleId: '',
      strokeStyleId: '',
      effectStyleId: '',
      getStyledTextSegments: jest.fn(() => [{ start: 0, end: 4, textStyleId: 'S:abc,' }]),
      setRangeTextStyleId: jest.fn(),
    } as unknown as TextNode;

    const applying = applySiblingStyleId(node, styleIds, styleMap, activeThemes);
    await started;
    let completed = false;
    applying.then(() => { completed = true; });
    await Promise.resolve();
    expect(completed).toBe(false);

    finishSegment('S:def,');
    await applying;
    expect(node.setRangeTextStyleId).toHaveBeenCalledWith(0, 4, 'S:def,');
  });
});
