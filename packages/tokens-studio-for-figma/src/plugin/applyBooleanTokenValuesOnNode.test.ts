import { applyBooleanTokenValuesOnNode } from './applyBooleanTokenValuesOnNode';
import { tryApplyVariableId } from '@/utils/tryApplyVariableId';

jest.mock('@/utils/tryApplyVariableId');

describe('applyBooleanTokenValuesOnNode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (tryApplyVariableId as jest.Mock).mockResolvedValue(false);
  });

  describe('visibility', () => {
    it('should set visibility to true when value is "true"', async () => {
      const mockNode = {
        visible: false,
      } as BaseNode;

      await applyBooleanTokenValuesOnNode(
        mockNode,
        { visibility: 'test-token' },
        { visibility: 'true' },
      );

      expect(mockNode.visible).toBe(true);
    });

    it('should set visibility to false when value is "false"', async () => {
      const mockNode = {
        visible: true,
      } as BaseNode;

      await applyBooleanTokenValuesOnNode(
        mockNode,
        { visibility: 'test-token' },
        { visibility: 'false' },
      );

      expect(mockNode.visible).toBe(false);
    });

    it('should not set visibility when variable is applied', async () => {
      (tryApplyVariableId as jest.Mock).mockResolvedValue(true);
      const mockNode = {
        visible: false,
      } as BaseNode;

      await applyBooleanTokenValuesOnNode(
        mockNode,
        { visibility: 'test-token' },
        { visibility: 'true' },
      );

      expect(mockNode.visible).toBe(false);
    });
  });

  describe('verticalTrim', () => {
    it('should set leadingTrim to CAP_HEIGHT when value is "true"', async () => {
      const mockNode = {
        type: 'TEXT',
        fontName: { family: 'Arial', style: 'Regular' },
        leadingTrim: 'NONE',
      } as unknown as TextNode;

      global.figma = {
        loadFontAsync: jest.fn().mockResolvedValue(undefined),
        mixed: Symbol('mixed'),
      } as any;

      await applyBooleanTokenValuesOnNode(
        mockNode,
        { verticalTrim: 'test-token' },
        { verticalTrim: 'true' },
      );

      expect(mockNode.leadingTrim).toBe('CAP_HEIGHT');
      expect(global.figma.loadFontAsync).toHaveBeenCalledWith({ family: 'Arial', style: 'Regular' });
    });

    it('should set leadingTrim to NONE when value is "false"', async () => {
      const mockNode = {
        type: 'TEXT',
        fontName: { family: 'Arial', style: 'Regular' },
        leadingTrim: 'CAP_HEIGHT',
      } as unknown as TextNode;

      global.figma = {
        loadFontAsync: jest.fn().mockResolvedValue(undefined),
        mixed: Symbol('mixed'),
      } as any;

      await applyBooleanTokenValuesOnNode(
        mockNode,
        { verticalTrim: 'test-token' },
        { verticalTrim: 'false' },
      );

      expect(mockNode.leadingTrim).toBe('NONE');
      expect(global.figma.loadFontAsync).toHaveBeenCalledWith({ family: 'Arial', style: 'Regular' });
    });

    it('should not apply verticalTrim to non-TEXT nodes', async () => {
      const mockNode = {
        type: 'RECTANGLE',
        visible: true,
      } as unknown as BaseNode;

      await applyBooleanTokenValuesOnNode(
        mockNode,
        { verticalTrim: 'test-token' },
        { verticalTrim: 'true' },
      );

      expect('leadingTrim' in mockNode).toBe(false);
    });

    it('should handle font loading errors gracefully', async () => {
      const mockNode = {
        type: 'TEXT',
        fontName: { family: 'Arial', style: 'Regular' },
        leadingTrim: 'NONE',
      } as unknown as TextNode;

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      global.figma = {
        loadFontAsync: jest.fn().mockRejectedValue(new Error('Font load failed')),
        mixed: Symbol('mixed'),
      } as any;

      await applyBooleanTokenValuesOnNode(
        mockNode,
        { verticalTrim: 'test-token' },
        { verticalTrim: 'true' },
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error applying vertical trim:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    it('should skip font loading when fontName is mixed', async () => {
      const mixedSymbol = Symbol('mixed');
      const mockNode = {
        type: 'TEXT',
        fontName: mixedSymbol,
        leadingTrim: 'NONE',
      } as unknown as TextNode;

      global.figma = {
        loadFontAsync: jest.fn().mockResolvedValue(undefined),
        mixed: mixedSymbol,
      } as any;

      await applyBooleanTokenValuesOnNode(
        mockNode,
        { verticalTrim: 'test-token' },
        { verticalTrim: 'true' },
      );

      expect(mockNode.leadingTrim).toBe('CAP_HEIGHT');
      expect(global.figma.loadFontAsync).not.toHaveBeenCalled();
    });

    it('should not apply verticalTrim when variable is applied', async () => {
      (tryApplyVariableId as jest.Mock).mockResolvedValue(true);
      const mockNode = {
        type: 'TEXT',
        fontName: { family: 'Arial', style: 'Regular' },
        leadingTrim: 'NONE',
      } as unknown as TextNode;

      global.figma = {
        loadFontAsync: jest.fn().mockResolvedValue(undefined),
        mixed: Symbol('mixed'),
      } as any;

      await applyBooleanTokenValuesOnNode(
        mockNode,
        { verticalTrim: 'test-token' },
        { verticalTrim: 'true' },
      );

      expect(mockNode.leadingTrim).toBe('NONE');
      expect(global.figma.loadFontAsync).not.toHaveBeenCalled();

      // Reset mock for other tests
      (tryApplyVariableId as jest.Mock).mockResolvedValue(false);
    });
  });

  describe('combined properties', () => {
    it('should handle both visibility and verticalTrim', async () => {
      const mockNode = {
        type: 'TEXT',
        visible: false,
        fontName: { family: 'Arial', style: 'Regular' },
        leadingTrim: 'NONE',
      } as unknown as TextNode;

      global.figma = {
        loadFontAsync: jest.fn().mockResolvedValue(undefined),
        mixed: Symbol('mixed'),
      } as any;

      await applyBooleanTokenValuesOnNode(
        mockNode,
        { visibility: 'visibility-token', verticalTrim: 'trim-token' },
        { visibility: 'true', verticalTrim: 'true' },
      );

      expect(mockNode.visible).toBe(true);
      expect(mockNode.leadingTrim).toBe('CAP_HEIGHT');
    });
  });
});
