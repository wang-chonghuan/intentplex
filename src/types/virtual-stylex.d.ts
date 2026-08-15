/**
 * Dev-only virtual modules published by @stylexjs/unplugin. They exist while
 * `vite dev` is running and are never part of a production build.
 */
declare module 'virtual:stylex:runtime' {
  const runtime: unknown;
  export default runtime;
}

declare module 'virtual:stylex:css-only' {
  const cssOnly: unknown;
  export default cssOnly;
}
