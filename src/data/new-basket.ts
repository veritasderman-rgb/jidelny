/**
 * Nový spotřební koš — vyhláška č. 310/2025 Sb.
 * Gramáže v g čisté hmotnosti (jedlý podíl) na strávníka a den.
 * Účinnost od 1. 9. 2025, přechodné období do 31. 8. 2026.
 */

import type {
  NewBasket,
  NewTolerances,
  NewAgeCategory,
  NewFoodGroup,
  FlexibleBasketMinSum,
} from '../types.js';

// ============================================================
// Standardní koš — Oběd
// ============================================================

export const NEW_BASKET_LUNCH: NewBasket = {
  maso:                   { '2-3': 26, '4-6': 39, '7-10': 46,  '11-14': 52,  '15+': 65  },
  ryby_korysi_mekkýsi:    { '2-3': 6,  '4-6': 9,  '7-10': 11,  '11-14': 13,  '15+': 16  },
  mlecne_vyrobky_mleko:   { '2-3': 44, '4-6': 67, '7-10': 78,  '11-14': 89,  '15+': 111 },
  tuky_volne:             { '2-3': 7,  '4-6': 10, '7-10': 12,  '11-14': 13,  '15+': 17  },
  cukry_volne:            { '2-3': 6,  '4-6': 8,  '7-10': 10,  '11-14': 11,  '15+': 14  },
  zelenina_ovoce:         { '2-3': 94, '4-6': 140,'7-10': 162, '11-14': 187, '15+': 233 },
  brambory_hlízy:         { '2-3': 53, '4-6': 79, '7-10': 92,  '11-14': 106, '15+': 132 },
  celozrnne_obiloviny:    { '2-3': 11, '4-6': 14, '7-10': 17,  '11-14': 20,  '15+': 25  },
  lusteniny:              { '2-3': 7,  '4-6': 9,  '7-10': 11,  '11-14': 13,  '15+': 15  },
};

// ============================================================
// Standardní koš — Celodenní stravování
// ============================================================

export const NEW_BASKET_FULL_DAY: NewBasket = {
  maso:                   { '2-3': 52,  '4-6': 78,  '7-10': 91,  '11-14': 104, '15+': 130 },
  ryby_korysi_mekkýsi:    { '2-3': 13,  '4-6': 19,  '7-10': 22,  '11-14': 26,  '15+': 32  },
  mlecne_vyrobky_mleko:   { '2-3': 296, '4-6': 445, '7-10': 519, '11-14': 593, '15+': 741 },
  tuky_volne:             { '2-3': 19,  '4-6': 29,  '7-10': 34,  '11-14': 38,  '15+': 48  },
  cukry_volne:            { '2-3': 16,  '4-6': 24,  '7-10': 28,  '11-14': 32,  '15+': 40  },
  zelenina_ovoce:         { '2-3': 267, '4-6': 400, '7-10': 465, '11-14': 534, '15+': 667 },
  brambory_hlízy:         { '2-3': 96,  '4-6': 144, '7-10': 168, '11-14': 192, '15+': 240 },
  celozrnne_obiloviny:    { '2-3': 29,  '4-6': 43,  '7-10': 50,  '11-14': 58,  '15+': 72  },
  lusteniny:              { '2-3': 13,  '4-6': 19,  '7-10': 22,  '11-14': 26,  '15+': 32  },
};

// ============================================================
// Podrobné rozložení po jídlech — 4–6 let (příklad z vyhlášky)
// ============================================================

export interface MealBreakdown {
  snidane: Record<NewFoodGroup, number>;
  presnidavka: Record<NewFoodGroup, number>;
  obed: Record<NewFoodGroup, number>;
  svacina: Record<NewFoodGroup, number>;
  vecere: Record<NewFoodGroup, number>;
}

