import z from 'zod';
import { SingleToken } from '@/types/tokens';
import { singleTokenSchema } from './singleTokenSchema';

interface DeepTokensMap {
  [K: string]: SingleToken<false> | DeepTokensMap
}

// @README need to "as" this type because of the string validation not mathcing to the TokenTypes enum
// but I do not want to set a strict validation because there might be instances where the incoming data
// has invalid types
export const tokensMapSchema: z.ZodType<DeepTokensMap> = z.lazy(() => (
  z.record(singleTokenSchema.or(tokensMapSchema)) as z.ZodType<DeepTokensMap>
));
