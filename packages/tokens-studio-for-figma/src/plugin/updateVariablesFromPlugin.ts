import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { getVariablesMap } from '@/utils/getVariablesMap';
import setColorValuesOnVariable from './setColorValuesOnVariable';
import { TokenTypes } from '@/constants/TokenTypes';
import setBooleanValuesOnVariable from './setBooleanValuesOnVariable';
import setNumberValuesOnVariable from './setNumberValuesOnVariable';
import setStringValuesOnVariable from './setStringValuesOnVariable';
import { UpdateTokenVariablePayload } from '@/types/payloads/UpdateTokenVariablePayload';
import { CodeSyntax, VariableScope } from '@/types/tokens';
import { FIGMA_PLATFORMS, normalizeVariableScopes, getCodeSyntaxValue } from '@/utils/figma';
import { checkCanReferenceVariable } from '@/utils/alias/checkCanReferenceVariable';
import { resolveCollectionContext } from './extendedCollections/collectionContext';
import { applyChildModeValue } from './extendedCollections/applyChildModeValue';

export default async function updateVariablesFromPlugin(payload: UpdateTokenVariablePayload) {
  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const variableMap = await getVariablesMap();
  const nameToVariableMap = (await figma.variables.getLocalVariablesAsync())?.reduce<Record<string, Variable>>((acc, curr) => {
    acc[curr.name] = curr;
    return acc;
  }, {});

  const metadataUpdateTracker: Record<string, boolean> = {};

  // eslint-disable-next-line no-console
  console.log(
    `[updateVariablesFromPlugin] token "${payload.name}" (set: ${payload.parent}, rawValue: ${payload.rawValue})`,
    `\n  active themes: ${JSON.stringify(themeInfo.activeTheme)}`,
  );

  for (const theme of themeInfo.themes) {
    if (
      Object.entries(theme.selectedTokenSets).some(
        ([tokenSet, status]) => status === TokenSetStatus.ENABLED && tokenSet === payload.parent,
      )
    ) {
      // Filter themes which contains this token
      {
        const refKey = theme.$figmaVariableReferences?.[payload.name];
        // eslint-disable-next-line no-console
        console.log(
          `[updateVariablesFromPlugin] theme "${theme.group ?? ''}/${theme.name}" (id: ${theme.id})${theme.$figmaIsExtension ? ' [EXTENDED]' : ''}`,
          `\n  set enabled: true`,
          `\n  $figmaVariableReferences["${payload.name}"]: ${refKey ?? 'MISSING → theme skipped'}`,
          `\n  $figmaModeId: ${theme.$figmaModeId ?? 'MISSING → theme skipped'}`,
          `\n  variable found for key: ${refKey ? Boolean(variableMap[refKey]) : 'n/a'}`,
          `\n  theme active: ${Object.values(themeInfo.activeTheme).includes(theme.id)} (inactive → theme skipped)`,
        );
      }
      if (theme.$figmaVariableReferences?.[payload.name] && theme.$figmaModeId) {
        const variable = variableMap[theme?.$figmaVariableReferences?.[payload.name]];
        if (variable && Object.values(themeInfo.activeTheme).includes(theme.id)) {
          if (!metadataUpdateTracker[variable.id]) {
            // Update metadata once per variable
            variable.description = payload.description ?? '';

            const flatScopes = payload.$extensions?.['com.figma.scopes'] as VariableScope[] | undefined;
            const flatCodeSyntax = payload.$extensions?.['com.figma.codeSyntax'] as CodeSyntax | undefined;
            const hiddenFromPublishing = payload.$extensions?.['com.figma.hiddenFromPublishing'] as boolean | undefined;

            if (typeof hiddenFromPublishing === 'boolean') {
              variable.hiddenFromPublishing = hiddenFromPublishing;
            }

            // Update Scopes
            if (flatScopes && Array.isArray(flatScopes)) {
              variable.scopes = normalizeVariableScopes(flatScopes);
            }

            // Update Code Syntax & Purge Removed Platforms
            const newCodeSyntax = flatCodeSyntax || {};
            FIGMA_PLATFORMS.forEach(({ key, figma: figmaPlatform }) => {
              const syntaxValue = getCodeSyntaxValue(newCodeSyntax, key);

              if (syntaxValue !== undefined) {
                const valueToSet = (typeof syntaxValue === 'string') ? syntaxValue.trim() : '';
                if (valueToSet === '') {
                  variable.removeVariableCodeSyntax(figmaPlatform);
                } else {
                  variable.setVariableCodeSyntax(figmaPlatform, valueToSet);
                }
              } else {
                // Platform removed from token -> remove from Figma
                try {
                  variable.removeVariableCodeSyntax(figmaPlatform);
                } catch (e) {
                  // Ignore
                }
              }
            });

            metadataUpdateTracker[variable.id] = true;
          }

          // Fetch collection only when needed for extended-collection parent-mode checks
          const collection = theme.$figmaCollectionId
            ? await figma.variables.getVariableCollectionByIdAsync(theme.$figmaCollectionId)
            : null;

          if (checkCanReferenceVariable(payload)) {
            let referenceTokenName: string = '';
            if (payload.rawValue && payload.rawValue?.toString().startsWith('{')) {
              referenceTokenName = payload.rawValue?.toString().slice(1, payload.rawValue.toString().length - 1);
            } else {
              referenceTokenName = payload.rawValue!.toString().substring(1);
            }
            const referenceVariable = nameToVariableMap[referenceTokenName.split('.').join('/')];
            if (referenceVariable) {
              const newValue: VariableAlias = {
                type: 'VARIABLE_ALIAS',
                id: referenceVariable.id,
              };

              // Extended collections: one shared inherit-vs-override decision
              const { parentModeId } = resolveCollectionContext(collection, theme.$figmaModeId!, theme);
              if (parentModeId) {
                const result = applyChildModeValue(variable, theme.$figmaModeId!, parentModeId, newValue);
                // eslint-disable-next-line no-console
                console.log(
                  `[updateVariablesFromPlugin] ALIAS write "${variable.name}" → "${referenceVariable.name}" on CHILD mode ${theme.$figmaModeId}: ${result.toUpperCase()}`,
                  `\n  parent mode ${parentModeId} value: ${JSON.stringify(variable.valuesByMode[parentModeId])}`,
                );
              } else {
                variable.setValueForMode(theme.$figmaModeId!, newValue);
                // eslint-disable-next-line no-console
                console.log(`[updateVariablesFromPlugin] ALIAS write "${variable.name}" → "${referenceVariable.name}" on mode ${theme.$figmaModeId}: SET`);
              }
            } else {
              // eslint-disable-next-line no-console
              console.log(`[updateVariablesFromPlugin] ALIAS write "${variable.name}": reference target "${referenceTokenName}" has NO matching variable — nothing written`);
            }
          } else {
            const modeId = theme.$figmaModeId!;
            // eslint-disable-next-line no-console
            console.log(`[updateVariablesFromPlugin] RAW write "${variable.name}" on mode ${modeId} (type: ${payload.type}, value: ${payload.value})`);
            switch (payload.type) {
              case TokenTypes.COLOR:
                if (typeof payload.value === 'string') {
                  if (collection) setColorValuesOnVariable(variable, modeId, payload.value, collection);
                  else setColorValuesOnVariable(variable, modeId, payload.value);
                }
                break;
              case TokenTypes.BOOLEAN:
                if (typeof payload.value === 'string') {
                  if (collection) setBooleanValuesOnVariable(variable, modeId, payload.value, collection);
                  else setBooleanValuesOnVariable(variable, modeId, payload.value);
                }
                break;
              case TokenTypes.TEXT:
                if (typeof payload.value === 'string') {
                  if (collection) setStringValuesOnVariable(variable, modeId, payload.value, collection);
                  else setStringValuesOnVariable(variable, modeId, payload.value);
                }
                break;
              case TokenTypes.SIZING:
              case TokenTypes.DIMENSION:
              case TokenTypes.BORDER_RADIUS:
              case TokenTypes.BORDER_WIDTH:
              case TokenTypes.SPACING:
              case TokenTypes.NUMBER:
                if (collection) setNumberValuesOnVariable(variable, modeId, Number(payload.value), collection);
                else setNumberValuesOnVariable(variable, modeId, Number(payload.value));
                break;
              default:
                break;
            }
          }
        }
      }
    }
  }
}
