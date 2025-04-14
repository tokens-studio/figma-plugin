import { create } from '@tokens-studio/sdk';
import { expect } from '@jest/globals';
import { getAllTokenSets } from '../TokensStudioTokenStorage';

jest.mock('@tokens-studio/sdk', () => ({
  ...jest.requireActual('@tokens-studio/sdk'),
  create: jest.fn(),
}));

describe('TokensStudioTokenStorage', () => {
  describe('getAllTokenSets', () => {
    const mockClient = {
      query: jest.fn(),
    } as unknown as jest.Mocked<ReturnType<typeof create>>;

    beforeEach(() => {
      jest.clearAllMocks();
      (create as jest.Mock).mockReturnValue(mockClient);
    });

    it('returns empty array when no branch data is available', async () => {
      mockClient.query.mockResolvedValueOnce({
        data: {
          project: {
            branch: null,
          },
        },
      } as any);

      const result = await getAllTokenSets('project-id', 'org-id', mockClient);
      expect(result).toEqual([]);
    });

    it('fetches and combines token sets from multiple pages', async () => {
      const page1Data = {
        data: {
          project: {
            branch: {
              tokenSets: {
                totalPages: 3,
                data: [
                  {
                    name: 'set1', raw: '{"color": "#000"}', type: 'static', orderIndex: 0,
                  },
                  {
                    name: 'set2', raw: '{"color": "#fff"}', type: 'static', orderIndex: 1,
                  },
                ],
              },
            },
          },
        },
      };

      const page2Data = {
        data: {
          project: {
            branch: {
              tokenSets: {
                data: [
                  {
                    name: 'set3', raw: '{"color": "#333"}', type: 'static', orderIndex: 2,
                  },
                ],
              },
            },
          },
        },
      };

      const page3Data = {
        data: {
          project: {
            branch: {
              tokenSets: {
                data: [
                  {
                    name: 'set4', raw: '{"color": "#666"}', type: 'static', orderIndex: 3,
                  },
                ],
              },
            },
          },
        },
      };

      mockClient.query
        .mockResolvedValueOnce(page1Data as any)
        .mockResolvedValueOnce(page2Data as any)
        .mockResolvedValueOnce(page3Data as any);

      const result = await getAllTokenSets('project-id', 'org-id', mockClient);

      expect(result).toHaveLength(4);
      expect(result).toEqual([
        {
          name: 'set1', raw: '{"color": "#000"}', type: 'static', orderIndex: 0,
        },
        {
          name: 'set2', raw: '{"color": "#fff"}', type: 'static', orderIndex: 1,
        },
        {
          name: 'set3', raw: '{"color": "#333"}', type: 'static', orderIndex: 2,
        },
        {
          name: 'set4', raw: '{"color": "#666"}', type: 'static', orderIndex: 3,
        },
      ]);

      expect(mockClient.query).toHaveBeenCalledTimes(3);
      expect(mockClient.query).toHaveBeenNthCalledWith(1, {
        query: expect.any(Object),
        variables: {
          projectId: 'project-id',
          organization: 'org-id',
          branch: 'main',
          page: 1,
        },
      });
      expect(mockClient.query).toHaveBeenNthCalledWith(2, {
        query: expect.any(Object),
        variables: {
          projectId: 'project-id',
          organization: 'org-id',
          branch: 'main',
          page: 2,
        },
      });
      expect(mockClient.query).toHaveBeenNthCalledWith(3, {
        query: expect.any(Object),
        variables: {
          projectId: 'project-id',
          organization: 'org-id',
          branch: 'main',
          page: 3,
        },
      });
    });

    it('uses custom branch name when provided', async () => {
      mockClient.query.mockResolvedValueOnce({
        data: {
          project: {
            branch: {
              tokenSets: {
                totalPages: 1,
                data: [
                  {
                    name: 'set1', raw: '{"color": "#000"}', type: 'static', orderIndex: 0,
                  },
                ],
              },
            },
          },
        },
      } as any);

      await getAllTokenSets('project-id', 'org-id', mockClient, 'develop');

      expect(mockClient.query).toHaveBeenCalledWith({
        query: expect.any(Object),
        variables: {
          projectId: 'project-id',
          organization: 'org-id',
          branch: 'develop',
          page: 1,
        },
      });
    });

    it('handles single page of results correctly', async () => {
      mockClient.query.mockResolvedValueOnce({
        data: {
          project: {
            branch: {
              tokenSets: {
                totalPages: 1,
                data: [
                  {
                    name: 'set1', raw: '{"color": "#000"}', type: 'static', orderIndex: 0,
                  },
                ],
              },
            },
          },
        },
      } as any);

      const result = await getAllTokenSets('project-id', 'org-id', mockClient);

      expect(result).toHaveLength(1);
      expect(mockClient.query).toHaveBeenCalledTimes(1);
    });
  });
});

