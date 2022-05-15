import compact from 'just-compact';
import { ContextObject } from '@/types/api';
import { generateId } from '@/plugin/helpers';
import { notifyAPIProviders, notifyUI } from '@/plugin/notifiers';
import isSameCredentials from './isSameCredentials';
import { ApiProvidersProperty } from '@/figmaStorage';

// update credentials
export async function updateCredentials(context: ContextObject) {
  try {
    delete context.new;
    const data = await ApiProvidersProperty.read();
    let existingProviders: NonNullable<typeof data> = [];
    if (data) {
      existingProviders = data;

      let matchingProvider;

      if (context.internalId) {
        matchingProvider = existingProviders.findIndex((i) => i.internalId === context.internalId);
      } else {
        matchingProvider = existingProviders.findIndex((i) => isSameCredentials(i, context));
      }
      // Handle case for old credentials where  we had no internalId. Check id and secret and provider then
      if (matchingProvider !== -1) {
        existingProviders.splice(matchingProvider, 1, context);
      }

      if (!parsedData || matchingProvider === -1) {
        existingProviders.push({ ...context, internalId: generateId(24) });
      }
    } else {
      existingProviders.push({ ...context, internalId: generateId(24) });
    }
    await ApiProvidersProperty.write(existingProviders);
    const newProviders = await ApiProvidersProperty.read();
    notifyAPIProviders(newProviders ?? []);
  } catch (err) {
    notifyUI('There was an issue saving your credentials. Please try again.');
  }
}

export async function removeSingleCredential(context: ContextObject) {
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
