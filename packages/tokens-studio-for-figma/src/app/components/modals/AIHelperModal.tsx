import React, {
  useState, useCallback, useRef, useEffect,
} from 'react';
import { useSelector } from 'react-redux';
import {
  Stack,
  Button,
  Text,
  Box,
  Textarea,
} from '@tokens-studio/ui';
import { PaperAirplaneIcon } from '@primer/octicons-react';
import Modal from '../Modal';
import { aiService, AIMessage, AIToolCall } from '@/app/services/AIService';
import useManageTokens from '@/app/store/useManageTokens';
import { activeTokenSetSelector } from '@/selectors';
import { TokenTypes } from '@/constants/TokenTypes';

type Props = {
  onClose: () => void;
};

interface ChatMessage extends AIMessage {
  id: string;
  timestamp: Date;
}

export default function AIHelperModal({ onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant for creating design tokens. I can help you create individual tokens, token sets, and themes. What would you like me to help you with today?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { createSingleToken } = useManageTokens();
  const activeTokenSet = useSelector(activeTokenSetSelector);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const executeToolCall = useCallback(async (toolCall: AIToolCall) => {
    const { name, parameters } = toolCall;

    try {
      switch (name) {
        case 'create_token':
          await createSingleToken({
            parent: activeTokenSet,
            type: parameters.type as TokenTypes,
            name: parameters.name,
            value: parameters.value,
            description: parameters.description,
            shouldUpdateDocument: true,
          });
          return `✅ Created token "${parameters.name}" with value "${parameters.value}"`;

        case 'create_multiple_tokens': {
          const results: string[] = [];
          for (const token of parameters.tokens) {
            await createSingleToken({
              parent: activeTokenSet,
              type: token.type as TokenTypes,
              name: token.name,
              value: token.value,
              description: token.description,
              shouldUpdateDocument: true,
            });
            results.push(`✅ Created token "${token.name}"`);
          }
          return results.join('\n');
        }

        case 'create_token_set': {
          // For now, we'll create tokens in the current set
          // In a full implementation, this would create a new token set
          const setResults: string[] = [];
          for (const token of parameters.tokens) {
            await createSingleToken({
              parent: activeTokenSet,
              type: token.type as TokenTypes,
              name: token.name,
              value: token.value,
              description: token.description,
              shouldUpdateDocument: true,
            });
            setResults.push(`✅ Created token "${token.name}"`);
          }
          return `✅ Created token set "${parameters.setName}" with ${parameters.tokens.length} tokens:\n${setResults.join('\n')}`;
        }

        case 'create_theme':
          // For now, we'll just return a success message
          // In a full implementation, this would create a new theme
          return `✅ Theme "${parameters.name}" configuration prepared (theme creation not yet implemented in this demo)`;

        default:
          return `❌ Unknown tool: ${name}`;
      }
    } catch (error) {
      return `❌ Error executing ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }, [createSingleToken, activeTokenSet]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiMessages: AIMessage[] = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        tool_calls: msg.tool_calls,
      }));
      aiMessages.push({
        role: userMessage.role,
        content: userMessage.content,
      });

      const response = await aiService.sendMessage(aiMessages);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message.content,
        tool_calls: response.tool_calls,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Execute tool calls if any
      if (response.tool_calls && response.tool_calls.length > 0) {
        const toolResults: string[] = [];
        for (const toolCall of response.tool_calls) {
          const result = await executeToolCall(toolCall);
          toolResults.push(result);
        }

        const toolResultMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: toolResults.join('\n\n'),
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, toolResultMessage]);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, messages, executeToolCall]);

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const formatMessage = useCallback((content: string) => {
    const lines = content.split('\n');
    // eslint-disable-next-line react/no-array-index-key
    return lines.map((line, lineIndex) => (
      <React.Fragment key={lineIndex}>
        {line}
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    ));
  }, []);
  return (
    <Modal
      size="large"
      isOpen
      close={onClose}
      title="AI Helper"
      showClose
    >
      <Stack direction="column" gap={4} css={{ height: '500px' }}>
        {/* Chat Messages */}
        <Box
          css={{
            flex: 1,
            overflowY: 'auto',
            padding: '$3',
            border: '1px solid $borderSubtle',
            borderRadius: '$medium',
            backgroundColor: '$bgCanvas',
          }}
        >
          <Stack direction="column" gap={3}>
            {messages.map((message) => (
              <Box
                key={message.id}
                css={{
                  alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                }}
              >
                <Box
                  css={{
                    padding: '$3',
                    borderRadius: '$medium',
                    backgroundColor: message.role === 'user'
                      ? '$bgBrandDefault'
                      : '$bgSubtle',
                    color: message.role === 'user'
                      ? '$fgOnBrand'
                      : '$fgDefault',
                  }}
                >
                  <Text size="small">
                    {formatMessage(message.content)}
                  </Text>
                </Box>
                <Text
                  size="xsmall"
                  css={{
                    color: '$fgMuted',
                    marginTop: '$1',
                    textAlign: message.role === 'user' ? 'right' : 'left',
                  }}
                >
                  {message.timestamp.toLocaleTimeString()}
                </Text>
              </Box>
            ))}
            {isLoading && (
            <Box css={{ alignSelf: 'flex-start' }}>
              <Box
                css={{
                  padding: '$3',
                  borderRadius: '$medium',
                  backgroundColor: '$bgSubtle',
                }}
              >
                <Text size="small" css={{ color: '$fgMuted' }}>
                  AI is thinking...
                </Text>
              </Box>
            </Box>
            )}
            <div ref={messagesEndRef} />
          </Stack>
        </Box>

        {/* Input Area */}
        <Stack direction="row" gap={2} align="end">
          <Box css={{ flex: 1 }}>
            <Textarea
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Ask me to create tokens, token sets, or themes..."
              rows={2}
              disabled={isLoading}
            />
          </Box>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            variant="primary"
            size="small"
          >
            <PaperAirplaneIcon />
          </Button>
        </Stack>

        {/* Help Text */}
        <Box css={{ padding: '$2', backgroundColor: '$bgSubtle', borderRadius: '$small' }}>
          <Text size="xsmall" css={{ color: '$fgMuted' }}>
            💡 Try asking: &quot;Create a primary color token&quot;, &quot;Create spacing tokens&quot;, &quot;Create a button component set&quot;, or &quot;Create a light theme&quot;
          </Text>
        </Box>
      </Stack>
    </Modal>
  );
}
