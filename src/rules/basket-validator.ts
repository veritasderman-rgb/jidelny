/**
 * Validátor plnění spotřebního koše.
 * Kontroluje měsíční průměrnou spotřebu proti normám starého i nového koše.
 */

import type {
  ValidationResult,
  ValidationMessage,
  OldAgeCategory,
  NewAgeCategory,
  OldFoodGroup,
  NewFoodGroup,
  BasketRegime,
  Recipe,
  Ingredient,
} from '../types.js';
import { OLD_BASKET_LUNCH, OLD_BASKET_FULL_DAY, OLD_TOLERANCES } from '../data/old-basket.js';
import { NEW_BASKET_LUNCH, NEW_BASKET_FULL_DAY, NEW_TOLERANCES, FLEXIBLE_MIN_SUM_LUNCH, FLEXIBLE_MIN_SUM_FULL_DAY } from '../data/new-basket.js';

// ============================================================
// Výpočet spotřeby z receptur
// ============================================================

export interface DailyConsumption<G extends string> {
  date: Date;
  groups: Record<G, number>;
}

/**
 * Spočítá spotřebu ingrediencí receptury dle potravinových skupin (nový koš, čistá hmotnost).
 */
export function computeNewGroupConsumption(recipes: Recipe[]): Record<NewFoodGroup, number> {
  const result: Record<string, number> = {};
  const groups: NewFoodGroup[] = [
    'maso', 'ryby_korysi_mekkýsi', 'mlecne_vyrobky_mleko', 'tuky_volne',
    'cukry_volne', 'zelenina_ovoce', 'brambory_hlízy', 'celozrnne_obiloviny', 'lusteniny',
  ];
  for (const g of groups) result[g] = 0;

  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      const perPortion = ing.netWeight / recipe.portions;
      result[ing.newFoodGroup] = (result[ing.newFoodGroup] || 0) + perPortion;
    }
  }
  return result as Record<NewFoodGroup, number>;
}

/**
 * Spočítá spotřebu ingrediencí receptury dle potravinových skupin (starý koš, "jak nakoupeno").
 */
export function computeOldGroupConsumption(recipes: Recipe[]): Record<OldFoodGroup, number> {
  const result: Record<string, number> = {};
  const groups: OldFoodGroup[] = [
    'maso', 'ryby', 'mleko_tekute', 'mlecne_vyrobky', 'tuky_volne',
    'cukr_volny', 'zelenina', 'ovoce', 'brambory', 'lusteniny',
  ];
  for (const g of groups) result[g] = 0;

  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      const perPortion = ing.grossWeight / recipe.portions;
      result[ing.oldFoodGroup] = (result[ing.oldFoodGroup] || 0) + perPortion;
    }
  }
  return result as Record<OldFoodGroup, number>;
}

// ============================================================
// Validace starého koše
// ============================================================

/**
 * Validuje měsíční průměrnou spotřebu proti starému spotřebnímu koši.
 * @param dailyConsumptions - denní spotřeby za měsíc
 * @param ageCategory - věková kategorie
 * @param isFullDay - celodenní stravování (vs. oběd)
 */
