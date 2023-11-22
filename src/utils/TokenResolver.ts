import { SingleToken } from '@/types/tokens';
import { TokenMap } from '../types/TokenMap';

import { AliasRegex } from '@/constants/AliasRegex';
import { checkAndEvaluateMath } from './math';
import { convertToRgb } from './color';
import { ColorModifierTypes } from '@/constants/ColorModifierTypes';
import { convertModifiedColorToHex } from './convertModifiedColorToHex';
import { getPathName } from './getPathName';
import { ResolveTokenValuesResult } from './tokenHelpers';

class TokenResolver {
  private tokens: SingleToken[];

  private tokenMap: TokenMap;

  private memo: Map<string, ResolveTokenValuesResult>;

  constructor(tokens: SingleToken[]) {
    this.tokens = tokens;
    this.tokenMap = new Map();
    this.memo = new Map();

    this.populateTokenMap();
  }

  // Set tokens and populate token map
  private populateTokenMap(): void {
    for (const token of this.tokens) {
      this.tokenMap.set(token.name, token);
    }
  }

  // When we get new tokens, we need to update the token map
  public setTokens(tokens: SingleToken[]): ResolveTokenValuesResult[] {
    this.tokens = tokens;
    this.tokenMap = new Map();
    this.memo = new Map();
    this.populateTokenMap();
    return this.resolveTokenValues();
  }

  // Initial function to iterate over all tokens and resolve references
  public resolveTokenValues(): ResolveTokenValuesResult[] {
    const resolvedTokens: ResolveTokenValuesResult[] = [];

    for (const token of this.tokens) {
      const resolvedValue = this.resolveReferences(token);
      // const resolvedValue = token.type === TokenTypes.TEXT ? token : this.resolveReferences(token);

      resolvedTokens.push({
        ...resolvedValue,
        rawValue: token.value,
      } as ResolveTokenValuesResult);
    }

    return resolvedTokens;
  }

  // When we resolve references, we also need to calculate the value of the token, meaning color and math transformations
  private calculateTokenValue(token: SingleToken, resolvedReferences: Set<string> = new Set()): SingleToken['value'] | undefined {
    // Calculations only happen on strings.
    if (typeof token.value === 'string') {
      const couldBeNumberValue = checkAndEvaluateMath(token.value);

      // if it's a number, we don't need to do anything else and can return it
      if (typeof couldBeNumberValue === 'number') {
        return couldBeNumberValue as SingleToken['value'];
      }

      // Transform non-conform colors such as rgba({color}, 0.5) to hex
      const rgbColor = convertToRgb(couldBeNumberValue);

      // If we have a color modifier, we need to apply it. As we need chained resolution to happen, this needs to be done here.
      if (typeof token === 'object' && token?.$extensions?.['studio.tokens']?.modify && rgbColor) {
        if (token?.$extensions?.['studio.tokens']?.modify?.type === ColorModifierTypes.MIX) {
          // As we support references in color modifiers, we need to resolve them.
          return convertModifiedColorToHex(rgbColor, {
            ...token.$extensions?.['studio.tokens']?.modify,
            value: String(this.resolveReferences({ value: token?.$extensions?.['studio.tokens']?.modify?.value } as SingleToken, resolvedReferences)?.value),
            color: String(this.resolveReferences({ value: token?.$extensions?.['studio.tokens']?.modify?.color } as SingleToken, resolvedReferences)?.value) ?? undefined,
          });
        }

        return convertModifiedColorToHex(rgbColor, {
          ...token.$extensions?.['studio.tokens']?.modify,
          value: String(this.resolveReferences({ value: token?.$extensions?.['studio.tokens']?.modify?.value } as SingleToken, resolvedReferences)?.value),
        });
      }
      // If we don't have a color modifier, we can just return the color
      return rgbColor;
    }

    // If it's not a string we just return the value.
    return token.value;
  }

