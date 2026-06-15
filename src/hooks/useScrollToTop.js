'use client';

import { useEffect } from 'react';

/**
 * Scroll the window back to the top whenever `dependency` changes.
 *
 * Multi-step flows (e.g. the patient assessment) advance by swapping rendered
 * content via state rather than navigating, so the browser keeps the previous
 * scroll position and the next "screen" appears scrolled down. Pass the value
 * that identifies the current screen (step id, question id, etc.) and this hook
 * resets the scroll position each time it changes.
 *
 * @param {*} dependency - Value that changes when a new screen is shown.
 * @param {Object} [options]
 * @param {ScrollBehavior} [options.behavior='auto'] - 'auto' (instant) or 'smooth'.
 */
export function useScrollToTop(dependency, { behavior = 'auto' } = {}) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, left: 0, behavior });
    // `behavior` is intentionally omitted from deps: only screen changes should scroll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependency]);
}

export default useScrollToTop;
