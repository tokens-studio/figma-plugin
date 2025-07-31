// Re-export functions from modular files for backward compatibility
export { filterAndGroupTokens, processTokenSets } from './tokenOrchestration';
export {
  applyTokenDataToTemplate,
  processSingleToken,
  processTokenBatch,
  appendTokenClones,
} from './tokenProcessingCore';
