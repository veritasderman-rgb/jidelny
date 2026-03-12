/**
 * Jídelny — systém pro plánování školního stravování v ČR
 *
 * Implementuje požadavky:
 *   - Vyhláška č. 107/2005 Sb. (starý spotřební koš)
 *   - Vyhláška č. 310/2025 Sb. (nový spotřební koš, standardní i flexibilní)
 *   - Nařízení EU č. 1169/2011 (alergeny)
 *   - Vyhláška č. 282/2016 Sb. (pamlsková vyhláška)
 *   - Nutriční doporučení MZ ČR a SZÚ
 */

// Typy
export type {
  OldAgeCategory,
  NewAgeCategory,
  AgeCategory,
  OldFoodGroup,
  NewFoodGroup,
  MealType,
  FacilityType,
  MealPlanType,
  EnergyDistribution,
  FoodGroupGramage,
  Tolerance,
  OldBasketEntry,
  NewBasketEntry,
  OldBasket,
  NewBasket,
  OldTolerances,
  NewTolerances,
  FlexibleBasketMinSum,
  FinancialRange,
  FinancialNormative,
  FinancialNormatives,
  AllergenNumber,
  AllergenDefinition,
  AllergenProfile,
  Ingredient,
  Recipe,
  MainDishCategory,
  SideDishCategory,
  FrequencyRule,
  DailyMenu,
  MealEntry,
  MonthlyMenuPlan,
  ValidationSeverity,
  ValidationResult,
  ValidationMessage,
  BasketRegime,
  SystemConfig,
  DietType,
  DietaryRequirement,
} from './types.js';

// Data — Starý koš
export {
  OLD_BASKET_LUNCH,
  OLD_BASKET_FULL_DAY,
  OLD_TOLERANCES,
  FROZEN_VEGETABLE_COEFFICIENT,
  DRIED_VEGETABLE_COEFFICIENT,
  getOldBasketGramage,
  getOldToleranceRange,
} from './data/old-basket.js';

// Data — Nový koš
export {
  NEW_BASKET_LUNCH,
  NEW_BASKET_FULL_DAY,
  NEW_TOLERANCES,
  FLEXIBLE_MIN_SUM_LUNCH,
  FLEXIBLE_MIN_SUM_FULL_DAY,
  MEAL_BREAKDOWN_4_6,
  getNewBasketGramage,
  getNewToleranceRange,
} from './data/new-basket.js';

// Data — Alergeny
export {
  ALLERGEN_DEFINITIONS,
  ALLERGEN_MAP,
  detectAllergenConflicts,
  deriveRecipeAllergens,
} from './data/allergens.js';

// Data — Finanční normativy
export {
  FINANCIAL_NORMATIVES,
  SECOND_DINNER_NORMATIVE,
  CELEBRATION_ALLOWANCE_PER_YEAR,
  SPORTS_SCHOOL_MULTIPLIER,
  getFinancialNormative,
} from './data/financial-normatives.js';

// Data — Energie a makronutrienty
export {
  ENERGY_DISTRIBUTION,
  LUNCH_ENERGY_KCAL,
  PORTION_COEFFICIENTS,
  MACRONUTRIENT_RATIOS,
  DAILY_FLUID_NEEDS,
  CALCIUM_DAILY,
} from './data/energy.js';

// Data — Pravidla pestrosti
export {
  WORKING_DAYS_PER_MONTH,
  MAIN_DISH_FREQUENCY_RULES,
  SIDE_DISH_FREQUENCY_RULES,
  WEEKLY_LUNCH_TEMPLATE,
  PASTRY_LIMITS,
  FRIED_FOOD_LIMITS,
  PROCESSED_MEAT_MAX_PERCENT,
  CANNED_PRODUCE_MAX_PERCENT,
  MAX_MAIN_DISH_VARIANTS,
  SWEETENED_DAIRY_LIMITS,
} from './data/frequency-rules.js';

// Data — Omezení
export {
  SALT_LIMITS,
  FAT_LIMITS,
  SUGAR_LIMITS,
  BANNED_ITEMS,
  BannedCategory,
  ALLOWED_BEVERAGES,
  UNSUITABLE_BEVERAGES,
  VENDING_LIMITS,
} from './data/restrictions.js';

// Validátory — Spotřební koš
export {
  computeNewGroupConsumption,
  computeOldGroupConsumption,
  validateOldBasket,
  validateNewBasket,
  validateFlexibleBasket,
  validateBasket,
} from './rules/basket-validator.js';

// Validátory — Jídelní lístek
export {
  countMainDishCategories,
  countSideDishCategories,
  validateFrequencyRules,
  validateFriedFoods,
  validateSalt,
  validateDailyMenuRules,
  checkBannedIngredients,
  validateMonthlyPlan,
} from './rules/menu-validator.js';
