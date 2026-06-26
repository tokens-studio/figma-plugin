interface RestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: any;
  query?: Record<string, string>;
}

async function restRequest(
  authToken: string,
  apiBaseUrl: string,
  endpoint: string,
  options: RestOptions = {},
) {
  const { method = 'GET', body, query } = options;
  const url = new URL(`${apiBaseUrl}${endpoint}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  try {
    const response = await fetch(url.toString(), {
      method,
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`REST API Request failed [${method} ${url.toString()}]:`, response.status, errorData);
      throw new Error(`API error: ${response.status} ${errorData.errors?.[0]?.detail || ''}`);
    }

    const result = await response.json().catch(() => ({}));
    return result;
  } catch (error) {
    console.error(`REST API Request failed [${method} ${endpoint}]:`, error);
    throw error;
  }
}

// Token Set Operations
export async function createTokenSetRest(
  authToken: string,
  apiBaseUrl: string,
  projectId: string,
  data: { name: string; type?: string; order_index?: number },
  branch?: string,
  changeSetId?: string,
) {
  return restRequest(authToken, apiBaseUrl, `/api/v1/projects/${projectId}/token_sets`, {
    method: 'POST',
    body: {
      data: {
        type: 'token_sets',
        attributes: data,
      },
    },
    query: changeSetId ? { change_set_id: changeSetId } : undefined,
  });
}

export async function updateTokenSetRest(
  authToken: string,
  apiBaseUrl: string,
  projectId: string,
  tokenSetId: string,
  data: { name?: string; type?: string; order_index?: number },
  branch?: string,
  changeSetId?: string,
) {
  return restRequest(authToken, apiBaseUrl, `/api/v1/projects/${projectId}/token_sets/${tokenSetId}`, {
    method: 'PATCH',
    body: {
      data: {
        type: 'token_sets',
        attributes: {
          name: data.name,
          type: data.type,
          order_index: data.order_index,
        },
      },
    },
    query: changeSetId ? { change_set_id: changeSetId } : undefined,
  });
}

export async function deleteTokenSetRest(
  authToken: string,
  apiBaseUrl: string,
  projectId: string,
  tokenSetId: string,
  branch?: string,
  changeSetId?: string,
) {
  return restRequest(authToken, apiBaseUrl, `/api/v1/projects/${projectId}/token_sets/${tokenSetId}`, {
    method: 'DELETE',
    query: changeSetId ? { change_set_id: changeSetId } : undefined,
  });
}

// Token Operations
export async function batchCreateTokensRest(
  authToken: string,
  apiBaseUrl: string,
  projectId: string,
  tokens: Array<{
    name: string;
    value: any;
    type: string;
    token_set_id: string;
    description?: string;
    $deprecated?: {
      severity: 'warning' | 'error';
      message: string;
      replacementToken?: string;
      removeAfter?: string;
    };
  }>,
  changeSetId: string,
) {
  // Transform tokens: convert $deprecated from DTCG format to API format
  const transformedTokens = tokens.map((token) => {
    const transformed: any = {
      name: token.name,
      value: token.value,
      type: token.type,
      token_set_id: token.token_set_id,
      description: token.description,
    };

    if (token.$deprecated) {
      transformed.deprecated_severity = token.$deprecated.severity;
      transformed.deprecated = token.$deprecated.message;
      transformed.deprecated_metadata = {
        ...(token.$deprecated.replacementToken && { replacement: token.$deprecated.replacementToken }),
        ...(token.$deprecated.removeAfter && { remove_after: token.$deprecated.removeAfter }),
      };
    }

    return transformed;
  });

  return restRequest(authToken, apiBaseUrl, `/api/v1/projects/${projectId}/tokens/batch_create`, {
    method: 'POST',
    body: {
      change_set_id: changeSetId,
      tokens: transformedTokens,
    },
  });
}

export async function createTokenRest(
  authToken: string,
  apiBaseUrl: string,
  projectId: string,
  data: {
    name: string;
    value: any;
    type: string;
    token_set_id: string;
    description?: string;
    $deprecated?: {
      severity: 'warning' | 'error';
      message: string;
      replacementToken?: string;
      removeAfter?: string;
    };
  },
  branch?: string,
  changeSetId?: string,
) {
  const token: any = {
    name: data.name,
    value: data.value,
    type: data.type,
    token_set_id: data.token_set_id,
    description: data.description,
  };

  // Transform $deprecated from DTCG format to API format
  if (data.$deprecated) {
    token.deprecated_severity = data.$deprecated.severity;
    token.deprecated = data.$deprecated.message;
    token.deprecated_metadata = {
      ...(data.$deprecated.replacementToken && { replacement: data.$deprecated.replacementToken }),
      ...(data.$deprecated.removeAfter && { remove_after: data.$deprecated.removeAfter }),
    };
  }

  return restRequest(authToken, apiBaseUrl, `/api/v1/projects/${projectId}/tokens`, {
    method: 'POST',
    body: { token },
    query: changeSetId ? { change_set_id: changeSetId } : undefined,
  });
}

export async function updateTokenRest(
  authToken: string,
  apiBaseUrl: string,
  projectId: string,
  tokenId: string,
  data: {
    name?: string;
    value?: any;
    type?: string;
    description?: string;
    token_set_id?: string;
    $deprecated?: {
      severity: 'warning' | 'error';
      message: string;
      replacementToken?: string;
      removeAfter?: string;
    } | null;
  },
  branch?: string,
  changeSetId?: string,
) {
  const token: any = {
    name: data.name,
    value: data.value,
    type: data.type,
    description: data.description,
    token_set_id: data.token_set_id,
  };

  // Transform $deprecated from DTCG format to API format, or clear it if null
  if (data.$deprecated !== undefined) {
    if (data.$deprecated === null) {
      // Clear deprecation
      token.deprecated_severity = null;
      token.deprecated = null;
      token.deprecated_metadata = null;
    } else {
      // Set deprecation with transformed format
      token.deprecated_severity = data.$deprecated.severity;
      token.deprecated = data.$deprecated.message;
      token.deprecated_metadata = {
        ...(data.$deprecated.replacementToken && { replacement: data.$deprecated.replacementToken }),
        ...(data.$deprecated.removeAfter && { remove_after: data.$deprecated.removeAfter }),
      };
    }
  }

  return restRequest(authToken, apiBaseUrl, `/api/v1/projects/${projectId}/tokens/${tokenId}`, {
    method: 'PATCH',
    body: { token },
    query: changeSetId ? { change_set_id: changeSetId } : undefined,
  });
}

export async function deleteTokenRest(
  authToken: string,
  apiBaseUrl: string,
  projectId: string,
  tokenId: string,
  branch?: string,
  changeSetId?: string,
) {
  return restRequest(authToken, apiBaseUrl, `/api/v1/projects/${projectId}/tokens/${tokenId}`, {
    method: 'DELETE',
    query: changeSetId ? { change_set_id: changeSetId } : undefined,
  });
}

// Theme Group Operations
export async function createThemeGroupRest(
  authToken: string,
  apiBaseUrl: string,
  projectId: string,
  data: {
    name: string;
    options?: any[];
  },
  branch?: string,
  changeSetId?: string,
) {
  return restRequest(authToken, apiBaseUrl, `/api/v1/projects/${projectId}/theme_groups`, {
    method: 'POST',
    body: {
      theme_group: data,
    },
    query: changeSetId ? { change_set_id: changeSetId } : undefined,
  });
}

export async function updateThemeGroupRest(
  authToken: string,
  apiBaseUrl: string,
  projectId: string,
  themeGroupId: string,
  data: {
    name?: string;
    options?: any[];
  },
  branch?: string,
  changeSetId?: string,
) {
  return restRequest(authToken, apiBaseUrl, `/api/v1/projects/${projectId}/theme_groups/${themeGroupId}`, {
    method: 'PATCH',
    body: {
      theme_group: data,
    },
    query: changeSetId ? { change_set_id: changeSetId } : undefined,
  });
}

export async function deleteThemeGroupRest(
  authToken: string,
  apiBaseUrl: string,
  projectId: string,
  themeGroupId: string,
  branch?: string,
  changeSetId?: string,
) {
  return restRequest(authToken, apiBaseUrl, `/api/v1/projects/${projectId}/theme_groups/${themeGroupId}`, {
    method: 'DELETE',
    query: changeSetId ? { change_set_id: changeSetId } : undefined,
  });
}

// Theme Option Operations
export async function createThemeOptionRest(
  authToken: string,
  apiBaseUrl: string,
  projectId: string,
  data: {
    name: string;
    theme_group_id: string;
    selected_token_sets: Record<string, string>;
    figma_style_references?: Record<string, string>;
    figma_variable_references?: Record<string, string>;
    figma_collection_id?: string;
    figma_mode_id?: string;
  },
  branch?: string,
  changeSetId?: string,
) {
  return restRequest(authToken, apiBaseUrl, `/api/v1/projects/${projectId}/theme_options`, {
    method: 'POST',
    body: {
      theme_option: data,
    },
    query: changeSetId ? { change_set_id: changeSetId } : undefined,
  });
}

export async function updateThemeOptionRest(
  authToken: string,
  apiBaseUrl: string,
  projectId: string,
  themeOptionId: string,
  data: {
    name?: string;
    theme_group_id?: string;
    selected_token_sets?: Record<string, string>;
    figma_style_references?: Record<string, string>;
    figma_variable_references?: Record<string, string>;
    figma_collection_id?: string;
    figma_mode_id?: string;
  },
  branch?: string,
  changeSetId?: string,
) {
  return restRequest(authToken, apiBaseUrl, `/api/v1/projects/${projectId}/theme_options/${themeOptionId}`, {
    method: 'PATCH',
    body: {
      theme_option: data,
    },
    query: changeSetId ? { change_set_id: changeSetId } : undefined,
  });
}

export async function deleteThemeOptionRest(
  authToken: string,
  apiBaseUrl: string,
  projectId: string,
  themeOptionId: string,
  branch?: string,
  changeSetId?: string,
) {
  return restRequest(authToken, apiBaseUrl, `/api/v1/projects/${projectId}/theme_options/${themeOptionId}`, {
    method: 'DELETE',
    query: changeSetId ? { change_set_id: changeSetId } : undefined,
  });
}
