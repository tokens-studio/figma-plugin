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
import { CodeSyntax, FigmaExtensions } from '@/types/tokens';
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

            const figmaExtensions = payload.$extensions?.['com.figma'] as FigmaExtensions;

            // Update Scopes
            if (figmaExtensions?.scopes && Array.isArray(figmaExtensions.scopes)) {
              let newScopes = figmaExtensions.scopes as VariableScope[];
              if (newScopes.includes('ALL_SCOPES' as VariableScope)) {
                newScopes = [];
              }
              if (newScopes.includes('ALL_FILLS' as VariableScope)) {
                newScopes = newScopes.filter((s) => !['FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL'].includes(s));
              }
              if (newScopes.includes('ALL_STROKES' as VariableScope)) {
                newScopes = newScopes.filter((s) => s !== 'STROKE_COLOR');
              }
              variable.scopes = newScopes;
            }

            // Update Code Syntax & Purge Removed Platforms
            const platformsToCheck = [
              { key: 'Web', figma: 'WEB' },
              { key: 'Android', figma: 'ANDROID' },
              { key: 'iOS', figma: 'iOS' },
            ] as const;

            const newCodeSyntax = figmaExtensions?.codeSyntax || {};
            platformsToCheck.forEach(({ key, figma: figmaPlatform }) => {
              const syntaxValue = (newCodeSyntax as CodeSyntax)[key] !== undefined
                ? (newCodeSyntax as CodeSyntax)[key]
                : (newCodeSyntax as CodeSyntax)[key.toLowerCase()];

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
        }
      }
    }
  });
}
