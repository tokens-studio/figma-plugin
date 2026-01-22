import {
  getParentVariableCollectionId,
  isExtendedCollection,
  getCollectionVariableIds,
} from './extendedCollectionHelpers';

describe('extendedCollectionHelpers', () => {
  describe('getParentVariableCollectionId', () => {
    it('returns parent collection ID when present as string', () => {
      const collection = {
        parentVariableCollectionId: 'VariableCollectionId:123:456',
      } as VariableCollection;

      expect(getParentVariableCollectionId(collection)).toBe('VariableCollectionId:123:456');
    });

    it('returns undefined when parentVariableCollectionId is not present', () => {
      const collection = {} as VariableCollection;

      expect(getParentVariableCollectionId(collection)).toBeUndefined();
    });

    it('returns undefined when parentVariableCollectionId is null', () => {
      const collection = {
        parentVariableCollectionId: null,
      } as unknown as VariableCollection;

      expect(getParentVariableCollectionId(collection)).toBeUndefined();
    });

    it('returns undefined when parentVariableCollectionId is undefined', () => {
      const collection = {
        parentVariableCollectionId: undefined,
      } as VariableCollection;

      expect(getParentVariableCollectionId(collection)).toBeUndefined();
    });

    it('handles parentVariableCollectionId on prototype', () => {
      // Simulate prototype-based property
      const proto = {
        parentVariableCollectionId: 'VariableCollectionId:proto:123',
      };
      const collection = Object.create(proto) as VariableCollection;

      expect(getParentVariableCollectionId(collection)).toBe('VariableCollectionId:proto:123');
    });
  });

  describe('isExtendedCollection', () => {
    it('returns true when collection has valid parent ID', () => {
      const collection = {
        parentVariableCollectionId: 'VariableCollectionId:123:456',
      } as VariableCollection;

      expect(isExtendedCollection(collection)).toBe(true);
    });

    it('returns false when collection has no parent ID', () => {
      const collection = {} as VariableCollection;

      expect(isExtendedCollection(collection)).toBe(false);
    });

    it('returns false when parent ID is null', () => {
      const collection = {
        parentVariableCollectionId: null,
      } as unknown as VariableCollection;

      expect(isExtendedCollection(collection)).toBe(false);
    });

    it('returns false when parent ID is empty string', () => {
      const collection = {
        parentVariableCollectionId: '',
      } as VariableCollection;

      expect(isExtendedCollection(collection)).toBe(false);
    });
  });

  describe('getCollectionVariableIds', () => {
    it('returns variable IDs array when present', () => {
      const collection = {
        variableIds: ['VariableID:1', 'VariableID:2', 'VariableID:3'],
      } as VariableCollection;

      expect(getCollectionVariableIds(collection)).toEqual([
        'VariableID:1',
        'VariableID:2',
        'VariableID:3',
      ]);
    });

    it('returns empty array when variableIds is not present', () => {
      const collection = {} as VariableCollection;

      expect(getCollectionVariableIds(collection)).toEqual([]);
    });

    it('returns empty array when variableIds is not an array', () => {
      const collection = {
        variableIds: 'not-an-array',
      } as unknown as VariableCollection;

      expect(getCollectionVariableIds(collection)).toEqual([]);
    });

    it('handles variableIds as a getter on prototype', () => {
      // Simulate getter on prototype
      const proto = {
        get variableIds() {
          return ['VariableID:proto:1', 'VariableID:proto:2'];
        },
      };
      const collection = Object.create(proto) as VariableCollection;

      expect(getCollectionVariableIds(collection)).toEqual([
        'VariableID:proto:1',
        'VariableID:proto:2',
      ]);
    });

    it('returns empty array for inherited variables from extended collection', () => {
      // Extended collections include inherited variables in variableIds
      const collection = {
        variableIds: [],
      } as VariableCollection;

      expect(getCollectionVariableIds(collection)).toEqual([]);
    });
  });
});
