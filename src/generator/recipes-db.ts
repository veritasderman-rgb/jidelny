/**
 * Databáze receptur pro školní obědy.
 * Každý recept obsahuje: kategorii hlavního jídla, přílohu, polévku,
 * ingredience s gramážemi (čistá hmotnost na 1 porci pro 7–10 let),
 * alergeny a nutriční metadata.
 *
 * Gramáže jsou pro referenční věkovou kategorii 7–10 let.
 * Pro jiné kategorie se násobí porčním koeficientem.
 */

import type { AllergenNumber, MainDishCategory, SideDishCategory } from '../types.js';

export interface RecipeIngredient {
  name: string;
  /** Gramáž čisté hmotnosti na 1 porci (7–10 let) */
  grams: number;
  /** Potravinová skupina nového koše */
  group: 'maso' | 'ryby_korysi_mekkysi' | 'mlecne_vyrobky_mleko' | 'tuky_volne' |
         'cukry_volne' | 'zelenina_ovoce' | 'brambory_hlizy' | 'celozrnne_obiloviny' |
         'lusteniny' | 'ostatni';
}

export interface LunchRecipe {
  id: string;
  name: string;
  mainDish: MainDishCategory;
  sideDish?: SideDishCategory;
  /** Polévka */
  soup: string;
  soupIngredients: RecipeIngredient[];
  /** Hlavní chod + příloha */
  mainIngredients: RecipeIngredient[];
  /** Zeleninová obloha / salát */
  garnish: string;
  garnishIngredients: RecipeIngredient[];
  /** Nápoj */
  beverage: string;
  allergens: AllergenNumber[];
  isSweet: boolean;
  isFried: boolean;
  /** Stručný popis přípravy */
  instructions: string;
  /** Sezóna, kdy je jídlo nejvhodnější (null = celoroční) */
  season?: 'spring' | 'summer' | 'autumn' | 'winter' | null;
  /** Přibližná cena surovin na porci (Kč, 7–10 let) */
  estimatedCostPerPortion: number;
}

// ================================================================
// POLÉVKY (znovupoužitelné)
// ================================================================

