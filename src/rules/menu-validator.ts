/**
 * Validátor jídelního lístku.
 * Kontroluje pravidla pestrosti, frekvenční omezení, sůl, cukry, tuky,
 * zakázané ingredience, alergeny a finanční normativy.
 */

import type {
  ValidationResult,
  ValidationMessage,
  MonthlyMenuPlan,
  DailyMenu,
  MealEntry,
  Recipe,
  NewAgeCategory,
} from '../types.js';
import {
  MAIN_DISH_FREQUENCY_RULES,
  SIDE_DISH_FREQUENCY_RULES,
  FRIED_FOOD_LIMITS,
  PASTRY_LIMITS,
  MAX_MAIN_DISH_VARIANTS,
  PROCESSED_MEAT_MAX_PERCENT,
  CANNED_PRODUCE_MAX_PERCENT,
  SWEETENED_DAIRY_LIMITS,
  WORKING_DAYS_PER_MONTH,
} from '../data/frequency-rules.js';
import { SALT_LIMITS } from '../data/restrictions.js';
import { FINANCIAL_NORMATIVES } from '../data/financial-normatives.js';

// ============================================================
// Frekvence hlavních jídel
// ============================================================

/**
 * Spočítá frekvence kategorií hlavních jídel za měsíc.
 */
export function countMainDishCategories(plan: MonthlyMenuPlan): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const day of plan.dailyMenus) {
    for (const meal of day.meals) {
      if (meal.mealType !== 'obed') continue;
      for (const recipe of meal.recipes) {
        if (recipe.mainDishCategory) {
          counts[recipe.mainDishCategory] = (counts[recipe.mainDishCategory] || 0) + 1;
        }
      }
    }
  }
  return counts;
}

/**
 * Spočítá frekvence kategorií příloh za měsíc.
 */
export function countSideDishCategories(plan: MonthlyMenuPlan): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const day of plan.dailyMenus) {
    for (const meal of day.meals) {
      if (meal.mealType !== 'obed') continue;
      for (const recipe of meal.recipes) {
        if (recipe.sideDishCategory) {
          counts[recipe.sideDishCategory] = (counts[recipe.sideDishCategory] || 0) + 1;
        }
      }
    }
  }
  return counts;
}

/**
 * Validuje frekvence hlavních jídel a příloh.
 */
export function validateFrequencyRules(plan: MonthlyMenuPlan): ValidationResult {
  const messages: ValidationMessage[] = [];

  const mainCounts = countMainDishCategories(plan);
  for (const rule of MAIN_DISH_FREQUENCY_RULES) {
    const count = mainCounts[rule.category] || 0;
    if (rule.minPerMonth !== null && count < rule.minPerMonth) {
      messages.push({
        severity: 'error',
        code: 'FREQ_MAIN_BELOW_MIN',
        message: `${rule.description}: skutečnost ${count}×, minimum ${rule.minPerMonth}×.`,
        details: { category: rule.category, count, min: rule.minPerMonth },
      });
    }
    if (rule.maxPerMonth !== null && count > rule.maxPerMonth) {
      messages.push({
        severity: 'error',
        code: 'FREQ_MAIN_ABOVE_MAX',
        message: `${rule.description}: skutečnost ${count}×, maximum ${rule.maxPerMonth}×.`,
        details: { category: rule.category, count, max: rule.maxPerMonth },
      });
    }
  }

  const sideCounts = countSideDishCategories(plan);
  for (const rule of SIDE_DISH_FREQUENCY_RULES) {
    const count = sideCounts[rule.category] || 0;
    if (rule.minPerMonth !== null && count < rule.minPerMonth) {
      messages.push({
        severity: 'error',
        code: 'FREQ_SIDE_BELOW_MIN',
        message: `${rule.description}: skutečnost ${count}×, minimum ${rule.minPerMonth}×.`,
        details: { category: rule.category, count, min: rule.minPerMonth },
      });
    }
    if (rule.maxPerMonth !== null && count > rule.maxPerMonth) {
      messages.push({
        severity: 'error',
        code: 'FREQ_SIDE_ABOVE_MAX',
        message: `${rule.description}: skutečnost ${count}×, maximum ${rule.maxPerMonth}×.`,
        details: { category: rule.category, count, max: rule.maxPerMonth },
      });
    }
  }

  return { valid: messages.every((m) => m.severity !== 'error'), messages };
}

// ============================================================
// Smažená jídla
// ============================================================

export function validateFriedFoods(
  plan: MonthlyMenuPlan,
  isKindergarten: boolean,
): ValidationResult {
  const messages: ValidationMessage[] = [];
  let friedCount = 0;

  for (const day of plan.dailyMenus) {
    for (const meal of day.meals) {
      for (const recipe of [...meal.recipes, ...(meal.variants || [])]) {
        if (recipe.isFried) friedCount++;
      }
    }
  }

  const limit = isKindergarten
    ? FRIED_FOOD_LIMITS.kindergartenMaxPerMonth
    : FRIED_FOOD_LIMITS.schoolMaxPerMonth;

  if (friedCount > limit) {
    messages.push({
      severity: 'error',
      code: 'FRIED_OVER_LIMIT',
      message: isKindergarten
        ? `V MŠ se smažení zcela vyhýbat. Nalezeno ${friedCount} smažených jídel.`
        : `Smažená jídla: ${friedCount}× za měsíc, maximum ${limit}×.`,
      details: { friedCount, limit },
    });
  }

  return { valid: messages.every((m) => m.severity !== 'error'), messages };
}

// ============================================================
// Sůl v recepturách
// ============================================================

