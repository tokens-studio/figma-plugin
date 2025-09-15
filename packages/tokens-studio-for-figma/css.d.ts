// eslint-disable-next-line
import * as CSS from 'csstype';

// My css.d.ts file
declare module 'csstype' {
  interface Properties {
    '--backgroundColor'?: string | number | null
    '--borderColor'?: string | number | null
  }
}

declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