const SOUPS = {
  rajska: {
    name: 'Rajska polevka s tестovinou',
    ingredients: [
      { name: 'Rajcata', grams: 40, group: 'zelenina_ovoce' as const },
      { name: 'Mrkev', grams: 10, group: 'zelenina_ovoce' as const },
      { name: 'Cibule', grams: 5, group: 'zelenina_ovoce' as const },
      { name: 'Celozrnne testoviny', grams: 8, group: 'celozrnne_obiloviny' as const },
      { name: 'Olivovy olej', grams: 2, group: 'tuky_volne' as const },
    ],
    allergens: [1] as AllergenNumber[],
  },
  zeleninova: {
    name: 'Zeleninova polevka',
    ingredients: [
      { name: 'Mrkev', grams: 15, group: 'zelenina_ovoce' as const },
      { name: 'Petrzel', grams: 10, group: 'zelenina_ovoce' as const },
      { name: 'Celer', grams: 8, group: 'zelenina_ovoce' as const },
      { name: 'Brambory', grams: 15, group: 'brambory_hlizy' as const },
      { name: 'Olivovy olej', grams: 2, group: 'tuky_volne' as const },
    ],
    allergens: [9] as AllergenNumber[],
  },
  cesnecka: {
    name: 'Cesnekova polevka s bramborem',
    ingredients: [
      { name: 'Cesnek', grams: 5, group: 'zelenina_ovoce' as const },
      { name: 'Brambory', grams: 20, group: 'brambory_hlizy' as const },
      { name: 'Olivovy olej', grams: 2, group: 'tuky_volne' as const },
    ],
    allergens: [] as AllergenNumber[],
  },
  hrachova: {
    name: 'Hrachova polevka',
    ingredients: [
      { name: 'Hrach suseny', grams: 15, group: 'lusteniny' as const },
      { name: 'Mrkev', grams: 8, group: 'zelenina_ovoce' as const },
      { name: 'Cibule', grams: 5, group: 'zelenina_ovoce' as const },
      { name: 'Olivovy olej', grams: 2, group: 'tuky_volne' as const },
    ],
    allergens: [] as AllergenNumber[],
  },
  kulajda: {
    name: 'Kulajda',
    ingredients: [
      { name: 'Brambory', grams: 20, group: 'brambory_hlizy' as const },
      { name: 'Houby', grams: 10, group: 'zelenina_ovoce' as const },
      { name: 'Kopr', grams: 2, group: 'zelenina_ovoce' as const },
      { name: 'Smetana', grams: 10, group: 'mlecne_vyrobky_mleko' as const },
      { name: 'Vejce', grams: 5, group: 'ostatni' as const },
    ],
    allergens: [3, 7] as AllergenNumber[],
  },
  cocková: {
    name: 'Cockova polevka',
    ingredients: [
      { name: 'Cocka cervena', grams: 15, group: 'lusteniny' as const },
      { name: 'Mrkev', grams: 8, group: 'zelenina_ovoce' as const },
      { name: 'Rajcata', grams: 10, group: 'zelenina_ovoce' as const },
      { name: 'Olivovy olej', grams: 2, group: 'tuky_volne' as const },
    ],
    allergens: [] as AllergenNumber[],
  },
  brokolice: {
    name: 'Brokolicova kremova polevka',
    ingredients: [
      { name: 'Brokolice', grams: 25, group: 'zelenina_ovoce' as const },
      { name: 'Brambory', grams: 10, group: 'brambory_hlizy' as const },
      { name: 'Smetana', grams: 8, group: 'mlecne_vyrobky_mleko' as const },
    ],
    allergens: [7] as AllergenNumber[],
  },
  hovezi_vyvar: {
    name: 'Hovezi vyvar s nudlemi',
    ingredients: [
      { name: 'Hovezi kost', grams: 10, group: 'maso' as const },
      { name: 'Mrkev', grams: 8, group: 'zelenina_ovoce' as const },
      { name: 'Celozrnne nudle', grams: 8, group: 'celozrnne_obiloviny' as const },
    ],
    allergens: [1] as AllergenNumber[],
  },
  dýnova: {
    name: 'Dynova kremova polevka',
    ingredients: [
      { name: 'Dyne hokaido', grams: 30, group: 'zelenina_ovoce' as const },
      { name: 'Brambory', grams: 10, group: 'brambory_hlizy' as const },
      { name: 'Olivovy olej', grams: 2, group: 'tuky_volne' as const },
    ],
    allergens: [] as AllergenNumber[],
  },
  polevka_minestrone: {
    name: 'Minestrone',
    ingredients: [
      { name: 'Fazole', grams: 10, group: 'lusteniny' as const },
      { name: 'Rajcata', grams: 15, group: 'zelenina_ovoce' as const },
      { name: 'Cuketa', grams: 10, group: 'zelenina_ovoce' as const },
      { name: 'Celozrnne testoviny', grams: 5, group: 'celozrnne_obiloviny' as const },
      { name: 'Olivovy olej', grams: 2, group: 'tuky_volne' as const },
    ],
    allergens: [1] as AllergenNumber[],
  },
};

// ================================================================
// RECEPTY — DRŮBEŽ
// ================================================================