export function validateOldBasket(
  dailyConsumptions: DailyConsumption<OldFoodGroup>[],
  ageCategory: OldAgeCategory,
  isFullDay: boolean,
): ValidationResult {
  const messages: ValidationMessage[] = [];
  const basket = isFullDay ? OLD_BASKET_FULL_DAY : OLD_BASKET_LUNCH;
  const days = dailyConsumptions.length;

  if (days === 0) {
    return { valid: false, messages: [{ severity: 'error', code: 'NO_DATA', message: 'Žádná data ke kontrole.' }] };
  }

  const groups = Object.keys(basket) as OldFoodGroup[];

  for (const group of groups) {
    const target = basket[group][ageCategory];
    const tolerance = OLD_TOLERANCES[group];

    // Průměrná denní spotřeba
    const totalConsumed = dailyConsumptions.reduce((sum, d) => sum + (d.groups[group] || 0), 0);
    const avgDaily = totalConsumed / days;

    const minAllowed = target * (tolerance.minPercent / 100);
    const maxAllowed = tolerance.maxPercent !== null ? target * (tolerance.maxPercent / 100) : null;

    if (avgDaily < minAllowed) {
      messages.push({
        severity: 'error',
        code: 'OLD_BASKET_BELOW_MIN',
        message: `Skupina "${group}": průměrná spotřeba ${avgDaily.toFixed(1)} g je pod minimem ${minAllowed.toFixed(1)} g (${tolerance.minPercent}% z ${target} g).`,
        details: { group, avgDaily, minAllowed, target },
      });
    }

    if (maxAllowed !== null && avgDaily > maxAllowed) {
      messages.push({
        severity: group === 'tuky_volne' || group === 'cukr_volny' ? 'error' : 'warning',
        code: 'OLD_BASKET_ABOVE_MAX',
        message: `Skupina "${group}": průměrná spotřeba ${avgDaily.toFixed(1)} g překračuje maximum ${maxAllowed.toFixed(1)} g (${tolerance.maxPercent}% z ${target} g).`,
        details: { group, avgDaily, maxAllowed, target },
      });
    }

    // Info pro skupiny bez horního limitu (žádoucí překračovat)
    if (maxAllowed === null && avgDaily > target) {
      messages.push({
        severity: 'info',
        code: 'OLD_BASKET_EXCEEDS_RECOMMENDED',
        message: `Skupina "${group}": průměrná spotřeba ${avgDaily.toFixed(1)} g překračuje normu ${target} g — to je žádoucí.`,
        details: { group, avgDaily, target },
      });
    }
  }

  return {
    valid: messages.every((m) => m.severity !== 'error'),
    messages,
  };
}

// ============================================================
// Validace nového koše (standardní)
// ============================================================

export function validateNewBasket(
  dailyConsumptions: DailyConsumption<NewFoodGroup>[],
  ageCategory: NewAgeCategory,
  isFullDay: boolean,
): ValidationResult {
  const messages: ValidationMessage[] = [];
  const basket = isFullDay ? NEW_BASKET_FULL_DAY : NEW_BASKET_LUNCH;
  const days = dailyConsumptions.length;

  if (days === 0) {
    return { valid: false, messages: [{ severity: 'error', code: 'NO_DATA', message: 'Žádná data ke kontrole.' }] };
  }

  const groups = Object.keys(basket) as NewFoodGroup[];

  for (const group of groups) {
    const target = basket[group][ageCategory];
    const tolerance = NEW_TOLERANCES[group];

    const totalConsumed = dailyConsumptions.reduce((sum, d) => sum + (d.groups[group] || 0), 0);
    const avgDaily = totalConsumed / days;

    const minAllowed = target * (tolerance.minPercent / 100);
    const maxAllowed = tolerance.maxPercent !== null ? target * (tolerance.maxPercent / 100) : null;

    if (avgDaily < minAllowed) {
      messages.push({
        severity: 'error',
        code: 'NEW_BASKET_BELOW_MIN',
        message: `Skupina "${group}": průměrná spotřeba ${avgDaily.toFixed(1)} g je pod minimem ${minAllowed.toFixed(1)} g (${tolerance.minPercent}% z ${target} g).`,
        details: { group, avgDaily, minAllowed, target },
      });
    }

    if (maxAllowed !== null && avgDaily > maxAllowed) {
      messages.push({
        severity: group === 'tuky_volne' || group === 'cukry_volne' ? 'error' : 'warning',
        code: 'NEW_BASKET_ABOVE_MAX',
        message: `Skupina "${group}": průměrná spotřeba ${avgDaily.toFixed(1)} g překračuje maximum ${maxAllowed.toFixed(1)} g (${tolerance.maxPercent}% z ${target} g).`,
        details: { group, avgDaily, maxAllowed, target },
      });
    }

    if (maxAllowed === null && avgDaily > target) {
      messages.push({
        severity: 'info',
        code: 'NEW_BASKET_EXCEEDS_RECOMMENDED',
        message: `Skupina "${group}": průměrná spotřeba ${avgDaily.toFixed(1)} g překračuje normu ${target} g — to je žádoucí.`,
        details: { group, avgDaily, target },
      });
    }
  }

  return {
    valid: messages.every((m) => m.severity !== 'error'),
    messages,
  };
}

