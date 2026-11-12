import { applyBorderValuesOnNode } from '../applyBorderValuesOnNode';
import { tryApplyVariableId } from '../../utils/tryApplyVariableId';
import { defaultTokenValueRetriever } from '../TokenValueRetriever';
import { setBorderColorValuesOnTarget } from '../setBorderColorValuesOnTarget';

jest.mock('../../utils/tryApplyVariableId');
jest.mock('../setBorderColorValuesOnTarget');

const mockTryApplyVariableId = tryApplyVariableId as jest.MockedFunction<typeof tryApplyVariableId>;

const borderTokens: Record<string, any> = {
  'border.top': {
    name: 'border.top',
    resolvedValueWithReferences: { color: '{color.red}', width: '{border.width.sm}', style: 'solid' },
  },
  'border.left.raw': {
    name: 'border.left.raw',
    resolvedValueWithReferences: { color: '#f00', width: '3', style: 'solid' },
  },
};

const createRectangle = () => ({
  type: 'RECTANGLE',
  strokes: [],
  strokeWeight: 0,
  strokeTopWeight: 0,
  strokeRightWeight: 0,
  strokeBottomWeight: 0,
  strokeLeftWeight: 0,
  dashPattern: [],
}) as unknown as RectangleNode;

describe('applyBorderValuesOnNode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(defaultTokenValueRetriever, 'get').mockImplementation((name: string) => borderTokens[name]);
  });

  it('binds a single-side border width to the variable of the referenced width token', async () => {
    mockTryApplyVariableId.mockImplementation(async (_node, type, token) => type === 'strokeTopWeight' && token === 'border.width.sm');
    const node = createRectangle();

    await applyBorderValuesOnNode(
      node,
      { borderTop: 'border.top', borderColor: 'color.red' },
      { borderTop: { color: '#ff0000', width: '2', style: 'solid' }, borderColor: '#ff0000' },
      '16',
    );

    expect(mockTryApplyVariableId).toHaveBeenCalledWith(node, 'strokeTopWeight', 'border.width.sm');
    // The variable was bound, so the raw width is not written over it
    expect(node.strokeTopWeight).toBe(0);
    expect(node.strokeRightWeight).toBe(0);
    expect(setBorderColorValuesOnTarget).toHaveBeenCalledWith({ node, data: 'color.red', value: '#ff0000' });
  });

  it('sets the raw width when the side border width is not a reference', async () => {
    mockTryApplyVariableId.mockResolvedValue(false);
    const node = createRectangle();

    await applyBorderValuesOnNode(
      node,
      { borderLeft: 'border.left.raw' },
      { borderLeft: { color: '#ff0000', width: '3', style: 'solid' } },
      '16',
    );

    expect(mockTryApplyVariableId).toHaveBeenCalledWith(node, 'strokeLeftWeight', '3');
    expect(node.strokeLeftWeight).toBe(3);
  });

  it('sets the raw width when the referenced width token has no variable', async () => {
    mockTryApplyVariableId.mockResolvedValue(false);
    const node = createRectangle();

    await applyBorderValuesOnNode(
      node,
      { borderTop: 'border.top' },
      { borderTop: { color: '#ff0000', width: '2', style: 'solid' } },
      '16',
    );

    expect(mockTryApplyVariableId).toHaveBeenCalledWith(node, 'strokeTopWeight', 'border.width.sm');
    expect(node.strokeTopWeight).toBe(2);
  });
});
