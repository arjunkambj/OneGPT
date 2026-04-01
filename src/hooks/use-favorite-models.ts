"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_FAVORITE_MODELS, isSupportedModel } from "@/constant/ai-model";

const STORAGE_KEY = "onegpt-favorite-models";
const DEFAULT_FAVORITES = [...DEFAULT_FAVORITE_MODELS];

function readFavorites(): string[] {
  if (typeof window === "undefined") return DEFAULT_FAVORITES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_FAVORITES;
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return DEFAULT_FAVORITES;
    const sanitized = parsed.filter(
      (modelValue): modelValue is string =>
        typeof modelValue === "string" && isSupportedModel(modelValue),
    );
    return sanitized.length > 0 ? sanitized : DEFAULT_FAVORITES;
  } catch {
    return DEFAULT_FAVORITES;
  }
}

export function useFavoriteModels() {
  const [favorites, setFavorites] = useState<string[]>(DEFAULT_FAVORITES);

  useEffect(() => {
    setFavorites(readFavorites());
  }, []);

  const persist = useCallback((next: string[]) => {
    setFavorites(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const toggleFavorite = useCallback(
    (modelValue: string) => {
      const next = favorites.includes(modelValue)
        ? favorites.filter((v) => v !== modelValue)
        : [...favorites, modelValue];
      persist(next);
    },
    [favorites, persist],
  );

  const isFavorite = useCallback(
    (modelValue: string) => favorites.includes(modelValue),
    [favorites],
  );

  return { favorites, toggleFavorite, isFavorite };
}
