declare module 'react-katex' {
  import { ComponentType } from 'react';

  interface KatexProps {
    math: string;
    errorColor?: string;
    renderError?: (error: Error) => JSX.Element;
    settings?: Record<string, unknown>;
    as?: string | ComponentType;
  }

  export const InlineMath: ComponentType<KatexProps>;
  export const BlockMath: ComponentType<KatexProps>;
}
