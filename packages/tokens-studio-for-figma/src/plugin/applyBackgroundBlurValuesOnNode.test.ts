import { applyBackgroundBlurValuesOnNode } from './applyBackgroundBlurValuesOnNode';
import setBackgroundBlurOnTarget from './setBackgroundBlurOnTarget';

jest.mock('./setBackgroundBlurOnTarget');
const mockSetBackgroundBlurOnTarget = setBackgroundBlurOnTarget as jest.MockedFunction<typeof setBackgroundBlurOnTarget>;

describe('applyBackgroundBlurValuesOnNode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetBackgroundBlurOnTarget.mockResolvedValue(undefined);
  });

  const baseFontSize = '16px';

  it('calls setBackgroundBlurOnTarget with value and token name', async () => {
    const node = { type: 'RECTANGLE', effects: [] } as unknown as RectangleNode;
    const data = { backgroundBlur: 'blur.background' };
    const values = { backgroundBlur: '12' };

    await applyBackgroundBlurValuesOnNode(node, data, values, baseFontSize);

    expect(mockSetBackgroundBlurOnTarget).toHaveBeenCalledWith(
      node,
      { value: '12' },
      baseFontSize,
      'blur.background',
    );
  });

  it('does nothing when values.backgroundBlur is undefined', async () => {
    const node = { type: 'RECTANGLE', effects: [] } as unknown as RectangleNode;
    const data = { backgroundBlur: 'blur.background' };
    const values = {};

    await applyBackgroundBlurValuesOnNode(node, data, values, baseFontSize);

    expect(mockSetBackgroundBlurOnTarget).not.toHaveBeenCalled();
  });

  it('does nothing when node has no effects property', async () => {
    const node = { type: 'TEXT' } as unknown as BaseNode;
    const data = { backgroundBlur: 'blur.background' };
    const values = { backgroundBlur: '12' };

    await applyBackgroundBlurValuesOnNode(node, data, values, baseFontSize);

    expect(mockSetBackgroundBlurOnTarget).not.toHaveBeenCalled();
  });

  it('does nothing when backgroundBlur value is not primitive (object)', async () => {
    const node = { type: 'RECTANGLE', effects: [] } as unknown as RectangleNode;
    const data = { backgroundBlur: 'blur.background' };
    const values = { backgroundBlur: { nested: 'value' } as any };

    await applyBackgroundBlurValuesOnNode(node, data, values, baseFontSize);

    expect(mockSetBackgroundBlurOnTarget).not.toHaveBeenCalled();
  });

  it('passes token name from data to setBackgroundBlurOnTarget', async () => {
    const node = { type: 'FRAME', effects: [] } as unknown as FrameNode;
    const data = { backgroundBlur: 'dimension.blur.lg' };
    const values = { backgroundBlur: '24' };

    await applyBackgroundBlurValuesOnNode(node, data, values, baseFontSize);

    expect(mockSetBackgroundBlurOnTarget).toHaveBeenCalledWith(
      node,
      { value: '24' },
      baseFontSize,
      'dimension.blur.lg',
    );
  });
});
