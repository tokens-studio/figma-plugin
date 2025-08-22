import { applyTextCharacterValuesOnNode } from '../applyTextCharacterValuesOnNode';

// Mock the formatValueForDisplay function by extracting it from the module
// Since it's a private function, we'll test it indirectly through the public function
// or we can test the formatting behavior through the actual applyTextCharacterValuesOnNode calls

describe('applyTextCharacterValuesOnNode', () => {
  // Mock Figma node
  const mockNode = {
    name: '__tokenValue',
    fontName: { family: 'Inter', style: 'Regular' },
    characters: '',
    setSharedPluginData: jest.fn(),
  } as any;

  // Mock data
  const mockData = {
    tokenValue: 'test-token',
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNode.characters = '';
  });

  describe('formatValueForDisplay integration', () => {
    it('should format primitive values correctly', async () => {
      const values = {
        tokenValue: 'simple string',
      };

      await applyTextCharacterValuesOnNode(mockNode, mockData, values);

      expect(mockNode.characters).toBe('simple string');
    });

    it('should format simple objects correctly', async () => {
      const values = {
        tokenValue: {
          width: 32,
          height: 32,
        },
      };

      await applyTextCharacterValuesOnNode(mockNode, mockData, values);

      expect(mockNode.characters).toBe('width: 32\nheight: 32');
    });

    it('should format nested objects correctly', async () => {
      const values = {
        tokenValue: {
          shadow: {
            x: 0,
            y: 4,
            blur: 8,
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
      };

      await applyTextCharacterValuesOnNode(mockNode, mockData, values);

      expect(mockNode.characters).toBe('shadow: x: 0\ny: 4\nblur: 8\ncolor: rgba(0, 0, 0, 0.1)');
    });

    it('should format arrays correctly', async () => {
      const values = {
        tokenValue: [
          {
            x: 0,
            y: 2,
            blur: 4,
            color: 'rgba(0, 0, 0, 0.1)',
          },
          {
            x: 0,
            y: 4,
            blur: 8,
            color: 'rgba(0, 0, 0, 0.15)',
          },
        ],
      };

      await applyTextCharacterValuesOnNode(mockNode, mockData, values);

      expect(mockNode.characters).toBe(
        'x: 0\ny: 2\nblur: 4\ncolor: rgba(0, 0, 0, 0.1)\n\nx: 0\ny: 4\nblur: 8\ncolor: rgba(0, 0, 0, 0.15)',
      );
    });

    it('should format empty arrays correctly', async () => {
      const values = {
        tokenValue: [],
      };

      await applyTextCharacterValuesOnNode(mockNode, mockData, values);

      expect(mockNode.characters).toBe('');
    });

    it('should format empty objects correctly', async () => {
      const values = {
        tokenValue: {},
      };

      await applyTextCharacterValuesOnNode(mockNode, mockData, values);

      expect(mockNode.characters).toBe('');
    });

    it('should handle mixed array content correctly', async () => {
      const values = {
        tokenValue: ['simple string', { x: 0, y: 2 }, 42, { color: 'red', size: 'large' }],
      };

      await applyTextCharacterValuesOnNode(mockNode, mockData, values);

      expect(mockNode.characters).toBe('simple string\n\nx: 0\ny: 2\n\n42\n\ncolor: red\nsize: large');
    });

    it('should handle null and undefined gracefully', async () => {
      const values = {
        tokenValue: null,
      };

      await applyTextCharacterValuesOnNode(mockNode, mockData, values);

      expect(mockNode.characters).toBe('null');
    });

    it('should handle complex nested structures correctly', async () => {
      const values = {
        tokenValue: {
          shadows: [
            {
              x: 0,
              y: 2,
              blur: 4,
              color: 'rgba(0, 0, 0, 0.1)',
            },
            {
              x: 0,
              y: 4,
              blur: 8,
              color: 'rgba(0, 0, 0, 0.15)',
            },
          ],
          colors: {
            primary: '#007AFF',
            secondary: '#5856D6',
          },
          spacing: [8, 16, 24, 32],
        },
      };

      await applyTextCharacterValuesOnNode(mockNode, mockData, values);

      expect(mockNode.characters).toBe(
        'shadows: x: 0\ny: 2\nblur: 4\ncolor: rgba(0, 0, 0, 0.1)\n\nx: 0\ny: 4\nblur: 8\ncolor: rgba(0, 0, 0, 0.15)\n'
          + 'colors: primary: #007AFF\nsecondary: #5856D6\n'
          + 'spacing: 8\n\n16\n\n24\n\n32',
      );
    });
  });

  describe('other value types', () => {
    it('should handle value property correctly', async () => {
      const values = {
        value: { fontSize: 16, fontFamily: 'Inter' },
      };

      await applyTextCharacterValuesOnNode(mockNode, mockData, values);

      expect(mockNode.characters).toBe('fontSize: 16\nfontFamily: Inter');
    });

    it('should handle tokenName property correctly', async () => {
      const values = {
        tokenName: 'colors.primary',
      };

      await applyTextCharacterValuesOnNode(mockNode, mockData, values);

      expect(mockNode.characters).toBe('colors.primary');
    });

    it('should handle description property correctly', async () => {
      const values = {
        description: 'Primary brand color',
      };

      await applyTextCharacterValuesOnNode(mockNode, mockData, values);

      expect(mockNode.characters).toBe('Primary brand color');
    });
  });
});
