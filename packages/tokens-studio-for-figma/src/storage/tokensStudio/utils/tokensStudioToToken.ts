import { RawToken } from '@tokens-studio/sdk';
import { deepmerge } from 'deepmerge-ts';
import { SingleToken } from '@/types/tokens';

interface Token {
  name?: string | null;
  description?: string | null;
  type?: string | null;
  value: any;
  $extensions?: SingleToken['$extensions'];
}

const removeNulls = (obj: any) => Object.fromEntries(Object.entries(obj).filter(([key, v]) => v !== null));

const parseValue = (value: string | undefined | null) => {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
};

// We need to convert the raw token data from the GraphQL API into a format that the plugin will understand,
// as there's some differences between the two. Ideally, we could just pass in a "request format"
// into the query, but that's not possible so far.
export const tokensStudioToToken = (raw: RawToken) => {
  let combined: Token = {
    name: raw.name,
    type: raw.type,
    value: null,
  };

  if (raw.urn) {
    combined = {
      ...combined,
      $extensions: {
        'studio.tokens': {
          urn: raw.urn,
        },
      },
    };
  }

  if (raw.description) {
    combined.description = raw.description;
  }

  if (raw.extensions) {
    combined.$extensions = deepmerge(JSON.parse(raw.extensions), combined.$extensions);
  }

  // @ts-ignore
  if (raw.value.typography) {
    // @ts-ignore typography exists for typography tokens
    combined.value = removeNulls((raw as RawToken).value!.typography!);
    // @ts-ignore
  } else if (raw.value.border) {
    // @ts-ignore border exists for border tokens
    combined.value = removeNulls((raw as unknown as Raw_Token_border).value!.border!);
    // @ts-ignore
  } else if (raw.value.boxShadow) {
    // @ts-ignore
    combined.value = (raw as Raw_Token_boxShadow).value!.boxShadow;
    // @ts-expect-error
  } else if (raw.value?.composition) {
    // @ts-expect-error composition exists for composition tokens
    combined.value = removeNulls((raw as RawToken).value!.composition!);
  } else if (raw.value?.value) {
    combined.value = parseValue(raw.value.value);
  } else {
    // tokens from dynamic sets have a different structure
    combined.value = parseValue(raw.value as unknown as string) || raw.value;
  }

  return combined;
};
