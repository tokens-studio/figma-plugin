import { aiService, AIService } from '@/app/services/AIService';
import { TokenTypes } from '@/constants/TokenTypes';

describe('AIService', () => {
  describe('getAvailableTools', () => {
    it('should return all available AI tools', () => {
      const tools = aiService.getAvailableTools();
      
      expect(tools).toHaveLength(4);
      expect(tools.map(tool => tool.name)).toEqual([
        'create_token',
        'create_multiple_tokens',
        'create_token_set',
        'create_theme'
      ]);
    });

    it('should return tools with proper structure', () => {
      const tools = aiService.getAvailableTools();
      
      tools.forEach(tool => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('parameters');
        expect(tool.parameters).toHaveProperty('type', 'object');
        expect(tool.parameters).toHaveProperty('properties');
        expect(tool.parameters).toHaveProperty('required');
      });
    });
  });

  describe('sendMessage', () => {
    it('should respond to color token request with create_token tool call', async () => {
      const messages = [{
        role: 'user' as const,
        content: 'create a primary color token'
      }];

      const response = await aiService.sendMessage(messages);
      
      expect(response.message.role).toBe('assistant');
      expect(response.message.content).toContain('color token');
      expect(response.tool_calls).toHaveLength(1);
      expect(response.tool_calls?.[0].name).toBe('create_token');
      expect(response.tool_calls?.[0].parameters.type).toBe(TokenTypes.COLOR);
    });

    it('should respond to spacing request with create_multiple_tokens tool call', async () => {
      const messages = [{
        role: 'user' as const,
        content: 'create spacing tokens'
      }];

      const response = await aiService.sendMessage(messages);
      
      expect(response.message.role).toBe('assistant');
      expect(response.message.content).toContain('spacing scale');
      expect(response.tool_calls).toHaveLength(1);
      expect(response.tool_calls?.[0].name).toBe('create_multiple_tokens');
      expect(response.tool_calls?.[0].parameters.tokens).toHaveLength(5);
    });

    it('should respond to theme request with create_theme tool call', async () => {
      const messages = [{
        role: 'user' as const,
        content: 'create a light theme'
      }];

      const response = await aiService.sendMessage(messages);
      
      expect(response.message.role).toBe('assistant');
      expect(response.message.content).toContain('light theme');
      expect(response.tool_calls).toHaveLength(1);
      expect(response.tool_calls?.[0].name).toBe('create_theme');
    });

    it('should respond to button component request with create_token_set tool call', async () => {
      const messages = [{
        role: 'user' as const,
        content: 'create a button component set'
      }];

      const response = await aiService.sendMessage(messages);
      
      expect(response.message.role).toBe('assistant');
      expect(response.message.content).toContain('button components');
      expect(response.tool_calls).toHaveLength(1);
      expect(response.tool_calls?.[0].name).toBe('create_token_set');
      expect(response.tool_calls?.[0].parameters.setName).toBe('button');
    });

    it('should provide helpful suggestions for general requests', async () => {
      const messages = [{
        role: 'user' as const,
        content: 'hello'
      }];

      const response = await aiService.sendMessage(messages);
      
      expect(response.message.role).toBe('assistant');
      expect(response.message.content).toContain('I can help you create design tokens');
      expect(response.tool_calls).toBeUndefined();
    });
  });
});