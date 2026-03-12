/**
 * Starý spotřební koš — vyhláška č. 107/2005 Sb.
 * Gramáže v g "jak nakoupeno" na strávníka a den.
 * Platný do 31. 8. 2026 pro zařízení, která nepřešla na nový koš.
 */

import type { OldBasket, OldTolerances, OldAgeCategory } from '../types.js';

// ============================================================
// Oběd (školy) / přesnídávka + oběd + svačina (MŠ 3–6 let)
// ============================================================

export const OLD_BASKET_LUNCH: OldBasket = {
  maso:            { '3-6': 55,  '7-10': 64,  '11-14': 70,  '15-18': 75  },
  ryby:            { '3-6': 10,  '7-10': 10,  '11-14': 10,  '15-18': 10  },
  mleko_tekute:    { '3-6': 300, '7-10': 55,  '11-14': 70,  '15-18': 100 },
  mlecne_vyrobky:  { '3-6': 31,  '7-10': 19,  '11-14': 17,  '15-18': 9   },
  tuky_volne:      { '3-6': 17,  '7-10': 12,  '11-14': 15,  '15-18': 17  },
  cukr_volny:      { '3-6': 20,  '7-10': 13,  '11-14': 16,  '15-18': 16  },
  zelenina:        { '3-6': 110, '7-10': 85,  '11-14': 90,  '15-18': 100 },
  ovoce:           { '3-6': 110, '7-10': 65,  '11-14': 80,  '15-18': 90  },
  brambory:        { '3-6': 90,  '7-10': 140, '11-14': 160, '15-18': 170 },
  lusteniny:       { '3-6': 10,  '7-10': 10,  '11-14': 10,  '15-18': 10  },
};

// ============================================================
// Celodenní stravování
// ============================================================

export const OLD_BASKET_FULL_DAY: OldBasket = {
  maso:            { '3-6': 114, '7-10': 149, '11-14': 159, '15-18': 163 },
  ryby:            { '3-6': 20,  '7-10': 30,  '11-14': 30,  '15-18': 20  },
  mleko_tekute:    { '3-6': 450, '7-10': 250, '11-14': 300, '15-18': 300 },
  mlecne_vyrobky:  { '3-6': 60,  '7-10': 70,  '11-14': 85,  '15-18': 85  },
  tuky_volne:      { '3-6': 25,  '7-10': 35,  '11-14': 36,  '15-18': 35  },
  cukr_volny:      { '3-6': 40,  '7-10': 55,  '11-14': 65,  '15-18': 50  },
  zelenina:        { '3-6': 190, '7-10': 215, '11-14': 215, '15-18': 250 },
  ovoce:           { '3-6': 180, '7-10': 170, '11-14': 210, '15-18': 240 },
  brambory:        { '3-6': 150, '7-10': 300, '11-14': 350, '15-18': 300 },
  lusteniny:       { '3-6': 15,  '7-10': 30,  '11-14': 30,  '15-18': 20  },
};

// ============================================================
// Tolerance starého koše
// ============================================================

/**
 * Měsíční průměrná spotřeba s tolerancí ±25 %.
 * Výjimky:
 *   - tuky_volne a cukr_volny: horní limit (min 75%, max 100%)
 *   - zelenina, ovoce, lusteniny: žádoucí překračovat (max = null)
 */
export const OLD_TOLERANCES: OldTolerances = {
  maso:            { minPercent: 75,  maxPercent: 125  },
  ryby:            { minPercent: 75,  maxPercent: 125  },
  mleko_tekute:    { minPercent: 75,  maxPercent: 125  },
  mlecne_vyrobky:  { minPercent: 75,  maxPercent: 125  },
  tuky_volne:      { minPercent: 75,  maxPercent: 100  },
  cukr_volny:      { minPercent: 75,  maxPercent: 100  },
  zelenina:        { minPercent: 75,  maxPercent: null  },
  ovoce:           { minPercent: 75,  maxPercent: null  },
  brambory:        { minPercent: 75,  maxPercent: 125  },
  lusteniny:       { minPercent: 75,  maxPercent: null  },
};

// ============================================================
// Přepočtové koeficienty pro starý koš
// ============================================================

/** Koeficient pro přepočet mražené/sterilované zeleniny na čerstvou */
export const FROZEN_VEGETABLE_COEFFICIENT = 1.42;

/** Koeficient pro přepočet sušené zeleniny na čerstvou */
export const DRIED_VEGETABLE_COEFFICIENT = 10;

/**
 * Vrátí gramáž pro danou věkovou kategorii, potravinovou skupinu a typ koše.
 */
export function getOldBasketGramage(
  basket: OldBasket,
  group: keyof OldBasket,
  ageCategory: OldAgeCategory,
): number {
  return basket[group][ageCategory];
}

/**
 * Vrátí tolerované rozpětí (min, max) pro danou skupinu a gramáž.
 * max = null znamená, že překračování je žádoucí.
 */
export function getOldToleranceRange(
  group: keyof OldBasket,
  baseGrams: number,
): { min: number; max: number | null } {
  const tol = OLD_TOLERANCES[group];
  return {
    min: baseGrams * (tol.minPercent / 100),
    max: tol.maxPercent !== null ? baseGrams * (tol.maxPercent / 100) : null,
  };
}
