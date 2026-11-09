declare module '*.svg' {
  const content: React.FunctionComponent<React.PropsWithChildren<React.PropsWithChildren<React.SVGAttributes<SVGElement>>>>;
  export default content;
}

declare module '*.svg?url' {
  const url: string;
  export default url;
}
