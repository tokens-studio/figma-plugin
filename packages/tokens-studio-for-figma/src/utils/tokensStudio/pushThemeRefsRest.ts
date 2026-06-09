/**
 * REST PATCH helpers for syncing $figmaVariableReferences and $figmaStyleReferences
 * with Studio-on-Rails theme_groups and theme_options endpoints.
 *
 * Semantics:
 * - undefined → omit key from payload (preserve existing refs on server)
 * - {}       → explicitly clear all refs
 * - never send null
 */

export async function patchThemeGroupVariableRefs(
  authToken: string,
  apiBaseUrl: string,
  projectId: string,
  changeSetId: string,
  themeGroupId: string,
  refs: Record<string, string> | undefined,
): Promise<void> {
  if (refs === undefined) return;

  const url = `${apiBaseUrl}/api/v1/projects/${projectId}/theme_groups/${themeGroupId}?change_set_id=${encodeURIComponent(changeSetId)}`;
  const body = {
    theme_group: {
      figma_variable_references: refs,
    },
  };

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Failed to PATCH theme_group variable refs (${res.status}): ${errorText}`);
  }
}

export async function patchThemeOptionStyleRefs(
  authToken: string,
  apiBaseUrl: string,
  projectId: string,
  changeSetId: string,
  themeOptionId: string,
  refs: Record<string, string> | undefined,
): Promise<void> {
  if (refs === undefined) return;

  const url = `${apiBaseUrl}/api/v1/projects/${projectId}/theme_options/${themeOptionId}?change_set_id=${encodeURIComponent(changeSetId)}`;
  const body = {
    theme_option: {
      figma_style_references: refs,
    },
  };

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Failed to PATCH theme_option style refs (${res.status}): ${errorText}`);
  }
}
