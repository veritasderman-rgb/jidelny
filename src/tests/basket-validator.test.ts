import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import type { OldFoodGroup, NewFoodGroup } from '../types.js';
import {
  validateOldBasket,
  validateNewBasket,
  validateFlexibleBasket,
  validateBasket,
  type DailyConsumption,
} from '../rules/basket-validator.js';
import { OLD_BASKET_LUNCH } from '../data/old-basket.js';
import { NEW_BASKET_LUNCH, FLEXIBLE_MIN_SUM_LUNCH } from '../data/new-basket.js';

function makeOldDays(overrides: Partial<Record<OldFoodGroup, number>>, count: number): DailyConsumption<OldFoodGroup>[] {
  const base: Record<OldFoodGroup, number> = {
    maso: 64, ryby: 10, mleko_tekute: 55, mlecne_vyrobky: 19,
    tuky_volne: 12, cukr_volny: 13, zelenina: 85, ovoce: 65,
    brambory: 140, lusteniny: 10,
  };
  const groups = { ...base, ...overrides };
  return Array.from({ length: count }, (_, i) => ({
    date: new Date(2026, 0, i + 1),
    groups,
  }));
}

function makeNewDays(overrides: Partial<Record<NewFoodGroup, number>>, count: number): DailyConsumption<NewFoodGroup>[] {
  const base: Record<NewFoodGroup, number> = {
    maso: 46, ryby_korysi_mekkýsi: 11, mlecne_vyrobky_mleko: 78,
    tuky_volne: 12, cukry_volne: 10, zelenina_ovoce: 162,
    brambory_hlízy: 92, celozrnne_obiloviny: 17, lusteniny: 11,
  };
  const groups = { ...base, ...overrides };
  return Array.from({ length: count }, (_, i) => ({
    date: new Date(2026, 0, i + 1),
    groups,
  }));
}

describe('validateOldBasket', () => {
  it('should pass with exact target values for 7-10', () => {
    const days = makeOldDays({}, 20);
    const result = validateOldBasket(days, '7-10', false);
    assert.ok(result.valid, `Expected valid but got: ${JSON.stringify(result.messages)}`);
  });

  it('should fail when maso is below 75% of target', () => {
    // Target for 7-10 maso oběd = 64g, 75% = 48g
    const days = makeOldDays({ maso: 40 }, 20);
    const result = validateOldBasket(days, '7-10', false);
    assert.ok(!result.valid);
    const masoError = result.messages.find((m) => m.code === 'OLD_BASKET_BELOW_MIN' && m.details?.['group'] === 'maso');
    assert.ok(masoError, 'Expected maso below min error');
  });

  it('should fail when tuky_volne exceeds 100% (upper limit)', () => {
    // Target for 7-10 tuky = 12g, max = 100% = 12g
    const days = makeOldDays({ tuky_volne: 15 }, 20);
    const result = validateOldBasket(days, '7-10', false);
    const tukyError = result.messages.find((m) => m.code === 'OLD_BASKET_ABOVE_MAX' && m.details?.['group'] === 'tuky_volne');
    assert.ok(tukyError, 'Expected tuky above max error');
  });

  it('should give info when zelenina exceeds target (desirable)', () => {
    const days = makeOldDays({ zelenina: 150 }, 20);
    const result = validateOldBasket(days, '7-10', false);
    assert.ok(result.valid, 'Exceeding zelenina should still be valid');
    const infoMsg = result.messages.find((m) => m.code === 'OLD_BASKET_EXCEEDS_RECOMMENDED');
    assert.ok(infoMsg, 'Expected info about exceeding zelenina');
  });

  it('should return error for empty data', () => {
    const result = validateOldBasket([], '7-10', false);
    assert.ok(!result.valid);
    assert.equal(result.messages[0].code, 'NO_DATA');
  });
});

describe('validateNewBasket', () => {
  it('should pass with exact target values for 7-10', () => {
    const days = makeNewDays({}, 20);
    const result = validateNewBasket(days, '7-10', false);
    assert.ok(result.valid, `Expected valid but got: ${JSON.stringify(result.messages)}`);
  });

  it('should fail when cukry_volne exceeds 100%', () => {
    // Target for 7-10 cukry = 10g, max 100% = 10g
    const days = makeNewDays({ cukry_volne: 15 }, 20);
    const result = validateNewBasket(days, '7-10', false);
    const sugarError = result.messages.find((m) => m.code === 'NEW_BASKET_ABOVE_MAX' && m.details?.['group'] === 'cukry_volne');
    assert.ok(sugarError, 'Expected cukry above max error');
  });

  it('should allow cukry_volne at 0 (minPercent = 0)', () => {
    const days = makeNewDays({ cukry_volne: 0 }, 20);
    const result = validateNewBasket(days, '7-10', false);
    const sugarBelowErr = result.messages.find(
      (m) => m.code === 'NEW_BASKET_BELOW_MIN' && m.details?.['group'] === 'cukry_volne',
    );
    assert.ok(!sugarBelowErr, 'Cukry at 0 should not produce below-min error');
  });
});

describe('validateFlexibleBasket', () => {
  it('should pass when maso=0 but sum of maso+ryby+lusteniny meets minimum', () => {
    // Min sum for 7-10 lunch = 51g
    const days = makeNewDays({ maso: 0, ryby_korysi_mekkýsi: 30, lusteniny: 25 }, 20);
    const result = validateFlexibleBasket(days, '7-10', false);
    const proteinError = result.messages.find((m) => m.code === 'FLEXIBLE_PROTEIN_SUM_BELOW_MIN');
    assert.ok(!proteinError, 'Should not fail for protein sum when >= 51g');
  });

  it('should fail when sum of maso+ryby+lusteniny is below minimum', () => {
    const days = makeNewDays({ maso: 10, ryby_korysi_mekkýsi: 5, lusteniny: 5 }, 20);
    const result = validateFlexibleBasket(days, '7-10', false);
    const proteinError = result.messages.find((m) => m.code === 'FLEXIBLE_PROTEIN_SUM_BELOW_MIN');
    assert.ok(proteinError, 'Should fail when sum < 51g');
  });
});

describe('validateBasket (universal)', () => {
  it('should route to old basket validator', () => {
    const days = makeOldDays({}, 20);
    const result = validateBasket('old', days, '7-10', false);
    assert.ok(result.valid);
  });

  it('should route to new standard validator', () => {
    const days = makeNewDays({}, 20);
    const result = validateBasket('new_standard', days, '7-10', false);
    assert.ok(result.valid);
  });

  it('should route to flexible validator', () => {
    const days = makeNewDays({ maso: 0, ryby_korysi_mekkýsi: 30, lusteniny: 25 }, 20);
    const result = validateBasket('new_flexible', days, '7-10', false);
    // Check that maso=0 doesn't cause standard error
    const masoError = result.messages.find(
      (m) => m.code === 'NEW_BASKET_BELOW_MIN' && m.details?.['group'] === 'maso',
    );
    assert.ok(!masoError, 'Flexible basket should not flag individual maso=0');
  });
});
