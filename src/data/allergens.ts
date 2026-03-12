/**
 * 14 povinných alergenů dle nařízení EU č. 1169/2011.
 * Česká transpozice: zákon č. 110/1997 Sb., § 9a a vyhláška č. 417/2016 Sb., § 7 odst. 3.
 */

import type { AllergenDefinition, AllergenNumber } from '../types.js';

export const ALLERGEN_DEFINITIONS: ReadonlyArray<AllergenDefinition> = [
  {
    number: 1,
    nameCz: 'Obiloviny obsahující lepek',
    nameEn: 'Cereals containing gluten',
    note: 'Pšenice (vč. špaldy, kamutu), žito, ječmen, oves a jejich kříženci',
    requiresSpecificType: true,
  },
  {
    number: 2,
    nameCz: 'Korýši',
    nameEn: 'Crustaceans',
    note: 'A výrobky z nich',
    requiresSpecificType: false,
  },
  {
    number: 3,
    nameCz: 'Vejce',
    nameEn: 'Eggs',
    note: 'A výrobky z nich',
    requiresSpecificType: false,
  },
  {
    number: 4,
    nameCz: 'Ryby',
    nameEn: 'Fish',
    note: 'A výrobky z nich',
    requiresSpecificType: false,
  },
  {
    number: 5,
    nameCz: 'Arašídy',
    nameEn: 'Peanuts',
    note: 'A výrobky z nich',
    requiresSpecificType: false,
  },
  {
    number: 6,
    nameCz: 'Sójové boby',
    nameEn: 'Soybeans',
    note: 'A výrobky z nich',
    requiresSpecificType: false,
  },
  {
    number: 7,
    nameCz: 'Mléko',
    nameEn: 'Milk',
    note: 'Včetně laktózy a výrobků z mléka',
    requiresSpecificType: false,
  },
  {
    number: 8,
    nameCz: 'Skořápkové plody',
    nameEn: 'Tree nuts',
    note: 'Mandle, lískové, vlašské, kešu, pekanové, para, pistácie, makadamie',
    requiresSpecificType: true,
  },
  {
    number: 9,
    nameCz: 'Celer',
    nameEn: 'Celery',
    note: 'A výrobky z něj',
    requiresSpecificType: false,
  },
  {
    number: 10,
    nameCz: 'Hořčice',
    nameEn: 'Mustard',
    note: 'A výrobky z ní',
    requiresSpecificType: false,
  },
  {
    number: 11,
    nameCz: 'Sezamová semena',
    nameEn: 'Sesame seeds',
    note: 'A výrobky z nich',
    requiresSpecificType: false,
  },
  {
    number: 12,
    nameCz: 'Oxid siřičitý a siřičitany',
    nameEn: 'Sulphur dioxide and sulphites',
    note: 'Při koncentraci > 10 mg/kg (l) vyjádřeno jako SO₂',
    requiresSpecificType: false,
  },
  {
    number: 13,
    nameCz: 'Vlčí bob (lupina)',
    nameEn: 'Lupin',
    note: 'A výrobky z něj',
    requiresSpecificType: false,
  },
  {
    number: 14,
    nameCz: 'Měkkýši',
    nameEn: 'Molluscs',
    note: 'A výrobky z nich',
    requiresSpecificType: false,
  },
];

/** Mapa alergenů dle čísla pro rychlý přístup */
export const ALLERGEN_MAP: ReadonlyMap<AllergenNumber, AllergenDefinition> = new Map(
  ALLERGEN_DEFINITIONS.map((a) => [a.number, a]),
);

/**
 * Detekuje kolize receptury s alergenním profilem strávníka.
 */
export function detectAllergenConflicts(
  recipeAllergens: ReadonlyArray<AllergenNumber>,
  dinerProfile: ReadonlySet<AllergenNumber>,
): AllergenDefinition[] {
  const conflicts: AllergenDefinition[] = [];
  for (const allergenNum of recipeAllergens) {
    if (dinerProfile.has(allergenNum)) {
      const def = ALLERGEN_MAP.get(allergenNum);
      if (def) conflicts.push(def);
    }
  }
  return conflicts;
}

/**
 * Odvodí alergeny receptury ze seznamu ingrediencí.
 */
export function deriveRecipeAllergens(
  ingredientAllergens: ReadonlyArray<ReadonlyArray<AllergenNumber>>,
): AllergenNumber[] {
  const set = new Set<AllergenNumber>();
  for (const allergens of ingredientAllergens) {
    for (const a of allergens) {
      set.add(a);
    }
  }
  return Array.from(set).sort((a, b) => a - b);
}
