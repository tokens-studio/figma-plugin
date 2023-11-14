// eslint-disable-next-line import/no-extraneous-dependencies
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup requests interception using the given handlers.
export const server = setupServer(...handlers);
