import { getVariablesWithoutZombies } from '@/plugin/getVariablesWithoutZombies';

export async function getVariablesMap() {
  return (await getVariablesWithoutZombies()).reduce<Record<string, Variable>>((acc, curr) => {
    acc[curr.key] = curr;
    return acc;
  }, {});
}
