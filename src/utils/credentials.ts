import compact from 'just-compact';
import { notifyAPIProviders, notifyUI } from '@/plugin/notifiers';
import isSameCredentials from './isSameCredentials';
import { ApiProvidersProperty } from '@/figmaStorage';
import { StorageTypeCredentials } from '@/types/StorageType';

export async function updateCredentials(context: StorageTypeCredentials) {
  try {
    const data = await ApiProvidersProperty.read();
    let existingProviders: NonNullable<typeof data> = [];
    if (data) {
      existingProviders = data;

      const matchingProvider = existingProviders.findIndex((i) => i.internalId === context.internalId);
      if (matchingProvider !== -1) {
        existingProviders.splice(matchingProvider, 1, context);
      }
    }
    await ApiProvidersProperty.write(existingProviders);
    const newProviders = await ApiProvidersProperty.read();
    notifyAPIProviders(newProviders ?? []);
  } catch (err) {
    notifyUI('There was an issue saving your credentials. Please try again.');
  }
}

export async function removeSingleCredential(context: StorageTypeCredentials) {
  try {
    const data = await ApiProvidersProperty.read();
    let existingProviders: NonNullable<typeof data> = [];
    if (data) {
      existingProviders = compact(
        data.map((i) => (isSameCredentials(i, context) ? null : i)).filter((i) => i),
      );
    }
    await ApiProvidersProperty.write(existingProviders);
    const newProviders = await ApiProvidersProperty.read();
    notifyAPIProviders(newProviders ?? []);
  } catch (err) {
    notifyUI('There was an issue saving your credentials. Please try again.');
  }
}
