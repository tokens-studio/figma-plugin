import { createDataset, mutationClientFactory } from 'figma-tokens-library';

export const [emitter, dataset] = createDataset([]);
export const mutation = mutationClientFactory(dataset);
