import { StyleToCreateToken } from '@/types/payloads';

export function findBoundVariable(
  style: TextStyle,
  propertyKey: string,
  localVariables: Variable[],
  compareValue: (el: StyleToCreateToken) => boolean,
): (el: StyleToCreateToken) => boolean {
  return (el: StyleToCreateToken) => {
    try {
      if (style.boundVariables?.[propertyKey]?.id) {
        const boundVar = localVariables.find((v) => v.id === style.boundVariables?.[propertyKey]?.id);
        if (boundVar) {
          const normalizedName = boundVar.name.replace(/\//g, '.');
          return el.name === normalizedName;
        }
      }
      return compareValue(el);
    } catch (e) {
      console.log('Error finding bound variable, using raw value instead:', e);
      return compareValue(el);
    }
  };
}
