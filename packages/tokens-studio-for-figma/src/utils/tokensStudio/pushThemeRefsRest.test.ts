import { patchThemeGroupVariableRefs, patchThemeOptionStyleRefs } from './pushThemeRefsRest';

describe('pushThemeRefsRest', () => {
  const mockFetch = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = mockFetch;
    mockFetch.mockReset();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  const authToken = 'test-token';
  const apiBaseUrl = 'https://studio.example.com';
  const projectId = 'proj-123';
  const changeSetId = 'cs-456';

  describe('patchThemeGroupVariableRefs', () => {
    it('should skip PATCH when refs is undefined (preserve semantics)', async () => {
      await patchThemeGroupVariableRefs(authToken, apiBaseUrl, projectId, changeSetId, 'group-1', undefined);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should PATCH with empty object to clear refs', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      await patchThemeGroupVariableRefs(authToken, apiBaseUrl, projectId, changeSetId, 'group-1', {});

      expect(mockFetch).toHaveBeenCalledWith(
        `${apiBaseUrl}/api/v1/projects/${projectId}/theme_groups/group-1?change_set_id=${encodeURIComponent(changeSetId)}`,
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ theme_group: { figma_variable_references: {} } }),
        }),
      );
    });

    it('should PATCH with refs map', async () => {
      mockFetch.mockResolvedValue({ ok: true });
      const refs = { 'color.brand.500': 'VariableID:123:456' };

      await patchThemeGroupVariableRefs(authToken, apiBaseUrl, projectId, changeSetId, 'group-1', refs);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.theme_group.figma_variable_references).toEqual(refs);
    });

    it('should throw on non-OK response', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 422, text: () => Promise.resolve('Unprocessable') });

      await expect(
        patchThemeGroupVariableRefs(authToken, apiBaseUrl, projectId, changeSetId, 'group-1', {}),
      ).rejects.toThrow('Failed to PATCH theme_group variable refs (422)');
    });
  });

  describe('patchThemeOptionStyleRefs', () => {
    it('should skip PATCH when refs is undefined (preserve semantics)', async () => {
      await patchThemeOptionStyleRefs(authToken, apiBaseUrl, projectId, changeSetId, 'opt-1', undefined);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should PATCH with empty object to clear refs', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      await patchThemeOptionStyleRefs(authToken, apiBaseUrl, projectId, changeSetId, 'opt-1', {});

      expect(mockFetch).toHaveBeenCalledWith(
        `${apiBaseUrl}/api/v1/projects/${projectId}/theme_options/opt-1?change_set_id=${encodeURIComponent(changeSetId)}`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ theme_option: { figma_style_references: {} } }),
        }),
      );
    });

    it('should PATCH with style refs verbatim (S: prefix included)', async () => {
      mockFetch.mockResolvedValue({ ok: true });
      const refs = { 'hint.text': 'S:81e4c301abc,' };

      await patchThemeOptionStyleRefs(authToken, apiBaseUrl, projectId, changeSetId, 'opt-1', refs);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.theme_option.figma_style_references).toEqual(refs);
    });

    it('should throw on non-OK response', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500, text: () => Promise.resolve('Internal') });

      await expect(
        patchThemeOptionStyleRefs(authToken, apiBaseUrl, projectId, changeSetId, 'opt-1', {}),
      ).rejects.toThrow('Failed to PATCH theme_option style refs (500)');
    });
  });
});
