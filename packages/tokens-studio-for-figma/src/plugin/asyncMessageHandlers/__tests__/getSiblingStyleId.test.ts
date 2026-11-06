import { mockGetStyleById, mockImportStyleByKeyAsync } from '../../../../tests/__mocks__/figmaMock';
import { defaultTokenValueRetriever } from '../../TokenValueRetriever';
import { getNewStyleId } from '../getSiblingStyleId';

describe('getNewStyleId', () => {
  beforeEach(() => {
    defaultTokenValueRetriever.clearCache();
  });

  it('imports a sibling style only once for concurrent nodes', async () => {
    mockGetStyleById.mockImplementation((id) => ({ id }));
    mockImportStyleByKeyAsync.mockResolvedValue({ id: 'S:new,1:1' });
    const styleIds = { 'S:old,': 'color.primary' };
    const styleMap = { 'color.primary': { light: 'S:new,' } };

    expect(
      await Promise.all([
        getNewStyleId('S:old,1:1', styleIds, styleMap, ['light']),
        getNewStyleId('S:old,2:2', styleIds, styleMap, ['light']),
      ]),
    ).toEqual(['S:new,1:1', 'S:new,1:1']);
    expect(mockImportStyleByKeyAsync).toHaveBeenCalledTimes(1);
  });
});
