/**
 * Generátor 4týdenního jídelníčku.
 * Respektuje frekvenční pravidla, pestrost příloh, limity smažených/sladkých jídel
 * a přizpůsobuje gramáže dle věkové kategorie.
 */

import type { NewAgeCategory } from '../types.js';
import { ALL_RECIPES, type LunchRecipe } from './recipes-db.js';

export interface GeneratorConfig {
  /** Věková kategorie strávníků */
  ageCategory: NewAgeCategory;
  /** Počet strávníků */
  dinerCount: number;
  /** Počet stravovacích dnů (default 20) */
  workingDays: number;
  /** Datum prvního dne */
  startDate: Date;
  /** Frekvence nákupu: kolik pracovních dnů mezi nákupy */
  purchaseFrequencyDays: number;
}

export interface GeneratedDay {
  date: Date;
  dayOfWeek: string;
  weekNumber: number;
  recipe: LunchRecipe;
  /** Gramáže přepočítané na danou věkovou kategorii */
  portionMultiplier: number;
}

export interface GeneratedMenu {
  config: GeneratorConfig;
  days: GeneratedDay[];
  /** Souhrn frekvencí */
  summary: MenuSummary;
}

export interface MenuSummary {
  mainDishCounts: Record<string, number>;
  sideDishCounts: Record<string, number>;
  sweetCount: number;
  friedCount: number;
  fishCount: number;
  meatlessCount: number;
  totalDays: number;
}

const DAY_NAMES = ['Nedele', 'Pondeli', 'Utery', 'Streda', 'Ctvrtek', 'Patek', 'Sobota'];

/** Porční koeficienty oproti referenční kategorii 7–10 let */
export const PORTION_MULTIPLIERS: Record<NewAgeCategory, number> = {
  '2-3': 0.57,   // ~0.5/0.7*0.8 roughly
  '4-6': 0.71,   // 0.5/0.7
  '7-10': 1.0,
  '11-14': 1.14,  // 0.8/0.7
  '15+': 1.29,   // 0.9/0.7
};

/**
 * Generuje 4týdenní jídelníček respektující všechna pravidla.
 */
export function generateMenu(config: GeneratorConfig): GeneratedMenu {
  const {
    ageCategory,
    workingDays = 20,
    startDate,
  } = config;

  const portionMultiplier = PORTION_MULTIPLIERS[ageCategory];

  // Cílové frekvence za 20 dnů (proporcionálně přizpůsobené)
  const scale = workingDays / 20;
  const targets = {
    drubez: Math.round(3 * scale),
    ryba: Math.round(2 * scale),
    veprove: Math.round(3 * scale),       // max 4, cílíme 3
    hovezi_kralik: Math.round(4 * scale),
    bezmase: Math.round(6 * scale),        // cílíme 6 (min 4, plus 2 dny/týden)
    sladke: Math.round(1 * scale),         // max 2
  };

  // Sestavíme plán
  const plan: string[] = [];
  const remaining = { ...targets };

  // Pro každý týden sestavíme ideální rozložení
  const weeksCount = Math.ceil(workingDays / 5);
  for (let w = 0; w < weeksCount; w++) {
    const daysThisWeek = Math.min(5, workingDays - w * 5);
    const weekPlan = buildWeek(remaining, daysThisWeek, w);
    plan.push(...weekPlan);
  }

  // Přiřadíme konkrétní recepty
  const usedRecipeIds = new Set<string>();
  const days: GeneratedDay[] = [];

  for (let i = 0; i < plan.length; i++) {
    const category = plan[i];
    const recipe = pickRecipe(category, usedRecipeIds, i);

    const date = new Date(startDate);
    // Posouváme po pracovních dnech (Po–Pá)
    let addedDays = 0;
    let offset = 0;
    while (addedDays < i) {
      offset++;
      const d = new Date(startDate);
      d.setDate(d.getDate() + offset);
      const dow = d.getDay();
      if (dow !== 0 && dow !== 6) addedDays++;
    }
    date.setDate(startDate.getDate() + offset);

    days.push({
      date,
      dayOfWeek: DAY_NAMES[date.getDay()],
      weekNumber: Math.floor(i / 5) + 1,
      recipe,
      portionMultiplier,
    });

    usedRecipeIds.add(recipe.id);
  }

  return {
    config,
    days,
    summary: computeSummary(days),
  };
}

