import { AsyncMessageTypes, GenerateLivingDocumentationAsyncMessage } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { generateLivingDocumentation } from '../livingDocumentation';
import { getTokenData } from '@/plugin/getTokenData';

export async function generateLivingDocumentationHandler({
  tokenSets,
  includeAllTokens,
  documentationLayout,
}: GenerateLivingDocumentationAsyncMessage) {
  try {
    const tokenData = await getTokenData();
    
    if (!tokenData || !tokenData.values) {
      return {
        success: false,
        message: 'No tokens available',
      };
    }

    const result = await generateLivingDocumentation({
      tokenSets,
      includeAllTokens,
      documentationLayout,
      tokens: tokenData.values,
      activeTheme: tokenData.activeTheme,
      storageType: tokenData.storageType,
    });

    return result;
  } catch (e) {
    console.error('Error generating living documentation:', e);
    return {
      success: false,
      message: `Error: ${e.message || 'Unknown error occurred'}`,
    };
  }
}