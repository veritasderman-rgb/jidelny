/**
 * Finanční normativy — Příloha č. 2, platné od 1. 9. 2025.
 * Hodnoty v Kč na strávníka a den, rozpětí min–max.
 */

import type { FinancialNormatives, FinancialRange, NewAgeCategory } from '../types.js';

export const FINANCIAL_NORMATIVES: FinancialNormatives = {
  '2-3': {
    snidane:      { min: 8,  max: 18  },
    presnidavka:  { min: 7,  max: 13  },
    obed:         { min: 15, max: 32  },
    svacina:      { min: 7,  max: 13  },
    vecere:       { min: 13, max: 24  },
    celodenni:    { min: 50, max: 100 },
    napoje_ms:    { min: 4,  max: 8   },
  },
  '4-6': {
    snidane:      { min: 9,  max: 20  },
    presnidavka:  { min: 8,  max: 15  },
    obed:         { min: 17, max: 36  },
    svacina:      { min: 8,  max: 15  },
    vecere:       { min: 15, max: 28  },
    celodenni:    { min: 57, max: 114 },
    napoje_ms:    { min: 4,  max: 8   },
  },
  '7-10': {
    snidane:      { min: 11, max: 22  },
    presnidavka:  { min: 9,  max: 20  },
    obed:         { min: 20, max: 47  },
    svacina:      { min: 8,  max: 16  },
    vecere:       { min: 17, max: 36  },
    celodenni:    { min: 65, max: 141 },
    napoje_ms:    { min: 4,  max: 8   },
  },
  '11-14': {
    snidane:      { min: 12, max: 24  },
    presnidavka:  { min: 9,  max: 20  },
    obed:         { min: 23, max: 50  },
    svacina:      { min: 9,  max: 19  },
    vecere:       { min: 18, max: 40  },
    celodenni:    { min: 71, max: 153 },
  },
  '15+': {
    snidane:      { min: 14, max: 26  },
    presnidavka:  { min: 9,  max: 20  },
    obed:         { min: 24, max: 54  },
    svacina:      { min: 9,  max: 19  },
    vecere:       { min: 21, max: 50  },
    celodenni:    { min: 77, max: 169 },
  },
};

/** II. večeře (pouze 15+) */
export const SECOND_DINNER_NORMATIVE: FinancialRange = { min: 11, max: 24 };

/** Příspěvek na osobní oslavy (ústavní péče) */
export const CELEBRATION_ALLOWANCE_PER_YEAR = 400; // Kč

/** Navýšení horního limitu pro sportovní gymnázia a taneční konzervatoře */
export const SPORTS_SCHOOL_MULTIPLIER = 1.5;

/**
 * Vrátí finanční normativ pro danou věkovou kategorii.
 * Pro sportovní gymnázia/taneční konzervatoře násobí horní limit ×1,5.
 */
export function getFinancialNormative(
  ageCategory: NewAgeCategory,
  isSportsSchool: boolean = false,
): typeof FINANCIAL_NORMATIVES[NewAgeCategory] {
  const base = FINANCIAL_NORMATIVES[ageCategory];
  if (!isSportsSchool) return base;

  const result: Record<string, unknown> = {};
  for (const [key, range] of Object.entries(base)) {
    if (range && typeof range === 'object' && 'min' in range && 'max' in range) {
      result[key] = {
        min: (range as FinancialRange).min,
        max: Math.round((range as FinancialRange).max * SPORTS_SCHOOL_MULTIPLIER),
      };
    }
  }
  return result as unknown as typeof base;
}
