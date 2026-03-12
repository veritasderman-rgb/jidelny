import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import type { MonthlyMenuPlan, DailyMenu, MealEntry, Recipe } from '../types.js';
import {
  validateFrequencyRules,
  validateFriedFoods,
  validateSalt,
  validateDailyMenuRules,
  checkBannedIngredients,
} from '../rules/menu-validator.js';

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: '1',
    name: 'Testovací recept',
    mealType: 'obed',
    ingredients: [],
    allergens: [],
    isSweet: false,
    isFried: false,
    portions: 10,
    ...overrides,
  };
}

function makeMeal(overrides: Partial<MealEntry> = {}): MealEntry {
  return {
    mealType: 'obed',
    recipes: [makeRecipe()],
    hasMeatFreeOption: false,
    beverage: 'voda',
    ...overrides,
  };
}

function makeDay(date: Date, meals: MealEntry[]): DailyMenu {
  return { date, meals };
}

function makePlan(days: DailyMenu[]): MonthlyMenuPlan {
  return { year: 2026, month: 1, schoolDays: days.length, dailyMenus: days };
}

describe('validateFriedFoods', () => {
  it('should pass when no fried foods', () => {
    const plan = makePlan([makeDay(new Date(), [makeMeal()])]);
    const result = validateFriedFoods(plan, false);
    assert.ok(result.valid);
  });

  it('should fail in kindergarten with any fried food', () => {
    const friedRecipe = makeRecipe({ isFried: true });
    const plan = makePlan([makeDay(new Date(), [makeMeal({ recipes: [friedRecipe] })])]);
    const result = validateFriedFoods(plan, true);
    assert.ok(!result.valid);
    assert.equal(result.messages[0].code, 'FRIED_OVER_LIMIT');
  });

  it('should fail in school with more than 2 fried foods per month', () => {
    const days = Array.from({ length: 3 }, (_, i) =>
      makeDay(new Date(2026, 0, i + 1), [makeMeal({ recipes: [makeRecipe({ isFried: true })] })]),
    );
    const plan = makePlan(days);
    const result = validateFriedFoods(plan, false);
    assert.ok(!result.valid);
  });
});

describe('validateSalt', () => {
  it('should pass when salt is within limits', () => {
    const recipe = makeRecipe({ saltPer10Portions: 18, mainDishCategory: 'drubez' });
    const result = validateSalt([recipe]);
    assert.ok(result.valid);
  });

  it('should fail when main dish salt exceeds 20g per 10 portions', () => {
    const recipe = makeRecipe({ saltPer10Portions: 25, mainDishCategory: 'drubez' });
    const result = validateSalt([recipe]);
    assert.ok(!result.valid);
    assert.equal(result.messages[0].code, 'SALT_MAIN_OVER');
  });
});

describe('validateDailyMenuRules', () => {
  it('should error when beverage is missing', () => {
    const meal = makeMeal({ beverage: '' });
    const result = validateDailyMenuRules([makeDay(new Date(), [meal])]);
    assert.ok(!result.valid);
    assert.equal(result.messages[0].code, 'MISSING_BEVERAGE');
  });

  it('should error when multiple variants but no meat-free option', () => {
    const meal = makeMeal({
      recipes: [makeRecipe(), makeRecipe()],
      hasMeatFreeOption: false,
    });
    const result = validateDailyMenuRules([makeDay(new Date(), [meal])]);
    const noMeatFree = result.messages.find((m) => m.code === 'NO_MEATFREE_VARIANT');
    assert.ok(noMeatFree);
  });
});

describe('checkBannedIngredients', () => {
  it('should detect instant/bouillon ingredients', () => {
    const recipe = makeRecipe({
      ingredients: [
        {
          name: 'Bujón hovězí',
          grossWeight: 10,
          netWeight: 10,
          conversionCoefficient: 1,
          newFoodGroup: 'maso',
          oldFoodGroup: 'maso',
          allergens: [],
          isBio: false,
          isSeasonal: false,
        },
      ],
    });
    const result = checkBannedIngredients([recipe]);
    assert.ok(!result.valid);
    assert.equal(result.messages[0].code, 'BANNED_INGREDIENT');
  });

  it('should pass for regular ingredients', () => {
    const recipe = makeRecipe({
      ingredients: [
        {
          name: 'Kuřecí prsa',
          grossWeight: 150,
          netWeight: 130,
          conversionCoefficient: 0.87,
          newFoodGroup: 'maso',
          oldFoodGroup: 'maso',
          allergens: [],
          isBio: false,
          isSeasonal: false,
        },
      ],
    });
    const result = checkBannedIngredients([recipe]);
    assert.ok(result.valid);
  });
});

describe('validateFrequencyRules', () => {
  it('should fail when uzeniny exceeds 1x per month', () => {
    const days = Array.from({ length: 2 }, (_, i) =>
      makeDay(new Date(2026, 0, i + 1), [
        makeMeal({ recipes: [makeRecipe({ mainDishCategory: 'uzeniny' })] }),
      ]),
    );
    const plan = makePlan(days);
    const result = validateFrequencyRules(plan);
    const uzeninyErr = result.messages.find(
      (m) => m.code === 'FREQ_MAIN_ABOVE_MAX' && m.details?.['category'] === 'uzeniny',
    );
    assert.ok(uzeninyErr, 'Expected uzeniny frequency error');
  });
});
