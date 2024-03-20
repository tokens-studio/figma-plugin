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
import { TokenSetStatus } from '@/constants/TokenSetStatus';

export type LocalVariableInfo = {
  collectionId: string;
  modeId: string;
  variableIds: Record<string, string>
};
export default async function createLocalVariablesWithoutModesInPlugin(tokens: Record<string, AnyTokenList>, settings: SettingsState, selectedSets: string[]) {
  // Big O (n * m * x): (n: amount of themes, m: amount of variableCollections, x: amount of modes)
  const allVariableCollectionIds: Record<string, LocalVariableInfo> = {};
  let referenceVariableCandidates: ReferenceVariableType[] = [];
  selectedSets.forEach((set: string, index) => {
    const collection = figma.variables.getLocalVariableCollections().find((vr) => vr.name === set);
    if (collection) {
      const mode = collection.modes.find((m) => m.name === set);
      console.log('mode: ', mode);
      const modeId: string = mode?.modeId ?? createVariableMode(collection, set);
      console.log('modeId: ', modeId);
      if (modeId) {
        const theme = {
          selectedTokenSets: {
            [set]: TokenSetStatus.ENABLED,
          }
        } as ThemeObject;
        const allVariableObj = updateVariables({
          collection, mode: modeId, theme, tokens, settings,
        });
        console.log('allVariableObj in second', allVariableObj);
        if (Object.keys(allVariableObj.variableIds).length > 0) {
          allVariableCollectionIds[index] = {
            collectionId: collection.id,
            modeId,
            variableIds: allVariableObj.variableIds,
          };
          referenceVariableCandidates = referenceVariableCandidates.concat(allVariableObj.referenceVariableCandidate);
        }
      }
    } else {
      const newCollection = figma.variables.createVariableCollection(set);
      newCollection.renameMode(newCollection.modes[0].modeId, set);
      const theme = {
        selectedTokenSets: {
          [set]: TokenSetStatus.ENABLED,
        }
      } as ThemeObject;
      const allVariableObj = updateVariables({
        collection: newCollection, mode: newCollection.modes[0].modeId, theme, tokens, settings
      });
      console.log('allVariableObj in first', allVariableObj);
      allVariableCollectionIds[index] = {
        collectionId: newCollection.id,
        modeId: newCollection.modes[0].modeId,
        variableIds: allVariableObj.variableIds,
      };
    }
  });
  const figmaVariables = figma.variables.getLocalVariables();
  updateVariablesToReference(figmaVariables, referenceVariableCandidates);
  if (figmaVariables.length === 0) {
    notifyUI('No variables were created');
  } else {
    notifyUI(`${figma.variables.getLocalVariableCollections().length} collections and ${figmaVariables.length} variables created`);
  }
  return {
    allVariableCollectionIds,
    totalVariables: figmaVariables.length,
  };
}
