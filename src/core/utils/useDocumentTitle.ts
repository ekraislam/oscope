/**
 * OScope — Document Title & Meta Synchronizer Hook
 * Updates document.title and meta description dynamically as routes change.
 */

import { useEffect } from 'react';

const TITLE_PREFIX = 'OScope';
const BASE_TITLE = 'OScope — Interactive Operating System Observatory';

export function useDocumentTitle(subTitle?: string, description?: string): void {
  useEffect(() => {
    if (subTitle) {
      document.title = `${TITLE_PREFIX} — ${subTitle}`;
    } else {
      document.title = BASE_TITLE;
    }

    if (description) {
      const metaTag = document.querySelector('meta[name="description"]');
      if (metaTag) {
        metaTag.setAttribute('content', description);
      }
    }
  }, [subTitle, description]);
}
