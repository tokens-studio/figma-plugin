import { AnyTokenSet } from '@/types/tokens';
import { ThemeObjectsList, ThemeObject } from '@/types';
import { parseBranchesFromResponse } from './fetchBranchesListRest';

// Types derived from REST endpoints

interface RestTokenSet {
  id: string;
  name: string;
  type?: string;
  is_dynamic: boolean;
  tokens?: any;
  order_index?: number;
}

interface RestThemeOption {
  id: string;
  name: string;
  theme_group_id: string;
  selected_token_sets: Record<string, string>;
  figmaStyleReferences?: Record<string, string>;
  figmaVariableReferences?: Record<string, string>;
  figmaCollectionId?: string;
  figmaModeId?: string;
}

export type ProjectData = {
  tokens: AnyTokenSet | null;
  themes: ThemeObjectsList;
  tokenSets: Record<string, { isDynamic: boolean }>;
  tokenSetOrder: string[];
  hasExceededPaginationLimit?: boolean;
};

function transformTokenValue(token: any): unknown {
  const value = token.attributes?.value;
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && value.hex) return value.hex;
  return value;
}

async function fetchAllPages(url: string, headers: HeadersInit, resourceName: string) {
  let allData: any[] = [];
  let currentPage = 1;
  let totalPages = 1;
  let meta: any = {};

  do {
    const separator = url.includes('?') ? '&' : '?';
    const pageUrl = `${url}${separator}page=${currentPage}`;
    const res = await fetch(pageUrl, { headers });

    if (!res.ok) {
      let errorData: { code?: string; error?: string } = {};
      try {
        errorData = await res.json();
      } catch (e) {
        // ignore parsing error
      }
      const error = new Error(errorData.error || `Failed to fetch ${resourceName}: ${res.statusText}`);
      if (errorData.code) (error as any).code = errorData.code;
      throw error;
    }

    const json = await res.json();
    if (json.data && Array.isArray(json.data)) {
      allData = [...allData, ...json.data];
    }
    meta = json.meta || meta;

    if (json.meta?.pagination) {
      totalPages = json.meta.pagination.total_pages || 1;
      currentPage += 1;
    } else {
      break;
    }
  } while (currentPage <= totalPages);

  return { data: allData, meta };
}

