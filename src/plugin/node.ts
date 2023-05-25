import compact from 'just-compact';
import omit from 'just-omit';
import { CollapsedTokenSetsProperty } from '@/figmaStorage/CollapsedTokenSetsProperty';
import store from './store';
import setValuesOnNode from './setValuesOnNode';
import { Properties } from '@/constants/Properties';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { defaultNodeManager, NodeManagerNode } from './NodeManager';
import { postToUI } from './notifiers';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { defaultWorker } from './Worker';
import { getAllFigmaStyleMaps } from '@/utils/getAllFigmaStyleMaps';
import { ProgressTracker } from './ProgressTracker';
import { AnyTokenList, SingleToken, TokenStore } from '@/types/tokens';
import { isSingleToken } from '@/utils/is';
import { ThemeObjectsList } from '@/types';
import { CompositionTokenProperty } from '@/types/CompositionTokenProperty';
import { TokenTypes } from '@/constants/TokenTypes';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageType } from '@/types/StorageType';
import {
  ActiveThemeProperty, CheckForChangesProperty, StorageTypeProperty, ThemesProperty, UpdatedAtProperty, ValuesProperty, VersionProperty, OnboardingExplainerSetsProperty, OnboardingExplainerInspectProperty, OnboardingExplainerSyncProvidersProperty,
} from '@/figmaStorage';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { updatePluginData } from './pluginData';
import { SettingsState } from '@/app/store/models/settings';
import { ColorModifierTypes } from '@/constants/ColorModifierTypes';

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

type MapValuesToTokensResult = Record<string, string | number | SingleToken['value'] | {
  property: string
  value?: SingleToken['value'];
}[]>;