const POULTRY: LunchRecipe[] = [
  {
    id: 'kure-paprika', name: 'Kureci prsa na paprice s celozrnnou ryzi',
    mainDish: 'drubez', sideDish: 'ryze',
    soup: SOUPS.rajska.name, soupIngredients: SOUPS.rajska.ingredients,
    mainIngredients: [
      { name: 'Kureci prsa', grams: 80, group: 'maso' },
      { name: 'Paprika cervena', grams: 20, group: 'zelenina_ovoce' },
      { name: 'Smetana', grams: 15, group: 'mlecne_vyrobky_mleko' },
      { name: 'Cibule', grams: 10, group: 'zelenina_ovoce' },
      { name: 'Olivovy olej', grams: 3, group: 'tuky_volne' },
      { name: 'Ryze natural', grams: 60, group: 'ostatni' },
    ],
    garnish: 'Okurkovy salat', garnishIngredients: [{ name: 'Okurka', grams: 40, group: 'zelenina_ovoce' }],
    beverage: 'Neslazeny ovocny caj', allergens: [7], isSweet: false, isFried: false,
    instructions: 'Kureci prsa nakrajime na kostky, orestujeme na olivovem oleji s cibuli. Pridame papriku, podlijeme vodou, dusime do mekkа. Zahutime smetanou. Podavame s ryzi natural a okurkovym salatem.',
    estimatedCostPerPortion: 32,
  },
  {
    id: 'kure-bylinkove', name: 'Pečené kuře s bylinkami a bramborovým pyré',
    mainDish: 'drubez', sideDish: 'bramborova_kase',
    soup: SOUPS.zeleninova.name, soupIngredients: SOUPS.zeleninova.ingredients,
    mainIngredients: [
      { name: 'Kureci stehno', grams: 85, group: 'maso' },
      { name: 'Brambory', grams: 100, group: 'brambory_hlizy' },
      { name: 'Mleko', grams: 20, group: 'mlecne_vyrobky_mleko' },
      { name: 'Maslo', grams: 3, group: 'tuky_volne' },
    ],
    garnish: 'Mrkvovy salat', garnishIngredients: [{ name: 'Mrkev', grams: 40, group: 'zelenina_ovoce' }],
    beverage: 'Voda s citronem', allergens: [7], isSweet: false, isFried: false,
    instructions: 'Kureci stehno okoreníme bylinkami, peceme v troube na 180°C cca 35 min. Brambory uvarime, rozmakneme s mlekem a maslem na pyre.',
    estimatedCostPerPortion: 30,
  },
  {
    id: 'kure-zelenina-testoviny', name: 'Kureci nudlicky se zeleninou a celozrnnými testovinami',
    mainDish: 'drubez', sideDish: 'testoviny',
    soup: SOUPS.hrachova.name, soupIngredients: SOUPS.hrachova.ingredients,
    mainIngredients: [
      { name: 'Kureci prsa', grams: 75, group: 'maso' },
      { name: 'Cuketa', grams: 20, group: 'zelenina_ovoce' },
      { name: 'Paprika', grams: 15, group: 'zelenina_ovoce' },
      { name: 'Celozrnne testoviny', grams: 55, group: 'celozrnne_obiloviny' },
      { name: 'Olivovy olej', grams: 4, group: 'tuky_volne' },
    ],
    garnish: 'Rajcatovy salat', garnishIngredients: [{ name: 'Rajcata', grams: 35, group: 'zelenina_ovoce' }],
    beverage: 'Neslazeny bylinny caj', allergens: [1], isSweet: false, isFried: false,
    instructions: 'Kureci prsa nakrajime na nudlicky, orestujeme. Pridame zeleninu, dusime. Podavame s uvarenimi celozrnnymi testovinami.',
    estimatedCostPerPortion: 28,
  },
];

// ================================================================
// RECEPTY — RYBY
// ================================================================

