import omit from 'just-omit';
import type { TokenState } from '@/app/store/models/tokenState';
import type { AnyTokenList } from '@/types/tokens';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { tokenSetListToTree } from './tokenSetListToTree';

export function updateTokenSetsInState(
  state: TokenState,
  mutate: ((name: string, tokenList: AnyTokenList) => null | [string, AnyTokenList]) | null,
  ...newTokenSets: ([string] | [string, AnyTokenList] | [string, AnyTokenList, number])[]
): TokenState {
  const deletedTokenSets = new Set<string>();
  const renamedTokenSets = new Map<string, string>();
  const entries = Object.entries(state.tokens).reduce<[string, AnyTokenList][]>((acc, [name, tokenList]) => {
    if (mutate) {
      const mutated = mutate(name, tokenList);
      if (mutated !== null) {
        if (mutated[0] !== name) {
          renamedTokenSets.set(name, mutated[0]);
        }
        acc.push(mutated);
      } else {
        deletedTokenSets.add(name);
      }
    } else {
      acc.push([name, tokenList]);
    }
    return acc;
  }, []);

  newTokenSets.forEach((newSet) => {
    const insertAt = newSet.length === 3 ? newSet[2] : entries.length;
    entries.splice(insertAt, 0, [newSet[0], newSet?.[1] ?? []]);
  });

  let nextActiveTokenSet = state.activeTokenSet;
  if (deletedTokenSets.has(state.activeTokenSet)) {
    if (entries.length) {
      const [firstTokenSetName] = entries[0];
      nextActiveTokenSet = firstTokenSetName;
    } else {
      nextActiveTokenSet = '';
    }
  } else if (renamedTokenSets.has(state.activeTokenSet)) {
    nextActiveTokenSet = renamedTokenSets.get(state.activeTokenSet)!;
  }

  let nextUsedTokenSet = { ...state.usedTokenSet };
  let nextThemes = [...state.themes];
  if (deletedTokenSets.size > 0) {
    const deletedTokenSetsList = Array.from(deletedTokenSets);
    nextUsedTokenSet = omit(nextUsedTokenSet, deletedTokenSetsList[0], ...deletedTokenSetsList.slice(1));
    nextThemes = nextThemes.map((theme) => ({
      ...theme,
      selectedTokenSets: omit(
        theme.selectedTokenSets,
        deletedTokenSetsList[0],
        ...deletedTokenSetsList.slice(1),
      ),
    }));
  }

  if (renamedTokenSets.size > 0) {
    renamedTokenSets.forEach((newName, originalName) => {
      const tokenSetStatus = nextUsedTokenSet[originalName] ?? TokenSetStatus.DISABLED;
      nextUsedTokenSet = omit(nextUsedTokenSet, originalName);
      nextUsedTokenSet[newName] = tokenSetStatus;
    });
    nextThemes = nextThemes.map((theme) => {
      let nextSelectedTokenSets = { ...theme.selectedTokenSets };
      renamedTokenSets.forEach((newName, originalName) => {
        const tokenSetStatus = nextSelectedTokenSets[originalName] ?? TokenSetStatus.DISABLED;
        nextSelectedTokenSets = omit(nextSelectedTokenSets, originalName);
        nextSelectedTokenSets[newName] = tokenSetStatus;
      });
      return {
        ...theme,
        selectedTokenSets: nextSelectedTokenSets,
      };
    });
  }

  if (newTokenSets.length) {
    newTokenSets.forEach(([name]) => {
      nextUsedTokenSet[name] = TokenSetStatus.DISABLED;
      nextThemes = nextThemes.map((theme) => ({
        ...theme,
        selectedTokenSets: {
          ...theme.selectedTokenSets,
          [name]: TokenSetStatus.DISABLED,
        },
      }));
    });
  }

  const updatedTokens = Object.fromEntries(entries);
  const tokenSetItems = tokenSetListToTree(entries.map(([tokenSet]) => tokenSet));
  const newTokens = {};
  tokenSetItems.filter(({ isLeaf }) => isLeaf).map(({ path }) => path).forEach((set) => {
    Object.assign(newTokens, { [set]: updatedTokens[set] });
  });

  return {
    ...state,
    tokens: newTokens,
    activeTokenSet: nextActiveTokenSet,
    usedTokenSet: nextUsedTokenSet,
    themes: nextThemes,
  };
}
