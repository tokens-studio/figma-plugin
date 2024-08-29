import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';
import { RawVariableReferenceMap } from '@/types/RawVariableReferenceMap';
import { AnyTokenList } from '@/types/tokens';

export class TokenValueRetriever {
  public tokens;

  public variableReferences;

  public cachedVariableReferences;

  private styleReferences;

  private potentialStylePathPrefixes;

  private ignoreFirstPartForStyles;

  public applyVariablesStylesOrRawValue;

  public createStylesWithVariableReferences;

  private getAdjustedTokenName(tokenName: string, internalParent: string | undefined): string {
    const matchingStylePathPrefix = this.potentialStylePathPrefixes?.find((prefix) => prefix === internalParent);

    const withPrefix = [matchingStylePathPrefix, tokenName].filter((n) => n).join('.');

    return withPrefix;
  }

  public initiate({
    tokens,
    variableReferences,
    styleReferences,
    potentialStylePathPrefixes,
    ignoreFirstPartForStyles = false,
    createStylesWithVariableReferences = false,
    applyVariablesStylesOrRawValue = ApplyVariablesStylesOrRawValues.VARIABLES_STYLES,
  }: { tokens: AnyTokenList,
    variableReferences?: RawVariableReferenceMap,
    styleReferences?: Map<string,
    string>,
    potentialStylePathPrefixes?: string[],
    ignoreFirstPartForStyles?: boolean,
    createStylesWithVariableReferences?: boolean,
    applyVariablesStylesOrRawValue?: ApplyVariablesStylesOrRawValues,
  }) {
    this.potentialStylePathPrefixes = typeof potentialStylePathPrefixes !== 'undefined' ? potentialStylePathPrefixes : null;
    this.ignoreFirstPartForStyles = ignoreFirstPartForStyles;
    this.createStylesWithVariableReferences = createStylesWithVariableReferences;
    this.styleReferences = styleReferences || new Map();
    this.variableReferences = variableReferences || new Map();
    this.cachedVariableReferences = new Map();
    this.applyVariablesStylesOrRawValue = applyVariablesStylesOrRawValue;

    this.tokens = new Map<string, any>(tokens.map((token) => {
      const variableId = variableReferences?.get(token.name);
      // For styles, we need to ignore the first part of the token name as well as consider theme prefix
      const adjustedTokenName = this.getAdjustedTokenName(token.name, token.internal__Parent);
      const styleId = styleReferences?.get(adjustedTokenName);
      return [token.name, {
        ...token, variableId, styleId, adjustedTokenName,
      }];
    }));
  }

  public get(tokenName: string) {
    
    console.log("prefixes", this.potentialStylePathPrefixes);
    return this.tokens.get(tokenName);
  }

  public async getVariableReference(tokenName: string) {
    let variable;
    const storedToken = this.tokens.get(tokenName);
    const isUsingReference = storedToken?.rawValue?.startsWith?.('{') && storedToken?.rawValue?.endsWith?.('}');
    const hasCachedVariable = this.cachedVariableReferences.has(tokenName);
    if (hasCachedVariable) {
      variable = this.cachedVariableReferences.get(tokenName);
      return variable;
    }
    const variableMapped = this.variableReferences.get(tokenName) || (isUsingReference ? this.variableReferences.get(storedToken.rawValue.slice(1, -1)) : null);
    if (!variableMapped) return false;
    if (!hasCachedVariable && typeof variableMapped === 'string') {
      try {
        const foundVariable = await figma.variables.importVariableByKeyAsync(variableMapped);
        if (foundVariable) {
          this.cachedVariableReferences.set(tokenName, foundVariable);
          variable = foundVariable;
          return variable;
        }
      } catch (e) {
        console.log('error importing variable', e);
        Promise.reject(e);
      }
    }

    if (variable === undefined) return null;
    return null;
  }

  public getTokens() {
    return this.tokens;
  }

  public clearCache() {
    if (this.cachedVariableReferences) this.cachedVariableReferences.clear();
    if (this.tokens) this.tokens.clear();
    if (this.variableReferences) this.variableReferences.clear();
    if (this.styleReferences) this.styleReferences.clear();
    if (this.potentialStylePathPrefixes) this.potentialStylePathPrefixes = undefined;
    if (this.ignoreFirstPartForStyles) this.ignoreFirstPartForStyles = undefined;
    if (this.createStylesWithVariableReferences) this.createStylesWithVariableReferences = undefined;
  }
}

const defaultTokenValueRetriever = new TokenValueRetriever();

export { defaultTokenValueRetriever };
