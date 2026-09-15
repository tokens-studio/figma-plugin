import { unbindVariableFromTarget } from './unbindVariableFromTarget';
import { mockSetBoundVariableForPaint } from '../../tests/__mocks__/figmaMock';

describe('unbindVariableFromTarget', () => {
  beforeEach(() => {
    mockSetBoundVariableForPaint.mockClear();
  });

  it('does not touch the target when there is nothing bound to unbind', async () => {
    const paints = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, opacity: 1 }] as unknown as Paint[];
    const target = { paints } as unknown as PaintStyle;

    await unbindVariableFromTarget(target, 'paints');

    // Same array reference — proves no redundant write happened when nothing needed unbinding.
    expect(target.paints).toBe(paints);
    expect(mockSetBoundVariableForPaint).not.toHaveBeenCalled();
  });

  it('unbinds an existing bound color variable', async () => {
    const boundPaint = {
      type: 'SOLID',
      color: { r: 1, g: 0, b: 0 },
      opacity: 1,
      boundVariables: { color: { type: 'VARIABLE_ALIAS', id: 'VariableID:1' } },
    } as unknown as Paint;
    const originalPaints = [boundPaint];
    const target = { paints: originalPaints } as unknown as PaintStyle;
    mockSetBoundVariableForPaint.mockReturnValue({ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, opacity: 1 });

    await unbindVariableFromTarget(target, 'paints');

    expect(target.paints).not.toBe(originalPaints);
    expect(mockSetBoundVariableForPaint).toHaveBeenCalledWith(boundPaint, 'color', null);
  });

  it('returns the existing value when the target has no matching key', async () => {
    const target = {} as unknown as PaintStyle;

    const result = await unbindVariableFromTarget(target, 'paints');

    expect(result).toBeUndefined();
    expect(mockSetBoundVariableForPaint).not.toHaveBeenCalled();
  });

  it('does not touch a node with mixed fills', async () => {
    const target = { fills: figma.mixed } as unknown as BaseNode;

    const result = await unbindVariableFromTarget(target, 'fills');

    expect(result).toBe(figma.mixed);
    expect(mockSetBoundVariableForPaint).not.toHaveBeenCalled();
  });
});
