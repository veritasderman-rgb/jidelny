/**
 * Generátor nákupních seznamů.
 * Na základě jídelníčku a frekvence nákupu vytvoří konkrétní objednávky
 * s množstvím na daný počet strávníků.
 */

import type { GeneratedMenu, GeneratedDay } from './menu-generator.js';
import type { RecipeIngredient } from './recipes-db.js';

export interface ShoppingItem {
  name: string;
  /** Celkové množství v g */
  totalGrams: number;
  /** Celkové množství v kg (zaokrouhleno) */
  totalKg: number;
  /** Potravinová skupina */
  group: string;
  /** Počet porcí */
  portions: number;
}

export interface ShoppingList {
  /** Pořadové číslo nákupu */
  orderNumber: number;
  /** Datum nákupu (den před prvním dnem období) */
  purchaseDate: Date;
  /** Dny, pro které se nakupuje */
  forDays: { date: Date; recipeName: string }[];
  /** Seskupené položky */
  items: ShoppingItem[];
  /** Celková odhadovaná cena (Kč) */
  estimatedTotalCost: number;
}

/**
 * Generuje nákupní seznamy z jídelníčku.
 * @param menu - Vygenerovaný jídelníček
 */
export function generateShoppingLists(menu: GeneratedMenu): ShoppingList[] {
  const { config, days } = menu;
  const { dinerCount, purchaseFrequencyDays } = config;
  const lists: ShoppingList[] = [];

  // Rozdělíme dny do skupin dle frekvence nákupu
  const chunks = chunkDays(days, purchaseFrequencyDays);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const purchaseDate = new Date(chunk[0].date);
    purchaseDate.setDate(purchaseDate.getDate() - 1); // den před

    // Agregace ingrediencí
    const ingredientMap = new Map<string, { grams: number; group: string }>();

    for (const day of chunk) {
      const multiplier = day.portionMultiplier * dinerCount;
      const allIngredients = [
        ...day.recipe.soupIngredients,
        ...day.recipe.mainIngredients,
        ...day.recipe.garnishIngredients,
      ];

      for (const ing of allIngredients) {
        const key = ing.name;
        const existing = ingredientMap.get(key);
        if (existing) {
          existing.grams += ing.grams * multiplier;
        } else {
          ingredientMap.set(key, {
            grams: ing.grams * multiplier,
            group: ing.group,
          });
        }
      }
    }

    // Převedeme na seznam a seřadíme
    const items: ShoppingItem[] = [];
    for (const [name, data] of ingredientMap) {
      const totalGrams = Math.round(data.grams);
      items.push({
        name,
        totalGrams,
        totalKg: Math.round(totalGrams / 100) / 10, // zaokrouhlení na 0.1 kg
        group: data.group,
        portions: chunk.length * dinerCount,
      });
    }

    // Seřadíme dle skupiny a pak abecedně
    items.sort((a, b) => {
      if (a.group !== b.group) return a.group.localeCompare(b.group);
      return a.name.localeCompare(b.name);
    });

    // Odhadovaná cena
    const estimatedTotalCost = chunk.reduce(
      (sum, day) => sum + day.recipe.estimatedCostPerPortion * dinerCount * day.portionMultiplier,
      0,
    );

    lists.push({
      orderNumber: i + 1,
      purchaseDate,
      forDays: chunk.map(d => ({ date: d.date, recipeName: d.recipe.name })),
      items,
      estimatedTotalCost: Math.round(estimatedTotalCost),
    });
  }

  return lists;
}

function chunkDays(days: GeneratedDay[], chunkSize: number): GeneratedDay[][] {
  const chunks: GeneratedDay[][] = [];
  for (let i = 0; i < days.length; i += chunkSize) {
    chunks.push(days.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Formátuje nákupní seznam do čitelného textu.
 */
export function formatShoppingList(list: ShoppingList): string {
  const lines: string[] = [];
  lines.push(`=== Nakup c. ${list.orderNumber} ===`);
  lines.push(`Datum nakupu: ${formatDate(list.purchaseDate)}`);
  lines.push(`Pro dny:`);
  for (const d of list.forDays) {
    lines.push(`  ${formatDate(d.date)} — ${d.recipeName}`);
  }
  lines.push('');
  lines.push('Polozky:');

  let currentGroup = '';
  for (const item of list.items) {
    if (item.group !== currentGroup) {
      currentGroup = item.group;
      lines.push(`  [${groupLabel(currentGroup)}]`);
    }
    const amount = item.totalKg >= 1
      ? `${item.totalKg} kg`
      : `${item.totalGrams} g`;
    lines.push(`    ${item.name}: ${amount}`);
  }

  lines.push('');
  lines.push(`Odhadovana cena: ${list.estimatedTotalCost} Kc`);
  return lines.join('\n');
}

function formatDate(d: Date): string {
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
}

const GROUP_LABELS: Record<string, string> = {
  maso: 'Maso', ryby_korysi_mekkysi: 'Ryby', mlecne_vyrobky_mleko: 'Mlecne vyrobky',
  tuky_volne: 'Tuky', cukry_volne: 'Cukry', zelenina_ovoce: 'Zelenina a ovoce',
  brambory_hlizy: 'Brambory', celozrnne_obiloviny: 'Celozrnne obiloviny',
  lusteniny: 'Lusteniny', ostatni: 'Ostatni',
};

function groupLabel(g: string): string {
  return GROUP_LABELS[g] || g;
}
