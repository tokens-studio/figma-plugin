import compact from 'just-compact';
import type { StorageProviderType } from '@sync-providers/types';
import { AVAILABLE_PROVIDERS } from '@sync-providers/constants';
import { CollapsedTokenSetsProperty } from '@/figmaStorage/CollapsedTokenSetsProperty';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { AnyTokenList, SingleToken, TokenStore } from '@/types/tokens';
import { isSingleToken } from '@/utils/is';
import { ThemeObjectsList } from '@/types';
import { CompositionTokenProperty } from '@/types/CompositionTokenProperty';
import { TokenTypes } from '@/constants/TokenTypes';

import { StorageType } from '@/types/StorageType';
import {
  ActiveThemeProperty, CheckForChangesProperty, StorageTypeProperty, ThemesProperty, UpdatedAtProperty, ValuesProperty, VersionProperty, OnboardingExplainerSetsProperty, OnboardingExplainerInspectProperty, OnboardingExplainerSyncProvidersProperty, TokenFormatProperty, OnboardingExplainerExportSetsProperty,
} from '@/figmaStorage';
import { ColorModifierTypes } from '@/constants/ColorModifierTypes';
import { Properties } from '@/constants/Properties';
import { TokenFormatOptions } from './TokenFormatStoreClass';

// @TODO fix typings

export function returnValueToLookFor(key: string) {
  switch (key) {
    case 'tokenName':
      return 'name';
    case 'description':
      return 'description';
    case 'tokenValue':
      return 'rawValue';
    case 'value':
      return 'value';
    default:
      return 'value';
  }
}

const borderPropertyMap = new Map<Properties, string>([
  [Properties.border, 'border'],
  [Properties.borderTop, 'borderTop'],
  [Properties.borderRight, 'borderRight'],
  [Properties.borderBottom, 'borderBottom'],
  [Properties.borderLeft, 'borderLeft'],
]);

type MapValuesToTokensResult = Record<string, string | number | SingleToken['value'] | {
  property: string
  value?: SingleToken['value'];
}[]>;

// TODO: It feels unecessary to do this like that. whats up with the modify? cant we do that upfront before we send tokens to the document?
// Ideally, we would build this object upfront so we would not have to iterate over this at all, but could just .get a token and then get the property of it
// Tokens: The full tokens map
// Values: The values applied to the node
export function mapValuesToTokens(tokens: Map<string, AnyTokenList[number]>, values: NodeTokenRefMap): MapValuesToTokensResult {
  const mappedValues = Object.entries(values).reduce<MapValuesToTokensResult>((acc, [key, tokenOnNode]) => {
    const resolvedToken = tokens.get(tokenOnNode);

    if (!resolvedToken) return acc;
    if (isSingleToken(resolvedToken)) {
      // We only do this for rawValue as its a documentation and we want to show this to the user
      if (returnValueToLookFor(key) === 'rawValue' && resolvedToken.$extensions?.['studio.tokens']?.modify) {
        const modifier = resolvedToken.$extensions?.['studio.tokens']?.modify;
        if (modifier) {
          acc[key] = modifier.type === ColorModifierTypes.MIX ? `${resolvedToken.rawValue} / mix(${modifier.color}, ${modifier.value}) / ${modifier.space}` : `${resolvedToken.rawValue} / ${modifier.type}(${modifier.value}) / ${modifier.space}`;
        }
      } else if (key === TokenTypes.COMPOSITION) {
        Object.entries(resolvedToken.value).forEach(([property, value]) => {
          // Assign the actual value of a composition token property to the applied values
          acc[property as Properties] = value;
          // If we're dealing with border tokens we want to extract the color part to be applied (we can only apply color on the whole border, not individual sides)
          if (typeof value === 'object' && borderPropertyMap.get(property as Properties) && 'color' in value && typeof value.color === 'string') {
            acc.borderColor = value.color;
          }
        });
      } else if (returnValueToLookFor(key) === 'description') {
        // Not all tokens have a description, so we need to treat it special
        acc[key] = resolvedToken.description ? resolvedToken.description : 'No description';
      } else if (
        borderPropertyMap.get(key as Properties)
        && resolvedToken.type === TokenTypes.BORDER
        && typeof resolvedToken.value === 'object'
        && 'color' in resolvedToken.value && resolvedToken.value.color
        && !('borderColor' in acc)) {
        // Same as above, if we're dealing with border tokens we want to extract the color part to be applied (we can only apply color on the whole border, not individual sides)
        acc.borderColor = resolvedToken.value.color;
        // We return the value because the token holds its values in the 'value' prop
        acc[key] = resolvedToken.value;
      } else {
        // Otherwise, try to apply the key, if we dont have it, apply the value
        acc[key] = resolvedToken[returnValueToLookFor(key)] || resolvedToken.value;
      }
    } else {
      acc[key] = resolvedToken;
    }

    return acc;
  }, {});
  return mappedValues;
}

