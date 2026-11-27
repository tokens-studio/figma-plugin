// The types shipped with i18next 24+ need TypeScript 5, while we are on 4.7 (skipLibCheck does not skip syntax errors).
// tsconfig.json maps `i18next` here for type-checking only. Remove this and the mapping once we are on TypeScript 5.
// It covers what we use, plus the types react-i18next imports.

export type Namespace = string | readonly string[];
export type FlatNamespace = string;
export type KeyPrefix<Ns> = string | undefined;
export type ParseKeys<Ns = string, TOpt = {}, KPrefix = undefined> = string;

export interface TypeOptions {
  defaultNS: 'translation';
  allowObjectInHTMLChildren: false;
}

export interface TOptions {
  count?: number;
  context?: unknown;
  defaultValue?: unknown;
  lng?: string;
  ns?: Namespace;
  [key: string]: any;
}

export interface TFunction<Ns = string, KPrefix = undefined> {
  (key: string | string[], options?: TOptions): string;
  (key: string | string[], defaultValue: string, options?: TOptions): string;
}

export interface Resource {
  [language: string]: { [namespace: string]: any };
}

export interface ReactOptions {
  useSuspense?: boolean;
  [option: string]: any;
}

export interface InitOptions {
  lng?: string;
  fallbackLng?: string | false;
  resources?: Resource;
  ns?: string | string[];
  defaultNS?: string | false;
  parseMissingKeyHandler?: (key: string, defaultValue?: string) => any;
  interpolation?: { escapeValue?: boolean };
  react?: ReactOptions;
}

export interface Module {
  type: string;
}

export interface ThirdPartyModule extends Module {
  type: '3rdParty';
  init(instance: i18n): void;
}

export interface i18n {
  t: TFunction;
  language: string;
  use(module: Module): this;
  init(options: InitOptions): Promise<TFunction>;
  changeLanguage(language?: string): Promise<TFunction>;
}

declare const i18next: i18n;
export default i18next;