export function validateSalt(recipes: Recipe[]): ValidationResult {
  const messages: ValidationMessage[] = [];

  for (const recipe of recipes) {
    if (recipe.saltPer10Portions === undefined) continue;

    if (recipe.mealType === 'obed' && recipe.mainDishCategory === undefined) {
      // Polévka
      if (recipe.saltPer10Portions > SALT_LIMITS.soupPer10Portions.max) {
        messages.push({
          severity: 'error',
          code: 'SALT_SOUP_OVER',
          message: `Polévka "${recipe.name}": ${recipe.saltPer10Portions} g soli na 10 porcí, max. ${SALT_LIMITS.soupPer10Portions.max} g.`,
          details: { recipeName: recipe.name, salt: recipe.saltPer10Portions },
        });
      }
    } else {
      // Hlavní jídlo
      if (recipe.saltPer10Portions > SALT_LIMITS.mainCoursePer10Portions.max) {
        messages.push({
          severity: 'error',
          code: 'SALT_MAIN_OVER',
          message: `Jídlo "${recipe.name}": ${recipe.saltPer10Portions} g soli na 10 porcí, max. ${SALT_LIMITS.mainCoursePer10Portions.max} g.`,
          details: { recipeName: recipe.name, salt: recipe.saltPer10Portions },
        });
      }
    }
  }

  return { valid: messages.every((m) => m.severity !== 'error'), messages };
}

// ============================================================
// Varianty a bezmasá nabídka
// ============================================================

export function validateDailyMenuRules(dailyMenus: DailyMenu[]): ValidationResult {
  const messages: ValidationMessage[] = [];

  for (const day of dailyMenus) {
    for (const meal of day.meals) {
      if (meal.mealType !== 'obed') continue;

      // Max. 2 varianty hlavního jídla
      const totalVariants = meal.recipes.length + (meal.variants?.length || 0);
      if (totalVariants > MAX_MAIN_DISH_VARIANTS) {
        messages.push({
          severity: 'warning',
          code: 'TOO_MANY_VARIANTS',
          message: `Den ${day.date.toISOString().slice(0, 10)}: ${totalVariants} variant hlavního jídla, doporučeno max. ${MAX_MAIN_DISH_VARIANTS}.`,
          details: { date: day.date, totalVariants },
        });
      }

      // Při nabídce výběru musí být alespoň 1 bezmasá varianta
      if (totalVariants > 1 && !meal.hasMeatFreeOption) {
        messages.push({
          severity: 'error',
          code: 'NO_MEATFREE_VARIANT',
          message: `Den ${day.date.toISOString().slice(0, 10)}: při nabídce výběru chybí bezmasá varianta.`,
          details: { date: day.date },
        });
      }

      // Nápoj ke každému jídlu
      if (!meal.beverage) {
        messages.push({
          severity: 'error',
          code: 'MISSING_BEVERAGE',
          message: `Den ${day.date.toISOString().slice(0, 10)}: chybí nápoj u ${meal.mealType}.`,
          details: { date: day.date, mealType: meal.mealType },
        });
      }
    }
  }

  return { valid: messages.every((m) => m.severity !== 'error'), messages };
}

// ============================================================
// Zakázané ingredience
// ============================================================

import { BANNED_ITEMS, BannedCategory } from '../data/restrictions.js';

/** Sada klíčových slov pro detekci zakázaných ingrediencí */
const BANNED_KEYWORDS: ReadonlyMap<BannedCategory, string[]> = new Map([
  [BannedCategory.DEHYDRATED_MIX, ['instantní', 'bujón', 'bujon', 'dehydrovan']],
  [BannedCategory.BANNED_FAT, ['palmový', 'palmojádrový', 'kokosový tuk']],
  [BannedCategory.SWEETENER, ['sladidlo', 'aspartam', 'sacharin', 'sukralóza', 'steviol']],
]);

export function checkBannedIngredients(recipes: Recipe[]): ValidationResult {
  const messages: ValidationMessage[] = [];

  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      const nameLower = ing.name.toLowerCase();
      for (const [category, keywords] of BANNED_KEYWORDS) {
        for (const kw of keywords) {
          if (nameLower.includes(kw)) {
            const banned = BANNED_ITEMS.find((b) => b.category === category);
            messages.push({
              severity: 'error',
              code: 'BANNED_INGREDIENT',
              message: `Receptura "${recipe.name}" obsahuje zakázanou ingredienci "${ing.name}" (${banned?.description || category}).`,
              details: { recipeName: recipe.name, ingredient: ing.name, category },
            });
          }
        }
      }
    }
  }

  return { valid: messages.every((m) => m.severity !== 'error'), messages };
}

// ============================================================
// Kompletní validace jídelního plánu
// ============================================================

export function validateMonthlyPlan(
  plan: MonthlyMenuPlan,
  isKindergarten: boolean,
): ValidationResult {
  const allMessages: ValidationMessage[] = [];

  // 1. Frekvence hlavních jídel a příloh
  const freqResult = validateFrequencyRules(plan);
  allMessages.push(...freqResult.messages);

  // 2. Smažená jídla
  const friedResult = validateFriedFoods(plan, isKindergarten);
  allMessages.push(...friedResult.messages);

  // 3. Denní pravidla (varianty, bezmasé, nápoje)
  const dailyResult = validateDailyMenuRules(plan.dailyMenus);
  allMessages.push(...dailyResult.messages);

  // 4. Zakázané ingredience
  const allRecipes = plan.dailyMenus.flatMap((d) =>
    d.meals.flatMap((m) => [...m.recipes, ...(m.variants || [])]),
  );
  const bannedResult = checkBannedIngredients(allRecipes);
  allMessages.push(...bannedResult.messages);

  // 5. Sůl
  const saltResult = validateSalt(allRecipes);
  allMessages.push(...saltResult.messages);

  return {
    valid: allMessages.every((m) => m.severity !== 'error'),
    messages: allMessages,
  };
}
