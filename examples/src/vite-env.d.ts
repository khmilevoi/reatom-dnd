/// <reference types="vite/client" />

declare module '*.css' {
  const content: string;
  export default content;
}

import type { JSX } from 'react';

declare module '@reatom/core' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface RouteChild extends JSX.Element {}
}

