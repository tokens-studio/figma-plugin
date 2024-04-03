import { AnyTokenList } from '@/types/tokens';
import { SettingsState } from '@/app/store/models/settings';
import updateVariables from './updateVariables';
import { ReferenceVariableType } from './setValuesOnVariable';
import updateVariablesToReference from './updateVariablesToReference';
import createVariableMode from './createVariableMode';
import { notifyUI } from './notifiers';
import { ThemeObject } from '@/types';
import { ExportTokenSet } from '@/types/ExportTokenSet';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

export type LocalVariableInfo = {
  collectionId: string;
  modeId: string;
  variableIds: Record<string, string>
};
export default async function createLocalVariablesWithoutModesInPlugin(tokens: Record<string, AnyTokenList>, settings: SettingsState, selectedSets: ExportTokenSet[]) {
  console.log('creating local variables in plugin without modes');
  // Big O (n * m * x): (n: amount of themes, m: amount of variableCollections, x: amount of modes)
  const allVariableCollectionIds: Record<string, LocalVariableInfo> = {};
  let referenceVariableCandidates: ReferenceVariableType[] = [];
  const initialVariablesCount = figma.variables.getLocalVariables().length;
  const initialVariableCollectionsCount = figma.variables.getLocalVariableCollections().length;
  const checkSetting = !settings.variablesBoolean && !settings.variablesColor && !settings.variablesNumber && !settings.variablesString;
  if (!checkSetting) {
    const theme = selectedSets.reduce((acc: ThemeObject, curr: ExportTokenSet) => {
      acc.selectedTokenSets = {
        ...acc.selectedTokenSets,
        [curr.set]: curr.status,
      };
      return acc;
    }, {} as ThemeObject);
    selectedSets.forEach(async (set: ExportTokenSet, index) => {
      if (set.status === TokenSetStatus.ENABLED) {
        const collection = figma.variables.getLocalVariableCollections().find((vr) => vr.name === set.set);
        if (collection) {
          const mode = collection.modes.find((m) => m.name === set.set);
          const modeId: string = mode?.modeId ?? createVariableMode(collection, set.set);
          if (modeId) {
            const allVariableObj = await updateVariables({
              collection, mode: modeId, theme, tokens, settings,
            });
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
          const newCollection = figma.variables.createVariableCollection(set.set);
          newCollection.renameMode(newCollection.modes[0].modeId, set.set);
          const allVariableObj = await updateVariables({
            collection: newCollection, mode: newCollection.modes[0].modeId, theme, tokens, settings,
          });
          allVariableCollectionIds[index] = {
            collectionId: newCollection.id,
            modeId: newCollection.modes[0].modeId,
            variableIds: allVariableObj.variableIds,
          };
          referenceVariableCandidates = referenceVariableCandidates.concat(allVariableObj.referenceVariableCandidate);
        }
      }
    });
  }
  const figmaVariables = figma.variables.getLocalVariables();
  updateVariablesToReference(figmaVariables, referenceVariableCandidates);
  if (figmaVariables.length === 0) {
    notifyUI('No variables were created');
  } else {
    notifyUI(`${figma.variables.getLocalVariableCollections().length - initialVariableCollectionsCount} collections and ${figma.variables.getLocalVariables().length - initialVariablesCount} variables created`);
  }
  return {
    allVariableCollectionIds,
    totalVariables: figmaVariables.length,
  };
}