  private resolveReferences(token: SingleToken, resolvedReferences: Set<string> = new Set()): ResolveTokenValuesResult {
    // We use the name as the memo key, if it exists
    const memoKey = token.name || undefined;

    // If we have a cache hit, we can return it
    if (memoKey && this.memo.has(memoKey)) {
      const cacheResult = this.memo.get(memoKey);
      if (cacheResult) {
        return cacheResult;
      }
    }

    // For strings, we need to check if there are any references, as those can only occur in strings
    if (typeof token.value === 'string') {
      const references = token.value.toString().match(AliasRegex) || [];

      let finalValue: SingleToken['value'] = token.value;

      // Resolve every reference, there could be more than 1, as in "{color.primary} {color.secondary}"
      for (const reference of references) {
        const path = getPathName(reference);

        // We need to avoid circular references, so we check if we already resolved this reference
        if (resolvedReferences.has(path)) {
          console.log('Circular reference detected:', path);
          return {
            ...token, rawValue: token.value, failedToResolve: true,
          } as ResolveTokenValuesResult;
        }

        // Users can nest references, so we need to make sure to resolve any nested references first.
        let resolvedPath = path;
        let matches: boolean = true;

        // As long as we have matches, we need to resolve them. This is needed for multiple levels of nesting. Performance will suffer, but that's the user's choice.
        while (matches !== false) {
          const match = resolvedPath.match(AliasRegex);
          matches = Boolean(match?.length);
          if (!match?.length) break;

          const nestedTokenName = getPathName(match[0]);
          const nestedToken = this.tokenMap.get(nestedTokenName);

          if (nestedToken && nestedToken.value) {
            const resolvedNestedToken = this.resolveReferences({ ...nestedToken, name: nestedTokenName } as SingleToken, new Set(resolvedReferences));

            if (typeof resolvedNestedToken.value === 'string' || typeof resolvedNestedToken.value === 'number') {
              resolvedPath = resolvedPath.replace(match[0], resolvedNestedToken.value);
            }
          } else {
            break;
          }
        }

        // We have the special case of deep references where we can reference the .fontFamily property of a typography token.
        // For that case, we need to split the path and get the last part, which might be the property name.
        // However, it might not be. If we have a token called "color.primary" and we reference "color.primary.fontFamily", we need to check if "color.primary" exists. If it does, we prefer to return that one.
        // If it doesn't it might be a composite token where we want to return the atomic property
        const propertyPath = resolvedPath.split('.');
        const propertyName = propertyPath.pop() as string;
        const tokenNameWithoutLastPart = propertyPath.join('.');
        const foundToken = this.tokenMap.get(resolvedPath);

        if (foundToken) {
          // We add the already resolved references to the new set, so we can check for circular references
          const newResolvedReferences = new Set(resolvedReferences);
          newResolvedReferences.add(resolvedPath);
          // We initiate a new resolveReferences call, as we need to resolve the references of the reference
          const resolvedTokenValue = this.resolveReferences({ ...foundToken, name: resolvedPath } as SingleToken, newResolvedReferences);

          // We weren't able to resolve the reference, so we return the token as is, but mark it as failed to resolve
          if (resolvedTokenValue.value === undefined) {
            return {
              ...token, value: token.value, rawValue: token.value, failedToResolve: true,
            } as ResolveTokenValuesResult;
          }

          // We replace the reference with the resolved value if needed
          if (typeof finalValue === 'string' && (typeof resolvedTokenValue.value === 'string' || typeof resolvedTokenValue.value === 'number')) {
            finalValue = finalValue.replace(reference, resolvedTokenValue.value);
          } else if (resolvedTokenValue.value !== undefined) {
            finalValue = resolvedTokenValue.value;
          }
        } else {
          // If we didn't find a value, we need to check if we have a composite token
          const tokenValueWithoutProperty = this.tokenMap.get(tokenNameWithoutLastPart)?.value;
          if (tokenValueWithoutProperty && tokenValueWithoutProperty.hasOwnProperty(propertyName)) {
            const propertyTokenValue = (tokenValueWithoutProperty as Record<string, unknown>)[propertyName];
            const parsedValue = this.calculateTokenValue({ value: propertyTokenValue } as SingleToken, resolvedReferences);

            if (parsedValue === undefined) {
              finalValue = token.value;
            } else {
              finalValue = (typeof finalValue === 'string' && (typeof parsedValue === 'string' || typeof parsedValue === 'number')) ? finalValue.replace(reference, parsedValue) : parsedValue;
            }
          } else {
            // Otherwise, we return the token as is, but mark it as failed to resolve
            return {
              ...token, value: token.value, rawValue: token.value, failedToResolve: true,
            } as ResolveTokenValuesResult;
          }
        }
      }

      let resolvedToken: ResolveTokenValuesResult;
      // When we have a string or number, we need to check if it's a valid token value.
      if ((typeof finalValue === 'string' || typeof finalValue === 'number') && !AliasRegex.test(finalValue)) {
        // We need to calculate the value of the token, as it might be a color or math transformation
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        const calculated = this.calculateTokenValue({ ...token, value: finalValue } as SingleToken, resolvedReferences);
        if (calculated === undefined) {
          resolvedToken = token;
        } else {
          resolvedToken = { ...token, value: calculated } as ResolveTokenValuesResult;
        }
      } else {
        // If it's not, we mark it as failed to resolve
        const hasFailingReferences = !AliasRegex.test(JSON.stringify(finalValue));

        resolvedToken = {
          ...token, value: finalValue, rawValue: token.value, ...(hasFailingReferences ? { failedToResolve: true } : {}),
        } as ResolveTokenValuesResult;
      }

      // When we have a string, we store the result in cache
      if (typeof memoKey === 'string') {
        this.memo.set(memoKey, resolvedToken);
      }

      // And then return it
      return resolvedToken as ResolveTokenValuesResult;
    }

    // Shadow tokens can be of type array, so we need to resolve those too
    if (Array.isArray(token.value)) {
      const resolvedArray: any[] = [];

      let failedToResolve = false;
      for (const item of token.value) {
        // We resolve each individual item, as it might be a reference
        const resolvedItem = this.resolveReferences({ value: item } as SingleToken, resolvedReferences);
        if (resolvedItem.failedToResolve) {
          failedToResolve = true;
        }

        resolvedArray.push(resolvedItem.value);
      }

      // We bring back the resolved array into the token object, and set failedToResolve on the token if needed
      const resolvedToken = {
        ...token, value: resolvedArray, rawValue: token.value, ...(failedToResolve ? { failedToResolve } : {}),
      } as ResolveTokenValuesResult;
      // We save back to cache
      if (typeof memoKey === 'string') {
        this.memo.set(memoKey, resolvedToken);
      }

      return resolvedToken;
    }

    // If we have an object (typography, border, shadow, composititions), we need to resolve each property
    if (typeof token.value === 'object' && token.value !== null) {
      const resolvedObject: { [key: string]: any } = {};

      let failedToResolve = false;
      for (const key of Object.keys(token.value)) {
        if (Object.prototype.hasOwnProperty.call(token.value, key)) {
          const propertyTokenValue = (token.value as Record<string, unknown>)[key];
          const resolvedValue = this.resolveReferences({ value: propertyTokenValue } as SingleToken, resolvedReferences);

          if (resolvedValue.failedToResolve) {
            failedToResolve = true;
          }
          resolvedObject[key] = resolvedValue.value;
        }
      }

      const resolvedToken = { ...token, value: resolvedObject, ...(failedToResolve ? { failedToResolve } : {}) } as ResolveTokenValuesResult;
      // If we have a value, we set it back to cache
      if (typeof memoKey === 'string') {
        this.memo.set(memoKey, resolvedToken);
      }
      return resolvedToken;
    }

    return token;
  }
}

const defaultTokenResolver = new TokenResolver([]);

export { defaultTokenResolver };
