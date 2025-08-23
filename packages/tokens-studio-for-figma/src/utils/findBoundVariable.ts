import { StyleToCreateToken } from '@/types/payloads';

export function findBoundVariable(
  style: TextStyle,
  propertyKey: string,
  localVariables: Variable[] | Map<string, Variable>,
  compareValue: (el: StyleToCreateToken) => boolean,
): (el: StyleToCreateToken) => boolean {
  return (el: StyleToCreateToken) => {
    if (style.boundVariables?.[propertyKey]?.id) {
      const boundVar = localVariables instanceof Map
        ? localVariables.get(style.boundVariables[propertyKey]?.id!)
        : localVariables.find((v) => v.id === style.boundVariables?.[propertyKey]?.id);

      if (boundVar) {
        const normalizedName = boundVar.name.replace(/\//g, '.');
        return el.name === normalizedName;
      }
    }
    return compareValue(el);
  };
}
