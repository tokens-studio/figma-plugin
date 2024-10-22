import { getVariablesWithoutZombies } from './getVariablesWithoutZombies';
import * as notifiers from './notifiers';

describe('getVariablesWithoutZombies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(notifiers, 'notifyException').mockImplementation(() => {});
  });

  it('should return variables without zombies', async () => {
    const variables = [
      { id: 'var1', variableCollectionId: 'col1' },
      { id: 'var2', variableCollectionId: 'col2' },
      { id: 'var3', variableCollectionId: 'col3' }, // This variable is not included in the collections
    ];
    const collections = [{ id: 'col1' }, { id: 'col2' }];

    (figma.variables.getLocalVariablesAsync as jest.Mock).mockResolvedValue(variables);
    (figma.variables.getLocalVariableCollectionsAsync as jest.Mock).mockResolvedValue(collections);

    const result = await getVariablesWithoutZombies();

    expect(result).toEqual([
      { id: 'var1', variableCollectionId: 'col1' },
      { id: 'var2', variableCollectionId: 'col2' },
    ]);
  });

  it('should return an empty array if no variables are available', async () => {
    (figma.variables.getLocalVariablesAsync as jest.Mock).mockResolvedValue([]);
    (figma.variables.getLocalVariableCollectionsAsync as jest.Mock).mockResolvedValue([]);

    const result = await getVariablesWithoutZombies();

    expect(result).toEqual([]);
  });

  it('should handle errors and notify exceptions', async () => {
    const errorMessage = 'An error occurred';
    (figma.variables.getLocalVariablesAsync as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const result = await getVariablesWithoutZombies();

    expect(result).toEqual([]);
    expect(notifiers.notifyException).toHaveBeenCalledWith(errorMessage);
  });
});
