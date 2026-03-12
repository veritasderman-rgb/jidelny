import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import type { AllergenNumber } from '../types.js';
import {
  ALLERGEN_DEFINITIONS,
  ALLERGEN_MAP,
  detectAllergenConflicts,
  deriveRecipeAllergens,
} from '../data/allergens.js';

describe('ALLERGEN_DEFINITIONS', () => {
  it('should have exactly 14 allergens', () => {
    assert.equal(ALLERGEN_DEFINITIONS.length, 14);
  });

  it('should have numbers 1–14', () => {
    const numbers = ALLERGEN_DEFINITIONS.map((a) => a.number);
    for (let i = 1; i <= 14; i++) {
      assert.ok(numbers.includes(i as AllergenNumber), `Missing allergen ${i}`);
    }
  });

  it('allergen 1 (cereals) should require specific type', () => {
    const cereal = ALLERGEN_MAP.get(1);
    assert.ok(cereal);
    assert.ok(cereal.requiresSpecificType);
  });

  it('allergen 8 (tree nuts) should require specific type', () => {
    const nuts = ALLERGEN_MAP.get(8);
    assert.ok(nuts);
    assert.ok(nuts.requiresSpecificType);
  });
});

describe('detectAllergenConflicts', () => {
  it('should detect conflicts between recipe and diner profile', () => {
    const recipeAllergens: AllergenNumber[] = [1, 3, 7]; // lepek, vejce, mléko
    const dinerProfile = new Set<AllergenNumber>([7]); // mléko
    const conflicts = detectAllergenConflicts(recipeAllergens, dinerProfile);
    assert.equal(conflicts.length, 1);
    assert.equal(conflicts[0].number, 7);
  });

  it('should return empty for no conflicts', () => {
    const recipeAllergens: AllergenNumber[] = [1, 3];
    const dinerProfile = new Set<AllergenNumber>([7, 9]);
    const conflicts = detectAllergenConflicts(recipeAllergens, dinerProfile);
    assert.equal(conflicts.length, 0);
  });

  it('should detect multiple conflicts', () => {
    const recipeAllergens: AllergenNumber[] = [1, 3, 7, 9];
    const dinerProfile = new Set<AllergenNumber>([1, 7]);
    const conflicts = detectAllergenConflicts(recipeAllergens, dinerProfile);
    assert.equal(conflicts.length, 2);
  });
});

describe('deriveRecipeAllergens', () => {
  it('should merge and sort allergens from multiple ingredients', () => {
    const ingredientAllergens: AllergenNumber[][] = [
      [7, 3],
      [1, 7],
      [9],
    ];
    const result = deriveRecipeAllergens(ingredientAllergens);
    assert.deepEqual(result, [1, 3, 7, 9]);
  });

  it('should return empty for no ingredients', () => {
    const result = deriveRecipeAllergens([]);
    assert.deepEqual(result, []);
  });
});
