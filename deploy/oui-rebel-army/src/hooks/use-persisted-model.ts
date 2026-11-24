"use client";

import { useCallback, useEffect, useState } from "react";

// The chosen model is saved in localStorage so it survives a page refresh.
const MODEL_STORAGE_KEY = "oui:selected-model";

function readPersistedModel(models: string[], fallback: string): string {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = window.localStorage.getItem(MODEL_STORAGE_KEY);
    // A saved model that the server no longer allows falls back to the default.
    if (saved && models.includes(saved)) return saved;
  } catch {
    // Ignore storage failures (private mode, quota, disabled storage).
  }
  return fallback;
}

/** Like useState, but the chosen model is remembered across refreshes. */
export function usePersistedModel(
  models: string[],
  defaultModel: string,
): readonly [string, (model: string) => void] {
  const [model, setModel] = useState(defaultModel);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModel(readPersistedModel(models, defaultModel));
  }, [models, defaultModel]);

  const selectModel = useCallback((next: string) => {
    setModel(next);
    try {
      window.localStorage.setItem(MODEL_STORAGE_KEY, next);
    } catch {
      // Ignore storage failures (private mode, quota, disabled storage).
    }
  }, []);

  return [model, selectModel] as const;
}