const FISH: LunchRecipe[] = [
  {
    id: 'losos-peceny', name: 'Peceny losos s brokolicí a bramborovými dílky',
    mainDish: 'ryba', sideDish: 'brambory_varene',
    soup: SOUPS.cesnecka.name, soupIngredients: SOUPS.cesnecka.ingredients,
    mainIngredients: [
      { name: 'Losos filet', grams: 70, group: 'ryby_korysi_mekkysi' },
      { name: 'Brambory', grams: 90, group: 'brambory_hlizy' },
      { name: 'Brokolice', grams: 30, group: 'zelenina_ovoce' },
      { name: 'Olivovy olej', grams: 4, group: 'tuky_volne' },
    ],
    garnish: 'Zeleny salat', garnishIngredients: [{ name: 'Hlávkový salat', grams: 30, group: 'zelenina_ovoce' }],
    beverage: 'Voda', allergens: [4], isSweet: false, isFried: false,
    instructions: 'Lososa peceme v troube na 190°C 15 min. Brambory nakrajime na dilky, peceme spolu s brokolicí. Podavame se zelenym salatem.',
    estimatedCostPerPortion: 42,
  },
  {
    id: 'treska-smetanova', name: 'Treska na smetane s rýží',
    mainDish: 'ryba', sideDish: 'ryze',
    soup: SOUPS.brokolice.name, soupIngredients: SOUPS.brokolice.ingredients,
    mainIngredients: [
      { name: 'Treska filet', grams: 70, group: 'ryby_korysi_mekkysi' },
      { name: 'Smetana', grams: 20, group: 'mlecne_vyrobky_mleko' },
      { name: 'Cibule', grams: 8, group: 'zelenina_ovoce' },
      { name: 'Ryze', grams: 55, group: 'ostatni' },
      { name: 'Olivovy olej', grams: 3, group: 'tuky_volne' },
    ],
    garnish: 'Zeli coleslaw', garnishIngredients: [{ name: 'Bili zeli', grams: 35, group: 'zelenina_ovoce' }, { name: 'Mrkev', grams: 10, group: 'zelenina_ovoce' }],
    beverage: 'Neslazeny caj', allergens: [4, 7], isSweet: false, isFried: false,
    instructions: 'Tresku dusime v smetanove omacce s cibuli. Podavame s ryzi a zelnym salatkem.',
    estimatedCostPerPortion: 38,
  },
];

// ================================================================
// RECEPTY — VEPŘOVÉ
// ================================================================

const PORK: LunchRecipe[] = [
  {
    id: 'veprove-pecene', name: 'Veprova pecene s bramborovým knedlíkem a zelím',
    mainDish: 'veprove', sideDish: 'bramborove_knedliky',
    soup: SOUPS.hovezi_vyvar.name, soupIngredients: SOUPS.hovezi_vyvar.ingredients,
    mainIngredients: [
      { name: 'Veprove maso', grams: 80, group: 'maso' },
      { name: 'Bramborovy knedlik', grams: 80, group: 'brambory_hlizy' },
      { name: 'Dusene zeli', grams: 40, group: 'zelenina_ovoce' },
      { name: 'Olivovy olej', grams: 3, group: 'tuky_volne' },
    ],
    garnish: '', garnishIngredients: [],
    beverage: 'Neslazeny caj', allergens: [1, 3], isSweet: false, isFried: false,
    instructions: 'Veprovou peceni dusime v troube s korenym. Podavame s bramborovym knedlikem a dusenym zelim.',
    estimatedCostPerPortion: 30,
  },
  {
    id: 'veprove-gulas', name: 'Veprovy gulas s celozrnným chlebem',
    mainDish: 'veprove', sideDish: 'jine',
    soup: SOUPS.zeleninova.name, soupIngredients: SOUPS.zeleninova.ingredients,
    mainIngredients: [
      { name: 'Veprove maso', grams: 75, group: 'maso' },
      { name: 'Cibule', grams: 15, group: 'zelenina_ovoce' },
      { name: 'Paprika', grams: 10, group: 'zelenina_ovoce' },
      { name: 'Celozrnny chleb', grams: 40, group: 'celozrnne_obiloviny' },
      { name: 'Olivovy olej', grams: 3, group: 'tuky_volne' },
    ],
    garnish: 'Kvasena zelenina', garnishIngredients: [{ name: 'Kvasena zelenina', grams: 30, group: 'zelenina_ovoce' }],
    beverage: 'Voda', allergens: [1], isSweet: false, isFried: false,
    instructions: 'Maso nakrajime na kostky, orestujeme s cibuli. Pridame papriku, koření, dusime do mekkа. Podavame s celozrnnym chlebem.',
    estimatedCostPerPortion: 28,
  },
];

// ================================================================
// RECEPTY — HOVĚZÍ / KRÁLÍK
// ================================================================

