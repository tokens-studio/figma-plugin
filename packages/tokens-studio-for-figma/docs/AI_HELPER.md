# AI Helper Feature Documentation

## Overview

The AI Helper feature provides an intelligent assistant for creating design tokens through natural language conversations. Users can ask the AI to create tokens, token sets, and themes, and the AI will execute these requests using sandboxed tools.

## Features

### 1. Natural Language Interface
- Chat-based interface with the AI assistant
- Conversational token creation
- Automatic tool selection based on user intent

### 2. Sandboxed AI Tools
The AI has access to four main tools for token management:

#### `create_token`
Creates a single design token with:
- Name (e.g., "colors.primary", "spacing.large")
- Type (color, spacing, border-radius, etc.)
- Value (e.g., "#FF0000", "16px")
- Optional description

#### `create_multiple_tokens`  
Creates multiple tokens at once:
- Array of token definitions
- Useful for creating token scales (spacing, colors, etc.)

#### `create_token_set`
Creates a token set with multiple related tokens:
- Set name
- Collection of tokens for the set
- Useful for component-specific tokens

#### `create_theme`
Creates theme configurations:
- Theme name and description
- Associated token sets
- Currently shows preparation message (full implementation pending)

### 3. Smart Intent Recognition
The AI recognizes various user intents:

- **Color tokens**: "Create a primary color token" → `create_token` with color type
- **Spacing scales**: "Create spacing tokens" → `create_multiple_tokens` with spacing scale
- **Component sets**: "Create button tokens" → `create_token_set` with button-related tokens
- **Themes**: "Create a light theme" → `create_theme` with theme configuration

## Example Conversations

### Creating a Color Token
**User**: "Create a primary color token"
**AI**: "I'll help you create a color token. Let me create a primary color token for you."
**Result**: Creates `colors.primary` with value `#007AFF`

### Creating a Spacing Scale
**User**: "Create spacing tokens"  
**AI**: "I'll create a spacing scale for you with multiple tokens."
**Result**: Creates spacing.xs (4px), spacing.sm (8px), spacing.md (16px), spacing.lg (24px), spacing.xl (32px)

### Creating Component Tokens
**User**: "Create a button component set"
**AI**: "I'll create a token set for button components with colors and spacing."
**Result**: Creates button token set with background, text, padding, and border-radius tokens

## Technical Implementation

### AIService Class
- Mock AI service with keyword-based response generation
- Expandable architecture for real AI backend integration
- Comprehensive tool definitions with TypeScript types

### AIHelperModal Component
- React-based chat interface
- Real-time message rendering
- Tool execution with visual feedback
- Integration with existing token management hooks

### Integration Points
- Uses existing `useManageTokens` hook for token creation
- Integrates with current token state management
- Follows existing UI patterns and design system

## Future Enhancements

1. **Real AI Backend**: Replace mock service with actual AI API
2. **Advanced Tool Capabilities**: 
   - Full theme creation implementation
   - Token editing and deletion
   - Bulk operations
3. **Enhanced Context Awareness**: 
   - Current token state awareness
   - Project-specific suggestions
4. **Learning Capabilities**: 
   - User preference learning
   - Project pattern recognition

## Usage

1. Open the Tools dropdown in the main interface
2. Select "AI Helper" from the menu
3. Type natural language requests in the chat interface
4. Review AI suggestions and tool executions
5. See tokens created in real-time in your token sets

The AI Helper provides an intuitive way to create design tokens without needing to understand the technical details of token structure and organization.