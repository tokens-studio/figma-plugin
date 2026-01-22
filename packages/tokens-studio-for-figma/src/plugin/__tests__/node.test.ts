import { mockGetNodeByIdAsync, mockScrollAndZoomIntoView } from '../../../tests/__mocks__/figmaMock';
import { goToNode } from '../node';

describe('goToNode', () => {
  it('should work', async () => {
    mockGetNodeByIdAsync.mockImplementation(() => Promise.resolve({
      type: 'RECTANGLE',
    }));

    await goToNode('id');

    expect(figma.currentPage.selection).toEqual([{
      type: 'RECTANGLE',
    }]);
    expect(mockScrollAndZoomIntoView).toBeCalledTimes(1);

    figma.currentPage.selection = [];
  });
});
