import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { OLD_BASKET_LUNCH, OLD_BASKET_FULL_DAY, getOldToleranceRange } from '../data/old-basket.js';
import { NEW_BASKET_LUNCH, NEW_BASKET_FULL_DAY, FLEXIBLE_MIN_SUM_LUNCH, FLEXIBLE_MIN_SUM_FULL_DAY, getNewToleranceRange } from '../data/new-basket.js';
import { FINANCIAL_NORMATIVES, getFinancialNormative, SPORTS_SCHOOL_MULTIPLIER } from '../data/financial-normatives.js';
import { ENERGY_DISTRIBUTION, PORTION_COEFFICIENTS } from '../data/energy.js';
import { BANNED_ITEMS, SALT_LIMITS, ALLOWED_BEVERAGES } from '../data/restrictions.js';

describe('Old basket data integrity', () => {
  it('should have correct maso for 7-10 lunch', () => {
    assert.equal(OLD_BASKET_LUNCH.maso['7-10'], 64);
  });

  it('should have correct brambory for 15-18 lunch', () => {
    assert.equal(OLD_BASKET_LUNCH.brambory['15-18'], 170);
  });

  it('should have correct maso for 3-6 full day', () => {
    assert.equal(OLD_BASKET_FULL_DAY.maso['3-6'], 114);
  });

  it('tolerance range for tuky_volne should cap at 100%', () => {
    const range = getOldToleranceRange('tuky_volne', 12);
    assert.equal(range.min, 9);
    assert.equal(range.max, 12);
  });

  it('tolerance range for zelenina should have no upper limit', () => {
    const range = getOldToleranceRange('zelenina', 85);
    assert.equal(range.max, null);
  });
});

describe('New basket data integrity', () => {
  it('should have correct maso for 4-6 lunch', () => {
    assert.equal(NEW_BASKET_LUNCH.maso['4-6'], 39);
  });

  it('should have correct zelenina_ovoce for 15+ full day', () => {
    assert.equal(NEW_BASKET_FULL_DAY.zelenina_ovoce['15+'], 667);
  });

  it('should have celozrnne_obiloviny as new group', () => {
    assert.ok('celozrnne_obiloviny' in NEW_BASKET_LUNCH);
    assert.equal(NEW_BASKET_LUNCH.celozrnne_obiloviny['7-10'], 17);
  });

  it('tolerance for cukry_volne should allow 0 minimum', () => {
    const range = getNewToleranceRange('cukry_volne', 10);
    assert.equal(range.min, 0);
    assert.equal(range.max, 10);
  });

  it('tolerance for lusteniny should have no upper limit', () => {
    const range = getNewToleranceRange('lusteniny', 11);
    assert.equal(range.max, null);
  });
});

describe('Flexible basket minimums', () => {
  it('should have correct sum for 7-10 lunch', () => {
    assert.equal(FLEXIBLE_MIN_SUM_LUNCH['7-10'], 51);
  });

  it('should have correct sum for 15+ full day', () => {
    assert.equal(FLEXIBLE_MIN_SUM_FULL_DAY['15+'], 147);
  });
});

describe('Financial normatives', () => {
  it('should have 5 age categories', () => {
    const keys = Object.keys(FINANCIAL_NORMATIVES);
    assert.equal(keys.length, 5);
  });

  it('should have correct obed range for 11-14', () => {
    assert.equal(FINANCIAL_NORMATIVES['11-14'].obed.min, 23);
    assert.equal(FINANCIAL_NORMATIVES['11-14'].obed.max, 50);
  });

  it('sports school should multiply max by 1.5', () => {
    const normative = getFinancialNormative('11-14', true);
    assert.equal(normative.obed.max, Math.round(50 * 1.5));
    assert.equal(normative.obed.min, 23); // min stays
  });

  it('napoje_ms should be defined for young categories', () => {
    assert.ok(FINANCIAL_NORMATIVES['2-3'].napoje_ms);
    assert.equal(FINANCIAL_NORMATIVES['2-3'].napoje_ms!.min, 4);
  });
});

describe('Energy distribution', () => {
  it('should sum to 100%', () => {
    const sum = ENERGY_DISTRIBUTION.snidane + ENERGY_DISTRIBUTION.presnidavka +
      ENERGY_DISTRIBUTION.obed + ENERGY_DISTRIBUTION.svacina + ENERGY_DISTRIBUTION.vecere;
    assert.equal(sum, 100);
  });

  it('obed should be 35%', () => {
    assert.equal(ENERGY_DISTRIBUTION.obed, 35);
  });
});

describe('Restrictions data', () => {
  it('should have banned items', () => {
    assert.ok(BANNED_ITEMS.length > 0);
  });

  it('should have salt limits', () => {
    assert.equal(SALT_LIMITS.mainCoursePer10Portions.max, 20);
  });

  it('should have allowed beverages', () => {
    assert.ok(ALLOWED_BEVERAGES.length >= 5);
  });
});
