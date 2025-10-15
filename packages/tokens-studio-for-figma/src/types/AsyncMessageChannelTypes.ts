/**
 * Shared type definitions for AsyncMessageChannel implementations
 */

import {
  AsyncMessageResultsMap,
  AsyncMessagesMap,
  AsyncMessageTypes,
} from './AsyncMessages';

// Credits goes to https://github.com/microsoft/TypeScript/issues/23182#issuecomment-379091887
export type IsTypeOnlyObject<Obj extends Record<PropertyKey, unknown>> = [keyof Obj] extends ['type'] ? true : false;

export type IncomingMessageEvent<Message = unknown> = {
  data: {
    pluginMessage:
    | {
      id: string;
      message: Message;
    }
    | {
      id: string;
      error: unknown;
    };
  };
};

export type AsyncMessageChannelHandlers = {
  [K in AsyncMessageTypes]: (
    incoming: AsyncMessagesMap[K],
  ) => Promise<IsTypeOnlyObject<AsyncMessageResultsMap[K]> extends true ? void : Omit<AsyncMessageResultsMap[K], 'type'>>;
};
