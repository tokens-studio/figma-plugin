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
          if (checkCanReferenceVariable(payload)) {
            // If new token reference to another token, we update the variable to reference to another variable
            let referenceTokenName: string = '';
            if (payload.rawValue && payload.rawValue?.toString().startsWith('{')) {
              referenceTokenName = payload.rawValue?.toString().slice(1, payload.rawValue.toString().length - 1);
            } else {
              referenceTokenName = payload.rawValue!.toString().substring(1);
            }
            const referenceVariable = nameToVariableMap[referenceTokenName.split('.').join('/')];
            if (referenceVariable) {
              variable.setValueForMode(theme.$figmaModeId, {
                type: 'VARIABLE_ALIAS',
                id: referenceVariable.id,
              });
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

          // Update variable metadata (scopes and code syntax) if present in token $extensions
          const figmaExtensions = payload.$extensions?.['com.figma'];
          console.log('[UPDATE-VAR-PLUGIN] Checking metadata update for variable:', variable?.name, 'figmaExtensions:', figmaExtensions);
          if (figmaExtensions && variable) {
            console.log('[UPDATE-VAR-PLUGIN] Updating metadata for variable:', variable.name);
            // Update scopes
            if (figmaExtensions.scopes && Array.isArray(figmaExtensions.scopes)) {
              let newScopes = figmaExtensions.scopes as VariableScope[];
              // ALL_SCOPES normalization: Figma uses an empty array [] to represent all/unrestricted scopes
              if (newScopes.includes('ALL_SCOPES' as VariableScope)) {
                newScopes = [];
              }
              // Figma constraint normalization
              if (newScopes.includes('ALL_FILLS' as VariableScope)) {
                newScopes = newScopes.filter((s) => !['FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL'].includes(s));
              }
              if (newScopes.includes('ALL_STROKES' as VariableScope)) {
                newScopes = newScopes.filter((s) => s !== 'STROKE_COLOR');
              }
              console.log('[UPDATE-VAR-PLUGIN] Setting scopes to:', newScopes);
              variable.scopes = newScopes;
            }

            // Update code syntax
            if (figmaExtensions.codeSyntax && typeof figmaExtensions.codeSyntax === 'object') {
              console.log('[UPDATE-VAR-PLUGIN] Updating code syntax, current:', (variable as any).codeSyntax, 'new:', figmaExtensions.codeSyntax);
              const platformsToCheck = [
                { key: 'Web', figma: 'WEB' },
                { key: 'Android', figma: 'ANDROID' },
                { key: 'iOS', figma: 'iOS' },
              ] as const;

              platformsToCheck.forEach(({ key, figma: figmaPlatform }) => {
                const hasKey = Object.prototype.hasOwnProperty.call(figmaExtensions.codeSyntax, key);
                const hasKeyLowercase = Object.prototype.hasOwnProperty.call(figmaExtensions.codeSyntax, key.toLowerCase());
                const keyExists = hasKey || hasKeyLowercase;

                const syntaxValue = hasKey
                  ? (figmaExtensions.codeSyntax as any)[key]
                  : (figmaExtensions.codeSyntax as any)[key.toLowerCase()];

                const currentSyntaxValue = (variable as any).codeSyntax?.[figmaPlatform] || '';
                const valueToSet = (typeof syntaxValue === 'string') ? syntaxValue.trim() : '';

                console.log(`[UPDATE-VAR-PLUGIN] ${key}: keyExists=${keyExists}, current="${currentSyntaxValue}", new="${valueToSet}"`);

                if (keyExists && syntaxValue !== undefined) {
                  // Platform is explicitly provided in token
                  if (currentSyntaxValue !== valueToSet) {
                    try {
                      if (valueToSet === '') {
                        if (currentSyntaxValue) {
                          console.log(`[UPDATE-VAR-PLUGIN] Removing ${key} code syntax`);
                          variable.removeVariableCodeSyntax(figmaPlatform);
                        }
                      } else {
                        console.log(`[UPDATE-VAR-PLUGIN] Setting ${key} code syntax to "${valueToSet}"`);
                        variable.setVariableCodeSyntax(figmaPlatform, valueToSet);
                        console.log(`[UPDATE-VAR-PLUGIN] ${key} code syntax set successfully`);
                      }
                    } catch (apiError) {
                      console.error(`Failed to set code syntax for ${key}:`, apiError);
                    }
                  } else {
                    console.log(`[UPDATE-VAR-PLUGIN] ${key} unchanged (both are "${valueToSet}")`);
                  }
                } else if (currentSyntaxValue) {
                  // Platform is missing from token, remove orphaned code syntax
                  try {
                    console.log(`[UPDATE-VAR-PLUGIN] Removing orphan ${key} code syntax`);
                    variable.removeVariableCodeSyntax(figmaPlatform);
                  } catch (apiError) {
                    const errorMsg = String(apiError);
                    if (!errorMsg.includes('Code syntax field not found')) {
                      console.error(`Failed to remove orphan code syntax for ${key}:`, apiError);
                    }
                  }
                }
              });
            }
          }
        }
      }
    }
  });
}