export const MEAL_BREAKDOWN_4_6: MealBreakdown = {
  snidane: {
    maso: 8, ryby_korysi_mekkýsi: 0, mlecne_vyrobky_mleko: 147,
    tuky_volne: 5, cukry_volne: 5, zelenina_ovoce: 72,
    brambory_hlízy: 0, celozrnne_obiloviny: 8, lusteniny: 0,
  },
  presnidavka: {
    maso: 4, ryby_korysi_mekkýsi: 3, mlecne_vyrobky_mleko: 89,
    tuky_volne: 4, cukry_volne: 4, zelenina_ovoce: 60,
    brambory_hlízy: 0, celozrnne_obiloviny: 7, lusteniny: 2,
  },
  obed: {
    maso: 39, ryby_korysi_mekkýsi: 9, mlecne_vyrobky_mleko: 67,
    tuky_volne: 10, cukry_volne: 8, zelenina_ovoce: 140,
    brambory_hlízy: 79, celozrnne_obiloviny: 14, lusteniny: 9,
  },
  svacina: {
    maso: 4, ryby_korysi_mekkýsi: 2, mlecne_vyrobky_mleko: 44,
    tuky_volne: 4, cukry_volne: 2, zelenina_ovoce: 41,
    brambory_hlízy: 0, celozrnne_obiloviny: 4, lusteniny: 2,
  },
  vecere: {
    maso: 23, ryby_korysi_mekkýsi: 5, mlecne_vyrobky_mleko: 98,
    tuky_volne: 6, cukry_volne: 5, zelenina_ovoce: 87,
    brambory_hlízy: 65, celozrnne_obiloviny: 10, lusteniny: 6,
  },
};

// ============================================================
// Tolerance nového koše (Tabulka č. 3)
// ============================================================

export const NEW_TOLERANCES: NewTolerances = {
  maso:                   { minPercent: 75,  maxPercent: 125  },
  ryby_korysi_mekkýsi:    { minPercent: 75,  maxPercent: null },
  mlecne_vyrobky_mleko:   { minPercent: 75,  maxPercent: 125  },
  tuky_volne:             { minPercent: 75,  maxPercent: 100  },
  cukry_volne:            { minPercent: 0,   maxPercent: 100  },
  zelenina_ovoce:         { minPercent: 75,  maxPercent: null },
  brambory_hlízy:         { minPercent: 75,  maxPercent: 125  },
  celozrnne_obiloviny:    { minPercent: 75,  maxPercent: null },
  lusteniny:              { minPercent: 75,  maxPercent: null },
};

// ============================================================
// Flexibilní koš (Příloha č. 1a)
// ============================================================

/**
 * Minimální součet (maso + ryby + luštěniny) — oběd (g).
 * V flexibilním koši mohou maso a ryby individuálně klesnout na 0 %,
 * ale součet musí splnit tuto hodnotu.
 */
export const FLEXIBLE_MIN_SUM_LUNCH: FlexibleBasketMinSum = {
  '2-3': 29,
  '4-6': 44,
  '7-10': 51,
  '11-14': 58,
  '15+': 73,
};

/** Minimální součet (maso + ryby + luštěniny) — celodenní (g) */
export const FLEXIBLE_MIN_SUM_FULL_DAY: FlexibleBasketMinSum = {
  '2-3': 59,
  '4-6': 88,
  '7-10': 102,
  '11-14': 116,
  '15+': 147,
};

/**
 * Vrátí gramáž pro danou věkovou kategorii a potravinovou skupinu.
 */
export function getNewBasketGramage(
  basket: NewBasket,
  group: NewFoodGroup,
  ageCategory: NewAgeCategory,
): number {
  return basket[group][ageCategory];
}

/**
 * Vrátí tolerované rozpětí (min, max) pro danou skupinu a gramáž.
 */
export function getNewToleranceRange(
  group: NewFoodGroup,
  baseGrams: number,
): { min: number; max: number | null } {
  const tol = NEW_TOLERANCES[group];
  return {
    min: baseGrams * (tol.minPercent / 100),
    max: tol.maxPercent !== null ? baseGrams * (tol.maxPercent / 100) : null,
  };
}