export async function getTokenData(): Promise<{
  values: TokenStore['values'];
  themes: ThemeObjectsList
  activeTheme: string | Record<string, string>
  updatedAt: string;
  version: string;
  checkForChanges: boolean | null
  collapsedTokenSets: string[] | null
  tokenFormat: TokenFormatOptions | null
} | null> {
  try {
    const values = await ValuesProperty.read(figma.root) ?? {};
    const themes = await ThemesProperty.read(figma.root) ?? [];
    const activeTheme = await ActiveThemeProperty.read(figma.root) ?? {};
    const version = await VersionProperty.read(figma.root);
    const updatedAt = await UpdatedAtProperty.read(figma.root);
    const checkForChanges = await CheckForChangesProperty.read(figma.root);
    const collapsedTokenSets = await CollapsedTokenSetsProperty.read(figma.root);
    const tokenFormat = await TokenFormatProperty.read(figma.root);
    if (Object.keys(values).length > 0) {
      const tokenObject = Object.entries(values).reduce<Record<string, AnyTokenList>>((acc, [key, groupValues]) => {
        acc[key] = typeof groupValues === 'string' ? JSON.parse(groupValues) : groupValues;
        return acc;
      }, {});
      return {
        values: tokenObject as TokenStore['values'],
        themes,
        activeTheme,
        updatedAt: updatedAt || '',
        version: version || '',
        checkForChanges,
        collapsedTokenSets,
        tokenFormat: tokenFormat as TokenFormatOptions,
      };
    }
  } catch (e) {
    console.log('Error reading tokens', e);
  }
  return null;
}

// set storage type (i.e. local or some remote provider)
export async function saveStorageType(context: StorageType) {
  await StorageTypeProperty.write(context);
}

export async function saveOnboardingExplainerSets(onboardingExplainerSets: boolean) {
  await OnboardingExplainerSetsProperty.write(onboardingExplainerSets);
}

export async function saveOnboardingExplainerExportSets(onboardingExplainerExportSets: boolean) {
  await OnboardingExplainerExportSetsProperty.write(onboardingExplainerExportSets);
}

export async function saveOnboardingExplainerSyncProviders(onboardingExplainerSyncProviders: boolean) {
  await OnboardingExplainerSyncProvidersProperty.write(onboardingExplainerSyncProviders);
}

export async function saveOnboardingExplainerInspect(onboardingExplainerInspect: boolean) {
  await OnboardingExplainerInspectProperty.write(onboardingExplainerInspect);
}

export async function getSavedStorageType(): Promise<StorageType> {
  // the saved storage types will never contain credentials
  // as they should not be shared across
  const storageType = await StorageTypeProperty.read(figma.root);

  if (storageType) {
    return storageType;
  }
  return { provider: AVAILABLE_PROVIDERS.LOCAL as StorageProviderType.LOCAL };
}

export function goToNode(id: string) {
  const node = figma.getNodeById(id);
  if (
    node
    && node.type !== 'PAGE'
    && node.type !== 'DOCUMENT'
  ) {
    figma.currentPage.selection = [node];
    figma.viewport.scrollAndZoomIntoView([node]);
  }
}

export function selectNodes(ids: string[]) {
  const nodes = compact(ids.map(figma.getNodeById)).filter((node) => (
    node.type !== 'PAGE' && node.type !== 'DOCUMENT'
  )) as (Exclude<BaseNode, PageNode | DocumentNode>)[];
  figma.currentPage.selection = nodes;
}
// Tokens: The full token object
// Values: The values applied to the node
export function destructureTokenForAlias(tokens: Map<string, AnyTokenList[number]>, values: NodeTokenRefMap): MapValuesToTokensResult {
  if (values && values.composition) {
    const resolvedToken = tokens.get(values.composition);
    const tokensInCompositionToken: NodeTokenRefMap = {};
    if (resolvedToken?.rawValue) {
      Object.entries(resolvedToken?.rawValue).forEach(([property, value]) => {
        let tokenName: string = resolvedToken.name;
        if (String(value).startsWith('$')) tokenName = String(value).slice(1, String(value).length);
        if (String(value).startsWith('{')) tokenName = String(value).slice(1, String(value).length - 1);
        tokensInCompositionToken[property as CompositionTokenProperty] = tokenName;
      });
      const { composition, ...objExcludedCompositionToken } = values;
      values = { ...tokensInCompositionToken, ...objExcludedCompositionToken };
    }
  }
  if (values && values.border && !values.borderColor && !values.borderWidth) {
    // if we have a border token we must convert the color variable out of it given how our resolution logic works
    const resolvedToken = tokens.get(values.border as string);
    if (resolvedToken && resolvedToken.resolvedValueWithReferences) {
      if (typeof resolvedToken.resolvedValueWithReferences === 'object') {
        if ('color' in resolvedToken.resolvedValueWithReferences) {
          const borderColorTokenName = (resolvedToken.resolvedValueWithReferences.color as string).replace('{', '').replace('}', '');
          values.borderColor = borderColorTokenName;
        }
        if ('width' in resolvedToken.resolvedValueWithReferences) {
          const borderWidthTokenName = (resolvedToken.resolvedValueWithReferences.width as string).replace('{', '').replace('}', '');
          values.borderWidth = borderWidthTokenName;
        }
      }
    }
    values = { ...values, ...(values.borderColor ? { } : { borderColor: values.border }) };
  }
  if (values && values.borderTop) {
    values = { ...values, ...(values.borderColor ? { } : { borderColor: values.borderTop }) };
  }
  if (values && values.borderRight) {
    values = { ...values, ...(values.borderColor ? { } : { borderColor: values.borderRight }) };
  }
  if (values && values.borderLeft) {
    values = { ...values, ...(values.borderColor ? { } : { borderColor: values.borderLeft }) };
  }
  if (values && values.borderBottom) {
    values = { ...values, ...(values.borderColor ? { } : { borderColor: values.borderBottom }) };
  }
  return values;
}
