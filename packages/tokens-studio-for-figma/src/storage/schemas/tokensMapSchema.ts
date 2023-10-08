import z from 'zod';
import { singleTokenSchema } from './singleTokenSchema';
import { DeepTokensMap } from '@/types';

// @README need to "as" this type because of the string validation not mathcing to the TokenTypes enum
// but I do not want to set a strict validation because there might be instances where the incoming data
// has invalid types
export const tokensMapSchema: z.ZodType<DeepTokensMap<false>> = z.lazy(() => (
  z.record(singleTokenSchema.or(tokensMapSchema)) as z.ZodType<DeepTokensMap<false>>
));
