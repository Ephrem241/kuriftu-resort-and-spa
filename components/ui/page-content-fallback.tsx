/**
 * Suspense fallback for a page body that awaits `params`. Even a fully
 * prerendered page sends this fallback first and the real content later in
 * the same HTML (an out-of-order segment). If the browser paints in between,
 * a short fallback leaves the footer in view, and the swap pushes it down
 * (measured CLS 0.22 mobile / 0.32 desktop). At least a screen tall keeps
 * the footer below the fold, so nothing visible moves.
 */
export function PageContentFallback() {
  return <div aria-busy="true" className="min-h-screen" />
}
