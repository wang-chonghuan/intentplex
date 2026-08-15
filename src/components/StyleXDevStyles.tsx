import {useEffect} from 'react';

/**
 * Dev-only StyleX plumbing.
 *
 * In a production build @stylexjs/unplugin appends the compiled StyleX rules
 * to the CSS asset app.css already emits, so nothing extra is needed. In dev
 * the rules are served from a virtual module instead; the link picks them up
 * on first paint and the runtime import re-fetches them on HMR.
 */
export function StyleXDevStyles() {
  if (!import.meta.env.DEV) {
    return null;
  }
  return <StyleXDevStylesImpl />;
}

function StyleXDevStylesImpl() {
  useEffect(() => {
    void import(/* @vite-ignore */ 'virtual:stylex:runtime');
  }, []);

  return <link rel="stylesheet" href="/virtual:stylex.css" />;
}