// ============================================================
// Validace flexibilního koše
// ============================================================

export function validateFlexibleBasket(
  dailyConsumptions: DailyConsumption<NewFoodGroup>[],
  ageCategory: NewAgeCategory,
  isFullDay: boolean,
): ValidationResult {
  // Nejprve spustit standardní validaci (všechny skupiny kromě maso/ryby/luštěniny mají stejné limity)
  const baseResult = validateNewBasket(dailyConsumptions, ageCategory, isFullDay);
  const messages: ValidationMessage[] = [];

  const days = dailyConsumptions.length;
  if (days === 0) {
    return { valid: false, messages: [{ severity: 'error', code: 'NO_DATA', message: 'Žádná data ke kontrole.' }] };
  }

  // Ve flexibilním koši maso a ryby mohou individuálně klesnout na 0 %,
  // ale součet maso + ryby + luštěniny musí splnit minimální hodnotu.
  const minSumTable = isFullDay ? FLEXIBLE_MIN_SUM_FULL_DAY : FLEXIBLE_MIN_SUM_LUNCH;
  const minSum = minSumTable[ageCategory];

  const avgMaso = dailyConsumptions.reduce((s, d) => s + (d.groups['maso'] || 0), 0) / days;
  const avgRyby = dailyConsumptions.reduce((s, d) => s + (d.groups['ryby_korysi_mekkýsi'] || 0), 0) / days;
  const avgLust = dailyConsumptions.reduce((s, d) => s + (d.groups['lusteniny'] || 0), 0) / days;
  const actualSum = avgMaso + avgRyby + avgLust;

  if (actualSum < minSum) {
    messages.push({
      severity: 'error',
      code: 'FLEXIBLE_PROTEIN_SUM_BELOW_MIN',
      message: `Součet maso + ryby + luštěniny (${actualSum.toFixed(1)} g) je pod minimem ${minSum} g.`,
      details: { avgMaso, avgRyby, avgLust, actualSum, minSum },
    });
  }

  // Filtrujeme z baseResult chyby o maso/ryby/luštěniny pod minimem (ty ve flexibilním koši nejsou chybou)
  const filteredBase = baseResult.messages.filter((m) => {
    if (m.code === 'NEW_BASKET_BELOW_MIN' && m.details) {
      const g = m.details['group'] as string;
      if (g === 'maso' || g === 'ryby_korysi_mekkýsi' || g === 'lusteniny') {
        return false;
      }
    }
    return true;
  });

  const allMessages = [...filteredBase, ...messages];

  return {
    valid: allMessages.every((m) => m.severity !== 'error'),
    messages: allMessages,
  };
}

// ============================================================
// Univerzální validátor dle režimu
// ============================================================

export function validateBasket(
  regime: BasketRegime,
  dailyConsumptions: DailyConsumption<any>[],
  ageCategory: string,
  isFullDay: boolean,
): ValidationResult {
  switch (regime) {
    case 'old':
      return validateOldBasket(
        dailyConsumptions as DailyConsumption<OldFoodGroup>[],
        ageCategory as OldAgeCategory,
        isFullDay,
      );
    case 'new_standard':
      return validateNewBasket(
        dailyConsumptions as DailyConsumption<NewFoodGroup>[],
        ageCategory as NewAgeCategory,
        isFullDay,
      );
    case 'new_flexible':
      return validateFlexibleBasket(
        dailyConsumptions as DailyConsumption<NewFoodGroup>[],
        ageCategory as NewAgeCategory,
        isFullDay,
      );
  }
}
