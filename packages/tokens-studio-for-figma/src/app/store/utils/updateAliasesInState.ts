import { AnyTokenList, SingleToken, TokenToRename } from '@/types/tokens';
import { replaceReferences } from '@/utils/findReferences';
import { isGradientTokenValue } from '@/utils/color/gradientTokenToCss';
import { TokenState } from '../models/tokenState';
import { updateModify } from './updateModify';

export function updateAliasesInState(tokens: Record<string, AnyTokenList>, data: TokenToRename) {
  const updatedSets: string[] = [];
  const updatedTokens = Object.entries(tokens).reduce<TokenState['tokens']>(
    (acc, [key, values]) => {
      const newValues = values.map<SingleToken>((token) => {
        try {
        // Update references inside modify
          const newToken = updateModify(token, data);
          // check if $extensions was updated
          if (JSON.stringify(newToken.$extensions) !== JSON.stringify(token.$extensions)) {
            if (!updatedSets.includes(key)) updatedSets.push(key);
          }

          // Update if token is of type array, e.g. box shadows
          if (Array.isArray(newToken.value)) {
            const newTokenValue = newToken.value.map((t) => Object.entries(t).reduce<Record<string, string | number>>((a, [k, v]) => {
              a[k] = replaceReferences(v.toString(), data.oldName, data.newName);
              return a;
            }, {}));

            if (JSON.stringify(newTokenValue) !== JSON.stringify(newToken.value)) {
              if (!updatedSets.includes(key)) updatedSets.push(key);
            }

            return {
              ...newToken,
              value: newTokenValue,
            } as SingleToken;
          }

          // Gradient tokens hold nested {stops, angle, center, ...}; the generic
          // composite branch below would flatten each property via toString(),
          // corrupting stops into "[object Object]". Only stop.color strings can
          // reference other tokens.
          if (isGradientTokenValue(newToken.value)) {
            const stops = Array.isArray(newToken.value.stops) ? newToken.value.stops : [];
            const newStops = stops.map((stop) => (typeof stop.color === 'string'
              ? { ...stop, color: replaceReferences(stop.color, data.oldName, data.newName) }
              : stop));
            const newTokenValue = { ...newToken.value, stops: newStops };
            if (JSON.stringify(newTokenValue) !== JSON.stringify(newToken.value)) {
              if (!updatedSets.includes(key)) updatedSets.push(key);
            }
            return {
              ...newToken,
              value: newTokenValue,
            } as SingleToken;
          }

          // Update if we have a composite token value, e.g. typography
          if (typeof newToken.value === 'object') {
            const newTokenValue = Object.entries(newToken.value).reduce<Record<string, string | number>>((a, [k, v]) => {
              a[k] = replaceReferences(v.toString(), data.oldName, data.newName);
              return a;
            }, {});

            if (JSON.stringify(newTokenValue) !== JSON.stringify(newToken.value)) {
              if (!updatedSets.includes(key)) updatedSets.push(key);
            }

            return {
              ...newToken,
              value: newTokenValue,
            } as SingleToken;
          }

          const newValue = replaceReferences(newToken.value.toString(), data.oldName, data.newName);
          if (newValue !== newToken.value) {
            if (!updatedSets.includes(key)) updatedSets.push(key);
          }

          // Update for remaining token value types
          return {
            ...newToken,
            value: newValue,
          } as SingleToken;
        } catch (e) {
          console.error(e);
          return token;
        }
      });

      acc[key] = newValues;
      return acc;
    },
    {},
  );
  return { updatedTokens, updatedSets };
}
