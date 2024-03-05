import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AnyTokenList } from '@/types/tokens';
import { SettingsState } from '@/app/store/models/settings';
import updateVariables from './updateVariables';
import { ReferenceVariableType } from './setValuesOnVariable';
import updateVariablesToReference from './updateVariablesToReference';
import createVariableMode from './createVariableMode';
import { notifyUI } from './notifiers';
import { ThemeObject } from '@/types';

export type LocalVariableInfo = {
  collectionId: string;
  modeId: string;
  variableIds: Record<string, string>
};
export default async function createLocalVariablesWithoutModesInPlugin(tokens: Record<string, AnyTokenList>, settings: SettingsState) {
  // Big O (n * m * x): (n: amount of themes, m: amount of variableCollections, x: amount of modes)
  const allVariableCollectionIds: Record<string, LocalVariableInfo> = {};
  let referenceVariableCandidates: ReferenceVariableType[] = [];

  Object.entries(tokens).forEach(([tokenSetKey, tokenList]) => {
    const collection = figma.variables.getLocalVariableCollections().find((vr) => vr.name === tokenSetKey);
    if (collection) {

    } else {
      const newCollection = figma.variables.createVariableCollection(tokenSetKey);
      newCollection.renameMode(newCollection.modes[0].modeId, 'Default mode');
      console.log('newCollection: ', newCollection);
      const allVariableObj = updateVariables({
        collection: newCollection,
        mode: newCollection.modes[0].modeId,
        theme: {} as ThemeObject,
        tokens,
        settings
      });
    }
  });

  // if (figmaVariables.length === 0) {
  //   notifyUI('No variables were created');
  // } else {
  //   notifyUI(`${figma.variables.getLocalVariableCollections().length} collections and ${figmaVariables.length} variables created`);
  // }
  return {
    allVariableCollectionIds,
    totalVariables: 0,
  };
}
