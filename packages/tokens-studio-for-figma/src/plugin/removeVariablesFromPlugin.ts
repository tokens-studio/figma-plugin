import { getVariablesMap } from '@/utils/getVariablesMap';

export default async function removeVariablesFromPlugin(variableKeys: string[]) {
  const variableMap = await getVariablesMap();
  const removedVariableIds: string[] = [];

  variableKeys.forEach((key) => {
    const variable = variableMap[key];
    if (variable) {
      removedVariableIds.push(variable.key);
      variable.remove();
    }
  });

  return removedVariableIds;
}
