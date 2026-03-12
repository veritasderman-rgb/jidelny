/**
 * Energetická distribuce a orientační hodnoty.
 */

import type { EnergyDistribution, NewAgeCategory } from '../types.js';

/** Podíl jednotlivých jídel na denním energetickém příjmu (%) */
export const ENERGY_DISTRIBUTION: EnergyDistribution = {
  snidane: 18,
  presnidavka: 15,
  obed: 35,
  svacina: 10,
  vecere: 22,
};

/** Orientační energetické hodnoty oběda (35 % denního příjmu) v kcal */
export const LUNCH_ENERGY_KCAL: Record<string, { min: number; max: number }> = {
  '7-10':  { min: 600,  max: 665  },
  '11-14': { min: 700,  max: 875  },
  '15-18': { min: 700,  max: 1050 },
};

/** Porční koeficienty (od dospělé porce) */
export const PORTION_COEFFICIENTS: Record<string, number> = {
  '3-6':   0.5,
  '7-10':  0.7,
  '11-14': 0.8,
  '15-18': 0.9,
};

/**
 * Makronutrientové poměry (dle DACH / Společnost pro výživu).
 */
export const MACRONUTRIENT_RATIOS = {
  protein: { minEnergyPercent: 10, maxEnergyPercent: 15, gramsPerKgPerDay: 0.9 },
  fat: {
    minEnergyPercent: 30,
    maxEnergyPercent: 35,
    saturatedMaxPercent: 10,
    polyunsaturatedMinPercent: 7,
    polyunsaturatedMaxPercent: 10,
    n6_n3_maxRatio: 5,
    cholesterolMaxMg: 300,
    plantToAnimalMinRatio: 2, // nový požadavek 2:1 ve prospěch rostlinných
  },
  carbohydrates: {
    minEnergyPercent: 55,
    maxEnergyPercent: 65,
    addedSugarMaxPercent: 10,
  },
} as const;

/** Denní potřeba tekutin u školních dětí (ml) */
export const DAILY_FLUID_NEEDS = { min: 1600, max: 2150 };

/** Doporučené denní dávky vápníku (mg/den) */
export const CALCIUM_DAILY: Record<string, { min: number; max: number }> = {
  'preschool': { min: 800,  max: 800  },
  'school':    { min: 800,  max: 1200 },
  'adolescent':{ min: 1200, max: 1500 },
};
