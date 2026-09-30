import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';
import { RawVariableReferenceMap } from '@/types/RawVariableReferenceMap';
import { AnyTokenList } from '@/types/tokens';
import { clearFontLoadCache } from './loadFontOnce';

export class TokenValueRetriever {
  public tokens;

  public variableReferences;

  public cachedVariableReferences;

  private variableImports = new Map<string, Promise<Variable | null>>();

  private styleImports = new Map<string, Promise<string>>();

  private styleReferences;

  private stylePathPrefix;

  private ignoreFirstPartForStyles;

  public applyVariablesStylesOrRawValue;

  public createStylesWithVariableReferences;

  private getAdjustedTokenName(tokenName: string): [string, string] {
    const withIgnoredFirstPart = this.ignoreFirstPartForStyles && tokenName.split('.').length > 1
      ? tokenName.split('.').slice(1).join('.')
      : tokenName;

    const adjustedTokenName = [this.stylePathPrefix, tokenName].filter((n) => n).join('.');
    const adjustedTokenNameWithIgnoreFirstPart = [this.stylePathPrefix, withIgnoredFirstPart]
      .filter((n) => n)
      .join('.');

    return [adjustedTokenName, adjustedTokenNameWithIgnoreFirstPart];
  }

  public initiate({
    tokens,
    variableReferences,
    styleReferences,
    stylePathPrefix,
    ignoreFirstPartForStyles = false,
    createStylesWithVariableReferences = false,
    applyVariablesStylesOrRawValue = ApplyVariablesStylesOrRawValues.VARIABLES_STYLES,
  }: {
    tokens: AnyTokenList;
    variableReferences?: RawVariableReferenceMap;
    styleReferences?: Map<string, string>;
    stylePathPrefix?: string;
    ignoreFirstPartForStyles?: boolean;
    createStylesWithVariableReferences?: boolean;
    applyVariablesStylesOrRawValue?: ApplyVariablesStylesOrRawValues;
  }) {
    this.stylePathPrefix = typeof stylePathPrefix !== 'undefined' ? stylePathPrefix : null;
    this.ignoreFirstPartForStyles = ignoreFirstPartForStyles;
    this.createStylesWithVariableReferences = createStylesWithVariableReferences;
    this.styleReferences = styleReferences || new Map();
    this.variableReferences = variableReferences || new Map();
    this.cachedVariableReferences = new Map();
    this.variableImports.clear();
    this.styleImports.clear();
    clearFontLoadCache();
    this.applyVariablesStylesOrRawValue = applyVariablesStylesOrRawValue;

    this.tokens = new Map<string, any>(
      tokens.map((token) => {
        const variableId = variableReferences?.get(token.name);
        // For styles, we need to ignore the first part of the token name as well as consider theme prefix
        const [adjustedTokenName, adjustedTokenNameWithIgnoreFirstPart] = this.getAdjustedTokenName(token.name);

        const styleId = styleReferences?.get(adjustedTokenName)
          || styleReferences?.get(adjustedTokenNameWithIgnoreFirstPart)
          || styleReferences?.get(token.name);
        const finalAdjustedTokenName = styleReferences?.has(adjustedTokenName)
          ? adjustedTokenName
          : adjustedTokenNameWithIgnoreFirstPart;

        return [
          token.name,
          {
            ...token,
            variableId,
            styleId,
            adjustedTokenName: styleId ? finalAdjustedTokenName : adjustedTokenName,
          },
        ];
      }),
    );
  }

  public get(tokenName: string) {
    return this.tokens.get(tokenName);
  }

  public async getVariableReference(tokenName: string) {
    const storedToken = this.tokens.get(tokenName);
    const isUsingReference = storedToken?.rawValue?.startsWith?.('{') && storedToken?.rawValue?.endsWith?.('}');
    if (this.cachedVariableReferences.has(tokenName)) return this.cachedVariableReferences.get(tokenName);

    const variableMapped = this.variableReferences.get(tokenName)
      || (isUsingReference ? this.variableReferences.get(storedToken.rawValue.slice(1, -1)) : null);
    if (!variableMapped) return false;
    if (typeof variableMapped !== 'string') return null;

    let pending = this.variableImports.get(variableMapped);
    if (!pending) {
      pending = Promise.resolve()
        .then(() => figma.variables.importVariableByKeyAsync(variableMapped))
        .catch((error) => {
          if (this.variableImports.get(variableMapped) === pending) this.variableImports.delete(variableMapped);
          console.log('error importing variable', error);
          return null;
        });
      this.variableImports.set(variableMapped, pending);
    }

    const variable = await pending;
    if (variable) this.cachedVariableReferences.set(tokenName, variable);
    return variable;
  }

  public importStyleByKey(key: string): Promise<string> {
    let pending = this.styleImports.get(key);
    if (!pending) {
      pending = Promise.resolve()
        .then(() => figma.importStyleByKeyAsync(key))
        .then((style) => style.id)
        .catch((error) => {
          if (this.styleImports.get(key) === pending) this.styleImports.delete(key);
          throw error;
        });
      this.styleImports.set(key, pending);
    }
    return pending;
  }

  public getTokens() {
    return this.tokens;
  }

  public clearCache() {
    if (this.cachedVariableReferences) this.cachedVariableReferences.clear();
    this.variableImports.clear();
    this.styleImports.clear();
    clearFontLoadCache();
    if (this.tokens) this.tokens.clear();
    if (this.variableReferences) this.variableReferences.clear();
    if (this.styleReferences) this.styleReferences.clear();
    if (this.stylePathPrefix) this.stylePathPrefix = undefined;
    if (this.ignoreFirstPartForStyles) this.ignoreFirstPartForStyles = undefined;
    if (this.createStylesWithVariableReferences) this.createStylesWithVariableReferences = undefined;
  }
}

const defaultTokenValueRetriever = new TokenValueRetriever();

export { defaultTokenValueRetriever };
