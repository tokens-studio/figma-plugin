import { clone, figmaRGBToHex } from '@figma-plugin/helpers';
import { Properties } from '@/constants/Properties';
import { SingleColorToken } from '@/types/tokens';
import convertVariableTypeToProperty from '@/utils/convertVariableTypeToProperty';

export type SelectionVariable = {
  name: string;
  type: Properties;
  value?: string;
};

export default function getAppliedVariablesFromNode(node: BaseNode): SelectionVariable[] {
  const localVariables: SelectionVariable[] = [];
  if (node.type !== 'DOCUMENT' && node.type !== 'PAGE' && node.boundVariables) {
    Object.entries(node.boundVariables).forEach(([key, value]) => {
      if ('fills' in node && key === 'fills' && Array.isArray(value)) {
        const variableId = node.boundVariables?.fills?.[0].id;
        if (variableId) {
          const variable = figma.variables.getVariableById(variableId);
          if (variable) {
            const paint = clone(node.fills);
            let variableObject: SingleColorToken | null = {} as SingleColorToken;
            if (paint[0].type === 'SOLID') {
              const { r, g, b } = paint[0].color;
              const a = paint[0].opacity;
              variableObject.value = figmaRGBToHex({
                r,
                g,
                b,
                a,
              });
            } else {
              variableObject = null;
            }
            localVariables.push({
              name: variable?.name.split('/').join('.'),
              type: Properties.fill,
              value: typeof variableObject?.value === 'string' ? variableObject.value : undefined,
            });
          }
        }
      }
      if (key === 'strokes' && Array.isArray(value)) {
        const variableId = node.boundVariables?.strokes?.[0].id;

        if (variableId) {
          const variable = figma.variables.getVariableById(variableId);
          if (variable && 'strokes' in node && typeof node.strokes !== 'undefined') {
            const paint = clone(node.strokes);
            let variableObject: SingleColorToken | null = {} as SingleColorToken;
            if (paint[0].type === 'SOLID') {
              const { r, g, b } = paint[0].color;
              const a = paint[0].opacity;
              variableObject.value = figmaRGBToHex({
                r,
                g,
                b,
                a,
              });
            } else {
              variableObject = null;
            }
            localVariables.push({
              name: variable?.name.split('/').join('.'),
              type: Properties.borderColor,
              value: typeof variableObject?.value === 'string' ? variableObject.value : undefined,
            });
          }
        }
      }
      if (!Array.isArray(value) && key in node) {
        const variableId = value.id;
        if (variableId && typeof variableId === 'string') {
          const variable = figma.variables.getVariableById(variableId);
          if (variable) {
            localVariables.push({
              name: variable?.name.split('/').join('.'),
              type: convertVariableTypeToProperty(key),
              // @TODO:: Rightnow, We get value from node directly. We Should investigate whether we can get value from variable by current mode. Rightnow, seems like that there is noway to know the current mode
              ...(key in node && { value: String(node[key as keyof typeof node]) }),
            });
          }
        }
      }
    });
  }

  return localVariables;
}