export function mapValuesToTokens(tokens: Map<string, AnyTokenList[number]>, values: NodeTokenRefMap): MapValuesToTokensResult {
  const mappedValues = Object.entries(values).reduce<MapValuesToTokensResult>((acc, [key, tokenOnNode]) => {
    const resolvedToken = tokens.get(tokenOnNode);
    if (!resolvedToken) return acc;
    if (isSingleToken(resolvedToken)) {
      if (returnValueToLookFor(key) === 'rawValue' && resolvedToken.$extensions) {
        const modifier = resolvedToken.$extensions['studio.tokens'].modify;
        acc[key] = modifier.type === ColorModifierTypes.MIX ? `${resolvedToken.rawValue} / mix(${modifier.color}, ${modifier.value}) / ${modifier.space}` : `${resolvedToken.rawValue} / ${modifier.type}(${modifier.value}) / ${modifier.space}`;
      } else {
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
} | null> {
  try {
    const values = await ValuesProperty.read(figma.root) ?? {};
    const themes = await ThemesProperty.read(figma.root) ?? [];
    const activeTheme = await ActiveThemeProperty.read(figma.root) ?? {};
    const version = await VersionProperty.read(figma.root);
    const updatedAt = await UpdatedAtProperty.read(figma.root);
    const checkForChanges = await CheckForChangesProperty.read(figma.root);
    const collapsedTokenSets = await CollapsedTokenSetsProperty.read(figma.root);
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
  return { provider: StorageProviderType.LOCAL };
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

export function destructureToken(values: MapValuesToTokensResult): MapValuesToTokensResult {
  const tokensInCompositionToken: Partial<
  Record<TokenTypes, SingleToken['value']>
  & Record<Properties, SingleToken['value']>
  > = {};
  if (values && values.border && typeof values.border === 'object' && 'color' in values.border && values.border.color) {
    values = { ...values, ...(values.borderColor ? { } : { borderColor: values.border.color }) };
  }
  if (values && values.borderTop && typeof values.borderTop === 'object' && 'color' in values.borderTop && values.borderTop.color) {
    values = { ...values, ...(values.borderColor ? { } : { borderColor: values.borderTop.color }) };
  }
  if (values && values.borderRight && typeof values.borderRight === 'object' && 'color' in values.borderRight && values.borderRight.color) {
    values = { ...values, ...(values.borderColor ? { } : { borderColor: values.borderRight.color }) };
  }
  if (values && values.borderLeft && typeof values.borderLeft === 'object' && 'color' in values.borderLeft && values.borderLeft.color) {
    values = { ...values, ...(values.borderColor ? { } : { borderColor: values.borderLeft.color }) };
  }
  if (values && values.borderBottom && typeof values.borderBottom === 'object' && 'color' in values.borderBottom && values.borderBottom.color) {
    values = { ...values, ...(values.borderColor ? { } : { borderColor: values.borderBottom.color }) };
  }
  if (values && values.composition) {
    Object.entries(values.composition).forEach(([property, value]) => {
      tokensInCompositionToken[property as CompositionTokenProperty] = value;
    });
    const { composition, ...objExcludedCompositionToken } = values;
    values = { ...tokensInCompositionToken, ...objExcludedCompositionToken };
  }
  return values;
}

export function destructureTokenForAlias(tokens: Map<string, AnyTokenList[number]>, values: NodeTokenRefMap): MapValuesToTokensResult {
  if (values && values.border) {
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
  return values;
}

async function migrateTokens(entry: NodeManagerNode, values: MapValuesToTokensResult, tokens: Partial<Record<TokenTypes, string> & Record<Properties, string>>) {
  // Older versions had `border` properties that were colors, move these to borderColor
  if (typeof values.border === 'string' && typeof tokens.border !== 'undefined') {
    values.borderColor = values.border;
    await updatePluginData({
      entries: [entry], values: { [Properties.borderColor]: tokens.border, [Properties.border]: 'delete' }, shouldRemove: false,
    });
    await defaultNodeManager.updateNode(entry.node, (t) => (
      omit(t, [Properties.border])
    ));
  }
}

export async function updateNodes(
  entries: readonly NodeManagerNode[],
  tokens: Map<string, AnyTokenList[number]>,
  settings?: SettingsState,
) {
  const { ignoreFirstPartForStyles, prefixStylesWithThemeName, baseFontSize } = settings ?? {};
  const figmaStyleMaps = getAllFigmaStyleMaps();
  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  postToUI({
    type: MessageFromPluginTypes.START_JOB,
    job: {
      name: BackgroundJobs.PLUGIN_UPDATENODES,
      timePerTask: 2,
      completedTasks: 0,
      totalTasks: entries.length,
    },
  });

  const tracker = new ProgressTracker(BackgroundJobs.PLUGIN_UPDATENODES);
  const promises: Set<Promise<void>> = new Set();
  const returnedValues: Set<NodeTokenRefMap> = new Set();
  entries.forEach((entry) => {
    promises.add(
      defaultWorker.schedule(async () => {
        try {
          if (entry.tokens) {
            const mappedTokens = destructureTokenForAlias(tokens, entry.tokens);
            let mappedValues = mapValuesToTokens(tokens, entry.tokens);
            mappedValues = destructureToken(mappedValues);
            await migrateTokens(entry, mappedValues, mappedTokens);
            setValuesOnNode(
              entry.node,
              mappedValues,
              mappedTokens,
              figmaStyleMaps,
              themeInfo,
              ignoreFirstPartForStyles,
              prefixStylesWithThemeName,
              baseFontSize,
            );
            store.successfulNodes.add(entry.node);
            returnedValues.add(entry.tokens);
          }
        } catch (e) {
          console.log('got error', e);
        }

        tracker.next();
        tracker.reportIfNecessary();
      }),
    );
  });
  await Promise.all(promises);

  postToUI({
    type: MessageFromPluginTypes.COMPLETE_JOB,
    name: BackgroundJobs.PLUGIN_UPDATENODES,
  });
  if (returnedValues.size) {
    return returnedValues.entries().next();
  }

  return {};
}