const BEEF: LunchRecipe[] = [
  {
    id: 'hovezi-svickova', name: 'Svickova na smetane s houskovym knedlikem',
    mainDish: 'hovezi', sideDish: 'houskove_knedliky',
    soup: SOUPS.cesnecka.name, soupIngredients: SOUPS.cesnecka.ingredients,
    mainIngredients: [
      { name: 'Hovezi svickova', grams: 75, group: 'maso' },
      { name: 'Mrkev', grams: 15, group: 'zelenina_ovoce' },
      { name: 'Celer', grams: 10, group: 'zelenina_ovoce' },
      { name: 'Smetana', grams: 15, group: 'mlecne_vyrobky_mleko' },
      { name: 'Houskovy knedlik', grams: 70, group: 'ostatni' },
      { name: 'Olivovy olej', grams: 3, group: 'tuky_volne' },
    ],
    garnish: 'Brusinka', garnishIngredients: [{ name: 'Brusinkova omacka', grams: 10, group: 'zelenina_ovoce' }],
    beverage: 'Neslazeny caj', allergens: [1, 3, 7, 9], isSweet: false, isFried: false,
    instructions: 'Hovezi maso dusime s koreninovou zeleninou. Omacku rozmixujeme, zahutime smetanou. Podavame s houskovym knedlikem a brusinkami.',
    estimatedCostPerPortion: 38,
  },
  {
    id: 'hovezi-stroganoff', name: 'Hovezi Stroganoff s rýží natural',
    mainDish: 'hovezi', sideDish: 'ryze',
    soup: SOUPS.rajska.name, soupIngredients: SOUPS.rajska.ingredients,
    mainIngredients: [
      { name: 'Hovezi maso', grams: 75, group: 'maso' },
      { name: 'Houby', grams: 15, group: 'zelenina_ovoce' },
      { name: 'Cibule', grams: 10, group: 'zelenina_ovoce' },
      { name: 'Smetana', grams: 12, group: 'mlecne_vyrobky_mleko' },
      { name: 'Ryze natural', grams: 55, group: 'ostatni' },
      { name: 'Olivovy olej', grams: 3, group: 'tuky_volne' },
    ],
    garnish: 'Sterilizovana okurka', garnishIngredients: [{ name: 'Okurka', grams: 25, group: 'zelenina_ovoce' }],
    beverage: 'Voda', allergens: [7], isSweet: false, isFried: false,
    instructions: 'Hovezi nakrajime na nudlicky, orestujeme s cibuli a houbami. Zalijeme smetanou, dusime. Podavame s ryzi.',
    estimatedCostPerPortion: 36,
  },
  {
    id: 'kralik-peceny', name: 'Pečený králík s bramborami a zeleninou',
    mainDish: 'kralik', sideDish: 'brambory_varene',
    soup: SOUPS.kulajda.name, soupIngredients: SOUPS.kulajda.ingredients,
    mainIngredients: [
      { name: 'Kralici maso', grams: 80, group: 'maso' },
      { name: 'Brambory', grams: 90, group: 'brambory_hlizy' },
      { name: 'Mrkev', grams: 20, group: 'zelenina_ovoce' },
      { name: 'Olivovy olej', grams: 4, group: 'tuky_volne' },
    ],
    garnish: 'Cervena repa salat', garnishIngredients: [{ name: 'Cervena repa', grams: 30, group: 'zelenina_ovoce' }],
    beverage: 'Neslazeny caj', allergens: [3, 7], isSweet: false, isFried: false,
    instructions: 'Kralika okoreníme, peceme v troube s brambory a mrkvi. Podavame s repoвym salatkem.',
    estimatedCostPerPortion: 40,
  },
];

// ================================================================
// RECEPTY — BEZMASÉ ZELENINOVÉ
// ================================================================

