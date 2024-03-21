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
  let createdVariablesCount: number = 0;
  selectedSets.forEach((set: string, index) => {
    const collection = figma.variables.getLocalVariableCollections().find((vr) => vr.name === set);
    if (collection) {
      const mode = collection.modes.find((m) => m.name === set);
      const modeId: string = mode?.modeId ?? createVariableMode(collection, set);
      if (modeId) {
        const theme = {
          selectedTokenSets: {
            [set]: TokenSetStatus.ENABLED
          }
        } as ThemeObject;
        const allVariableObj = updateVariables({
          collection, mode: modeId, theme, tokens, settings
        });
        if (Object.keys(allVariableObj.variableIds).length > 0) {
          allVariableCollectionIds[index] = {
            collectionId: collection.id,
            modeId,
            variableIds: allVariableObj.variableIds,
          };
          createdVariablesCount += Object.keys(allVariableObj.variableIds).length;
          referenceVariableCandidates = referenceVariableCandidates.concat(allVariableObj.referenceVariableCandidate);
        }
      }
    } else {
      const newCollection = figma.variables.createVariableCollection(set);
      newCollection.renameMode(newCollection.modes[0].modeId, set);
      const theme = {
        selectedTokenSets: {
          [set]: TokenSetStatus.ENABLED
        }
      } as ThemeObject;
      const allVariableObj = updateVariables({
        collection: newCollection, mode: newCollection.modes[0].modeId, theme, tokens, settings
      });
      allVariableCollectionIds[index] = {
        collectionId: newCollection.id,
        modeId: newCollection.modes[0].modeId,
        variableIds: allVariableObj.variableIds,
      };
      createdVariablesCount += Object.keys(allVariableObj.variableIds).length;
      referenceVariableCandidates = referenceVariableCandidates.concat(allVariableObj.referenceVariableCandidate);
    }
  });
  const figmaVariables = figma.variables.getLocalVariables();
  updateVariablesToReference(figmaVariables, referenceVariableCandidates);
  if (figmaVariables.length === 0) {
    notifyUI('No variables were created');
  } else {
    notifyUI(`${selectedSets.length} collections and ${createdVariablesCount} variables created`);
  }
  return {
    allVariableCollectionIds,
    totalVariables: figmaVariables.length,
  };
}
