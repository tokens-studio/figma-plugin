declare module '*.svg' {
  const content: React.FunctionComponent<React.PropsWithChildren<React.PropsWithChildren<React.SVGAttributes<SVGElement>>>>;
  export default content;
}
declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    directory?: string;
    webkitdirectory?: string;
  }
}