const MEATLESS: LunchRecipe[] = [
  {
    id: 'lusteniny-chili', name: 'Fazolove chili s celozrnnou ryzi',
    mainDish: 'bezmase_zeleninove', sideDish: 'ryze',
    soup: SOUPS.dýnova.name, soupIngredients: SOUPS.dýnova.ingredients,
    mainIngredients: [
      { name: 'Fazole cervene', grams: 40, group: 'lusteniny' },
      { name: 'Rajcata', grams: 30, group: 'zelenina_ovoce' },
      { name: 'Paprika', grams: 15, group: 'zelenina_ovoce' },
      { name: 'Kukurice', grams: 15, group: 'zelenina_ovoce' },
      { name: 'Cibule', grams: 10, group: 'zelenina_ovoce' },
      { name: 'Celozrnna ryze', grams: 55, group: 'celozrnne_obiloviny' },
      { name: 'Olivovy olej', grams: 4, group: 'tuky_volne' },
    ],
    garnish: 'Jogurt', garnishIngredients: [{ name: 'Prirozeny jogurt', grams: 30, group: 'mlecne_vyrobky_mleko' }],
    beverage: 'Voda', allergens: [7], isSweet: false, isFried: false,
    instructions: 'Fazole predchystame (namocime pres noc). Dusime s rajcaty, paprikou, kukurici a korenym. Podavame s celozrnnou ryzi a lzici jogurtu.',
    estimatedCostPerPortion: 22,
  },
  {
    id: 'zeleninove-rizoto', name: 'Zeleninove rizoto s parmazanem',
    mainDish: 'bezmase_zeleninove', sideDish: 'ryze',
    soup: SOUPS.cocková.name, soupIngredients: SOUPS.cocková.ingredients,
    mainIngredients: [
      { name: 'Ryze', grams: 55, group: 'ostatni' },
      { name: 'Cuketa', grams: 25, group: 'zelenina_ovoce' },
      { name: 'Hrasek', grams: 15, group: 'zelenina_ovoce' },
      { name: 'Parmazan', grams: 10, group: 'mlecne_vyrobky_mleko' },
      { name: 'Cibule', grams: 8, group: 'zelenina_ovoce' },
      { name: 'Olivovy olej', grams: 4, group: 'tuky_volne' },
    ],
    garnish: 'Rajcatovy salat', garnishIngredients: [{ name: 'Rajcata cherry', grams: 35, group: 'zelenina_ovoce' }],
    beverage: 'Voda s citronem', allergens: [7], isSweet: false, isFried: false,
    instructions: 'Cibuli orestujeme, pridame ryzi, postupne prilevame vyvar. Vmicname zeleninu a na konci parmazan.',
    estimatedCostPerPortion: 24,
  },
  {
    id: 'cockovy-dhal', name: 'Cockovy dhal s celozrnným naanem',
    mainDish: 'bezmase_zeleninove', sideDish: 'jine',
    soup: SOUPS.polevka_minestrone.name, soupIngredients: SOUPS.polevka_minestrone.ingredients,
    mainIngredients: [
      { name: 'Cocka cervena', grams: 40, group: 'lusteniny' },
      { name: 'Rajcata', grams: 20, group: 'zelenina_ovoce' },
      { name: 'Spenat', grams: 15, group: 'zelenina_ovoce' },
      { name: 'Cibule', grams: 10, group: 'zelenina_ovoce' },
      { name: 'Celozrnny naan', grams: 40, group: 'celozrnne_obiloviny' },
      { name: 'Olivovy olej', grams: 4, group: 'tuky_volne' },
    ],
    garnish: 'Jogurt s mátou', garnishIngredients: [{ name: 'Jogurt', grams: 25, group: 'mlecne_vyrobky_mleko' }],
    beverage: 'Neslazeny bylinny caj', allergens: [1, 7], isSweet: false, isFried: false,
    instructions: 'Cocku uvarime s rajcaty, korenym a spenatem do huste konzistence. Podavame s celozrnnym naanem a jogurtem.',
    estimatedCostPerPortion: 20,
  },
  {
    id: 'bramborak-peceny', name: 'Pečené bramboráky se zeleninovým salátem',
    mainDish: 'bezmase_zeleninove', sideDish: 'brambory_varene',
    soup: SOUPS.hrachova.name, soupIngredients: SOUPS.hrachova.ingredients,
    mainIngredients: [
      { name: 'Brambory', grams: 100, group: 'brambory_hlizy' },
      { name: 'Vejce', grams: 10, group: 'ostatni' },
      { name: 'Celozrnna mouka', grams: 10, group: 'celozrnne_obiloviny' },
      { name: 'Cesnek', grams: 3, group: 'zelenina_ovoce' },
      { name: 'Olivovy olej', grams: 4, group: 'tuky_volne' },
    ],
    garnish: 'Míchaný salat', garnishIngredients: [
      { name: 'Ledovy salat', grams: 20, group: 'zelenina_ovoce' },
      { name: 'Rajce', grams: 15, group: 'zelenina_ovoce' },
      { name: 'Okurka', grams: 15, group: 'zelenina_ovoce' },
    ],
    beverage: 'Voda', allergens: [1, 3], isSweet: false, isFried: false,
    instructions: 'Brambory nastrouháme, smichame s vejcem, moukou a cesnekem. Tvarujeme placicky, peceme v troube na 200°C 20 min. Podavame se salatem.',
    estimatedCostPerPortion: 18,
  },
  {
    id: 'spagety-bolognese-veg', name: 'Celozrnné špagety s čočkovou boloňskou omáčkou',
    mainDish: 'bezmase_zeleninove', sideDish: 'testoviny',
    soup: SOUPS.rajska.name, soupIngredients: SOUPS.rajska.ingredients,
    mainIngredients: [
      { name: 'Celozrnne spagety', grams: 55, group: 'celozrnne_obiloviny' },
      { name: 'Cocka zelena', grams: 25, group: 'lusteniny' },
      { name: 'Rajcata', grams: 30, group: 'zelenina_ovoce' },
      { name: 'Mrkev', grams: 10, group: 'zelenina_ovoce' },
      { name: 'Cibule', grams: 8, group: 'zelenina_ovoce' },
      { name: 'Olivovy olej', grams: 4, group: 'tuky_volne' },
      { name: 'Parmazan', grams: 5, group: 'mlecne_vyrobky_mleko' },
    ],
    garnish: 'Cerstvа bazalka', garnishIngredients: [{ name: 'Zeleny salat', grams: 20, group: 'zelenina_ovoce' }],
    beverage: 'Voda', allergens: [1, 7], isSweet: false, isFried: false,
    instructions: 'Cocku uvarime. Pripravime omacku z rajcat, mrkve a cibule, vmicname cocku. Podavame s celozrnnymi spagetami a parmazanem.',
    estimatedCostPerPortion: 22,
  },
];