export async function fetchProjectDataRest(
  authToken: string,
  apiBaseUrl: string,
  projectId: string,
  branchName: string = 'main',
): Promise<ProjectData | null> {
  const headers = {
    Authorization: `Bearer ${authToken}`,
    'Content-Type': 'application/json',
  };

  try {
    // 1. Fetch branches to find change_set_id for main
    const branchesRes = await fetch(`${apiBaseUrl}/api/v1/projects/${projectId}/branches`, { headers });
    if (!branchesRes.ok) throw new Error(`Failed to fetch branches: ${branchesRes.statusText}`);
    const branchesData = await branchesRes.json();

    const branches = parseBranchesFromResponse(branchesData);

    const branch = branches.find((b) => b.name === branchName) || branches.find((b) => b.is_default) || branches[0];
    if (!branch) throw new Error(`Branch ${branchName} not found`);
    const changeSetId = branch.change_set_id;

    const branchQuery = `change_set_id=${encodeURIComponent(changeSetId)}`;

    // 2. Fetch all required data concurrently
    const [tokensRes, tokenSetsData, themeGroupsData, themeOptionsData] = await Promise.all([
      fetch(`${apiBaseUrl}/api/v1/projects/${projectId}/tokens?${branchQuery}&per_page=10000`, { headers }),
      fetchAllPages(`${apiBaseUrl}/api/v1/projects/${projectId}/token_sets?${branchQuery}&per_page=100`, headers, 'token sets'),
      fetchAllPages(`${apiBaseUrl}/api/v1/projects/${projectId}/theme_groups?${branchQuery}&per_page=100`, headers, 'theme groups'),
      fetchAllPages(`${apiBaseUrl}/api/v1/projects/${projectId}/theme_options?${branchQuery}&per_page=1000`, headers, 'theme options'),
    ]);

    const handleFetchResponse = async (res: Response, resourceName: string) => {
      if (!res.ok) {
        let errorData: { code?: string; error?: string } = {};
        try {
          errorData = await res.json();
        } catch (e) {
          // ignore parsing error
        }
        const error = new Error(errorData.error || `Failed to fetch ${resourceName}: ${res.statusText}`);
        if (errorData.code) (error as any).code = errorData.code;
        throw error;
      }
      return res.json();
    };

    const tokensData = await handleFetchResponse(tokensRes, 'tokens');

    const hasExceededPaginationLimit = tokensData?.meta?.pagination?.total_items > 10000
      || (tokensData?.data && tokensData.data.length >= 10000);

    // Parse token sets
    const tokenSets: RestTokenSet[] = [];
    if (tokenSetsData.data && Array.isArray(tokenSetsData.data)) {
      tokenSetsData.data.forEach((item: any) => {
        let setName = item.attributes?.name || item.id;

        tokenSets.push({
          id: item.id,
          name: setName,
          type: item.attributes?.type,
          is_dynamic: item.attributes?.is_dynamic || false,
          order_index: item.attributes?.order_index || 0,
        });
      });
    }

    const tokensBySetId: Record<string, any[]> = {};
    if (tokensData.data && Array.isArray(tokensData.data)) {
      tokensData.data.forEach((token: any) => {
        const setId = token.attributes?.token_set_id;
        if (!tokensBySetId[setId]) tokensBySetId[setId] = [];
        tokensBySetId[setId].push(token);
      });
    }

    const tokens: AnyTokenSet = {};
    const tokenSetsMap: Record<string, { isDynamic: boolean }> = {};
    const tokenSetIdToName: Record<string, string> = {};

    // Sort by order_index and transform
    const sortedSets = tokenSets.sort((a, b) => (Number(a.order_index) > Number(b.order_index) ? 1 : -1));
    const tokenSetOrder = sortedSets.map((s) => s.name);

    sortedSets.forEach((set) => {
      const setTokens = tokensBySetId[set.id] || [];
      const transformedTokens: any[] = [];
      setTokens.forEach((token: any) => {
        const tokenName = token.attributes?.name;
        if (tokenName) {
          const rawExtensions = token.attributes?.$extensions || token.attributes?.extensions || {};
          const $extensions = { ...rawExtensions };

          // Flatten nested 'com.figma' from REST API to flat keys expected by the plugin,
          // but preserve the nested object for consumers that still read $extensions['com.figma'].
          if ($extensions['com.figma'] && typeof $extensions['com.figma'] === 'object') {
            const figmaExt = $extensions['com.figma'];
            if (figmaExt.scopes !== undefined) $extensions['com.figma.scopes'] = figmaExt.scopes;
            if (figmaExt.codeSyntax !== undefined) $extensions['com.figma.codeSyntax'] = figmaExt.codeSyntax;
            if (figmaExt.hiddenFromPublishing !== undefined) $extensions['com.figma.hiddenFromPublishing'] = figmaExt.hiddenFromPublishing;
          }

          if (token.attributes?.scopes || token.attributes?.scope) {
            $extensions['com.figma.scopes'] = token.attributes.scopes || token.attributes.scope;
          }

          if (token.attributes?.syntaxes) {
            $extensions['com.figma.codeSyntax'] = token.attributes.syntaxes;
          }

          transformedTokens.push({
            name: tokenName,
            value: transformTokenValue(token),
            type: token.attributes?.type,
            ...(token.attributes?.description && { description: token.attributes.description }),
            ...(Object.keys($extensions).length > 0 && { $extensions }),
          });
        }
      });
      tokens[set.name] = transformedTokens as any;
      tokenSetsMap[set.name] = { isDynamic: set.is_dynamic };
      tokenSetIdToName[set.id] = set.name;
    });

    // Parse theme options
    const themeOptions: RestThemeOption[] = [];
    if (themeOptionsData.data && Array.isArray(themeOptionsData.data)) {
      themeOptionsData.data.forEach((item: any) => {
        themeOptions.push({
          id: item.id,
          name: item.attributes?.name || item.id,
          theme_group_id: item.relationships?.theme_group?.data?.id || '',
          selected_token_sets: item.attributes?.selected_token_sets || {},
          figmaStyleReferences: item.attributes?.figma_style_references,
          figmaVariableReferences: item.attributes?.figma_variable_references,
          figmaCollectionId: item.attributes?.figma_collection_id,
          figmaModeId: item.attributes?.figma_mode_id,
        });
      });
    }

    const optionsByGroupId: Record<string, RestThemeOption[]> = {};
    themeOptions.forEach((opt) => {
      if (!optionsByGroupId[opt.theme_group_id]) optionsByGroupId[opt.theme_group_id] = [];
      optionsByGroupId[opt.theme_group_id].push(opt);
    });

    // Parse theme groups
    const themes: ThemeObjectsList = [];
    if (themeGroupsData.data && Array.isArray(themeGroupsData.data)) {
      themeGroupsData.data.forEach((group: any) => {
        const { id } = group;
        const name = group.attributes?.name || id;
        const options = optionsByGroupId[id] || [];

        options.forEach((opt) => {
          const selectedTokenSetsByName: Record<string, string> = {};

          Object.entries(opt.selected_token_sets || {}).forEach(([setId, status]) => {
            const setName = tokenSetIdToName[setId];
            if (setName) {
              selectedTokenSetsByName[setName] = (status as string).toLowerCase();
            }
          });

          const themeObj: ThemeObject = {
            id: opt.id,
            name: opt.name,
            group: name,
            selectedTokenSets: selectedTokenSetsByName as any,
          };

          if (opt.figmaStyleReferences !== undefined) themeObj.$figmaStyleReferences = opt.figmaStyleReferences;
          if (opt.figmaVariableReferences !== undefined) themeObj.$figmaVariableReferences = opt.figmaVariableReferences;
          if (opt.figmaCollectionId !== undefined) themeObj.$figmaCollectionId = opt.figmaCollectionId;
          if (opt.figmaModeId !== undefined) themeObj.$figmaModeId = opt.figmaModeId;

          themes.push(themeObj);
        });
      });
    }

    return {
      tokens,
      themes,
      tokenSets: tokenSetsMap,
      tokenSetOrder,
      hasExceededPaginationLimit,
    };
  } catch (error) {
    console.error('Error fetching project data from REST API:', error);
    return null;
  }
}
