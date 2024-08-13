import { mockGetNodeById, mockScrollAndZoomIntoView } from '../../../tests/__mocks__/figmaMock';
import { goToNode } from '../node';

describe('goToNode', () => {
  it('should work', () => {
    mockGetNodeById.mockImplementation(() => ({
      type: 'RECTANGLE',
    }));

    goToNode('id');

    expect(figma.currentPage.selection).toEqual([{
      type: 'RECTANGLE',
    }]);
    expect(mockScrollAndZoomIntoView).toBeCalledTimes(1);

    figma.currentPage.selection = [];
  });
});
