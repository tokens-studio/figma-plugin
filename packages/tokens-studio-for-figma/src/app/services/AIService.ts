import { TokenTypes } from '@/constants/TokenTypes';

export interface AITool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
}

export interface AIToolCall {
  name: string;
  parameters: Record<string, any>;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_calls?: AIToolCall[];
}

export interface AIResponse {
  message: AIMessage;
  tool_calls?: AIToolCall[];
}

// Mock AI service for sandboxed token creation
export class AIService {
  private tools: AITool[] = [
    {
      name: 'create_token',
      description: 'Create a single design token',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The name of the token (e.g., "colors.primary" or "spacing.large")',
          },
          type: {
            type: 'string',
            enum: Object.values(TokenTypes),
            description: 'The type of token to create',
          },
          value: {
            type: 'string',
            description: 'The value of the token (e.g., "#FF0000" for color, "16px" for spacing)',
          },
          description: {
            type: 'string',
            description: 'Optional description for the token',
          },
        },
        required: ['name', 'type', 'value'],
      },
    },
    {
      name: 'create_multiple_tokens',
      description: 'Create multiple design tokens at once',
      parameters: {
        type: 'object',
        properties: {
          tokens: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                type: { type: 'string', enum: Object.values(TokenTypes) },
                value: { type: 'string' },
                description: { type: 'string' },
              },
              required: ['name', 'type', 'value'],
            },
            description: 'Array of tokens to create',
          },
        },
        required: ['tokens'],
      },
    },
    {
      name: 'create_token_set',
      description: 'Create a new token set with specific tokens',
      parameters: {
        type: 'object',
        properties: {
          setName: {
            type: 'string',
            description: 'Name of the new token set',
          },
          tokens: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                type: { type: 'string', enum: Object.values(TokenTypes) },
                value: { type: 'string' },
                description: { type: 'string' },
              },
              required: ['name', 'type', 'value'],
            },
            description: 'Tokens to include in the set',
          },
        },
        required: ['setName', 'tokens'],
      },
    },
    {
      name: 'create_theme',
      description: 'Create a new theme configuration',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name of the theme',
          },
          description: {
            type: 'string',
            description: 'Description of the theme',
          },
          tokenSets: {
            type: 'array',
            items: { type: 'string' },
            description: 'Token sets to include in this theme',
          },
        },
        required: ['name', 'tokenSets'],
      },
    },
  ];

  getAvailableTools(): AITool[] {
    return this.tools;
  }

  async sendMessage(messages: AIMessage[]): Promise<AIResponse> {
    // Mock AI response - in a real implementation, this would call an AI API
    const lastMessage = messages[messages.length - 1];

    if (lastMessage.role === 'user') {
      const response = await this.generateMockResponse(lastMessage.content);
      return response;
    }

    return {
      message: {
        role: 'assistant',
        content: 'I understand. How can I help you with your design tokens?',
      },
    };
  }

  private async generateMockResponse(userMessage: string): Promise<AIResponse> {
    // Simple keyword-based responses for demonstration
    const message = userMessage.toLowerCase();

    if (message.includes('create') && message.includes('color')) {
      return {
        message: {
          role: 'assistant',
          content: "I'll help you create a color token. Let me create a primary color token for you.",
        },
        tool_calls: [{
          name: 'create_token',
          parameters: {
            name: 'colors.primary',
            type: TokenTypes.COLOR,
            value: '#007AFF',
            description: 'Primary brand color',
          },
        }],
      };
    }

    if (message.includes('spacing') || message.includes('size')) {
      return {
        message: {
          role: 'assistant',
          content: "I'll create a spacing scale for you with multiple tokens.",
        },
        tool_calls: [{
          name: 'create_multiple_tokens',
          parameters: {
            tokens: [
              {
                name: 'spacing.xs', type: TokenTypes.SPACING, value: '4px', description: 'Extra small spacing',
              },
              {
                name: 'spacing.sm', type: TokenTypes.SPACING, value: '8px', description: 'Small spacing',
              },
              {
                name: 'spacing.md', type: TokenTypes.SPACING, value: '16px', description: 'Medium spacing',
              },
              {
                name: 'spacing.lg', type: TokenTypes.SPACING, value: '24px', description: 'Large spacing',
              },
              {
                name: 'spacing.xl', type: TokenTypes.SPACING, value: '32px', description: 'Extra large spacing',
              },
            ],
          },
        }],
      };
    }

    if (message.includes('theme')) {
      return {
        message: {
          role: 'assistant',
          content: "I'll create a light theme for you. Let me set up a basic theme configuration.",
        },
        tool_calls: [{
          name: 'create_theme',
          parameters: {
            name: 'Light Theme',
            description: 'Default light theme with primary colors and spacing',
            tokenSets: ['global', 'light'],
          },
        }],
      };
    }

    if (message.includes('button') || message.includes('component')) {
      return {
        message: {
          role: 'assistant',
          content: "I'll create a token set for button components with colors and spacing.",
        },
        tool_calls: [{
          name: 'create_token_set',
          parameters: {
            setName: 'button',
            tokens: [
              {
                name: 'button.background', type: TokenTypes.COLOR, value: '#007AFF', description: 'Button background color',
              },
              {
                name: 'button.text', type: TokenTypes.COLOR, value: '#FFFFFF', description: 'Button text color',
              },
              {
                name: 'button.padding.horizontal', type: TokenTypes.SPACING, value: '16px', description: 'Button horizontal padding',
              },
              {
                name: 'button.padding.vertical', type: TokenTypes.SPACING, value: '12px', description: 'Button vertical padding',
              },
              {
                name: 'button.border.radius', type: TokenTypes.BORDER_RADIUS, value: '8px', description: 'Button border radius',
              },
            ],
          },
        }],
      };
    }

    // Default response with suggestions
    return {
      message: {
        role: 'assistant',
        content: `I can help you create design tokens! Here are some things you can ask me:

• "Create a primary color token" - I'll create a color token for you
• "Create spacing tokens" - I'll generate a spacing scale
• "Create a button component set" - I'll make tokens for button components
• "Create a light theme" - I'll set up a theme configuration

What would you like me to help you with?`,
      },
    };
  }
}

export const aiService = new AIService();
