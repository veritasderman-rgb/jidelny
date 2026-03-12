/**
 * Omezení cukrů, soli, tuků, smažených pokrmů a zakázané ingredience.
 * Nový režim od 2025 (vyhláška 310/2025 Sb.).
 */

// ============================================================
// Limity soli
// ============================================================

export const SALT_LIMITS = {
  /** Polévky: max. g soli na 10 porcí */
  soupPer10Portions: { min: 10, max: 20 },
  /** Hlavní jídla: max. g soli na 10 porcí */
  mainCoursePer10Portions: { max: 20 },
  /** Nakupované doplňky: max. g soli na 100 g */
  purchasedSupplementsPer100g: { max: 1 },
  /** Koření s obsahem soli > 10 g/100 g je zakázáno */
  spiceMaxSaltPer100g: 10,
} as const;

// ============================================================
// Limity tuků
// ============================================================

export const FAT_LIMITS = {
  /** Poměr rostlinných a živočišných tuků: minimum rostlinné:živočišné */
  plantToAnimalMinRatio: 2, // 2:1
  /** Nakupované doplňky: max. g nasycených tuků na 100 g */
  purchasedSupplementsSaturatedPer100g: 5,
  /** Nasycené tuky < % celkové energie */
  saturatedMaxEnergyPercent: 10,
  /** Trans-tuky < % celkové energie */
  transMaxEnergyPercent: 1,
} as const;

// ============================================================
// Limity cukrů
// ============================================================

export const SUGAR_LIMITS = {
  /** Přidané cukry: max. % celkové energie */
  addedSugarMaxEnergyPercent: 10,
  /** Nakupované doplňky: max. g cukrů na 100 g */
  purchasedSupplementsPer100g: 10,
} as const;

// ============================================================
// Zakázané potraviny a ingredience
// ============================================================

export enum BannedCategory {
  DEHYDRATED_MIX = 'DEHYDRATED_MIX',
  BANNED_FAT = 'BANNED_FAT',
  HIGH_SALT_SPICE = 'HIGH_SALT_SPICE',
  SWEETENER = 'SWEETENER',
  SWEETENED_BEVERAGE = 'SWEETENED_BEVERAGE',
  HIGHLY_PROCESSED = 'HIGHLY_PROCESSED',
}

export interface BannedItem {
  category: BannedCategory;
  nameCz: string;
  description: string;
}

export const BANNED_ITEMS: ReadonlyArray<BannedItem> = [
  {
    category: BannedCategory.DEHYDRATED_MIX,
    nameCz: 'Instantní polévky',
    description: 'Dehydratované směsi — instantní polévky',
  },
  {
    category: BannedCategory.DEHYDRATED_MIX,
    nameCz: 'Bujóny',
    description: 'Dehydratované směsi — bujóny',
  },
  {
    category: BannedCategory.DEHYDRATED_MIX,
    nameCz: 'Instantní omáčky',
    description: 'Dehydratované směsi — instantní omáčky',
  },
  {
    category: BannedCategory.DEHYDRATED_MIX,
    nameCz: 'Základy jíšek s přidanou solí',
    description: 'Dehydratované směsi — základy jíšek s přidanou solí',
  },
  {
    category: BannedCategory.BANNED_FAT,
    nameCz: 'Palmový tuk',
    description: 'Palmový tuk jako volný tuk',
  },
  {
    category: BannedCategory.BANNED_FAT,
    nameCz: 'Palmojádrový tuk',
    description: 'Palmojádrový tuk jako volný tuk',
  },
  {
    category: BannedCategory.BANNED_FAT,
    nameCz: 'Kokosový tuk',
    description: 'Kokosový tuk jako volný tuk',
  },
  {
    category: BannedCategory.HIGH_SALT_SPICE,
    nameCz: 'Koření s vysokým obsahem soli',
    description: 'Koření s obsahem soli > 10 g/100 g',
  },
  {
    category: BannedCategory.SWEETENER,
    nameCz: 'Sladidla',
    description: 'Sladidla ve školním stravování jsou zakázána',
  },
  {
    category: BannedCategory.SWEETENED_BEVERAGE,
    nameCz: 'Džusy (vč. 100%)',
    description: 'Veškeré nápoje s volnými cukry',
  },
  {
    category: BannedCategory.SWEETENED_BEVERAGE,
    nameCz: 'Nektary',
    description: 'Veškeré nápoje s volnými cukry',
  },
  {
    category: BannedCategory.SWEETENED_BEVERAGE,
    nameCz: 'Sirupy',
    description: 'Veškeré nápoje s volnými cukry',
  },
  {
    category: BannedCategory.SWEETENED_BEVERAGE,
    nameCz: 'Slazené limonády',
    description: 'Veškeré nápoje s volnými cukry',
  },
];

/** Povolené nápoje */
export const ALLOWED_BEVERAGES = [
  'Pitná voda',
  'Neslazený bylinný čaj',
  'Neslazený ovocný čaj',
  'Neslazený zelený čaj',
  'Neslazený černý čaj',
  'Voda s celými kusy ovoce/bylinek (louhování)',
  'Mléko bez přidaného cukru',
  'Mléčné nápoje bez přidaného cukru',
] as const;

/** Nevhodné nápoje pro děti */
export const UNSUITABLE_BEVERAGES = [
  'Káva',
  'Energetické nápoje',
  'Alkohol',
  'Silně perlivé nápoje',
] as const;

// ============================================================
// Pamlsková vyhláška (282/2016 Sb.) — max. hodnoty na 100 g/ml
// ============================================================

export interface VendingLimit {
  category: string;
  saltPer100g: number | null;
  saturatedFatPer100g: number | null;
  sugarPer100g: number | null;
  note?: string;
}

export const VENDING_LIMITS: ReadonlyArray<VendingLimit> = [
  { category: 'Nealkoholické nápoje', saltPer100g: null, saturatedFatPer100g: null, sugarPer100g: 4 },
  { category: 'Mléčné nápoje (min. 50% mléka)', saltPer100g: null, saturatedFatPer100g: null, sugarPer100g: 11 },
  { category: 'Fermentované mléčné výrobky', saltPer100g: null, saturatedFatPer100g: 10, sugarPer100g: 11 },
  { category: 'Masné/vaječné výrobky (min. 50% masa)', saltPer100g: 1.8, saturatedFatPer100g: 10, sugarPer100g: 1.0 },
  { category: 'Sladké pečivo', saltPer100g: 0.7, saturatedFatPer100g: 5, sugarPer100g: 20 },
  { category: 'Slané pečivo', saltPer100g: 1.6, saturatedFatPer100g: 5, sugarPer100g: 13 },
  { category: 'Ovoce/zelenina zpracované', saltPer100g: 0.5, saturatedFatPer100g: null, sugarPer100g: null, note: 'Bez přidaného cukru' },
  { category: 'Ořechy, semena, luštěniny', saltPer100g: null, saturatedFatPer100g: null, sugarPer100g: null, note: 'Bez přidané soli a cukru' },
];
