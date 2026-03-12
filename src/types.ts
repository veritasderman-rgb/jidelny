/**
 * Typy a definice pro systém školního stravování v ČR
 * Vyhláška č. 107/2005 Sb. a novela č. 310/2025 Sb.
 */

// ============================================================
// Věkové kategorie
// ============================================================

/** Starý systém věkových kategorií (107/2005, platný do 31.8.2026) */
export type OldAgeCategory = '3-6' | '7-10' | '11-14' | '15-18';

/** Nový systém věkových kategorií (310/2025) */
export type NewAgeCategory = '2-3' | '4-6' | '7-10' | '11-14' | '15+';

/** Obecná věková kategorie (union obou systémů) */
export type AgeCategory = OldAgeCategory | NewAgeCategory;

// ============================================================
// Potravinové skupiny
// ============================================================

/** Starý spotřební koš — 10 skupin ("jak nakoupeno") */
export type OldFoodGroup =
  | 'maso'
  | 'ryby'
  | 'mleko_tekute'
  | 'mlecne_vyrobky'
  | 'tuky_volne'
  | 'cukr_volny'
  | 'zelenina'
  | 'ovoce'
  | 'brambory'
  | 'lusteniny';

/** Nový spotřební koš — 9 skupin (čistá hmotnost) */
export type NewFoodGroup =
  | 'maso'
  | 'ryby_korysi_mekkýsi'
  | 'mlecne_vyrobky_mleko'
  | 'tuky_volne'
  | 'cukry_volne'
  | 'zelenina_ovoce'
  | 'brambory_hlízy'
  | 'celozrnne_obiloviny'
  | 'lusteniny';

// ============================================================
// Typy jídel
// ============================================================

/** Typy jednotlivých jídel v denním režimu */
export type MealType =
  | 'snidane'
  | 'presnidavka'
  | 'obed'
  | 'svacina'
  | 'vecere'
  | 'druha_vecere';

/** Typ stravovacího zařízení */
export type FacilityType =
  | 'skolni_jidelna'
  | 'skolni_jidelna_vyvarna'
  | 'skolni_jidelna_vydejna'
  | 'vydejna_lesni_ms';

/** Režim stravování */
export type MealPlanType = 'obed' | 'ms_presnidavka_obed_svacina' | 'celodenni';

// ============================================================
// Energetická distribuce
// ============================================================

/** Podíl jídla na denním energetickém příjmu (v %) */
export interface EnergyDistribution {
  snidane: number;
  presnidavka: number;
  obed: number;
  svacina: number;
  vecere: number;
}

// ============================================================
// Spotřební koš
// ============================================================

/** Gramáž jedné potravinové skupiny pro danou věkovou kategorii a typ jídla */
export interface FoodGroupGramage<G extends string = string> {
  group: G;
  gramsPerDinerPerDay: number;
}

/** Tolerance pro jednu potravinovou skupinu */
export interface Tolerance {
  /** Minimum v procentech (0–100). Null = nestanoven. */
  minPercent: number;
  /** Maximum v procentech (0–100). Null = nestanoven (žádoucí překračovat). */
  maxPercent: number | null;
}

/** Položka starého spotřebního koše */
export type OldBasketEntry = Record<OldAgeCategory, number>;

/** Položka nového spotřebního koše */
export type NewBasketEntry = Record<NewAgeCategory, number>;

/** Kompletní koš starého systému: pro každou skupinu gramáže dle věkové kategorie */
export type OldBasket = Record<OldFoodGroup, OldBasketEntry>;

/** Kompletní koš nového systému */
export type NewBasket = Record<NewFoodGroup, NewBasketEntry>;

/** Tolerance starého koše */
export type OldTolerances = Record<OldFoodGroup, Tolerance>;

/** Tolerance nového koše */
export type NewTolerances = Record<NewFoodGroup, Tolerance>;

// ============================================================
// Flexibilní koš
// ============================================================

/** Minimální součet (maso + ryby + luštěniny) pro flexibilní koš */
export type FlexibleBasketMinSum = Record<NewAgeCategory, number>;

// ============================================================
// Finanční normativy
// ============================================================

/** Rozpětí finančního normativu v Kč */
export interface FinancialRange {
  min: number;
  max: number;
}

/** Finanční normativy jedné věkové kategorie */
export interface FinancialNormative {
  snidane: FinancialRange;
  presnidavka: FinancialRange;
  obed: FinancialRange;
  svacina: FinancialRange;
  vecere: FinancialRange;
  celodenni: FinancialRange;
  napoje_ms?: FinancialRange;
}

export type FinancialNormatives = Record<NewAgeCategory, FinancialNormative>;

// ============================================================
// Alergeny
// ============================================================

/** Číslo alergenu dle nařízení EU č. 1169/2011 */
export type AllergenNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

/** Definice alergenu */
export interface AllergenDefinition {
  number: AllergenNumber;
  nameCz: string;
  nameEn: string;
  note: string;
  requiresSpecificType: boolean;
}

