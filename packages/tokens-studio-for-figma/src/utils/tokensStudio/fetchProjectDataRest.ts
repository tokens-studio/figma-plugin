import { AnyTokenSet } from '@/types/tokens';
import { ThemeObjectsList } from '@/types';
import { RestBranch, parseBranchesFromResponse } from './fetchBranchesListRest';

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
    const [tokensRes, tokenSetsRes, themeGroupsRes, themeOptionsRes] = await Promise.all([
      fetch(`${apiBaseUrl}/api/v1/projects/${projectId}/tokens?${branchQuery}&per_page=10000`, { headers }),
      // Note: fetching multiple pages is left out for simplicity unless there's many sets. We just fetch page 1.
      fetch(`${apiBaseUrl}/api/v1/projects/${projectId}/token_sets?${branchQuery}&per_page=100`, { headers }),
      fetch(`${apiBaseUrl}/api/v1/projects/${projectId}/theme_groups?${branchQuery}&per_page=100`, { headers }),
      fetch(`${apiBaseUrl}/api/v1/projects/${projectId}/theme_options?${branchQuery}&per_page=1000`, { headers }),
    ]);

    if (!tokensRes.ok) throw new Error(`Failed to fetch tokens: ${tokensRes.statusText}`);
    if (!tokenSetsRes.ok) throw new Error(`Failed to fetch token sets: ${tokenSetsRes.statusText}`);
    if (!themeGroupsRes.ok) throw new Error(`Failed to fetch theme groups: ${themeGroupsRes.statusText}`);
    if (!themeOptionsRes.ok) throw new Error(`Failed to fetch theme options: ${themeOptionsRes.statusText}`);

    const [tokensData, tokenSetsData, themeGroupsData, themeOptionsData] = await Promise.all([
      tokensRes.json(),
      tokenSetsRes.json(),
      themeGroupsRes.json(),
      themeOptionsRes.json(),
    ]);

    const hasExceededPaginationLimit = tokensData?.meta?.pagination?.total_items > 10000 
      || (tokensData?.data && tokensData.data.length >= 10000);

    // Parse token sets
    const tokenSets: RestTokenSet[] = [];
    if (tokenSetsData.data && Array.isArray(tokenSetsData.data)) {
      tokenSetsData.data.forEach((item: any) => {
        let setName = item.attributes?.name || item.id;
        // Strip the root directory prefix if it exists (e.g. "florian-tokens/component/btn" -> "component/btn")
        const slashIndex = setName.indexOf('/');
        if (slashIndex > 0) {
          setName = setName.substring(slashIndex + 1);
        }

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
          transformedTokens.push({
            name: tokenName,
            value: transformTokenValue(token),
            type: token.attributes?.type,
            ...(token.attributes?.description && { description: token.attributes.description }),
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
          // Map token sets ID -> name mapping
          const selectedTokenSetsByName: Record<string, string> = {};
          Object.entries(opt.selected_token_sets || {}).forEach(([setId, status]) => {
            const setName = tokenSetIdToName[setId];
            if (setName) {
              selectedTokenSetsByName[setName] = (status as string).toLowerCase();
            }
          });

          themes.push({
            id: opt.id,
            name: opt.name,
            group: name,
            selectedTokenSets: selectedTokenSetsByName as any,
            $figmaStyleReferences: opt.figmaStyleReferences,
            $figmaVariableReferences: opt.figmaVariableReferences,
            $figmaCollectionId: opt.figmaCollectionId,
            $figmaModeId: opt.figmaModeId,
          });
        });
      });
    }

    return {
      tokens: Object.keys(tokens).length > 0 ? tokens : undefined as any,
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
