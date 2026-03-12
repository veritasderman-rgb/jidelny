import { Router } from 'express';
import { OLD_BASKET_LUNCH, OLD_BASKET_FULL_DAY, OLD_TOLERANCES } from '../data/old-basket.js';
import { NEW_BASKET_LUNCH, NEW_BASKET_FULL_DAY, NEW_TOLERANCES, FLEXIBLE_MIN_SUM_LUNCH, FLEXIBLE_MIN_SUM_FULL_DAY, MEAL_BREAKDOWN_4_6 } from '../data/new-basket.js';
import { ALLERGEN_DEFINITIONS } from '../data/allergens.js';
import { FINANCIAL_NORMATIVES, SECOND_DINNER_NORMATIVE, SPORTS_SCHOOL_MULTIPLIER } from '../data/financial-normatives.js';
import { ENERGY_DISTRIBUTION, LUNCH_ENERGY_KCAL, PORTION_COEFFICIENTS, MACRONUTRIENT_RATIOS, DAILY_FLUID_NEEDS } from '../data/energy.js';
import { MAIN_DISH_FREQUENCY_RULES, SIDE_DISH_FREQUENCY_RULES, WEEKLY_LUNCH_TEMPLATE, PASTRY_LIMITS, FRIED_FOOD_LIMITS, SWEETENED_DAIRY_LIMITS } from '../data/frequency-rules.js';
import { SALT_LIMITS, FAT_LIMITS, SUGAR_LIMITS, BANNED_ITEMS, ALLOWED_BEVERAGES, UNSUITABLE_BEVERAGES, VENDING_LIMITS } from '../data/restrictions.js';
import { validateOldBasket, validateNewBasket, validateFlexibleBasket, type DailyConsumption } from '../rules/basket-validator.js';
import type { OldFoodGroup, NewFoodGroup } from '../types.js';

export const apiRouter = Router();

// --- Data endpoints ---

apiRouter.get('/old-basket', (_req, res) => {
  res.json({
    lunch: OLD_BASKET_LUNCH,
    fullDay: OLD_BASKET_FULL_DAY,
    tolerances: OLD_TOLERANCES,
  });
});

apiRouter.get('/new-basket', (_req, res) => {
  res.json({
    lunch: NEW_BASKET_LUNCH,
    fullDay: NEW_BASKET_FULL_DAY,
    tolerances: NEW_TOLERANCES,
    flexibleMinSumLunch: FLEXIBLE_MIN_SUM_LUNCH,
    flexibleMinSumFullDay: FLEXIBLE_MIN_SUM_FULL_DAY,
    mealBreakdown4_6: MEAL_BREAKDOWN_4_6,
  });
});

apiRouter.get('/allergens', (_req, res) => {
  res.json(ALLERGEN_DEFINITIONS);
});

apiRouter.get('/financial', (_req, res) => {
  res.json({
    normatives: FINANCIAL_NORMATIVES,
    secondDinner: SECOND_DINNER_NORMATIVE,
    sportsMultiplier: SPORTS_SCHOOL_MULTIPLIER,
  });
});

apiRouter.get('/energy', (_req, res) => {
  res.json({
    distribution: ENERGY_DISTRIBUTION,
    lunchEnergy: LUNCH_ENERGY_KCAL,
    portionCoefficients: PORTION_COEFFICIENTS,
    macronutrients: MACRONUTRIENT_RATIOS,
    fluidNeeds: DAILY_FLUID_NEEDS,
  });
});

apiRouter.get('/frequency', (_req, res) => {
  res.json({
    mainDish: MAIN_DISH_FREQUENCY_RULES,
    sideDish: SIDE_DISH_FREQUENCY_RULES,
    weeklyTemplate: WEEKLY_LUNCH_TEMPLATE,
    pastryLimits: PASTRY_LIMITS,
    friedLimits: FRIED_FOOD_LIMITS,
    sweetenedDairyLimits: SWEETENED_DAIRY_LIMITS,
  });
});

apiRouter.get('/restrictions', (_req, res) => {
  res.json({
    salt: SALT_LIMITS,
    fat: FAT_LIMITS,
    sugar: SUGAR_LIMITS,
    bannedItems: BANNED_ITEMS,
    allowedBeverages: ALLOWED_BEVERAGES,
    unsuitableBeverages: UNSUITABLE_BEVERAGES,
    vendingLimits: VENDING_LIMITS,
  });
});

// --- Validation endpoint ---

apiRouter.post('/validate', (req, res) => {
  const { regime, ageCategory, isFullDay, dailyConsumptions } = req.body;

  if (!regime || !ageCategory || !dailyConsumptions || !Array.isArray(dailyConsumptions)) {
    res.status(400).json({ error: 'Missing required fields: regime, ageCategory, dailyConsumptions' });
    return;
  }

  const days = dailyConsumptions.map((d: { date: string; groups: Record<string, number> }) => ({
    date: new Date(d.date),
    groups: d.groups,
  }));

  let result;
  switch (regime) {
    case 'old':
      result = validateOldBasket(days as DailyConsumption<OldFoodGroup>[], ageCategory, isFullDay ?? false);
      break;
    case 'new_standard':
      result = validateNewBasket(days as DailyConsumption<NewFoodGroup>[], ageCategory, isFullDay ?? false);
      break;
    case 'new_flexible':
      result = validateFlexibleBasket(days as DailyConsumption<NewFoodGroup>[], ageCategory, isFullDay ?? false);
      break;
    default:
      res.status(400).json({ error: `Unknown regime: ${regime}` });
      return;
  }

  res.json(result);
});
