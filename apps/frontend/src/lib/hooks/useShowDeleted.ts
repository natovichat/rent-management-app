'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'show_deleted_entities';

/**
 * Hook that manages the "show deleted entities" preference.
 * Only meaningful for ADMIN users — persisted in localStorage.
 */
export function useShowDeleted() {
  const [showDeleted, setShowDeletedState] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setShowDeletedState(stored === 'true');
    } catch {
      // localStorage not available
    }
    setHydrated(true);
  }, []);

  const setShowDeleted = useCallback((value: boolean) => {
    setShowDeletedState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false');
    } catch {
      // localStorage not available
    }
  }, []);

  return { showDeleted, setShowDeleted, hydrated };
}
