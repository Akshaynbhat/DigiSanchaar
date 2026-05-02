
'use client';

import { useEffect } from 'react';

/**
 * This component handles Next.js ChunkLoadError exceptions by forcing a page reload.
 * This is a common issue when a new deployment happens while a user is active on the site.
 * The browser tries to fetch an old, now-deleted JavaScript chunk, causing an error.
 * Reloading the page fetches the new chunks and resolves the problem.
 *
 * It listens for unhandled promise rejections, which is how these errors surface.
 */
export function ChunkLoadErrorHandler() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && event.reason.name === 'ChunkLoadError') {
        console.warn('ChunkLoadError detected. Forcing a page reload to recover.');
        window.location.reload();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // This component does not render anything.
  return null;
}