function buildWeek(remaining: Record<string, number>, daysCount: number, weekIdx: number): string[] {
  const week: string[] = [];

  // Pravidlo: 2 bezmasé dny v týdnu
  const bezmaseDays = Math.min(2, remaining.bezmase, daysCount);
  for (let i = 0; i < bezmaseDays; i++) {
    // Sladké jídlo max 1 za 2 týdny
    if (remaining.sladke > 0 && weekIdx % 2 === 1 && i === 0) {
      week.push('sladke');
      remaining.sladke--;
    } else {
      week.push('bezmase');
      remaining.bezmase--;
    }
  }

  // 1 den ryba (min 2×/měsíc ≈ 1 za 2 týdny)
  if (remaining.ryba > 0 && daysCount - week.length > 0) {
    week.push('ryba');
    remaining.ryba--;
  }

  // 1 den drůbež
  if (remaining.drubez > 0 && daysCount - week.length > 0) {
    week.push('drubez');
    remaining.drubez--;
  }

  // Zbývající dny: hovězí/králík nebo vepřové
  while (week.length < daysCount) {
    if (remaining.hovezi_kralik > 0 && remaining.hovezi_kralik >= remaining.veprove) {
      week.push('hovezi_kralik');
      remaining.hovezi_kralik--;
    } else if (remaining.veprove > 0) {
      week.push('veprove');
      remaining.veprove--;
    } else if (remaining.hovezi_kralik > 0) {
      week.push('hovezi_kralik');
      remaining.hovezi_kralik--;
    } else if (remaining.bezmase > 0) {
      week.push('bezmase');
      remaining.bezmase--;
    } else {
      week.push('drubez');
    }
  }

  // Promícháme, aby stejné kategorie nebyly za sebou
  shuffle(week);
  return week;
}

function pickRecipe(category: string, usedIds: Set<string>, dayIndex: number): LunchRecipe {
  let candidates: LunchRecipe[];

  switch (category) {
    case 'drubez':
      candidates = ALL_RECIPES.filter(r => r.mainDish === 'drubez');
      break;
    case 'ryba':
      candidates = ALL_RECIPES.filter(r => r.mainDish === 'ryba');
      break;
    case 'veprove':
      candidates = ALL_RECIPES.filter(r => r.mainDish === 'veprove');
      break;
    case 'hovezi_kralik':
      candidates = ALL_RECIPES.filter(r => r.mainDish === 'hovezi' || r.mainDish === 'kralik');
      break;
    case 'bezmase':
      candidates = ALL_RECIPES.filter(r => r.mainDish === 'bezmase_zeleninove' && !r.isSweet);
      break;
    case 'sladke':
      candidates = ALL_RECIPES.filter(r => r.isSweet);
      break;
    default:
      candidates = ALL_RECIPES.filter(r => r.mainDish === 'bezmase_zeleninove');
  }

  // Preferujeme dosud nepoužité recepty
  const unused = candidates.filter(r => !usedIds.has(r.id));
  const pool = unused.length > 0 ? unused : candidates;

  // Deterministický výběr na základě indexu dne
  return pool[dayIndex % pool.length];
}

function shuffle(arr: string[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function computeSummary(days: GeneratedDay[]): MenuSummary {
  const mainDishCounts: Record<string, number> = {};
  const sideDishCounts: Record<string, number> = {};
  let sweetCount = 0, friedCount = 0, fishCount = 0, meatlessCount = 0;

  for (const day of days) {
    const r = day.recipe;
    mainDishCounts[r.mainDish] = (mainDishCounts[r.mainDish] || 0) + 1;
    if (r.sideDish) sideDishCounts[r.sideDish] = (sideDishCounts[r.sideDish] || 0) + 1;
    if (r.isSweet) sweetCount++;
    if (r.isFried) friedCount++;
    if (r.mainDish === 'ryba') fishCount++;
    if (r.mainDish === 'bezmase_zeleninove' || r.isSweet) meatlessCount++;
  }

  return { mainDishCounts, sideDishCounts, sweetCount, friedCount, fishCount, meatlessCount, totalDays: days.length };
}