/** Profil alergií strávníka */
export type AllergenProfile = Set<AllergenNumber>;

// ============================================================
// Receptura
// ============================================================

/** Ingredience receptury */
export interface Ingredient {
  name: string;
  /** Gramáž "jak nakoupeno" */
  grossWeight: number;
  /** Gramáž čisté hmotnosti (jedlý podíl) */
  netWeight: number;
  /** Přepočtový koeficient hrubá → čistá */
  conversionCoefficient: number;
  /** Potravinová skupina (nový koš) */
  newFoodGroup: NewFoodGroup;
  /** Potravinová skupina (starý koš) */
  oldFoodGroup: OldFoodGroup;
  /** Alergeny obsažené v ingredienci */
  allergens: AllergenNumber[];
  /** BIO surovina */
  isBio: boolean;
  /** Sezónní surovina */
  isSeasonal: boolean;
}

/** Receptura (recept) */
export interface Recipe {
  id: string;
  name: string;
  mealType: MealType;
  ingredients: Ingredient[];
  /** Automaticky odvozené alergeny ze všech ingrediencí */
  allergens: AllergenNumber[];
  /** Kategorie hlavního jídla */
  mainDishCategory?: MainDishCategory;
  /** Kategorie přílohy */
  sideDishCategory?: SideDishCategory;
  /** Je sladké jídlo */
  isSweet: boolean;
  /** Smažený pokrm */
  isFried: boolean;
  /** Počet porcí */
  portions: number;
  /** Množství soli na 10 porcí (g) */
  saltPer10Portions?: number;
}

// ============================================================
// Pravidla pestrosti
// ============================================================

/** Kategorie hlavního jídla */
export type MainDishCategory =
  | 'drubez'
  | 'ryba'
  | 'veprove'
  | 'hovezi'
  | 'kralik'
  | 'zverina'
  | 'vnitrnosti'
  | 'uzeniny'
  | 'bezmase_zeleninove'
  | 'sladke_jidlo';

/** Kategorie přílohy */
export type SideDishCategory =
  | 'brambory_varene'
  | 'bramborova_kase'
  | 'testoviny'
  | 'ryze'
  | 'houskove_knedliky'
  | 'bramborove_knedliky'
  | 'lusteniny'
  | 'jine';

/** Pravidlo frekvence výskytu za měsíc (20 stravovacích dnů) */
export interface FrequencyRule {
  category: string;
  /** Minimální počet výskytů za měsíc. Null = nestanoven. */
  minPerMonth: number | null;
  /** Maximální počet výskytů za měsíc. Null = nestanoven. */
  maxPerMonth: number | null;
  description: string;
}

// ============================================================
// Jídelní lístek
// ============================================================

/** Denní jídelní lístek */
export interface DailyMenu {
  date: Date;
  meals: MealEntry[];
}

/** Položka jídelního lístku */
export interface MealEntry {
  mealType: MealType;
  recipes: Recipe[];
  /** Nabízeny varianty (max. 2 hlavní chody) */
  variants?: Recipe[];
  /** Bezmasá varianta přítomna */
  hasMeatFreeOption: boolean;
  /** Nápoj ke každému jídlu */
  beverage: string;
}

/** Měsíční jídelní plán */
export interface MonthlyMenuPlan {
  year: number;
  month: number;
  schoolDays: number;
  dailyMenus: DailyMenu[];
}

// ============================================================
// Výsledky validace
// ============================================================

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationResult {
  valid: boolean;
  messages: ValidationMessage[];
}

export interface ValidationMessage {
  severity: ValidationSeverity;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ============================================================
// Režim koše (přechodné období)
// ============================================================

export type BasketRegime = 'old' | 'new_standard' | 'new_flexible';

/** Konfigurace systému */
export interface SystemConfig {
  basketRegime: BasketRegime;
  /** Datum přechodu na nový koš */
  transitionDate: Date;
  /** Minimální podíl BIO (% hmotnostně) */
  bioMinPercent: number;
  /** Minimální podíl sezónních potravin (% hmotnostně) */
  seasonalMinPercent: number;
  /** Počet strávníků (pro pravidla BIO/sezónnosti) */
  dinerCount: number;
  /** Sportovní gymnázium / taneční konzervatoř */
  isSportsSchool: boolean;
}

// ============================================================
// Dietní stravování
// ============================================================

export type DietType =
  | 'bezlepkova'
  | 'diabetes_1'
  | 'laktozova_intolerance'
  | 'potravinova_alergie'
  | 'fenylketonurie'
  | 'crohnova_choroba'
  | 'selektivni_poruchy'
  | 'laktoovovegetarianska';

export interface DietaryRequirement {
  dinerName: string;
  dietType: DietType;
  allergenProfile: AllergenProfile;
  doctorConfirmation: boolean;
  nutritionTherapistApproval: boolean;
  parentAgreement: boolean;
}
