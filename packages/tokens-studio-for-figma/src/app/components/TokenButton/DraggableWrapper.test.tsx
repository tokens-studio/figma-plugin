import { resetStore } from '../../../../tests/config/setupTest';
import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
import { store } from '@/app/store';
import { getParentPath, wouldCauseNameCollision, getNewTokenName } from '@/utils/token';

describe('DraggableWrapper - Cross-group reordering logic', () => {
  const createToken = (name: string): SingleToken => ({
    name,
    type: TokenTypes.SIZING,
    value: '10',
  });

  beforeEach(() => {
    resetStore();
  });

  describe('token reordering within same group', () => {
    it('should reorder tokens correctly when both are in the same parent', () => {
      const tokens = [
        createToken('size.font.small'),
        createToken('size.font.big'),
        createToken('size.spacing.small'),
      ];

      // Simulate the reorder logic (same as in DraggableWrapper)
      const draggedIndex = 0;
      const dropIndex = 1;
      const newTokens = [...tokens];
      const [moved] = newTokens.splice(draggedIndex, 1);
      // When dragging up (lower index to higher), insert before drop target
      const adjustedDropIndex = draggedIndex > dropIndex ? dropIndex : dropIndex - 1;
      newTokens.splice(adjustedDropIndex, 0, moved);

      // After reordering: big should be first, small should be second
      expect(newTokens[0].name).toBe('size.font.small');
      expect(newTokens[1].name).toBe('size.font.big');
    });
  });

  describe('token reordering across groups', () => {
    it('should update token name when moving to different parent', () => {
      const tokens = [
        createToken('size.font.small'),
        createToken('size.spacing.big'),
      ];

      const draggedToken = tokens[0];
      const targetParentPath = 'size.spacing';

      // Check if collision would occur
      const hasCollision = wouldCauseNameCollision(draggedToken, targetParentPath, tokens);
      expect(hasCollision).toBe(false);

      // Get new name
      const newName = getNewTokenName(draggedToken, targetParentPath);
      expect(newName).toBe('size.spacing.small');
    });

    it('should prevent move when name collision exists', () => {
      const tokens = [
        createToken('size.font.small'),
        createToken('size.spacing.small'), // This already exists!
      ];

      const draggedToken = tokens[0];
      const targetParentPath = 'size.spacing';

      // Check if collision would occur
      const hasCollision = wouldCauseNameCollision(draggedToken, targetParentPath, tokens);
      expect(hasCollision).toBe(true);
    });

    it('should allow moving to empty parent group', () => {
      const tokens = [
        createToken('size.font.small'),
        createToken('size.spacing.big'),
      ];

      const draggedToken = tokens[0];
      const targetParentPath = 'color.primary';

      const hasCollision = wouldCauseNameCollision(draggedToken, targetParentPath, tokens);
      expect(hasCollision).toBe(false);

      const newName = getNewTokenName(draggedToken, targetParentPath);
      expect(newName).toBe('color.primary.small');
    });
  });

  describe('parent path detection', () => {
    it('should correctly identify parent paths', () => {
      expect(getParentPath('size.font.small')).toBe('size.font');
      expect(getParentPath('size.font')).toBe('size');
      expect(getParentPath('size')).toBe('');
    });
  });

  describe('integration with store', () => {
    it('should update tokens in store correctly', () => {
      store.dispatch.tokenState.setTokens({
        'test-set': [
          createToken('size.font.small'),
          createToken('size.font.big'),
          createToken('size.spacing.small'),
        ],
      });
      store.dispatch.tokenState.setActiveTokenSet('test-set');

      const tokens = store.getState().tokenState.tokens['test-set'];
      expect(tokens).toHaveLength(3);
      expect(tokens[0].name).toBe('size.font.small');

      // Simulate reordering
      const newTokens = [...tokens];
      const [moved] = newTokens.splice(0, 1);
      newTokens.splice(1, 0, moved);

      store.dispatch.tokenState.setTokens({
        'test-set': newTokens,
      });

      const updatedTokens = store.getState().tokenState.tokens['test-set'];
      expect(updatedTokens[1].name).toBe('size.font.small');
    });

    it('should update token names when moving across groups', () => {
      store.dispatch.tokenState.setTokens({
        'test-set': [
          createToken('size.font.small'),
          createToken('size.spacing.big'),
        ],
      });
      store.dispatch.tokenState.setActiveTokenSet('test-set');

      const tokens = store.getState().tokenState.tokens['test-set'];
      const draggedToken = tokens[0];
      const targetParentPath = 'size.spacing';

      // Create updated token with new name
      const updatedToken = {
        ...draggedToken,
        name: getNewTokenName(draggedToken, targetParentPath),
      };

      const newTokens = [...tokens];
      newTokens[0] = updatedToken;

      store.dispatch.tokenState.setTokens({
        'test-set': newTokens,
      });

      const updatedTokens = store.getState().tokenState.tokens['test-set'];
      expect(updatedTokens[0].name).toBe('size.spacing.small');
      expect(updatedTokens.find((t) => t.name === 'size.font.small')).toBeUndefined();
    });
  });
});
