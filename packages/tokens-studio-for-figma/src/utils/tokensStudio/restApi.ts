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
    if (body) {
      console.log(`REST API Request Body [${method} ${url.toString()}]:`, body);
    }

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
    console.log(`REST API Response [${method} ${url.toString()}]:`, response.status, result);
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
    query: (changeSetId || branch) ? { change_set_id: changeSetId || branch || '' } : undefined,
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
    query: (changeSetId || branch) ? { change_set_id: changeSetId || branch || '' } : undefined,
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
    query: (changeSetId || branch) ? { change_set_id: changeSetId || branch || '' } : undefined,
  });
}

// Token Operations
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
  },
  branch?: string,
  changeSetId?: string,
) {
  return restRequest(authToken, apiBaseUrl, `/api/v1/projects/${projectId}/tokens`, {
    method: 'POST',
    body: {
      token: {
        name: data.name,
        value: data.value,
        type: data.type,
        token_set_id: data.token_set_id,
        description: data.description,
      },
    },
    query: (changeSetId || branch) ? { change_set_id: changeSetId || branch || '' } : undefined,
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
  },
  branch?: string,
  changeSetId?: string,
) {
  return restRequest(authToken, apiBaseUrl, `/api/v1/projects/${projectId}/tokens/${tokenId}`, {
    method: 'PATCH',
    body: {
      token: {
        name: data.name,
        value: data.value,
        type: data.type,
        description: data.description,
        token_set_id: data.token_set_id,
      },
    },
    query: (changeSetId || branch) ? { change_set_id: changeSetId || branch || '' } : undefined,
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
    query: (changeSetId || branch) ? { change_set_id: changeSetId || branch || '' } : undefined,
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
    query: (changeSetId || branch) ? { change_set_id: changeSetId || branch || '' } : undefined,
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
      theme_group: {
        name: data.name,
        options: data.options,
      },
    },
    query: (changeSetId || branch) ? { change_set_id: changeSetId || branch || '' } : undefined,
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
    query: (changeSetId || branch) ? { change_set_id: changeSetId || branch || '' } : undefined,
  });
}