// ================================================================
// RECEPTY — SLADKÉ (max 2× za měsíc)
// ================================================================

const SWEET: LunchRecipe[] = [
  {
    id: 'tvarohove-knedliky', name: 'Tvarohové knedlíky s ovocem',
    mainDish: 'sladke_jidlo', sideDish: 'jine',
    soup: SOUPS.zeleninova.name, soupIngredients: SOUPS.zeleninova.ingredients,
    mainIngredients: [
      { name: 'Tvaroh', grams: 50, group: 'mlecne_vyrobky_mleko' },
      { name: 'Celozrnna mouka', grams: 25, group: 'celozrnne_obiloviny' },
      { name: 'Vejce', grams: 10, group: 'ostatni' },
      { name: 'Jahody/boruvky', grams: 40, group: 'zelenina_ovoce' },
      { name: 'Maslo', grams: 3, group: 'tuky_volne' },
    ],
    garnish: '', garnishIngredients: [],
    beverage: 'Voda', allergens: [1, 3, 7], isSweet: true, isFried: false,
    instructions: 'Z tvarohu, mouky a vejce zpracujeme testo. Tvarujeme knedlicky, varime ve vode. Podavame s cerstvym ovocem a kouskem masla.',
    estimatedCostPerPortion: 26,
  },
];

// ================================================================
// EXPORT — KOMPLETNÍ DATABÁZE
// ================================================================

export const ALL_RECIPES: ReadonlyArray<LunchRecipe> = [
  ...POULTRY,
  ...FISH,
  ...PORK,
  ...BEEF,
  ...MEATLESS,
  ...SWEET,
];

export function getRecipesByCategory(category: MainDishCategory): LunchRecipe[] {
  return ALL_RECIPES.filter(r => r.mainDish === category);
}

export function getRecipeById(id: string): LunchRecipe | undefined {
  return ALL_RECIPES.find(r => r.id === id);
}
