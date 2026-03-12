/**
 * Pravidla pestrosti jídelníčku a frekvence podávání.
 * Založeno na doporučeních SZÚ a novele 310/2025 Sb.
 * Referenční období: 20 stravovacích dnů/měsíc.
 */

import type { FrequencyRule } from '../types.js';

export const WORKING_DAYS_PER_MONTH = 20;

// ============================================================
// Pravidla pro hlavní jídla (oběd) — 20 dnů/měsíc
// ============================================================

export const MAIN_DISH_FREQUENCY_RULES: ReadonlyArray<FrequencyRule> = [
  {
    category: 'drubez',
    minPerMonth: 3,
    maxPerMonth: null,
    description: 'Drůbež: doporučeno 3× za měsíc',
  },
  {
    category: 'ryba',
    minPerMonth: 2,
    maxPerMonth: null,
    description: 'Ryby: minimálně 2× za měsíc',
  },
  {
    category: 'veprove',
    minPerMonth: null,
    maxPerMonth: 4,
    description: 'Vepřové: maximálně 4× za měsíc',
  },
  {
    category: 'hovezi_kralik_jine',
    minPerMonth: null,
    maxPerMonth: null,
    description: 'Hovězí/králík/jiné: doporučeno 5× za měsíc',
  },
  {
    category: 'bezmase_zeleninove',
    minPerMonth: 4,
    maxPerMonth: null,
    description: 'Bezmasé zeleninové: doporučeno 4× za měsíc',
  },
  {
    category: 'sladke_jidlo',
    minPerMonth: null,
    maxPerMonth: 2,
    description: 'Sladké jídlo: max. 1× za 2 týdny (≈2× za měsíc)',
  },
  {
    category: 'vnitrnosti',
    minPerMonth: null,
    maxPerMonth: null,
    description: 'Vnitřnosti: doporučeno 1× za měsíc',
  },
  {
    category: 'uzeniny',
    minPerMonth: null,
    maxPerMonth: 1,
    description: 'Uzeniny: max. 1× za měsíc (nedoporučuje se)',
  },
];

// ============================================================
// Pravidla pro přílohy — 20 dnů/měsíc
// ============================================================

export const SIDE_DISH_FREQUENCY_RULES: ReadonlyArray<FrequencyRule> = [
  {
    category: 'brambory_varene',
    minPerMonth: null,
    maxPerMonth: null,
    description: 'Brambory vařené/pečené: doporučeno 5× za měsíc',
  },
  {
    category: 'bramborova_kase',
    minPerMonth: null,
    maxPerMonth: null,
    description: 'Bramborová kaše: doporučeno 2× za měsíc',
  },
  {
    category: 'testoviny',
    minPerMonth: null,
    maxPerMonth: null,
    description: 'Těstoviny (vč. celozrnných): doporučeno 3× za měsíc',
  },
  {
    category: 'ryze',
    minPerMonth: null,
    maxPerMonth: null,
    description: 'Rýže (vč. natural, parboiled): doporučeno 4× za měsíc',
  },
  {
    category: 'houskove_knedliky',
    minPerMonth: null,
    maxPerMonth: 2,
    description: 'Houskové knedlíky: max. 2× za měsíc',
  },
  {
    category: 'bramborove_knedliky',
    minPerMonth: null,
    maxPerMonth: null,
    description: 'Bramborové knedlíky: doporučeno 1× za měsíc',
  },
  {
    category: 'lusteniny',
    minPerMonth: 1,
    maxPerMonth: null,
    description: 'Luštěniny: min. 1× za měsíc',
  },
];

// ============================================================
// Struktura týdenního oběda (nový režim, bez výběru)
// ============================================================

export interface WeeklyLunchStructure {
  day1: 'bile_maso';          // drůbež, králík, zvěřina
  day2: 'bile_nebo_cervene';  // bílé nebo červené maso
  day3: 'ryba_nebo_bile';     // ryba (min 2×/měsíc) nebo bílé maso
  day4: 'bezmase';            // bezmasé jídlo
  day5: 'bezmase';            // bezmasé jídlo
}

export const WEEKLY_LUNCH_TEMPLATE: WeeklyLunchStructure = {
  day1: 'bile_maso',
  day2: 'bile_nebo_cervene',
  day3: 'ryba_nebo_bile',
  day4: 'bezmase',
  day5: 'bezmase',
};

// ============================================================
// Pravidla pro jemné pečivo a další omezení pestrosti
// ============================================================

export const PASTRY_LIMITS = {
  /** Jemné pečivo u obědů: max. za měsíc */
  lunchMaxPerMonth: 2,
  /** Jemné pečivo u svačin: max. za měsíc */
  snackMaxPerMonth: 4,
  /** Jemné pečivo celodenní: max. za měsíc */
  fullDayMaxPerMonth: 8,
} as const;

/** Smažená jídla: max. za měsíc */
export const FRIED_FOOD_LIMITS = {
  schoolMaxPerMonth: 2,
  /** V MŠ se smažení zcela vyhýbat */
  kindergartenMaxPerMonth: 0,
} as const;

/** Maximální podíl masných výrobků/polotovarů na skupině "maso" */
export const PROCESSED_MEAT_MAX_PERCENT = 20;

/** Maximální podíl kompotů/sterilované zeleniny na skupině zelenina+ovoce */
export const CANNED_PRODUCE_MAX_PERCENT = 15;

/** Max. počet variant hlavního jídla denně */
export const MAX_MAIN_DISH_VARIANTS = 2;

/** Slazené mléčné nápoje/kakao limity za měsíc */
export const SWEETENED_DAIRY_LIMITS = {
  lunchMaxPerMonth: 1,
  snackMaxPerMonth: 2,
  fullDayMaxPerMonth: 4,
} as const;
