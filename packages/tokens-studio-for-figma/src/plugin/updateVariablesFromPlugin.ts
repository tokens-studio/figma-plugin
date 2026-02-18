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

  themeInfo.themes.forEach((theme) => {
    if (
      Object.entries(theme.selectedTokenSets).some(
        ([tokenSet, status]) => status === TokenSetStatus.ENABLED && tokenSet === payload.parent,
      )
    ) {
      // Filter themes which contains this token
      if (theme.$figmaVariableReferences?.[payload.name] && theme.$figmaModeId) {
        const variable = variableMap[theme?.$figmaVariableReferences?.[payload.name]];
        if (Object.values(themeInfo.activeTheme).includes(theme.id)) {
          if (variable && !metadataUpdateTracker[variable.id]) {
            // Update metadata once per variable
            variable.description = payload.description ?? '';

            const flatScopes = payload.$extensions?.['com.figma.scopes'] as VariableScope[] | undefined;
            const flatCodeSyntax = payload.$extensions?.['com.figma.codeSyntax'] as CodeSyntax | undefined;

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

          if (checkCanReferenceVariable(payload)) {
            // If new token reference to another token, we update the variable to reference to another variable
            // Extract reference token name from rawValue
            // rawValue should be in the format "{token.name}" for alias references
            let referenceTokenName: string = '';
            const rawValueStr = payload.rawValue?.toString() || '';
            
            if (rawValueStr.startsWith('{') && rawValueStr.endsWith('}')) {
              // Standard case: "{token.name}" -> "token.name"
              referenceTokenName = rawValueStr.slice(1, -1);
            } else if (rawValueStr.startsWith('{')) {
              // Edge case: "{token.name" (missing closing brace)
              referenceTokenName = rawValueStr.slice(1);
            } else {
              // Fallback: rawValue doesn't have braces (shouldn't normally happen)
              referenceTokenName = rawValueStr;
            }
            
            if (referenceTokenName) {
              const referenceVariable = nameToVariableMap[referenceTokenName.split('.').join('/')];
              if (referenceVariable) {
                variable.setValueForMode(theme.$figmaModeId, {
                  type: 'VARIABLE_ALIAS',
                  id: referenceVariable.id,
                });
              }
            }
          } else {
            switch (payload.type) {
              case TokenTypes.COLOR:
                if (typeof payload.value === 'string') {
                  setColorValuesOnVariable(variable, theme.$figmaModeId, payload.value);
                }
                break;
              case TokenTypes.BOOLEAN:
                if (typeof payload.value === 'string') {
                  setBooleanValuesOnVariable(variable, theme.$figmaModeId, payload.value);
                }
                break;
              case TokenTypes.TEXT:
                if (typeof payload.value === 'string') {
                  setStringValuesOnVariable(variable, theme.$figmaModeId, payload.value);
                }
                break;
              case TokenTypes.SIZING:
              case TokenTypes.DIMENSION:
              case TokenTypes.BORDER_RADIUS:
              case TokenTypes.BORDER_WIDTH:
              case TokenTypes.SPACING:
              case TokenTypes.NUMBER:
                setNumberValuesOnVariable(variable, theme.$figmaModeId, Number(payload.value));
                break;
              default:
                break;
            }
          }
        }
      }
    }
  });
}
