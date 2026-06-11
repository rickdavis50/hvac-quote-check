export interface CbsaCostEntry {
  cbsaCode: string;
  name: string;
  state: string;
  laborIndex: number;
  costOfLivingIndex: number;
  permitBurden: number;
  urbanDensity: number;
  climateComplexity: number;
  compositeIndex: number;
}

// Helper to calculate and round composite index
function ci(l: number, c: number, p: number, u: number, cc: number): number {
  return Math.round((l * 0.40 + c * 0.30 + p * 0.10 + u * 0.10 + cc * 0.10) * 100) / 100;
}

export const CBSA_COST_INDEX: CbsaCostEntry[] = [
  // ============================================================
  // PACIFIC WEST (CA, OR, WA, HI, AK)
  // ============================================================

  // California
  { cbsaCode: "41860", name: "San Francisco-Oakland-Berkeley", state: "CA", laborIndex: 1.65, costOfLivingIndex: 1.28, permitBurden: 1.15, urbanDensity: 1.07, climateComplexity: 0.97, compositeIndex: ci(1.65, 1.28, 1.15, 1.07, 0.97) },
  { cbsaCode: "41940", name: "San Jose-Sunnyvale-Santa Clara", state: "CA", laborIndex: 1.62, costOfLivingIndex: 1.27, permitBurden: 1.13, urbanDensity: 1.05, climateComplexity: 0.97, compositeIndex: ci(1.62, 1.27, 1.13, 1.05, 0.97) },
  { cbsaCode: "31080", name: "Los Angeles-Long Beach-Anaheim", state: "CA", laborIndex: 1.42, costOfLivingIndex: 1.18, permitBurden: 1.10, urbanDensity: 1.06, climateComplexity: 0.96, compositeIndex: ci(1.42, 1.18, 1.10, 1.06, 0.96) },
  { cbsaCode: "40140", name: "Riverside-San Bernardino-Ontario", state: "CA", laborIndex: 1.28, costOfLivingIndex: 1.08, permitBurden: 1.05, urbanDensity: 1.01, climateComplexity: 0.98, compositeIndex: ci(1.28, 1.08, 1.05, 1.01, 0.98) },
  { cbsaCode: "41740", name: "San Diego-Chula Vista-Carlsbad", state: "CA", laborIndex: 1.38, costOfLivingIndex: 1.16, permitBurden: 1.08, urbanDensity: 1.04, climateComplexity: 0.95, compositeIndex: ci(1.38, 1.16, 1.08, 1.04, 0.95) },
  { cbsaCode: "40900", name: "Sacramento-Roseville-Folsom", state: "CA", laborIndex: 1.35, costOfLivingIndex: 1.12, permitBurden: 1.07, urbanDensity: 1.02, climateComplexity: 1.00, compositeIndex: ci(1.35, 1.12, 1.07, 1.02, 1.00) },
  { cbsaCode: "23420", name: "Fresno", state: "CA", laborIndex: 1.18, costOfLivingIndex: 1.02, permitBurden: 1.03, urbanDensity: 1.00, climateComplexity: 1.00, compositeIndex: ci(1.18, 1.02, 1.03, 1.00, 1.00) },
  { cbsaCode: "12540", name: "Bakersfield", state: "CA", laborIndex: 1.15, costOfLivingIndex: 0.99, permitBurden: 1.02, urbanDensity: 0.99, climateComplexity: 1.00, compositeIndex: ci(1.15, 0.99, 1.02, 0.99, 1.00) },
  { cbsaCode: "36084", name: "Oakland-Berkeley-Livermore", state: "CA", laborIndex: 1.60, costOfLivingIndex: 1.26, permitBurden: 1.14, urbanDensity: 1.06, climateComplexity: 0.97, compositeIndex: ci(1.60, 1.26, 1.14, 1.06, 0.97) },
  { cbsaCode: "46700", name: "Stockton", state: "CA", laborIndex: 1.20, costOfLivingIndex: 1.04, permitBurden: 1.03, urbanDensity: 1.00, climateComplexity: 1.00, compositeIndex: ci(1.20, 1.04, 1.03, 1.00, 1.00) },
  { cbsaCode: "33700", name: "Modesto", state: "CA", laborIndex: 1.18, costOfLivingIndex: 1.02, permitBurden: 1.02, urbanDensity: 0.99, climateComplexity: 1.00, compositeIndex: ci(1.18, 1.02, 1.02, 0.99, 1.00) },
  { cbsaCode: "37100", name: "Oxnard-Thousand Oaks-Ventura", state: "CA", laborIndex: 1.38, costOfLivingIndex: 1.15, permitBurden: 1.08, urbanDensity: 1.02, climateComplexity: 0.96, compositeIndex: ci(1.38, 1.15, 1.08, 1.02, 0.96) },
  { cbsaCode: "42020", name: "San Luis Obispo-Paso Robles", state: "CA", laborIndex: 1.30, costOfLivingIndex: 1.12, permitBurden: 1.06, urbanDensity: 0.99, climateComplexity: 0.97, compositeIndex: ci(1.30, 1.12, 1.06, 0.99, 0.97) },
  { cbsaCode: "42200", name: "Santa Maria-Santa Barbara", state: "CA", laborIndex: 1.35, costOfLivingIndex: 1.18, permitBurden: 1.08, urbanDensity: 1.01, climateComplexity: 0.96, compositeIndex: ci(1.35, 1.18, 1.08, 1.01, 0.96) },
  { cbsaCode: "42100", name: "Santa Cruz-Watsonville", state: "CA", laborIndex: 1.45, costOfLivingIndex: 1.22, permitBurden: 1.10, urbanDensity: 1.01, climateComplexity: 0.97, compositeIndex: ci(1.45, 1.22, 1.10, 1.01, 0.97) },
  { cbsaCode: "49700", name: "Yuba City", state: "CA", laborIndex: 1.15, costOfLivingIndex: 1.02, permitBurden: 1.02, urbanDensity: 0.97, climateComplexity: 1.00, compositeIndex: ci(1.15, 1.02, 1.02, 0.97, 1.00) },
  { cbsaCode: "17020", name: "Chico", state: "CA", laborIndex: 1.15, costOfLivingIndex: 1.04, permitBurden: 1.03, urbanDensity: 0.97, climateComplexity: 1.00, compositeIndex: ci(1.15, 1.04, 1.03, 0.97, 1.00) },
  { cbsaCode: "39820", name: "Redding", state: "CA", laborIndex: 1.15, costOfLivingIndex: 1.02, permitBurden: 1.02, urbanDensity: 0.96, climateComplexity: 1.02, compositeIndex: ci(1.15, 1.02, 1.02, 0.96, 1.02) },
  { cbsaCode: "20940", name: "El Centro", state: "CA", laborIndex: 1.10, costOfLivingIndex: 0.98, permitBurden: 1.02, urbanDensity: 0.96, climateComplexity: 0.96, compositeIndex: ci(1.10, 0.98, 1.02, 0.96, 0.96) },
  { cbsaCode: "32900", name: "Merced", state: "CA", laborIndex: 1.15, costOfLivingIndex: 1.00, permitBurden: 1.02, urbanDensity: 0.98, climateComplexity: 1.00, compositeIndex: ci(1.15, 1.00, 1.02, 0.98, 1.00) },
  { cbsaCode: "47300", name: "Visalia", state: "CA", laborIndex: 1.12, costOfLivingIndex: 0.99, permitBurden: 1.02, urbanDensity: 0.97, climateComplexity: 1.00, compositeIndex: ci(1.12, 0.99, 1.02, 0.97, 1.00) },
  { cbsaCode: "25260", name: "Hanford-Corcoran", state: "CA", laborIndex: 1.12, costOfLivingIndex: 0.98, permitBurden: 1.01, urbanDensity: 0.96, climateComplexity: 1.00, compositeIndex: ci(1.12, 0.98, 1.01, 0.96, 1.00) },
  { cbsaCode: "31460", name: "Madera", state: "CA", laborIndex: 1.12, costOfLivingIndex: 0.99, permitBurden: 1.01, urbanDensity: 0.96, climateComplexity: 1.00, compositeIndex: ci(1.12, 0.99, 1.01, 0.96, 1.00) },
  { cbsaCode: "36140", name: "Napa", state: "CA", laborIndex: 1.45, costOfLivingIndex: 1.22, permitBurden: 1.10, urbanDensity: 1.00, climateComplexity: 0.97, compositeIndex: ci(1.45, 1.22, 1.10, 1.00, 0.97) },
  { cbsaCode: "42220", name: "Santa Rosa-Petaluma", state: "CA", laborIndex: 1.42, costOfLivingIndex: 1.20, permitBurden: 1.09, urbanDensity: 1.00, climateComplexity: 0.97, compositeIndex: ci(1.42, 1.20, 1.09, 1.00, 0.97) },
  { cbsaCode: "46020", name: "Vallejo", state: "CA", laborIndex: 1.40, costOfLivingIndex: 1.18, permitBurden: 1.08, urbanDensity: 1.01, climateComplexity: 0.97, compositeIndex: ci(1.40, 1.18, 1.08, 1.01, 0.97) },

  // Oregon
  { cbsaCode: "38900", name: "Portland-Vancouver-Hillsboro", state: "OR", laborIndex: 1.30, costOfLivingIndex: 1.12, permitBurden: 1.08, urbanDensity: 1.04, climateComplexity: 1.04, compositeIndex: ci(1.30, 1.12, 1.08, 1.04, 1.04) },
  { cbsaCode: "21660", name: "Eugene-Springfield", state: "OR", laborIndex: 1.12, costOfLivingIndex: 1.04, permitBurden: 1.04, urbanDensity: 0.99, climateComplexity: 1.02, compositeIndex: ci(1.12, 1.04, 1.04, 0.99, 1.02) },
  { cbsaCode: "41420", name: "Salem", state: "OR", laborIndex: 1.10, costOfLivingIndex: 1.02, permitBurden: 1.03, urbanDensity: 0.98, climateComplexity: 1.02, compositeIndex: ci(1.10, 1.02, 1.03, 0.98, 1.02) },
  { cbsaCode: "32780", name: "Medford", state: "OR", laborIndex: 1.08, costOfLivingIndex: 1.00, permitBurden: 1.02, urbanDensity: 0.97, climateComplexity: 1.02, compositeIndex: ci(1.08, 1.00, 1.02, 0.97, 1.02) },
  { cbsaCode: "13460", name: "Bend", state: "OR", laborIndex: 1.15, costOfLivingIndex: 1.08, permitBurden: 1.04, urbanDensity: 0.98, climateComplexity: 1.05, compositeIndex: ci(1.15, 1.08, 1.04, 0.98, 1.05) },
  { cbsaCode: "18700", name: "Corvallis", state: "OR", laborIndex: 1.10, costOfLivingIndex: 1.04, permitBurden: 1.03, urbanDensity: 0.97, climateComplexity: 1.02, compositeIndex: ci(1.10, 1.04, 1.03, 0.97, 1.02) },

  // Washington
  { cbsaCode: "42660", name: "Seattle-Tacoma-Bellevue", state: "WA", laborIndex: 1.32, costOfLivingIndex: 1.12, permitBurden: 1.06, urbanDensity: 1.04, climateComplexity: 1.04, compositeIndex: ci(1.32, 1.12, 1.06, 1.04, 1.04) },
  { cbsaCode: "44060", name: "Spokane-Spokane Valley", state: "WA", laborIndex: 1.05, costOfLivingIndex: 0.98, permitBurden: 1.00, urbanDensity: 0.99, climateComplexity: 1.08, compositeIndex: ci(1.05, 0.98, 1.00, 0.99, 1.08) },
  { cbsaCode: "28420", name: "Kennewick-Richland", state: "WA", laborIndex: 1.08, costOfLivingIndex: 0.98, permitBurden: 0.98, urbanDensity: 0.97, climateComplexity: 1.05, compositeIndex: ci(1.08, 0.98, 0.98, 0.97, 1.05) },
  { cbsaCode: "36500", name: "Olympia-Lacey-Tumwater", state: "WA", laborIndex: 1.22, costOfLivingIndex: 1.08, permitBurden: 1.05, urbanDensity: 0.99, climateComplexity: 1.03, compositeIndex: ci(1.22, 1.08, 1.05, 0.99, 1.03) },
  { cbsaCode: "13380", name: "Bellingham", state: "WA", laborIndex: 1.20, costOfLivingIndex: 1.10, permitBurden: 1.05, urbanDensity: 0.98, climateComplexity: 1.04, compositeIndex: ci(1.20, 1.10, 1.05, 0.98, 1.04) },
  { cbsaCode: "14740", name: "Bremerton-Silverdale-Port Orchard", state: "WA", laborIndex: 1.25, costOfLivingIndex: 1.10, permitBurden: 1.04, urbanDensity: 0.99, climateComplexity: 1.03, compositeIndex: ci(1.25, 1.10, 1.04, 0.99, 1.03) },
  { cbsaCode: "49420", name: "Yakima", state: "WA", laborIndex: 1.00, costOfLivingIndex: 0.95, permitBurden: 0.97, urbanDensity: 0.96, climateComplexity: 1.06, compositeIndex: ci(1.00, 0.95, 0.97, 0.96, 1.06) },

  // Hawaii
  { cbsaCode: "46520", name: "Urban Honolulu", state: "HI", laborIndex: 1.40, costOfLivingIndex: 1.25, permitBurden: 1.10, urbanDensity: 1.06, climateComplexity: 0.95, compositeIndex: ci(1.40, 1.25, 1.10, 1.06, 0.95) },
  { cbsaCode: "27980", name: "Kahului-Wailuku-Lahaina", state: "HI", laborIndex: 1.35, costOfLivingIndex: 1.22, permitBurden: 1.08, urbanDensity: 0.98, climateComplexity: 0.95, compositeIndex: ci(1.35, 1.22, 1.08, 0.98, 0.95) },

  // Alaska
  { cbsaCode: "11260", name: "Anchorage", state: "AK", laborIndex: 1.35, costOfLivingIndex: 1.18, permitBurden: 1.02, urbanDensity: 1.00, climateComplexity: 1.12, compositeIndex: ci(1.35, 1.18, 1.02, 1.00, 1.12) },
  { cbsaCode: "21820", name: "Fairbanks", state: "AK", laborIndex: 1.30, costOfLivingIndex: 1.15, permitBurden: 1.00, urbanDensity: 0.96, climateComplexity: 1.12, compositeIndex: ci(1.30, 1.15, 1.00, 0.96, 1.12) },

  // ============================================================
  // MOUNTAIN WEST (NV, AZ, UT, CO, NM, ID, MT, WY)
  // ============================================================

  // Nevada
  { cbsaCode: "29820", name: "Las Vegas-Henderson-Paradise", state: "NV", laborIndex: 1.15, costOfLivingIndex: 1.02, permitBurden: 0.98, urbanDensity: 1.02, climateComplexity: 0.97, compositeIndex: ci(1.15, 1.02, 0.98, 1.02, 0.97) },
  { cbsaCode: "39900", name: "Reno", state: "NV", laborIndex: 1.18, costOfLivingIndex: 1.05, permitBurden: 0.99, urbanDensity: 1.00, climateComplexity: 1.04, compositeIndex: ci(1.18, 1.05, 0.99, 1.00, 1.04) },
  { cbsaCode: "16180", name: "Carson City", state: "NV", laborIndex: 1.12, costOfLivingIndex: 1.02, permitBurden: 0.98, urbanDensity: 0.97, climateComplexity: 1.04, compositeIndex: ci(1.12, 1.02, 0.98, 0.97, 1.04) },

  // Arizona
  { cbsaCode: "38060", name: "Phoenix-Mesa-Chandler", state: "AZ", laborIndex: 1.00, costOfLivingIndex: 0.98, permitBurden: 0.95, urbanDensity: 1.01, climateComplexity: 0.96, compositeIndex: ci(1.00, 0.98, 0.95, 1.01, 0.96) },
  { cbsaCode: "46060", name: "Tucson", state: "AZ", laborIndex: 0.95, costOfLivingIndex: 0.96, permitBurden: 0.96, urbanDensity: 0.99, climateComplexity: 0.96, compositeIndex: ci(0.95, 0.96, 0.96, 0.99, 0.96) },
  { cbsaCode: "22380", name: "Flagstaff", state: "AZ", laborIndex: 1.00, costOfLivingIndex: 1.04, permitBurden: 0.98, urbanDensity: 0.97, climateComplexity: 1.06, compositeIndex: ci(1.00, 1.04, 0.98, 0.97, 1.06) },
  { cbsaCode: "39150", name: "Prescott Valley-Prescott", state: "AZ", laborIndex: 0.95, costOfLivingIndex: 0.99, permitBurden: 0.96, urbanDensity: 0.96, climateComplexity: 1.02, compositeIndex: ci(0.95, 0.99, 0.96, 0.96, 1.02) },
  { cbsaCode: "49740", name: "Yuma", state: "AZ", laborIndex: 0.90, costOfLivingIndex: 0.94, permitBurden: 0.95, urbanDensity: 0.96, climateComplexity: 0.95, compositeIndex: ci(0.90, 0.94, 0.95, 0.96, 0.95) },
  { cbsaCode: "29420", name: "Lake Havasu City-Kingman", state: "AZ", laborIndex: 0.90, costOfLivingIndex: 0.96, permitBurden: 0.95, urbanDensity: 0.96, climateComplexity: 0.96, compositeIndex: ci(0.90, 0.96, 0.95, 0.96, 0.96) },
  { cbsaCode: "43420", name: "Sierra Vista-Douglas", state: "AZ", laborIndex: 0.88, costOfLivingIndex: 0.94, permitBurden: 0.95, urbanDensity: 0.95, climateComplexity: 0.97, compositeIndex: ci(0.88, 0.94, 0.95, 0.95, 0.97) },

  // Utah
  { cbsaCode: "41620", name: "Salt Lake City", state: "UT", laborIndex: 1.08, costOfLivingIndex: 1.02, permitBurden: 0.98, urbanDensity: 1.02, climateComplexity: 1.06, compositeIndex: ci(1.08, 1.02, 0.98, 1.02, 1.06) },
  { cbsaCode: "39340", name: "Provo-Orem", state: "UT", laborIndex: 1.02, costOfLivingIndex: 1.00, permitBurden: 0.97, urbanDensity: 1.00, climateComplexity: 1.06, compositeIndex: ci(1.02, 1.00, 0.97, 1.00, 1.06) },
  { cbsaCode: "36260", name: "Ogden-Clearfield", state: "UT", laborIndex: 1.05, costOfLivingIndex: 1.00, permitBurden: 0.97, urbanDensity: 1.00, climateComplexity: 1.06, compositeIndex: ci(1.05, 1.00, 0.97, 1.00, 1.06) },
  { cbsaCode: "41100", name: "St. George", state: "UT", laborIndex: 0.98, costOfLivingIndex: 0.99, permitBurden: 0.96, urbanDensity: 0.97, climateComplexity: 1.00, compositeIndex: ci(0.98, 0.99, 0.96, 0.97, 1.00) },
  { cbsaCode: "30860", name: "Logan", state: "UT", laborIndex: 0.95, costOfLivingIndex: 0.97, permitBurden: 0.96, urbanDensity: 0.96, climateComplexity: 1.08, compositeIndex: ci(0.95, 0.97, 0.96, 0.96, 1.08) },

  // Colorado
  { cbsaCode: "19740", name: "Denver-Aurora-Lakewood", state: "CO", laborIndex: 1.12, costOfLivingIndex: 1.04, permitBurden: 1.02, urbanDensity: 1.02, climateComplexity: 1.06, compositeIndex: ci(1.12, 1.04, 1.02, 1.02, 1.06) },
  { cbsaCode: "17820", name: "Colorado Springs", state: "CO", laborIndex: 1.08, costOfLivingIndex: 1.02, permitBurden: 1.00, urbanDensity: 1.00, climateComplexity: 1.06, compositeIndex: ci(1.08, 1.02, 1.00, 1.00, 1.06) },
  { cbsaCode: "14500", name: "Boulder", state: "CO", laborIndex: 1.28, costOfLivingIndex: 1.14, permitBurden: 1.08, urbanDensity: 1.02, climateComplexity: 1.06, compositeIndex: ci(1.28, 1.14, 1.08, 1.02, 1.06) },
  { cbsaCode: "22660", name: "Fort Collins", state: "CO", laborIndex: 1.15, costOfLivingIndex: 1.06, permitBurden: 1.02, urbanDensity: 1.00, climateComplexity: 1.06, compositeIndex: ci(1.15, 1.06, 1.02, 1.00, 1.06) },
  { cbsaCode: "24300", name: "Grand Junction", state: "CO", laborIndex: 1.02, costOfLivingIndex: 0.98, permitBurden: 0.98, urbanDensity: 0.96, climateComplexity: 1.06, compositeIndex: ci(1.02, 0.98, 0.98, 0.96, 1.06) },
  { cbsaCode: "24540", name: "Greeley", state: "CO", laborIndex: 1.10, costOfLivingIndex: 1.02, permitBurden: 1.00, urbanDensity: 0.99, climateComplexity: 1.06, compositeIndex: ci(1.10, 1.02, 1.00, 0.99, 1.06) },
  { cbsaCode: "39740", name: "Pueblo", state: "CO", laborIndex: 0.95, costOfLivingIndex: 0.94, permitBurden: 0.97, urbanDensity: 0.97, climateComplexity: 1.05, compositeIndex: ci(0.95, 0.94, 0.97, 0.97, 1.05) },

  // New Mexico
  { cbsaCode: "10740", name: "Albuquerque", state: "NM", laborIndex: 0.95, costOfLivingIndex: 0.96, permitBurden: 0.97, urbanDensity: 1.00, climateComplexity: 1.02, compositeIndex: ci(0.95, 0.96, 0.97, 1.00, 1.02) },
  { cbsaCode: "42140", name: "Santa Fe", state: "NM", laborIndex: 1.02, costOfLivingIndex: 1.05, permitBurden: 1.02, urbanDensity: 0.98, climateComplexity: 1.04, compositeIndex: ci(1.02, 1.05, 1.02, 0.98, 1.04) },
  { cbsaCode: "29740", name: "Las Cruces", state: "NM", laborIndex: 0.88, costOfLivingIndex: 0.92, permitBurden: 0.96, urbanDensity: 0.97, climateComplexity: 0.98, compositeIndex: ci(0.88, 0.92, 0.96, 0.97, 0.98) },
  { cbsaCode: "21580", name: "Farmington", state: "NM", laborIndex: 0.88, costOfLivingIndex: 0.92, permitBurden: 0.95, urbanDensity: 0.95, climateComplexity: 1.04, compositeIndex: ci(0.88, 0.92, 0.95, 0.95, 1.04) },

  // Idaho
  { cbsaCode: "14260", name: "Boise City", state: "ID", laborIndex: 1.02, costOfLivingIndex: 1.00, permitBurden: 0.97, urbanDensity: 1.00, climateComplexity: 1.06, compositeIndex: ci(1.02, 1.00, 0.97, 1.00, 1.06) },
  { cbsaCode: "26820", name: "Idaho Falls", state: "ID", laborIndex: 0.92, costOfLivingIndex: 0.94, permitBurden: 0.95, urbanDensity: 0.96, climateComplexity: 1.08, compositeIndex: ci(0.92, 0.94, 0.95, 0.96, 1.08) },
  { cbsaCode: "17660", name: "Coeur d'Alene", state: "ID", laborIndex: 1.00, costOfLivingIndex: 1.02, permitBurden: 0.97, urbanDensity: 0.97, climateComplexity: 1.08, compositeIndex: ci(1.00, 1.02, 0.97, 0.97, 1.08) },
  { cbsaCode: "38540", name: "Pocatello", state: "ID", laborIndex: 0.88, costOfLivingIndex: 0.92, permitBurden: 0.95, urbanDensity: 0.96, climateComplexity: 1.08, compositeIndex: ci(0.88, 0.92, 0.95, 0.96, 1.08) },
  { cbsaCode: "46300", name: "Twin Falls", state: "ID", laborIndex: 0.88, costOfLivingIndex: 0.92, permitBurden: 0.95, urbanDensity: 0.95, climateComplexity: 1.06, compositeIndex: ci(0.88, 0.92, 0.95, 0.95, 1.06) },

  // Montana
  { cbsaCode: "13740", name: "Billings", state: "MT", laborIndex: 0.98, costOfLivingIndex: 0.97, permitBurden: 0.96, urbanDensity: 0.96, climateComplexity: 1.10, compositeIndex: ci(0.98, 0.97, 0.96, 0.96, 1.10) },
  { cbsaCode: "33540", name: "Missoula", state: "MT", laborIndex: 0.98, costOfLivingIndex: 1.00, permitBurden: 0.97, urbanDensity: 0.97, climateComplexity: 1.10, compositeIndex: ci(0.98, 1.00, 0.97, 0.97, 1.10) },
  { cbsaCode: "24500", name: "Great Falls", state: "MT", laborIndex: 0.92, costOfLivingIndex: 0.95, permitBurden: 0.95, urbanDensity: 0.96, climateComplexity: 1.10, compositeIndex: ci(0.92, 0.95, 0.95, 0.96, 1.10) },
  { cbsaCode: "25740", name: "Helena", state: "MT", laborIndex: 0.95, costOfLivingIndex: 0.97, permitBurden: 0.96, urbanDensity: 0.96, climateComplexity: 1.10, compositeIndex: ci(0.95, 0.97, 0.96, 0.96, 1.10) },
  { cbsaCode: "28060", name: "Kalispell", state: "MT", laborIndex: 0.95, costOfLivingIndex: 1.02, permitBurden: 0.96, urbanDensity: 0.95, climateComplexity: 1.10, compositeIndex: ci(0.95, 1.02, 0.96, 0.95, 1.10) },

  // Wyoming
  { cbsaCode: "16940", name: "Cheyenne", state: "WY", laborIndex: 0.95, costOfLivingIndex: 0.96, permitBurden: 0.95, urbanDensity: 0.96, climateComplexity: 1.10, compositeIndex: ci(0.95, 0.96, 0.95, 0.96, 1.10) },
  { cbsaCode: "16220", name: "Casper", state: "WY", laborIndex: 0.95, costOfLivingIndex: 0.96, permitBurden: 0.95, urbanDensity: 0.95, climateComplexity: 1.10, compositeIndex: ci(0.95, 0.96, 0.95, 0.95, 1.10) },

  // ============================================================
  // MIDWEST (MN, WI, IA, ND, SD, NE, KS, MO, IL, IN, OH, MI)
  // ============================================================

  // Minnesota
  { cbsaCode: "33460", name: "Minneapolis-St. Paul-Bloomington", state: "MN", laborIndex: 1.10, costOfLivingIndex: 1.00, permitBurden: 1.02, urbanDensity: 1.02, climateComplexity: 1.12, compositeIndex: ci(1.10, 1.00, 1.02, 1.02, 1.12) },
  { cbsaCode: "20260", name: "Duluth", state: "MN", laborIndex: 1.05, costOfLivingIndex: 0.96, permitBurden: 1.00, urbanDensity: 0.98, climateComplexity: 1.12, compositeIndex: ci(1.05, 0.96, 1.00, 0.98, 1.12) },
  { cbsaCode: "40340", name: "Rochester", state: "MN", laborIndex: 1.10, costOfLivingIndex: 1.00, permitBurden: 1.02, urbanDensity: 0.99, climateComplexity: 1.12, compositeIndex: ci(1.10, 1.00, 1.02, 0.99, 1.12) },
  { cbsaCode: "41060", name: "St. Cloud", state: "MN", laborIndex: 1.02, costOfLivingIndex: 0.96, permitBurden: 1.00, urbanDensity: 0.97, climateComplexity: 1.12, compositeIndex: ci(1.02, 0.96, 1.00, 0.97, 1.12) },
  { cbsaCode: "31860", name: "Mankato", state: "MN", laborIndex: 1.00, costOfLivingIndex: 0.95, permitBurden: 0.99, urbanDensity: 0.97, climateComplexity: 1.12, compositeIndex: ci(1.00, 0.95, 0.99, 0.97, 1.12) },

  // Wisconsin
  { cbsaCode: "33340", name: "Milwaukee-Waukesha", state: "WI", laborIndex: 1.12, costOfLivingIndex: 0.98, permitBurden: 1.04, urbanDensity: 1.03, climateComplexity: 1.10, compositeIndex: ci(1.12, 0.98, 1.04, 1.03, 1.10) },
  { cbsaCode: "31540", name: "Madison", state: "WI", laborIndex: 1.12, costOfLivingIndex: 1.02, permitBurden: 1.04, urbanDensity: 1.01, climateComplexity: 1.10, compositeIndex: ci(1.12, 1.02, 1.04, 1.01, 1.10) },
  { cbsaCode: "24580", name: "Green Bay", state: "WI", laborIndex: 1.02, costOfLivingIndex: 0.94, permitBurden: 1.00, urbanDensity: 0.99, climateComplexity: 1.10, compositeIndex: ci(1.02, 0.94, 1.00, 0.99, 1.10) },
  { cbsaCode: "39540", name: "Racine", state: "WI", laborIndex: 1.08, costOfLivingIndex: 0.96, permitBurden: 1.02, urbanDensity: 1.00, climateComplexity: 1.10, compositeIndex: ci(1.08, 0.96, 1.02, 1.00, 1.10) },
  { cbsaCode: "11540", name: "Appleton", state: "WI", laborIndex: 1.02, costOfLivingIndex: 0.94, permitBurden: 1.00, urbanDensity: 0.99, climateComplexity: 1.10, compositeIndex: ci(1.02, 0.94, 1.00, 0.99, 1.10) },
  { cbsaCode: "20740", name: "Eau Claire", state: "WI", laborIndex: 0.98, costOfLivingIndex: 0.92, permitBurden: 0.99, urbanDensity: 0.97, climateComplexity: 1.10, compositeIndex: ci(0.98, 0.92, 0.99, 0.97, 1.10) },
  { cbsaCode: "36780", name: "Oshkosh-Neenah", state: "WI", laborIndex: 1.00, costOfLivingIndex: 0.93, permitBurden: 1.00, urbanDensity: 0.98, climateComplexity: 1.10, compositeIndex: ci(1.00, 0.93, 1.00, 0.98, 1.10) },
  { cbsaCode: "48140", name: "Wausau-Weston", state: "WI", laborIndex: 0.98, costOfLivingIndex: 0.92, permitBurden: 0.99, urbanDensity: 0.97, climateComplexity: 1.10, compositeIndex: ci(0.98, 0.92, 0.99, 0.97, 1.10) },
  { cbsaCode: "29100", name: "La Crosse-Onalaska", state: "WI", laborIndex: 0.98, costOfLivingIndex: 0.93, permitBurden: 0.99, urbanDensity: 0.97, climateComplexity: 1.10, compositeIndex: ci(0.98, 0.93, 0.99, 0.97, 1.10) },
  { cbsaCode: "27500", name: "Janesville-Beloit", state: "WI", laborIndex: 1.00, costOfLivingIndex: 0.93, permitBurden: 1.00, urbanDensity: 0.98, climateComplexity: 1.10, compositeIndex: ci(1.00, 0.93, 1.00, 0.98, 1.10) },
  { cbsaCode: "43100", name: "Sheboygan", state: "WI", laborIndex: 1.00, costOfLivingIndex: 0.93, permitBurden: 0.99, urbanDensity: 0.98, climateComplexity: 1.10, compositeIndex: ci(1.00, 0.93, 0.99, 0.98, 1.10) },
  { cbsaCode: "22540", name: "Fond du Lac", state: "WI", laborIndex: 0.98, costOfLivingIndex: 0.92, permitBurden: 0.99, urbanDensity: 0.97, climateComplexity: 1.10, compositeIndex: ci(0.98, 0.92, 0.99, 0.97, 1.10) },

  // Iowa
  { cbsaCode: "19780", name: "Des Moines-West Des Moines", state: "IA", laborIndex: 1.02, costOfLivingIndex: 0.94, permitBurden: 0.99, urbanDensity: 1.00, climateComplexity: 1.10, compositeIndex: ci(1.02, 0.94, 0.99, 1.00, 1.10) },
  { cbsaCode: "16300", name: "Cedar Rapids", state: "IA", laborIndex: 1.00, costOfLivingIndex: 0.92, permitBurden: 0.98, urbanDensity: 0.98, climateComplexity: 1.10, compositeIndex: ci(1.00, 0.92, 0.98, 0.98, 1.10) },
  { cbsaCode: "19340", name: "Davenport-Moline-Rock Island", state: "IA", laborIndex: 1.00, costOfLivingIndex: 0.91, permitBurden: 0.98, urbanDensity: 0.99, climateComplexity: 1.10, compositeIndex: ci(1.00, 0.91, 0.98, 0.99, 1.10) },
  { cbsaCode: "47940", name: "Waterloo-Cedar Falls", state: "IA", laborIndex: 0.95, costOfLivingIndex: 0.90, permitBurden: 0.97, urbanDensity: 0.97, climateComplexity: 1.10, compositeIndex: ci(0.95, 0.90, 0.97, 0.97, 1.10) },
  { cbsaCode: "26980", name: "Iowa City", state: "IA", laborIndex: 1.02, costOfLivingIndex: 0.96, permitBurden: 1.00, urbanDensity: 0.98, climateComplexity: 1.10, compositeIndex: ci(1.02, 0.96, 1.00, 0.98, 1.10) },
  { cbsaCode: "43580", name: "Sioux City", state: "IA", laborIndex: 0.92, costOfLivingIndex: 0.89, permitBurden: 0.96, urbanDensity: 0.97, climateComplexity: 1.10, compositeIndex: ci(0.92, 0.89, 0.96, 0.97, 1.10) },
  { cbsaCode: "20220", name: "Dubuque", state: "IA", laborIndex: 0.98, costOfLivingIndex: 0.91, permitBurden: 0.98, urbanDensity: 0.97, climateComplexity: 1.10, compositeIndex: ci(0.98, 0.91, 0.98, 0.97, 1.10) },
  { cbsaCode: "11180", name: "Ames", state: "IA", laborIndex: 0.98, costOfLivingIndex: 0.94, permitBurden: 0.98, urbanDensity: 0.97, climateComplexity: 1.10, compositeIndex: ci(0.98, 0.94, 0.98, 0.97, 1.10) },

  // North Dakota
  { cbsaCode: "22020", name: "Fargo", state: "ND", laborIndex: 0.98, costOfLivingIndex: 0.92, permitBurden: 0.97, urbanDensity: 0.98, climateComplexity: 1.12, compositeIndex: ci(0.98, 0.92, 0.97, 0.98, 1.12) },
  { cbsaCode: "13900", name: "Bismarck", state: "ND", laborIndex: 0.95, costOfLivingIndex: 0.92, permitBurden: 0.96, urbanDensity: 0.96, climateComplexity: 1.12, compositeIndex: ci(0.95, 0.92, 0.96, 0.96, 1.12) },
  { cbsaCode: "24220", name: "Grand Forks", state: "ND", laborIndex: 0.92, costOfLivingIndex: 0.91, permitBurden: 0.96, urbanDensity: 0.97, climateComplexity: 1.12, compositeIndex: ci(0.92, 0.91, 0.96, 0.97, 1.12) },

  // South Dakota
  { cbsaCode: "43620", name: "Sioux Falls", state: "SD", laborIndex: 0.95, costOfLivingIndex: 0.92, permitBurden: 0.96, urbanDensity: 0.98, climateComplexity: 1.10, compositeIndex: ci(0.95, 0.92, 0.96, 0.98, 1.10) },
  { cbsaCode: "39660", name: "Rapid City", state: "SD", laborIndex: 0.92, costOfLivingIndex: 0.92, permitBurden: 0.95, urbanDensity: 0.96, climateComplexity: 1.10, compositeIndex: ci(0.92, 0.92, 0.95, 0.96, 1.10) },

  // Nebraska
  { cbsaCode: "36540", name: "Omaha-Council Bluffs", state: "NE", laborIndex: 1.02, costOfLivingIndex: 0.93, permitBurden: 0.98, urbanDensity: 1.00, climateComplexity: 1.10, compositeIndex: ci(1.02, 0.93, 0.98, 1.00, 1.10) },
  { cbsaCode: "30700", name: "Lincoln", state: "NE", laborIndex: 0.98, costOfLivingIndex: 0.92, permitBurden: 0.97, urbanDensity: 0.98, climateComplexity: 1.10, compositeIndex: ci(0.98, 0.92, 0.97, 0.98, 1.10) },
  { cbsaCode: "24260", name: "Grand Island", state: "NE", laborIndex: 0.90, costOfLivingIndex: 0.89, permitBurden: 0.95, urbanDensity: 0.96, climateComplexity: 1.10, compositeIndex: ci(0.90, 0.89, 0.95, 0.96, 1.10) },

  // Kansas
  { cbsaCode: "48620", name: "Wichita", state: "KS", laborIndex: 0.95, costOfLivingIndex: 0.90, permitBurden: 0.97, urbanDensity: 0.99, climateComplexity: 1.06, compositeIndex: ci(0.95, 0.90, 0.97, 0.99, 1.06) },
  { cbsaCode: "28140", name: "Kansas City", state: "KS", laborIndex: 1.05, costOfLivingIndex: 0.95, permitBurden: 1.00, urbanDensity: 1.01, climateComplexity: 1.08, compositeIndex: ci(1.05, 0.95, 1.00, 1.01, 1.08) },
  { cbsaCode: "45820", name: "Topeka", state: "KS", laborIndex: 0.92, costOfLivingIndex: 0.89, permitBurden: 0.96, urbanDensity: 0.97, climateComplexity: 1.06, compositeIndex: ci(0.92, 0.89, 0.96, 0.97, 1.06) },
  { cbsaCode: "30580", name: "Lawrence", state: "KS", laborIndex: 0.95, costOfLivingIndex: 0.93, permitBurden: 0.98, urbanDensity: 0.97, climateComplexity: 1.06, compositeIndex: ci(0.95, 0.93, 0.98, 0.97, 1.06) },
  { cbsaCode: "31740", name: "Manhattan", state: "KS", laborIndex: 0.90, costOfLivingIndex: 0.91, permitBurden: 0.96, urbanDensity: 0.96, climateComplexity: 1.06, compositeIndex: ci(0.90, 0.91, 0.96, 0.96, 1.06) },

  // Missouri
  { cbsaCode: "41180", name: "St. Louis", state: "MO", laborIndex: 1.10, costOfLivingIndex: 0.94, permitBurden: 1.02, urbanDensity: 1.02, climateComplexity: 1.06, compositeIndex: ci(1.10, 0.94, 1.02, 1.02, 1.06) },
  { cbsaCode: "44180", name: "Springfield", state: "MO", laborIndex: 0.88, costOfLivingIndex: 0.88, permitBurden: 0.95, urbanDensity: 0.98, climateComplexity: 1.04, compositeIndex: ci(0.88, 0.88, 0.95, 0.98, 1.04) },
  { cbsaCode: "17860", name: "Columbia", state: "MO", laborIndex: 0.92, costOfLivingIndex: 0.91, permitBurden: 0.97, urbanDensity: 0.98, climateComplexity: 1.06, compositeIndex: ci(0.92, 0.91, 0.97, 0.98, 1.06) },
  { cbsaCode: "27900", name: "Joplin", state: "MO", laborIndex: 0.85, costOfLivingIndex: 0.86, permitBurden: 0.94, urbanDensity: 0.96, climateComplexity: 1.04, compositeIndex: ci(0.85, 0.86, 0.94, 0.96, 1.04) },
  { cbsaCode: "41140", name: "St. Joseph", state: "MO", laborIndex: 0.88, costOfLivingIndex: 0.88, permitBurden: 0.96, urbanDensity: 0.97, climateComplexity: 1.08, compositeIndex: ci(0.88, 0.88, 0.96, 0.97, 1.08) },

  // Illinois
  { cbsaCode: "16980", name: "Chicago-Naperville-Elgin", state: "IL", laborIndex: 1.22, costOfLivingIndex: 1.02, permitBurden: 1.10, urbanDensity: 1.05, climateComplexity: 1.10, compositeIndex: ci(1.22, 1.02, 1.10, 1.05, 1.10) },
  { cbsaCode: "40420", name: "Rockford", state: "IL", laborIndex: 1.05, costOfLivingIndex: 0.92, permitBurden: 1.02, urbanDensity: 0.99, climateComplexity: 1.10, compositeIndex: ci(1.05, 0.92, 1.02, 0.99, 1.10) },
  { cbsaCode: "37900", name: "Peoria", state: "IL", laborIndex: 1.02, costOfLivingIndex: 0.91, permitBurden: 1.00, urbanDensity: 0.98, climateComplexity: 1.08, compositeIndex: ci(1.02, 0.91, 1.00, 0.98, 1.08) },
  { cbsaCode: "44100", name: "Springfield", state: "IL", laborIndex: 1.00, costOfLivingIndex: 0.91, permitBurden: 1.00, urbanDensity: 0.98, climateComplexity: 1.08, compositeIndex: ci(1.00, 0.91, 1.00, 0.98, 1.08) },
  { cbsaCode: "14010", name: "Bloomington", state: "IL", laborIndex: 1.02, costOfLivingIndex: 0.93, permitBurden: 1.00, urbanDensity: 0.98, climateComplexity: 1.08, compositeIndex: ci(1.02, 0.93, 1.00, 0.98, 1.08) },
  { cbsaCode: "16580", name: "Champaign-Urbana", state: "IL", laborIndex: 1.00, costOfLivingIndex: 0.92, permitBurden: 1.00, urbanDensity: 0.98, climateComplexity: 1.08, compositeIndex: ci(1.00, 0.92, 1.00, 0.98, 1.08) },
  { cbsaCode: "19500", name: "Decatur", state: "IL", laborIndex: 0.95, costOfLivingIndex: 0.88, permitBurden: 0.98, urbanDensity: 0.97, climateComplexity: 1.08, compositeIndex: ci(0.95, 0.88, 0.98, 0.97, 1.08) },
  { cbsaCode: "28100", name: "Kankakee", state: "IL", laborIndex: 1.05, costOfLivingIndex: 0.92, permitBurden: 1.02, urbanDensity: 0.98, climateComplexity: 1.08, compositeIndex: ci(1.05, 0.92, 1.02, 0.98, 1.08) },

  // Indiana
  { cbsaCode: "26900", name: "Indianapolis-Carmel-Anderson", state: "IN", laborIndex: 1.02, costOfLivingIndex: 0.93, permitBurden: 0.98, urbanDensity: 1.01, climateComplexity: 1.06, compositeIndex: ci(1.02, 0.93, 0.98, 1.01, 1.06) },
  { cbsaCode: "23060", name: "Fort Wayne", state: "IN", laborIndex: 0.95, costOfLivingIndex: 0.89, permitBurden: 0.97, urbanDensity: 0.99, climateComplexity: 1.08, compositeIndex: ci(0.95, 0.89, 0.97, 0.99, 1.08) },
  { cbsaCode: "21140", name: "Elkhart-Goshen", state: "IN", laborIndex: 0.92, costOfLivingIndex: 0.88, permitBurden: 0.96, urbanDensity: 0.98, climateComplexity: 1.08, compositeIndex: ci(0.92, 0.88, 0.96, 0.98, 1.08) },
  { cbsaCode: "21780", name: "Evansville", state: "IN", laborIndex: 0.92, costOfLivingIndex: 0.88, permitBurden: 0.96, urbanDensity: 0.98, climateComplexity: 1.04, compositeIndex: ci(0.92, 0.88, 0.96, 0.98, 1.04) },
  { cbsaCode: "43780", name: "South Bend-Mishawaka", state: "IN", laborIndex: 0.95, costOfLivingIndex: 0.89, permitBurden: 0.97, urbanDensity: 0.99, climateComplexity: 1.08, compositeIndex: ci(0.95, 0.89, 0.97, 0.99, 1.08) },
  { cbsaCode: "29200", name: "Lafayette-West Lafayette", state: "IN", laborIndex: 0.95, costOfLivingIndex: 0.90, permitBurden: 0.97, urbanDensity: 0.98, climateComplexity: 1.06, compositeIndex: ci(0.95, 0.90, 0.97, 0.98, 1.06) },
  { cbsaCode: "34620", name: "Muncie", state: "IN", laborIndex: 0.88, costOfLivingIndex: 0.86, permitBurden: 0.96, urbanDensity: 0.97, climateComplexity: 1.06, compositeIndex: ci(0.88, 0.86, 0.96, 0.97, 1.06) },
  { cbsaCode: "45460", name: "Terre Haute", state: "IN", laborIndex: 0.88, costOfLivingIndex: 0.86, permitBurden: 0.96, urbanDensity: 0.97, climateComplexity: 1.06, compositeIndex: ci(0.88, 0.86, 0.96, 0.97, 1.06) },
  { cbsaCode: "14020", name: "Bloomington", state: "IN", laborIndex: 0.95, costOfLivingIndex: 0.92, permitBurden: 0.98, urbanDensity: 0.98, climateComplexity: 1.06, compositeIndex: ci(0.95, 0.92, 0.98, 0.98, 1.06) },
  { cbsaCode: "29020", name: "Kokomo", state: "IN", laborIndex: 0.88, costOfLivingIndex: 0.86, permitBurden: 0.96, urbanDensity: 0.97, climateComplexity: 1.06, compositeIndex: ci(0.88, 0.86, 0.96, 0.97, 1.06) },

  // Ohio
  { cbsaCode: "18140", name: "Columbus", state: "OH", laborIndex: 1.05, costOfLivingIndex: 0.95, permitBurden: 1.00, urbanDensity: 1.02, climateComplexity: 1.06, compositeIndex: ci(1.05, 0.95, 1.00, 1.02, 1.06) },
  { cbsaCode: "17460", name: "Cleveland-Elyria", state: "OH", laborIndex: 1.10, costOfLivingIndex: 0.94, permitBurden: 1.02, urbanDensity: 1.03, climateComplexity: 1.08, compositeIndex: ci(1.10, 0.94, 1.02, 1.03, 1.08) },
  { cbsaCode: "17140", name: "Cincinnati", state: "OH", laborIndex: 1.05, costOfLivingIndex: 0.93, permitBurden: 1.00, urbanDensity: 1.02, climateComplexity: 1.04, compositeIndex: ci(1.05, 0.93, 1.00, 1.02, 1.04) },
  { cbsaCode: "19380", name: "Dayton-Kettering", state: "OH", laborIndex: 0.98, costOfLivingIndex: 0.90, permitBurden: 0.98, urbanDensity: 1.00, climateComplexity: 1.06, compositeIndex: ci(0.98, 0.90, 0.98, 1.00, 1.06) },
  { cbsaCode: "10420", name: "Akron", state: "OH", laborIndex: 1.02, costOfLivingIndex: 0.92, permitBurden: 1.00, urbanDensity: 1.01, climateComplexity: 1.08, compositeIndex: ci(1.02, 0.92, 1.00, 1.01, 1.08) },
  { cbsaCode: "45780", name: "Toledo", state: "OH", laborIndex: 1.02, costOfLivingIndex: 0.90, permitBurden: 0.99, urbanDensity: 1.00, climateComplexity: 1.08, compositeIndex: ci(1.02, 0.90, 0.99, 1.00, 1.08) },
  { cbsaCode: "49660", name: "Youngstown-Warren-Boardman", state: "OH", laborIndex: 0.95, costOfLivingIndex: 0.88, permitBurden: 0.98, urbanDensity: 0.99, climateComplexity: 1.08, compositeIndex: ci(0.95, 0.88, 0.98, 0.99, 1.08) },
  { cbsaCode: "15940", name: "Canton-Massillon", state: "OH", laborIndex: 0.95, costOfLivingIndex: 0.88, permitBurden: 0.98, urbanDensity: 0.99, climateComplexity: 1.08, compositeIndex: ci(0.95, 0.88, 0.98, 0.99, 1.08) },
  { cbsaCode: "31900", name: "Mansfield", state: "OH", laborIndex: 0.92, costOfLivingIndex: 0.87, permitBurden: 0.97, urbanDensity: 0.97, climateComplexity: 1.08, compositeIndex: ci(0.92, 0.87, 0.97, 0.97, 1.08) },
  { cbsaCode: "30620", name: "Lima", state: "OH", laborIndex: 0.90, costOfLivingIndex: 0.86, permitBurden: 0.97, urbanDensity: 0.97, climateComplexity: 1.06, compositeIndex: ci(0.90, 0.86, 0.97, 0.97, 1.06) },

  // Michigan
  { cbsaCode: "19820", name: "Detroit-Warren-Dearborn", state: "MI", laborIndex: 1.15, costOfLivingIndex: 0.96, permitBurden: 1.04, urbanDensity: 1.04, climateComplexity: 1.10, compositeIndex: ci(1.15, 0.96, 1.04, 1.04, 1.10) },
  { cbsaCode: "24340", name: "Grand Rapids-Kentwood", state: "MI", laborIndex: 1.02, costOfLivingIndex: 0.92, permitBurden: 0.99, urbanDensity: 1.00, climateComplexity: 1.08, compositeIndex: ci(1.02, 0.92, 0.99, 1.00, 1.08) },
  { cbsaCode: "11460", name: "Ann Arbor", state: "MI", laborIndex: 1.12, costOfLivingIndex: 1.02, permitBurden: 1.04, urbanDensity: 1.01, climateComplexity: 1.08, compositeIndex: ci(1.12, 1.02, 1.04, 1.01, 1.08) },
  { cbsaCode: "29620", name: "Lansing-East Lansing", state: "MI", laborIndex: 1.02, costOfLivingIndex: 0.92, permitBurden: 1.00, urbanDensity: 0.99, climateComplexity: 1.08, compositeIndex: ci(1.02, 0.92, 1.00, 0.99, 1.08) },
  { cbsaCode: "22420", name: "Flint", state: "MI", laborIndex: 1.02, costOfLivingIndex: 0.90, permitBurden: 1.00, urbanDensity: 1.00, climateComplexity: 1.10, compositeIndex: ci(1.02, 0.90, 1.00, 1.00, 1.10) },
  { cbsaCode: "28020", name: "Kalamazoo-Portage", state: "MI", laborIndex: 0.98, costOfLivingIndex: 0.91, permitBurden: 0.99, urbanDensity: 0.99, climateComplexity: 1.08, compositeIndex: ci(0.98, 0.91, 0.99, 0.99, 1.08) },
  { cbsaCode: "40980", name: "Saginaw", state: "MI", laborIndex: 0.95, costOfLivingIndex: 0.88, permitBurden: 0.98, urbanDensity: 0.98, climateComplexity: 1.10, compositeIndex: ci(0.95, 0.88, 0.98, 0.98, 1.10) },
  { cbsaCode: "34740", name: "Muskegon", state: "MI", laborIndex: 0.95, costOfLivingIndex: 0.88, permitBurden: 0.98, urbanDensity: 0.98, climateComplexity: 1.10, compositeIndex: ci(0.95, 0.88, 0.98, 0.98, 1.10) },
  { cbsaCode: "12980", name: "Battle Creek", state: "MI", laborIndex: 0.92, costOfLivingIndex: 0.87, permitBurden: 0.98, urbanDensity: 0.97, climateComplexity: 1.08, compositeIndex: ci(0.92, 0.87, 0.98, 0.97, 1.08) },
  { cbsaCode: "26100", name: "Holland", state: "MI", laborIndex: 0.98, costOfLivingIndex: 0.92, permitBurden: 0.99, urbanDensity: 0.98, climateComplexity: 1.08, compositeIndex: ci(0.98, 0.92, 0.99, 0.98, 1.08) },
  { cbsaCode: "45580", name: "Traverse City", state: "MI", laborIndex: 0.98, costOfLivingIndex: 0.96, permitBurden: 0.99, urbanDensity: 0.96, climateComplexity: 1.10, compositeIndex: ci(0.98, 0.96, 0.99, 0.96, 1.10) },

  // ============================================================
  // SOUTH CENTRAL (TX, OK, AR, LA)
  // ============================================================

  // Texas
  { cbsaCode: "19100", name: "Dallas-Fort Worth-Arlington", state: "TX", laborIndex: 1.00, costOfLivingIndex: 0.96, permitBurden: 0.94, urbanDensity: 1.01, climateComplexity: 0.98, compositeIndex: ci(1.00, 0.96, 0.94, 1.01, 0.98) },
  { cbsaCode: "26420", name: "Houston-The Woodlands-Sugar Land", state: "TX", laborIndex: 1.00, costOfLivingIndex: 0.94, permitBurden: 0.92, urbanDensity: 1.01, climateComplexity: 0.97, compositeIndex: ci(1.00, 0.94, 0.92, 1.01, 0.97) },
  { cbsaCode: "41700", name: "San Antonio-New Braunfels", state: "TX", laborIndex: 0.95, costOfLivingIndex: 0.93, permitBurden: 0.94, urbanDensity: 1.00, climateComplexity: 0.97, compositeIndex: ci(0.95, 0.93, 0.94, 1.00, 0.97) },
  { cbsaCode: "12420", name: "Austin-Round Rock-Georgetown", state: "TX", laborIndex: 1.08, costOfLivingIndex: 1.02, permitBurden: 0.96, urbanDensity: 1.02, climateComplexity: 0.97, compositeIndex: ci(1.08, 1.02, 0.96, 1.02, 0.97) },
  { cbsaCode: "21340", name: "El Paso", state: "TX", laborIndex: 0.85, costOfLivingIndex: 0.90, permitBurden: 0.95, urbanDensity: 1.00, climateComplexity: 0.96, compositeIndex: ci(0.85, 0.90, 0.95, 1.00, 0.96) },
  { cbsaCode: "32580", name: "McAllen-Edinburg-Mission", state: "TX", laborIndex: 0.78, costOfLivingIndex: 0.86, permitBurden: 0.94, urbanDensity: 0.98, climateComplexity: 0.96, compositeIndex: ci(0.78, 0.86, 0.94, 0.98, 0.96) },
  { cbsaCode: "18580", name: "Corpus Christi", state: "TX", laborIndex: 0.92, costOfLivingIndex: 0.92, permitBurden: 0.94, urbanDensity: 0.99, climateComplexity: 0.97, compositeIndex: ci(0.92, 0.92, 0.94, 0.99, 0.97) },
  { cbsaCode: "31180", name: "Lubbock", state: "TX", laborIndex: 0.88, costOfLivingIndex: 0.90, permitBurden: 0.94, urbanDensity: 0.98, climateComplexity: 1.00, compositeIndex: ci(0.88, 0.90, 0.94, 0.98, 1.00) },
  { cbsaCode: "10180", name: "Abilene", state: "TX", laborIndex: 0.85, costOfLivingIndex: 0.88, permitBurden: 0.93, urbanDensity: 0.97, climateComplexity: 1.00, compositeIndex: ci(0.85, 0.88, 0.93, 0.97, 1.00) },
  { cbsaCode: "11100", name: "Amarillo", state: "TX", laborIndex: 0.88, costOfLivingIndex: 0.89, permitBurden: 0.93, urbanDensity: 0.97, climateComplexity: 1.04, compositeIndex: ci(0.88, 0.89, 0.93, 0.97, 1.04) },
  { cbsaCode: "13140", name: "Beaumont-Port Arthur", state: "TX", laborIndex: 0.95, costOfLivingIndex: 0.90, permitBurden: 0.94, urbanDensity: 0.98, climateComplexity: 0.97, compositeIndex: ci(0.95, 0.90, 0.94, 0.98, 0.97) },
  { cbsaCode: "15180", name: "Brownsville-Harlingen", state: "TX", laborIndex: 0.78, costOfLivingIndex: 0.85, permitBurden: 0.94, urbanDensity: 0.97, climateComplexity: 0.96, compositeIndex: ci(0.78, 0.85, 0.94, 0.97, 0.96) },
  { cbsaCode: "28660", name: "Killeen-Temple", state: "TX", laborIndex: 0.88, costOfLivingIndex: 0.90, permitBurden: 0.94, urbanDensity: 0.98, climateComplexity: 0.98, compositeIndex: ci(0.88, 0.90, 0.94, 0.98, 0.98) },
  { cbsaCode: "48660", name: "Wichita Falls", state: "TX", laborIndex: 0.85, costOfLivingIndex: 0.87, permitBurden: 0.93, urbanDensity: 0.96, climateComplexity: 1.02, compositeIndex: ci(0.85, 0.87, 0.93, 0.96, 1.02) },
  { cbsaCode: "45500", name: "Texarkana", state: "TX", laborIndex: 0.82, costOfLivingIndex: 0.86, permitBurden: 0.93, urbanDensity: 0.96, climateComplexity: 1.00, compositeIndex: ci(0.82, 0.86, 0.93, 0.96, 1.00) },
  { cbsaCode: "30980", name: "Longview", state: "TX", laborIndex: 0.88, costOfLivingIndex: 0.88, permitBurden: 0.93, urbanDensity: 0.97, climateComplexity: 0.98, compositeIndex: ci(0.88, 0.88, 0.93, 0.97, 0.98) },
  { cbsaCode: "46340", name: "Tyler", state: "TX", laborIndex: 0.88, costOfLivingIndex: 0.89, permitBurden: 0.94, urbanDensity: 0.97, climateComplexity: 0.98, compositeIndex: ci(0.88, 0.89, 0.94, 0.97, 0.98) },
  { cbsaCode: "36220", name: "Odessa", state: "TX", laborIndex: 0.92, costOfLivingIndex: 0.92, permitBurden: 0.93, urbanDensity: 0.96, climateComplexity: 0.98, compositeIndex: ci(0.92, 0.92, 0.93, 0.96, 0.98) },
  { cbsaCode: "33260", name: "Midland", state: "TX", laborIndex: 0.95, costOfLivingIndex: 0.95, permitBurden: 0.93, urbanDensity: 0.96, climateComplexity: 0.98, compositeIndex: ci(0.95, 0.95, 0.93, 0.96, 0.98) },
  { cbsaCode: "29700", name: "Laredo", state: "TX", laborIndex: 0.78, costOfLivingIndex: 0.86, permitBurden: 0.94, urbanDensity: 0.98, climateComplexity: 0.96, compositeIndex: ci(0.78, 0.86, 0.94, 0.98, 0.96) },
  { cbsaCode: "17780", name: "College Station-Bryan", state: "TX", laborIndex: 0.88, costOfLivingIndex: 0.90, permitBurden: 0.94, urbanDensity: 0.97, climateComplexity: 0.98, compositeIndex: ci(0.88, 0.90, 0.94, 0.97, 0.98) },
  { cbsaCode: "47380", name: "Waco", state: "TX", laborIndex: 0.88, costOfLivingIndex: 0.89, permitBurden: 0.94, urbanDensity: 0.98, climateComplexity: 0.98, compositeIndex: ci(0.88, 0.89, 0.94, 0.98, 0.98) },
  { cbsaCode: "41660", name: "San Angelo", state: "TX", laborIndex: 0.85, costOfLivingIndex: 0.88, permitBurden: 0.93, urbanDensity: 0.96, climateComplexity: 0.98, compositeIndex: ci(0.85, 0.88, 0.93, 0.96, 0.98) },
  { cbsaCode: "43300", name: "Sherman-Denison", state: "TX", laborIndex: 0.88, costOfLivingIndex: 0.89, permitBurden: 0.94, urbanDensity: 0.96, climateComplexity: 1.00, compositeIndex: ci(0.88, 0.89, 0.94, 0.96, 1.00) },
  { cbsaCode: "47020", name: "Victoria", state: "TX", laborIndex: 0.88, costOfLivingIndex: 0.89, permitBurden: 0.93, urbanDensity: 0.96, climateComplexity: 0.97, compositeIndex: ci(0.88, 0.89, 0.93, 0.96, 0.97) },

  // Oklahoma
  { cbsaCode: "36420", name: "Oklahoma City", state: "OK", laborIndex: 0.92, costOfLivingIndex: 0.90, permitBurden: 0.95, urbanDensity: 1.00, climateComplexity: 1.02, compositeIndex: ci(0.92, 0.90, 0.95, 1.00, 1.02) },
  { cbsaCode: "46140", name: "Tulsa", state: "OK", laborIndex: 0.92, costOfLivingIndex: 0.89, permitBurden: 0.95, urbanDensity: 0.99, climateComplexity: 1.02, compositeIndex: ci(0.92, 0.89, 0.95, 0.99, 1.02) },
  { cbsaCode: "22900", name: "Fort Smith", state: "OK", laborIndex: 0.82, costOfLivingIndex: 0.85, permitBurden: 0.93, urbanDensity: 0.97, climateComplexity: 1.02, compositeIndex: ci(0.82, 0.85, 0.93, 0.97, 1.02) },
  { cbsaCode: "30020", name: "Lawton", state: "OK", laborIndex: 0.85, costOfLivingIndex: 0.87, permitBurden: 0.94, urbanDensity: 0.96, climateComplexity: 1.02, compositeIndex: ci(0.85, 0.87, 0.94, 0.96, 1.02) },

  // Arkansas
  { cbsaCode: "30780", name: "Little Rock-North Little Rock-Conway", state: "AR", laborIndex: 0.85, costOfLivingIndex: 0.87, permitBurden: 0.95, urbanDensity: 0.99, climateComplexity: 1.00, compositeIndex: ci(0.85, 0.87, 0.95, 0.99, 1.00) },
  { cbsaCode: "22220", name: "Fayetteville-Springdale-Rogers", state: "AR", laborIndex: 0.88, costOfLivingIndex: 0.90, permitBurden: 0.95, urbanDensity: 0.98, climateComplexity: 1.02, compositeIndex: ci(0.88, 0.90, 0.95, 0.98, 1.02) },
  { cbsaCode: "27860", name: "Jonesboro", state: "AR", laborIndex: 0.80, costOfLivingIndex: 0.84, permitBurden: 0.93, urbanDensity: 0.96, climateComplexity: 1.02, compositeIndex: ci(0.80, 0.84, 0.93, 0.96, 1.02) },
  { cbsaCode: "38220", name: "Pine Bluff", state: "AR", laborIndex: 0.78, costOfLivingIndex: 0.82, permitBurden: 0.93, urbanDensity: 0.96, climateComplexity: 1.00, compositeIndex: ci(0.78, 0.82, 0.93, 0.96, 1.00) },

  // Louisiana
  { cbsaCode: "35380", name: "New Orleans-Metairie", state: "LA", laborIndex: 1.00, costOfLivingIndex: 0.95, permitBurden: 1.02, urbanDensity: 1.03, climateComplexity: 0.98, compositeIndex: ci(1.00, 0.95, 1.02, 1.03, 0.98) },
  { cbsaCode: "12940", name: "Baton Rouge", state: "LA", laborIndex: 0.92, costOfLivingIndex: 0.91, permitBurden: 0.97, urbanDensity: 1.00, climateComplexity: 0.98, compositeIndex: ci(0.92, 0.91, 0.97, 1.00, 0.98) },
  { cbsaCode: "43340", name: "Shreveport-Bossier City", state: "LA", laborIndex: 0.85, costOfLivingIndex: 0.87, permitBurden: 0.95, urbanDensity: 0.98, climateComplexity: 1.00, compositeIndex: ci(0.85, 0.87, 0.95, 0.98, 1.00) },
  { cbsaCode: "29180", name: "Lafayette", state: "LA", laborIndex: 0.88, costOfLivingIndex: 0.89, permitBurden: 0.96, urbanDensity: 0.98, climateComplexity: 0.98, compositeIndex: ci(0.88, 0.89, 0.96, 0.98, 0.98) },
  { cbsaCode: "29340", name: "Lake Charles", state: "LA", laborIndex: 0.88, costOfLivingIndex: 0.88, permitBurden: 0.95, urbanDensity: 0.97, climateComplexity: 0.98, compositeIndex: ci(0.88, 0.88, 0.95, 0.97, 0.98) },
  { cbsaCode: "33740", name: "Monroe", state: "LA", laborIndex: 0.82, costOfLivingIndex: 0.85, permitBurden: 0.94, urbanDensity: 0.96, climateComplexity: 1.00, compositeIndex: ci(0.82, 0.85, 0.94, 0.96, 1.00) },
  { cbsaCode: "10780", name: "Alexandria", state: "LA", laborIndex: 0.82, costOfLivingIndex: 0.85, permitBurden: 0.94, urbanDensity: 0.96, climateComplexity: 0.98, compositeIndex: ci(0.82, 0.85, 0.94, 0.96, 0.98) },
  { cbsaCode: "26380", name: "Houma-Thibodaux", state: "LA", laborIndex: 0.90, costOfLivingIndex: 0.89, permitBurden: 0.96, urbanDensity: 0.97, climateComplexity: 0.98, compositeIndex: ci(0.90, 0.89, 0.96, 0.97, 0.98) },

  // ============================================================
  // SOUTHEAST (FL, GA, NC, SC, VA, TN, AL, MS, KY, WV)
  // ============================================================

  // Florida
  { cbsaCode: "33100", name: "Miami-Fort Lauderdale-Pompano Beach", state: "FL", laborIndex: 1.05, costOfLivingIndex: 1.02, permitBurden: 1.04, urbanDensity: 1.04, climateComplexity: 0.96, compositeIndex: ci(1.05, 1.02, 1.04, 1.04, 0.96) },
  { cbsaCode: "36740", name: "Orlando-Kissimmee-Sanford", state: "FL", laborIndex: 1.00, costOfLivingIndex: 0.99, permitBurden: 1.02, urbanDensity: 1.02, climateComplexity: 0.96, compositeIndex: ci(1.00, 0.99, 1.02, 1.02, 0.96) },
  { cbsaCode: "45300", name: "Tampa-St. Petersburg-Clearwater", state: "FL", laborIndex: 1.00, costOfLivingIndex: 0.98, permitBurden: 1.02, urbanDensity: 1.02, climateComplexity: 0.96, compositeIndex: ci(1.00, 0.98, 1.02, 1.02, 0.96) },
  { cbsaCode: "27260", name: "Jacksonville", state: "FL", laborIndex: 0.98, costOfLivingIndex: 0.97, permitBurden: 1.00, urbanDensity: 1.01, climateComplexity: 0.97, compositeIndex: ci(0.98, 0.97, 1.00, 1.01, 0.97) },
  { cbsaCode: "35840", name: "North Port-Sarasota-Bradenton", state: "FL", laborIndex: 1.00, costOfLivingIndex: 1.02, permitBurden: 1.02, urbanDensity: 1.01, climateComplexity: 0.96, compositeIndex: ci(1.00, 1.02, 1.02, 1.01, 0.96) },
  { cbsaCode: "15980", name: "Cape Coral-Fort Myers", state: "FL", laborIndex: 0.98, costOfLivingIndex: 1.00, permitBurden: 1.02, urbanDensity: 1.00, climateComplexity: 0.96, compositeIndex: ci(0.98, 1.00, 1.02, 1.00, 0.96) },
  { cbsaCode: "29460", name: "Lakeland-Winter Haven", state: "FL", laborIndex: 0.92, costOfLivingIndex: 0.95, permitBurden: 1.00, urbanDensity: 0.99, climateComplexity: 0.96, compositeIndex: ci(0.92, 0.95, 1.00, 0.99, 0.96) },
  { cbsaCode: "37340", name: "Palm Bay-Melbourne-Titusville", state: "FL", laborIndex: 0.98, costOfLivingIndex: 0.99, permitBurden: 1.02, urbanDensity: 1.00, climateComplexity: 0.96, compositeIndex: ci(0.98, 0.99, 1.02, 1.00, 0.96) },
  { cbsaCode: "19660", name: "Deltona-Daytona Beach-Ormond Beach", state: "FL", laborIndex: 0.92, costOfLivingIndex: 0.96, permitBurden: 1.00, urbanDensity: 0.99, climateComplexity: 0.96, compositeIndex: ci(0.92, 0.96, 1.00, 0.99, 0.96) },
  { cbsaCode: "34940", name: "Naples-Marco Island", state: "FL", laborIndex: 1.05, costOfLivingIndex: 1.10, permitBurden: 1.04, urbanDensity: 1.00, climateComplexity: 0.96, compositeIndex: ci(1.05, 1.10, 1.04, 1.00, 0.96) },
  { cbsaCode: "37860", name: "Pensacola-Ferry Pass-Brent", state: "FL", laborIndex: 0.90, costOfLivingIndex: 0.93, permitBurden: 0.98, urbanDensity: 0.98, climateComplexity: 0.98, compositeIndex: ci(0.90, 0.93, 0.98, 0.98, 0.98) },
  { cbsaCode: "38940", name: "Port St. Lucie", state: "FL", laborIndex: 0.95, costOfLivingIndex: 0.99, permitBurden: 1.02, urbanDensity: 0.99, climateComplexity: 0.96, compositeIndex: ci(0.95, 0.99, 1.02, 0.99, 0.96) },
  { cbsaCode: "45220", name: "Tallahassee", state: "FL", laborIndex: 0.88, costOfLivingIndex: 0.93, permitBurden: 0.98, urbanDensity: 0.98, climateComplexity: 0.98, compositeIndex: ci(0.88, 0.93, 0.98, 0.98, 0.98) },
  { cbsaCode: "23540", name: "Gainesville", state: "FL", laborIndex: 0.90, costOfLivingIndex: 0.95, permitBurden: 1.00, urbanDensity: 0.98, climateComplexity: 0.97, compositeIndex: ci(0.90, 0.95, 1.00, 0.98, 0.97) },
  { cbsaCode: "36100", name: "Ocala", state: "FL", laborIndex: 0.88, costOfLivingIndex: 0.93, permitBurden: 0.98, urbanDensity: 0.97, climateComplexity: 0.96, compositeIndex: ci(0.88, 0.93, 0.98, 0.97, 0.96) },
  { cbsaCode: "37380", name: "Panama City", state: "FL", laborIndex: 0.88, costOfLivingIndex: 0.94, permitBurden: 0.98, urbanDensity: 0.97, climateComplexity: 0.97, compositeIndex: ci(0.88, 0.94, 0.98, 0.97, 0.97) },
  { cbsaCode: "39460", name: "Punta Gorda", state: "FL", laborIndex: 0.95, costOfLivingIndex: 0.99, permitBurden: 1.00, urbanDensity: 0.98, climateComplexity: 0.96, compositeIndex: ci(0.95, 0.99, 1.00, 0.98, 0.96) },

  // Georgia
  { cbsaCode: "12060", name: "Atlanta-Sandy Springs-Alpharetta", state: "GA", laborIndex: 0.98, costOfLivingIndex: 0.95, permitBurden: 0.97, urbanDensity: 1.01, climateComplexity: 0.98, compositeIndex: ci(0.98, 0.95, 0.97, 1.01, 0.98) },
  { cbsaCode: "12260", name: "Augusta-Richmond County", state: "GA", laborIndex: 0.88, costOfLivingIndex: 0.89, permitBurden: 0.96, urbanDensity: 0.98, climateComplexity: 0.98, compositeIndex: ci(0.88, 0.89, 0.96, 0.98, 0.98) },
  { cbsaCode: "42340", name: "Savannah", state: "GA", laborIndex: 0.90, costOfLivingIndex: 0.93, permitBurden: 0.97, urbanDensity: 0.99, climateComplexity: 0.97, compositeIndex: ci(0.90, 0.93, 0.97, 0.99, 0.97) },
  { cbsaCode: "17980", name: "Columbus", state: "GA", laborIndex: 0.85, costOfLivingIndex: 0.87, permitBurden: 0.95, urbanDensity: 0.98, climateComplexity: 0.98, compositeIndex: ci(0.85, 0.87, 0.95, 0.98, 0.98) },
  { cbsaCode: "31420", name: "Macon-Bibb County", state: "GA", laborIndex: 0.82, costOfLivingIndex: 0.86, permitBurden: 0.95, urbanDensity: 0.97, climateComplexity: 0.98, compositeIndex: ci(0.82, 0.86, 0.95, 0.97, 0.98) },
  { cbsaCode: "12020", name: "Athens-Clarke County", state: "GA", laborIndex: 0.88, costOfLivingIndex: 0.91, permitBurden: 0.97, urbanDensity: 0.98, climateComplexity: 0.98, compositeIndex: ci(0.88, 0.91, 0.97, 0.98, 0.98) },
  { cbsaCode: "47580", name: "Warner Robins", state: "GA", laborIndex: 0.85, costOfLivingIndex: 0.87, permitBurden: 0.95, urbanDensity: 0.97, climateComplexity: 0.98, compositeIndex: ci(0.85, 0.87, 0.95, 0.97, 0.98) },
  { cbsaCode: "10500", name: "Albany", state: "GA", laborIndex: 0.78, costOfLivingIndex: 0.84, permitBurden: 0.94, urbanDensity: 0.96, climateComplexity: 0.98, compositeIndex: ci(0.78, 0.84, 0.94, 0.96, 0.98) },
  { cbsaCode: "46660", name: "Valdosta", state: "GA", laborIndex: 0.78, costOfLivingIndex: 0.85, permitBurden: 0.94, urbanDensity: 0.96, climateComplexity: 0.97, compositeIndex: ci(0.78, 0.85, 0.94, 0.96, 0.97) },
  { cbsaCode: "23580", name: "Gainesville", state: "GA", laborIndex: 0.88, costOfLivingIndex: 0.92, permitBurden: 0.96, urbanDensity: 0.98, climateComplexity: 1.00, compositeIndex: ci(0.88, 0.92, 0.96, 0.98, 1.00) },

  // North Carolina
  { cbsaCode: "16740", name: "Charlotte-Concord-Gastonia", state: "NC", laborIndex: 1.02, costOfLivingIndex: 0.96, permitBurden: 0.98, urbanDensity: 1.02, climateComplexity: 1.00, compositeIndex: ci(1.02, 0.96, 0.98, 1.02, 1.00) },
  { cbsaCode: "39580", name: "Raleigh-Cary", state: "NC", laborIndex: 1.02, costOfLivingIndex: 0.98, permitBurden: 0.99, urbanDensity: 1.01, climateComplexity: 1.00, compositeIndex: ci(1.02, 0.98, 0.99, 1.01, 1.00) },
  { cbsaCode: "24660", name: "Greensboro-High Point", state: "NC", laborIndex: 0.92, costOfLivingIndex: 0.92, permitBurden: 0.97, urbanDensity: 1.00, climateComplexity: 1.00, compositeIndex: ci(0.92, 0.92, 0.97, 1.00, 1.00) },
  { cbsaCode: "20500", name: "Durham-Chapel Hill", state: "NC", laborIndex: 1.02, costOfLivingIndex: 0.99, permitBurden: 1.00, urbanDensity: 1.01, climateComplexity: 1.00, compositeIndex: ci(1.02, 0.99, 1.00, 1.01, 1.00) },
  { cbsaCode: "48900", name: "Winston-Salem", state: "NC", laborIndex: 0.90, costOfLivingIndex: 0.91, permitBurden: 0.97, urbanDensity: 0.99, climateComplexity: 1.00, compositeIndex: ci(0.90, 0.91, 0.97, 0.99, 1.00) },
  { cbsaCode: "22180", name: "Fayetteville", state: "NC", laborIndex: 0.85, costOfLivingIndex: 0.89, permitBurden: 0.96, urbanDensity: 0.98, climateComplexity: 0.99, compositeIndex: ci(0.85, 0.89, 0.96, 0.98, 0.99) },
  { cbsaCode: "11700", name: "Asheville", state: "NC", laborIndex: 0.95, costOfLivingIndex: 0.98, permitBurden: 1.00, urbanDensity: 0.99, climateComplexity: 1.04, compositeIndex: ci(0.95, 0.98, 1.00, 0.99, 1.04) },
  { cbsaCode: "48980", name: "Wilmington", state: "NC", laborIndex: 0.92, costOfLivingIndex: 0.96, permitBurden: 0.98, urbanDensity: 0.99, climateComplexity: 0.98, compositeIndex: ci(0.92, 0.96, 0.98, 0.99, 0.98) },
  { cbsaCode: "25860", name: "Hickory-Lenoir-Morganton", state: "NC", laborIndex: 0.85, costOfLivingIndex: 0.88, permitBurden: 0.96, urbanDensity: 0.97, climateComplexity: 1.02, compositeIndex: ci(0.85, 0.88, 0.96, 0.97, 1.02) },
  { cbsaCode: "24140", name: "Goldsboro", state: "NC", laborIndex: 0.82, costOfLivingIndex: 0.87, permitBurden: 0.95, urbanDensity: 0.96, climateComplexity: 0.99, compositeIndex: ci(0.82, 0.87, 0.95, 0.96, 0.99) },
  { cbsaCode: "15500", name: "Burlington", state: "NC", laborIndex: 0.88, costOfLivingIndex: 0.90, permitBurden: 0.96, urbanDensity: 0.97, climateComplexity: 1.00, compositeIndex: ci(0.88, 0.90, 0.96, 0.97, 1.00) },
  { cbsaCode: "27340", name: "Jacksonville", state: "NC", laborIndex: 0.82, costOfLivingIndex: 0.90, permitBurden: 0.96, urbanDensity: 0.97, climateComplexity: 0.98, compositeIndex: ci(0.82, 0.90, 0.96, 0.97, 0.98) },
  { cbsaCode: "24780", name: "Greenville", state: "NC", laborIndex: 0.85, costOfLivingIndex: 0.90, permitBurden: 0.96, urbanDensity: 0.97, climateComplexity: 0.99, compositeIndex: ci(0.85, 0.90, 0.96, 0.97, 0.99) },
  { cbsaCode: "35100", name: "New Bern", state: "NC", laborIndex: 0.82, costOfLivingIndex: 0.88, permitBurden: 0.96, urbanDensity: 0.96, climateComplexity: 0.98, compositeIndex: ci(0.82, 0.88, 0.96, 0.96, 0.98) },
  { cbsaCode: "40580", name: "Rocky Mount", state: "NC", laborIndex: 0.80, costOfLivingIndex: 0.86, permitBurden: 0.95, urbanDensity: 0.96, climateComplexity: 0.99, compositeIndex: ci(0.80, 0.86, 0.95, 0.96, 0.99) },

  // South Carolina
  { cbsaCode: "16700", name: "Charleston-North Charleston", state: "SC", laborIndex: 0.95, costOfLivingIndex: 0.97, permitBurden: 0.98, urbanDensity: 1.01, climateComplexity: 0.97, compositeIndex: ci(0.95, 0.97, 0.98, 1.01, 0.97) },
  { cbsaCode: "24860", name: "Greenville-Anderson", state: "SC", laborIndex: 0.92, costOfLivingIndex: 0.93, permitBurden: 0.97, urbanDensity: 1.00, climateComplexity: 1.00, compositeIndex: ci(0.92, 0.93, 0.97, 1.00, 1.00) },
  { cbsaCode: "17900", name: "Columbia", state: "SC", laborIndex: 0.90, costOfLivingIndex: 0.92, permitBurden: 0.97, urbanDensity: 0.99, climateComplexity: 0.98, compositeIndex: ci(0.90, 0.92, 0.97, 0.99, 0.98) },
  { cbsaCode: "34820", name: "Myrtle Beach-Conway-North Myrtle Beach", state: "SC", laborIndex: 0.88, costOfLivingIndex: 0.95, permitBurden: 0.97, urbanDensity: 0.99, climateComplexity: 0.97, compositeIndex: ci(0.88, 0.95, 0.97, 0.99, 0.97) },
  { cbsaCode: "44940", name: "Spartanburg", state: "SC", laborIndex: 0.88, costOfLivingIndex: 0.90, permitBurden: 0.96, urbanDensity: 0.98, climateComplexity: 1.00, compositeIndex: ci(0.88, 0.90, 0.96, 0.98, 1.00) },
  { cbsaCode: "22500", name: "Florence", state: "SC", laborIndex: 0.82, costOfLivingIndex: 0.87, permitBurden: 0.95, urbanDensity: 0.96, climateComplexity: 0.98, compositeIndex: ci(0.82, 0.87, 0.95, 0.96, 0.98) },
  { cbsaCode: "25940", name: "Hilton Head Island-Bluffton", state: "SC", laborIndex: 0.95, costOfLivingIndex: 1.02, permitBurden: 1.00, urbanDensity: 0.98, climateComplexity: 0.97, compositeIndex: ci(0.95, 1.02, 1.00, 0.98, 0.97) },
  { cbsaCode: "43900", name: "Sumter", state: "SC", laborIndex: 0.78, costOfLivingIndex: 0.85, permitBurden: 0.94, urbanDensity: 0.96, climateComplexity: 0.98, compositeIndex: ci(0.78, 0.85, 0.94, 0.96, 0.98) },

  // Virginia
  { cbsaCode: "47900", name: "Washington-Arlington-Alexandria", state: "VA", laborIndex: 1.35, costOfLivingIndex: 1.15, permitBurden: 1.08, urbanDensity: 1.06, climateComplexity: 1.02, compositeIndex: ci(1.35, 1.15, 1.08, 1.06, 1.02) },
  { cbsaCode: "47260", name: "Virginia Beach-Norfolk-Newport News", state: "VA", laborIndex: 1.00, costOfLivingIndex: 0.97, permitBurden: 1.00, urbanDensity: 1.02, climateComplexity: 1.00, compositeIndex: ci(1.00, 0.97, 1.00, 1.02, 1.00) },
  { cbsaCode: "40060", name: "Richmond", state: "VA", laborIndex: 1.02, costOfLivingIndex: 0.97, permitBurden: 0.99, urbanDensity: 1.01, climateComplexity: 1.02, compositeIndex: ci(1.02, 0.97, 0.99, 1.01, 1.02) },
  { cbsaCode: "40220", name: "Roanoke", state: "VA", laborIndex: 0.90, costOfLivingIndex: 0.91, permitBurden: 0.97, urbanDensity: 0.98, climateComplexity: 1.04, compositeIndex: ci(0.90, 0.91, 0.97, 0.98, 1.04) },
  { cbsaCode: "31340", name: "Lynchburg", state: "VA", laborIndex: 0.88, costOfLivingIndex: 0.90, permitBurden: 0.97, urbanDensity: 0.97, climateComplexity: 1.02, compositeIndex: ci(0.88, 0.90, 0.97, 0.97, 1.02) },
  { cbsaCode: "16820", name: "Charlottesville", state: "VA", laborIndex: 0.98, costOfLivingIndex: 1.00, permitBurden: 1.00, urbanDensity: 0.98, climateComplexity: 1.02, compositeIndex: ci(0.98, 1.00, 1.00, 0.98, 1.02) },
  { cbsaCode: "25500", name: "Harrisonburg", state: "VA", laborIndex: 0.88, costOfLivingIndex: 0.92, permitBurden: 0.97, urbanDensity: 0.97, climateComplexity: 1.04, compositeIndex: ci(0.88, 0.92, 0.97, 0.97, 1.04) },
  { cbsaCode: "13980", name: "Blacksburg-Christiansburg", state: "VA", laborIndex: 0.88, costOfLivingIndex: 0.92, permitBurden: 0.97, urbanDensity: 0.97, climateComplexity: 1.04, compositeIndex: ci(0.88, 0.92, 0.97, 0.97, 1.04) },
  { cbsaCode: "19260", name: "Danville", state: "VA", laborIndex: 0.80, costOfLivingIndex: 0.86, permitBurden: 0.95, urbanDensity: 0.96, climateComplexity: 1.02, compositeIndex: ci(0.80, 0.86, 0.95, 0.96, 1.02) },
  { cbsaCode: "44420", name: "Staunton", state: "VA", laborIndex: 0.88, costOfLivingIndex: 0.91, permitBurden: 0.97, urbanDensity: 0.96, climateComplexity: 1.04, compositeIndex: ci(0.88, 0.91, 0.97, 0.96, 1.04) },

  // Tennessee
  { cbsaCode: "34980", name: "Nashville-Davidson-Murfreesboro-Franklin", state: "TN", laborIndex: 1.00, costOfLivingIndex: 0.96, permitBurden: 0.97, urbanDensity: 1.02, climateComplexity: 1.02, compositeIndex: ci(1.00, 0.96, 0.97, 1.02, 1.02) },
  { cbsaCode: "32820", name: "Memphis", state: "TN", laborIndex: 0.92, costOfLivingIndex: 0.90, permitBurden: 0.96, urbanDensity: 1.01, climateComplexity: 1.00, compositeIndex: ci(0.92, 0.90, 0.96, 1.01, 1.00) },
  { cbsaCode: "28940", name: "Knoxville", state: "TN", laborIndex: 0.90, costOfLivingIndex: 0.90, permitBurden: 0.96, urbanDensity: 0.99, climateComplexity: 1.02, compositeIndex: ci(0.90, 0.90, 0.96, 0.99, 1.02) },
  { cbsaCode: "16860", name: "Chattanooga", state: "TN", laborIndex: 0.88, costOfLivingIndex: 0.89, permitBurden: 0.96, urbanDensity: 0.99, climateComplexity: 1.02, compositeIndex: ci(0.88, 0.89, 0.96, 0.99, 1.02) },
  { cbsaCode: "17420", name: "Clarksville", state: "TN", laborIndex: 0.85, costOfLivingIndex: 0.89, permitBurden: 0.95, urbanDensity: 0.98, climateComplexity: 1.02, compositeIndex: ci(0.85, 0.89, 0.95, 0.98, 1.02) },
  { cbsaCode: "27740", name: "Johnson City", state: "TN", laborIndex: 0.82, costOfLivingIndex: 0.87, permitBurden: 0.95, urbanDensity: 0.97, climateComplexity: 1.04, compositeIndex: ci(0.82, 0.87, 0.95, 0.97, 1.04) },
  { cbsaCode: "27180", name: "Jackson", state: "TN", laborIndex: 0.82, costOfLivingIndex: 0.86, permitBurden: 0.95, urbanDensity: 0.97, climateComplexity: 1.02, compositeIndex: ci(0.82, 0.86, 0.95, 0.97, 1.02) },
  { cbsaCode: "28700", name: "Kingsport-Bristol", state: "TN", laborIndex: 0.80, costOfLivingIndex: 0.86, permitBurden: 0.95, urbanDensity: 0.97, climateComplexity: 1.04, compositeIndex: ci(0.80, 0.86, 0.95, 0.97, 1.04) },

  // Alabama
  { cbsaCode: "13820", name: "Birmingham-Hoover", state: "AL", laborIndex: 0.90, costOfLivingIndex: 0.90, permitBurden: 0.96, urbanDensity: 1.00, climateComplexity: 0.99, compositeIndex: ci(0.90, 0.90, 0.96, 1.00, 0.99) },
  { cbsaCode: "26620", name: "Huntsville", state: "AL", laborIndex: 0.92, costOfLivingIndex: 0.92, permitBurden: 0.96, urbanDensity: 0.99, climateComplexity: 1.00, compositeIndex: ci(0.92, 0.92, 0.96, 0.99, 1.00) },
  { cbsaCode: "33660", name: "Mobile", state: "AL", laborIndex: 0.82, costOfLivingIndex: 0.87, permitBurden: 0.95, urbanDensity: 0.98, climateComplexity: 0.97, compositeIndex: ci(0.82, 0.87, 0.95, 0.98, 0.97) },
  { cbsaCode: "33860", name: "Montgomery", state: "AL", laborIndex: 0.82, costOfLivingIndex: 0.87, permitBurden: 0.95, urbanDensity: 0.98, climateComplexity: 0.99, compositeIndex: ci(0.82, 0.87, 0.95, 0.98, 0.99) },
  { cbsaCode: "46220", name: "Tuscaloosa", state: "AL", laborIndex: 0.82, costOfLivingIndex: 0.87, permitBurden: 0.95, urbanDensity: 0.97, climateComplexity: 0.99, compositeIndex: ci(0.82, 0.87, 0.95, 0.97, 0.99) },
  { cbsaCode: "19460", name: "Decatur", state: "AL", laborIndex: 0.82, costOfLivingIndex: 0.87, permitBurden: 0.95, urbanDensity: 0.97, climateComplexity: 1.00, compositeIndex: ci(0.82, 0.87, 0.95, 0.97, 1.00) },
  { cbsaCode: "12220", name: "Auburn-Opelika", state: "AL", laborIndex: 0.82, costOfLivingIndex: 0.89, permitBurden: 0.95, urbanDensity: 0.97, climateComplexity: 0.99, compositeIndex: ci(0.82, 0.89, 0.95, 0.97, 0.99) },
  { cbsaCode: "20020", name: "Dothan", state: "AL", laborIndex: 0.78, costOfLivingIndex: 0.84, permitBurden: 0.94, urbanDensity: 0.96, climateComplexity: 0.98, compositeIndex: ci(0.78, 0.84, 0.94, 0.96, 0.98) },
  { cbsaCode: "23460", name: "Gadsden", state: "AL", laborIndex: 0.78, costOfLivingIndex: 0.83, permitBurden: 0.94, urbanDensity: 0.96, climateComplexity: 1.00, compositeIndex: ci(0.78, 0.83, 0.94, 0.96, 1.00) },
  { cbsaCode: "22520", name: "Florence-Muscle Shoals", state: "AL", laborIndex: 0.80, costOfLivingIndex: 0.85, permitBurden: 0.94, urbanDensity: 0.96, climateComplexity: 1.00, compositeIndex: ci(0.80, 0.85, 0.94, 0.96, 1.00) },
  { cbsaCode: "11500", name: "Anniston-Oxford", state: "AL", laborIndex: 0.78, costOfLivingIndex: 0.84, permitBurden: 0.94, urbanDensity: 0.96, climateComplexity: 0.99, compositeIndex: ci(0.78, 0.84, 0.94, 0.96, 0.99) },

  // Mississippi
  { cbsaCode: "27140", name: "Jackson", state: "MS", laborIndex: 0.80, costOfLivingIndex: 0.85, permitBurden: 0.94, urbanDensity: 0.98, climateComplexity: 0.99, compositeIndex: ci(0.80, 0.85, 0.94, 0.98, 0.99) },
  { cbsaCode: "25060", name: "Gulfport-Biloxi", state: "MS", laborIndex: 0.80, costOfLivingIndex: 0.86, permitBurden: 0.94, urbanDensity: 0.97, climateComplexity: 0.97, compositeIndex: ci(0.80, 0.86, 0.94, 0.97, 0.97) },
  { cbsaCode: "25620", name: "Hattiesburg", state: "MS", laborIndex: 0.76, costOfLivingIndex: 0.83, permitBurden: 0.93, urbanDensity: 0.96, climateComplexity: 0.98, compositeIndex: ci(0.76, 0.83, 0.93, 0.96, 0.98) },
  { cbsaCode: "46180", name: "Tupelo", state: "MS", laborIndex: 0.76, costOfLivingIndex: 0.83, permitBurden: 0.93, urbanDensity: 0.96, climateComplexity: 1.00, compositeIndex: ci(0.76, 0.83, 0.93, 0.96, 1.00) },

  // Kentucky
  { cbsaCode: "31140", name: "Louisville/Jefferson County", state: "KY", laborIndex: 0.98, costOfLivingIndex: 0.92, permitBurden: 0.98, urbanDensity: 1.01, climateComplexity: 1.04, compositeIndex: ci(0.98, 0.92, 0.98, 1.01, 1.04) },
  { cbsaCode: "30460", name: "Lexington-Fayette", state: "KY", laborIndex: 0.95, costOfLivingIndex: 0.92, permitBurden: 0.98, urbanDensity: 1.00, climateComplexity: 1.04, compositeIndex: ci(0.95, 0.92, 0.98, 1.00, 1.04) },
  { cbsaCode: "14540", name: "Bowling Green", state: "KY", laborIndex: 0.85, costOfLivingIndex: 0.87, permitBurden: 0.95, urbanDensity: 0.97, climateComplexity: 1.02, compositeIndex: ci(0.85, 0.87, 0.95, 0.97, 1.02) },
  { cbsaCode: "21060", name: "Elizabethtown-Fort Knox", state: "KY", laborIndex: 0.82, costOfLivingIndex: 0.86, permitBurden: 0.95, urbanDensity: 0.96, climateComplexity: 1.02, compositeIndex: ci(0.82, 0.86, 0.95, 0.96, 1.02) },
  { cbsaCode: "36980", name: "Owensboro", state: "KY", laborIndex: 0.82, costOfLivingIndex: 0.86, permitBurden: 0.95, urbanDensity: 0.96, climateComplexity: 1.04, compositeIndex: ci(0.82, 0.86, 0.95, 0.96, 1.04) },

  // West Virginia
  { cbsaCode: "16620", name: "Charleston", state: "WV", laborIndex: 0.85, costOfLivingIndex: 0.88, permitBurden: 0.96, urbanDensity: 0.97, climateComplexity: 1.04, compositeIndex: ci(0.85, 0.88, 0.96, 0.97, 1.04) },
  { cbsaCode: "26580", name: "Huntington-Ashland", state: "WV", laborIndex: 0.82, costOfLivingIndex: 0.85, permitBurden: 0.95, urbanDensity: 0.97, climateComplexity: 1.04, compositeIndex: ci(0.82, 0.85, 0.95, 0.97, 1.04) },
  { cbsaCode: "34060", name: "Morgantown", state: "WV", laborIndex: 0.88, costOfLivingIndex: 0.91, permitBurden: 0.97, urbanDensity: 0.97, climateComplexity: 1.06, compositeIndex: ci(0.88, 0.91, 0.97, 0.97, 1.06) },
  { cbsaCode: "48260", name: "Wheeling", state: "WV", laborIndex: 0.82, costOfLivingIndex: 0.85, permitBurden: 0.95, urbanDensity: 0.97, climateComplexity: 1.06, compositeIndex: ci(0.82, 0.85, 0.95, 0.97, 1.06) },
  { cbsaCode: "37620", name: "Parkersburg-Vienna", state: "WV", laborIndex: 0.80, costOfLivingIndex: 0.84, permitBurden: 0.95, urbanDensity: 0.96, climateComplexity: 1.04, compositeIndex: ci(0.80, 0.84, 0.95, 0.96, 1.04) },

  // ============================================================
  // NORTHEAST (NY, NJ, PA, CT, MA, RI, NH, VT, ME, MD, DE, DC)
  // ============================================================

  // New York
  { cbsaCode: "35620", name: "New York-Newark-Jersey City", state: "NY", laborIndex: 1.55, costOfLivingIndex: 1.22, permitBurden: 1.15, urbanDensity: 1.08, climateComplexity: 1.06, compositeIndex: ci(1.55, 1.22, 1.15, 1.08, 1.06) },
  { cbsaCode: "15380", name: "Buffalo-Cheektowaga", state: "NY", laborIndex: 1.12, costOfLivingIndex: 0.95, permitBurden: 1.04, urbanDensity: 1.02, climateComplexity: 1.10, compositeIndex: ci(1.12, 0.95, 1.04, 1.02, 1.10) },
  { cbsaCode: "40380", name: "Rochester", state: "NY", laborIndex: 1.10, costOfLivingIndex: 0.95, permitBurden: 1.04, urbanDensity: 1.01, climateComplexity: 1.10, compositeIndex: ci(1.10, 0.95, 1.04, 1.01, 1.10) },
  { cbsaCode: "10580", name: "Albany-Schenectady-Troy", state: "NY", laborIndex: 1.15, costOfLivingIndex: 0.99, permitBurden: 1.04, urbanDensity: 1.01, climateComplexity: 1.10, compositeIndex: ci(1.15, 0.99, 1.04, 1.01, 1.10) },
  { cbsaCode: "45060", name: "Syracuse", state: "NY", laborIndex: 1.10, costOfLivingIndex: 0.94, permitBurden: 1.04, urbanDensity: 1.00, climateComplexity: 1.10, compositeIndex: ci(1.10, 0.94, 1.04, 1.00, 1.10) },
  { cbsaCode: "38460", name: "Poughkeepsie-Newburgh-Middletown", state: "NY", laborIndex: 1.30, costOfLivingIndex: 1.08, permitBurden: 1.08, urbanDensity: 1.01, climateComplexity: 1.08, compositeIndex: ci(1.30, 1.08, 1.08, 1.01, 1.08) },
  { cbsaCode: "46540", name: "Utica-Rome", state: "NY", laborIndex: 1.02, costOfLivingIndex: 0.92, permitBurden: 1.02, urbanDensity: 0.99, climateComplexity: 1.10, compositeIndex: ci(1.02, 0.92, 1.02, 0.99, 1.10) },
  { cbsaCode: "13780", name: "Binghamton", state: "NY", laborIndex: 1.02, costOfLivingIndex: 0.92, permitBurden: 1.02, urbanDensity: 0.99, climateComplexity: 1.10, compositeIndex: ci(1.02, 0.92, 1.02, 0.99, 1.10) },
  { cbsaCode: "24020", name: "Glens Falls", state: "NY", laborIndex: 1.05, costOfLivingIndex: 0.94, permitBurden: 1.02, urbanDensity: 0.97, climateComplexity: 1.10, compositeIndex: ci(1.05, 0.94, 1.02, 0.97, 1.10) },
  { cbsaCode: "21300", name: "Elmira", state: "NY", laborIndex: 0.98, costOfLivingIndex: 0.90, permitBurden: 1.00, urbanDensity: 0.97, climateComplexity: 1.08, compositeIndex: ci(0.98, 0.90, 1.00, 0.97, 1.08) },
  { cbsaCode: "27060", name: "Ithaca", state: "NY", laborIndex: 1.05, costOfLivingIndex: 0.98, permitBurden: 1.04, urbanDensity: 0.98, climateComplexity: 1.10, compositeIndex: ci(1.05, 0.98, 1.04, 0.98, 1.10) },
  { cbsaCode: "48060", name: "Watertown-Fort Drum", state: "NY", laborIndex: 0.98, costOfLivingIndex: 0.91, permitBurden: 1.00, urbanDensity: 0.96, climateComplexity: 1.12, compositeIndex: ci(0.98, 0.91, 1.00, 0.96, 1.12) },
  { cbsaCode: "28740", name: "Kingston", state: "NY", laborIndex: 1.18, costOfLivingIndex: 1.02, permitBurden: 1.06, urbanDensity: 0.98, climateComplexity: 1.08, compositeIndex: ci(1.18, 1.02, 1.06, 0.98, 1.08) },

  // New Jersey (mostly in NY metro, but also standalone)
  { cbsaCode: "45940", name: "Trenton-Princeton", state: "NJ", laborIndex: 1.35, costOfLivingIndex: 1.12, permitBurden: 1.10, urbanDensity: 1.04, climateComplexity: 1.04, compositeIndex: ci(1.35, 1.12, 1.10, 1.04, 1.04) },
  { cbsaCode: "12100", name: "Atlantic City-Hammonton", state: "NJ", laborIndex: 1.20, costOfLivingIndex: 1.04, permitBurden: 1.08, urbanDensity: 1.02, climateComplexity: 1.02, compositeIndex: ci(1.20, 1.04, 1.08, 1.02, 1.02) },
  { cbsaCode: "47220", name: "Vineland-Bridgeton", state: "NJ", laborIndex: 1.12, costOfLivingIndex: 0.98, permitBurden: 1.06, urbanDensity: 0.99, climateComplexity: 1.02, compositeIndex: ci(1.12, 0.98, 1.06, 0.99, 1.02) },
  { cbsaCode: "36350", name: "Ocean City", state: "NJ", laborIndex: 1.20, costOfLivingIndex: 1.06, permitBurden: 1.08, urbanDensity: 1.00, climateComplexity: 1.02, compositeIndex: ci(1.20, 1.06, 1.08, 1.00, 1.02) },

  // Pennsylvania
  { cbsaCode: "37980", name: "Philadelphia-Camden-Wilmington", state: "PA", laborIndex: 1.30, costOfLivingIndex: 1.08, permitBurden: 1.10, urbanDensity: 1.06, climateComplexity: 1.04, compositeIndex: ci(1.30, 1.08, 1.10, 1.06, 1.04) },
  { cbsaCode: "38300", name: "Pittsburgh", state: "PA", laborIndex: 1.15, costOfLivingIndex: 0.96, permitBurden: 1.04, urbanDensity: 1.03, climateComplexity: 1.08, compositeIndex: ci(1.15, 0.96, 1.04, 1.03, 1.08) },
  { cbsaCode: "10900", name: "Allentown-Bethlehem-Easton", state: "PA", laborIndex: 1.15, costOfLivingIndex: 1.00, permitBurden: 1.04, urbanDensity: 1.02, climateComplexity: 1.06, compositeIndex: ci(1.15, 1.00, 1.04, 1.02, 1.06) },
  { cbsaCode: "25420", name: "Harrisburg-Carlisle", state: "PA", laborIndex: 1.08, costOfLivingIndex: 0.96, permitBurden: 1.02, urbanDensity: 1.00, climateComplexity: 1.06, compositeIndex: ci(1.08, 0.96, 1.02, 1.00, 1.06) },
  { cbsaCode: "42540", name: "Scranton-Wilkes-Barre", state: "PA", laborIndex: 1.05, costOfLivingIndex: 0.92, permitBurden: 1.02, urbanDensity: 1.00, climateComplexity: 1.08, compositeIndex: ci(1.05, 0.92, 1.02, 1.00, 1.08) },
  { cbsaCode: "29540", name: "Lancaster", state: "PA", laborIndex: 1.08, costOfLivingIndex: 0.98, permitBurden: 1.02, urbanDensity: 1.00, climateComplexity: 1.06, compositeIndex: ci(1.08, 0.98, 1.02, 1.00, 1.06) },
  { cbsaCode: "49620", name: "York-Hanover", state: "PA", laborIndex: 1.05, costOfLivingIndex: 0.95, permitBurden: 1.00, urbanDensity: 0.99, climateComplexity: 1.06, compositeIndex: ci(1.05, 0.95, 1.00, 0.99, 1.06) },
  { cbsaCode: "39260", name: "Reading", state: "PA", laborIndex: 1.08, costOfLivingIndex: 0.96, permitBurden: 1.02, urbanDensity: 1.00, climateComplexity: 1.06, compositeIndex: ci(1.08, 0.96, 1.02, 1.00, 1.06) },
  { cbsaCode: "21500", name: "Erie", state: "PA", laborIndex: 1.02, costOfLivingIndex: 0.90, permitBurden: 1.00, urbanDensity: 0.99, climateComplexity: 1.10, compositeIndex: ci(1.02, 0.90, 1.00, 0.99, 1.10) },
  { cbsaCode: "44300", name: "State College", state: "PA", laborIndex: 1.02, costOfLivingIndex: 0.96, permitBurden: 1.02, urbanDensity: 0.97, climateComplexity: 1.08, compositeIndex: ci(1.02, 0.96, 1.02, 0.97, 1.08) },
  { cbsaCode: "48700", name: "Williamsport", state: "PA", laborIndex: 0.95, costOfLivingIndex: 0.89, permitBurden: 0.98, urbanDensity: 0.96, climateComplexity: 1.08, compositeIndex: ci(0.95, 0.89, 0.98, 0.96, 1.08) },
  { cbsaCode: "27780", name: "Johnstown", state: "PA", laborIndex: 0.92, costOfLivingIndex: 0.87, permitBurden: 0.98, urbanDensity: 0.97, climateComplexity: 1.08, compositeIndex: ci(0.92, 0.87, 0.98, 0.97, 1.08) },
  { cbsaCode: "20700", name: "East Stroudsburg", state: "PA", laborIndex: 1.10, costOfLivingIndex: 0.98, permitBurden: 1.04, urbanDensity: 0.98, climateComplexity: 1.08, compositeIndex: ci(1.10, 0.98, 1.04, 0.98, 1.08) },
  { cbsaCode: "16540", name: "Chambersburg-Waynesboro", state: "PA", laborIndex: 0.98, costOfLivingIndex: 0.92, permitBurden: 0.99, urbanDensity: 0.97, climateComplexity: 1.06, compositeIndex: ci(0.98, 0.92, 0.99, 0.97, 1.06) },
  { cbsaCode: "30140", name: "Lebanon", state: "PA", laborIndex: 1.00, costOfLivingIndex: 0.93, permitBurden: 1.00, urbanDensity: 0.97, climateComplexity: 1.06, compositeIndex: ci(1.00, 0.93, 1.00, 0.97, 1.06) },

  // Connecticut
  { cbsaCode: "25540", name: "Hartford-East Hartford-Middletown", state: "CT", laborIndex: 1.30, costOfLivingIndex: 1.10, permitBurden: 1.08, urbanDensity: 1.03, climateComplexity: 1.08, compositeIndex: ci(1.30, 1.10, 1.08, 1.03, 1.08) },
  { cbsaCode: "14860", name: "Bridgeport-Stamford-Norwalk", state: "CT", laborIndex: 1.45, costOfLivingIndex: 1.22, permitBurden: 1.12, urbanDensity: 1.05, climateComplexity: 1.06, compositeIndex: ci(1.45, 1.22, 1.12, 1.05, 1.06) },
  { cbsaCode: "35300", name: "New Haven-Milford", state: "CT", laborIndex: 1.25, costOfLivingIndex: 1.08, permitBurden: 1.08, urbanDensity: 1.03, climateComplexity: 1.08, compositeIndex: ci(1.25, 1.08, 1.08, 1.03, 1.08) },
  { cbsaCode: "49340", name: "Worcester", state: "CT", laborIndex: 1.22, costOfLivingIndex: 1.06, permitBurden: 1.06, urbanDensity: 1.02, climateComplexity: 1.08, compositeIndex: ci(1.22, 1.06, 1.06, 1.02, 1.08) },
  { cbsaCode: "35980", name: "Norwich-New London", state: "CT", laborIndex: 1.18, costOfLivingIndex: 1.04, permitBurden: 1.06, urbanDensity: 1.00, climateComplexity: 1.08, compositeIndex: ci(1.18, 1.04, 1.06, 1.00, 1.08) },
  { cbsaCode: "47860", name: "Waterbury", state: "CT", laborIndex: 1.20, costOfLivingIndex: 1.06, permitBurden: 1.06, urbanDensity: 1.01, climateComplexity: 1.08, compositeIndex: ci(1.20, 1.06, 1.06, 1.01, 1.08) },

  // Massachusetts
  { cbsaCode: "14460", name: "Boston-Cambridge-Newton", state: "MA", laborIndex: 1.45, costOfLivingIndex: 1.18, permitBurden: 1.12, urbanDensity: 1.07, climateComplexity: 1.08, compositeIndex: ci(1.45, 1.18, 1.12, 1.07, 1.08) },
  { cbsaCode: "44140", name: "Springfield", state: "MA", laborIndex: 1.15, costOfLivingIndex: 1.02, permitBurden: 1.06, urbanDensity: 1.01, climateComplexity: 1.08, compositeIndex: ci(1.15, 1.02, 1.06, 1.01, 1.08) },
  { cbsaCode: "38340", name: "Pittsfield", state: "MA", laborIndex: 1.10, costOfLivingIndex: 1.02, permitBurden: 1.06, urbanDensity: 0.98, climateComplexity: 1.10, compositeIndex: ci(1.10, 1.02, 1.06, 0.98, 1.10) },
  { cbsaCode: "12700", name: "Barnstable Town", state: "MA", laborIndex: 1.25, costOfLivingIndex: 1.14, permitBurden: 1.08, urbanDensity: 0.99, climateComplexity: 1.06, compositeIndex: ci(1.25, 1.14, 1.08, 0.99, 1.06) },
  { cbsaCode: "35580", name: "New Bedford", state: "MA", laborIndex: 1.12, costOfLivingIndex: 1.00, permitBurden: 1.06, urbanDensity: 1.00, climateComplexity: 1.06, compositeIndex: ci(1.12, 1.00, 1.06, 1.00, 1.06) },

  // Rhode Island
  { cbsaCode: "39300", name: "Providence-Warwick", state: "RI", laborIndex: 1.20, costOfLivingIndex: 1.06, permitBurden: 1.08, urbanDensity: 1.03, climateComplexity: 1.06, compositeIndex: ci(1.20, 1.06, 1.08, 1.03, 1.06) },

  // New Hampshire
  { cbsaCode: "31700", name: "Manchester-Nashua", state: "NH", laborIndex: 1.18, costOfLivingIndex: 1.06, permitBurden: 1.02, urbanDensity: 1.01, climateComplexity: 1.10, compositeIndex: ci(1.18, 1.06, 1.02, 1.01, 1.10) },
  { cbsaCode: "18180", name: "Concord", state: "NH", laborIndex: 1.12, costOfLivingIndex: 1.04, permitBurden: 1.00, urbanDensity: 0.98, climateComplexity: 1.10, compositeIndex: ci(1.12, 1.04, 1.00, 0.98, 1.10) },
  { cbsaCode: "73450", name: "Dover-Durham", state: "NH", laborIndex: 1.12, costOfLivingIndex: 1.04, permitBurden: 1.00, urbanDensity: 0.98, climateComplexity: 1.10, compositeIndex: ci(1.12, 1.04, 1.00, 0.98, 1.10) },

  // Vermont
  { cbsaCode: "15540", name: "Burlington-South Burlington", state: "VT", laborIndex: 1.10, costOfLivingIndex: 1.04, permitBurden: 1.04, urbanDensity: 0.99, climateComplexity: 1.12, compositeIndex: ci(1.10, 1.04, 1.04, 0.99, 1.12) },

  // Maine
  { cbsaCode: "38860", name: "Portland-South Portland", state: "ME", laborIndex: 1.10, costOfLivingIndex: 1.04, permitBurden: 1.02, urbanDensity: 1.00, climateComplexity: 1.10, compositeIndex: ci(1.10, 1.04, 1.02, 1.00, 1.10) },
  { cbsaCode: "12620", name: "Bangor", state: "ME", laborIndex: 0.98, costOfLivingIndex: 0.96, permitBurden: 0.99, urbanDensity: 0.97, climateComplexity: 1.12, compositeIndex: ci(0.98, 0.96, 0.99, 0.97, 1.12) },
  { cbsaCode: "30340", name: "Lewiston-Auburn", state: "ME", laborIndex: 1.00, costOfLivingIndex: 0.96, permitBurden: 1.00, urbanDensity: 0.98, climateComplexity: 1.12, compositeIndex: ci(1.00, 0.96, 1.00, 0.98, 1.12) },

  // Maryland
  { cbsaCode: "12580", name: "Baltimore-Columbia-Towson", state: "MD", laborIndex: 1.22, costOfLivingIndex: 1.08, permitBurden: 1.06, urbanDensity: 1.04, climateComplexity: 1.04, compositeIndex: ci(1.22, 1.08, 1.06, 1.04, 1.04) },
  { cbsaCode: "41540", name: "Salisbury", state: "MD", laborIndex: 0.95, costOfLivingIndex: 0.96, permitBurden: 0.99, urbanDensity: 0.97, climateComplexity: 1.02, compositeIndex: ci(0.95, 0.96, 0.99, 0.97, 1.02) },
  { cbsaCode: "25180", name: "Hagerstown-Martinsburg", state: "MD", laborIndex: 1.02, costOfLivingIndex: 0.96, permitBurden: 1.00, urbanDensity: 0.98, climateComplexity: 1.06, compositeIndex: ci(1.02, 0.96, 1.00, 0.98, 1.06) },
  { cbsaCode: "19060", name: "Cumberland", state: "MD", laborIndex: 0.88, costOfLivingIndex: 0.88, permitBurden: 0.97, urbanDensity: 0.96, climateComplexity: 1.06, compositeIndex: ci(0.88, 0.88, 0.97, 0.96, 1.06) },

  // Delaware
  { cbsaCode: "20100", name: "Dover", state: "DE", laborIndex: 1.05, costOfLivingIndex: 1.00, permitBurden: 1.02, urbanDensity: 0.98, climateComplexity: 1.02, compositeIndex: ci(1.05, 1.00, 1.02, 0.98, 1.02) },

  // District of Columbia (covered by Washington VA entry above)

  // ============================================================
  // RURAL ENTRIES (one per state + DC)
  // ============================================================

  // Pacific West Rural
  { cbsaCode: "RURAL-CA", name: "Rural California", state: "CA", laborIndex: 1.10, costOfLivingIndex: 1.02, permitBurden: 1.02, urbanDensity: 0.96, climateComplexity: 1.00, compositeIndex: ci(1.10, 1.02, 1.02, 0.96, 1.00) },
  { cbsaCode: "RURAL-OR", name: "Rural Oregon", state: "OR", laborIndex: 1.02, costOfLivingIndex: 0.98, permitBurden: 1.00, urbanDensity: 0.95, climateComplexity: 1.04, compositeIndex: ci(1.02, 0.98, 1.00, 0.95, 1.04) },
  { cbsaCode: "RURAL-WA", name: "Rural Washington", state: "WA", laborIndex: 1.05, costOfLivingIndex: 0.98, permitBurden: 0.98, urbanDensity: 0.95, climateComplexity: 1.05, compositeIndex: ci(1.05, 0.98, 0.98, 0.95, 1.05) },
  { cbsaCode: "RURAL-HI", name: "Rural Hawaii", state: "HI", laborIndex: 1.30, costOfLivingIndex: 1.20, permitBurden: 1.06, urbanDensity: 0.95, climateComplexity: 0.95, compositeIndex: ci(1.30, 1.20, 1.06, 0.95, 0.95) },
  { cbsaCode: "RURAL-AK", name: "Rural Alaska", state: "AK", laborIndex: 1.25, costOfLivingIndex: 1.18, permitBurden: 0.98, urbanDensity: 0.95, climateComplexity: 1.12, compositeIndex: ci(1.25, 1.18, 0.98, 0.95, 1.12) },

  // Mountain West Rural
  { cbsaCode: "RURAL-NV", name: "Rural Nevada", state: "NV", laborIndex: 1.05, costOfLivingIndex: 0.98, permitBurden: 0.96, urbanDensity: 0.95, climateComplexity: 1.02, compositeIndex: ci(1.05, 0.98, 0.96, 0.95, 1.02) },
  { cbsaCode: "RURAL-AZ", name: "Rural Arizona", state: "AZ", laborIndex: 0.88, costOfLivingIndex: 0.93, permitBurden: 0.94, urbanDensity: 0.95, climateComplexity: 0.98, compositeIndex: ci(0.88, 0.93, 0.94, 0.95, 0.98) },
  { cbsaCode: "RURAL-UT", name: "Rural Utah", state: "UT", laborIndex: 0.92, costOfLivingIndex: 0.96, permitBurden: 0.95, urbanDensity: 0.95, climateComplexity: 1.06, compositeIndex: ci(0.92, 0.96, 0.95, 0.95, 1.06) },
  { cbsaCode: "RURAL-CO", name: "Rural Colorado", state: "CO", laborIndex: 0.98, costOfLivingIndex: 0.96, permitBurden: 0.97, urbanDensity: 0.95, climateComplexity: 1.08, compositeIndex: ci(0.98, 0.96, 0.97, 0.95, 1.08) },
  { cbsaCode: "RURAL-NM", name: "Rural New Mexico", state: "NM", laborIndex: 0.82, costOfLivingIndex: 0.88, permitBurden: 0.94, urbanDensity: 0.95, climateComplexity: 1.02, compositeIndex: ci(0.82, 0.88, 0.94, 0.95, 1.02) },
  { cbsaCode: "RURAL-ID", name: "Rural Idaho", state: "ID", laborIndex: 0.85, costOfLivingIndex: 0.91, permitBurden: 0.94, urbanDensity: 0.95, climateComplexity: 1.08, compositeIndex: ci(0.85, 0.91, 0.94, 0.95, 1.08) },
  { cbsaCode: "RURAL-MT", name: "Rural Montana", state: "MT", laborIndex: 0.88, costOfLivingIndex: 0.94, permitBurden: 0.94, urbanDensity: 0.95, climateComplexity: 1.10, compositeIndex: ci(0.88, 0.94, 0.94, 0.95, 1.10) },
  { cbsaCode: "RURAL-WY", name: "Rural Wyoming", state: "WY", laborIndex: 0.90, costOfLivingIndex: 0.94, permitBurden: 0.94, urbanDensity: 0.95, climateComplexity: 1.10, compositeIndex: ci(0.90, 0.94, 0.94, 0.95, 1.10) },

  // Midwest Rural
  { cbsaCode: "RURAL-MN", name: "Rural Minnesota", state: "MN", laborIndex: 0.95, costOfLivingIndex: 0.90, permitBurden: 0.97, urbanDensity: 0.95, climateComplexity: 1.12, compositeIndex: ci(0.95, 0.90, 0.97, 0.95, 1.12) },
  { cbsaCode: "RURAL-WI", name: "Rural Wisconsin", state: "WI", laborIndex: 0.92, costOfLivingIndex: 0.88, permitBurden: 0.97, urbanDensity: 0.95, climateComplexity: 1.10, compositeIndex: ci(0.92, 0.88, 0.97, 0.95, 1.10) },
  { cbsaCode: "RURAL-IA", name: "Rural Iowa", state: "IA", laborIndex: 0.88, costOfLivingIndex: 0.86, permitBurden: 0.95, urbanDensity: 0.95, climateComplexity: 1.10, compositeIndex: ci(0.88, 0.86, 0.95, 0.95, 1.10) },
  { cbsaCode: "RURAL-ND", name: "Rural North Dakota", state: "ND", laborIndex: 0.88, costOfLivingIndex: 0.88, permitBurden: 0.95, urbanDensity: 0.95, climateComplexity: 1.12, compositeIndex: ci(0.88, 0.88, 0.95, 0.95, 1.12) },
  { cbsaCode: "RURAL-SD", name: "Rural South Dakota", state: "SD", laborIndex: 0.85, costOfLivingIndex: 0.87, permitBurden: 0.94, urbanDensity: 0.95, climateComplexity: 1.10, compositeIndex: ci(0.85, 0.87, 0.94, 0.95, 1.10) },
  { cbsaCode: "RURAL-NE", name: "Rural Nebraska", state: "NE", laborIndex: 0.85, costOfLivingIndex: 0.86, permitBurden: 0.94, urbanDensity: 0.95, climateComplexity: 1.10, compositeIndex: ci(0.85, 0.86, 0.94, 0.95, 1.10) },
  { cbsaCode: "RURAL-KS", name: "Rural Kansas", state: "KS", laborIndex: 0.85, costOfLivingIndex: 0.86, permitBurden: 0.94, urbanDensity: 0.95, climateComplexity: 1.06, compositeIndex: ci(0.85, 0.86, 0.94, 0.95, 1.06) },
  { cbsaCode: "RURAL-MO", name: "Rural Missouri", state: "MO", laborIndex: 0.80, costOfLivingIndex: 0.84, permitBurden: 0.93, urbanDensity: 0.95, climateComplexity: 1.06, compositeIndex: ci(0.80, 0.84, 0.93, 0.95, 1.06) },
  { cbsaCode: "RURAL-IL", name: "Rural Illinois", state: "IL", laborIndex: 0.92, costOfLivingIndex: 0.88, permitBurden: 0.98, urbanDensity: 0.95, climateComplexity: 1.08, compositeIndex: ci(0.92, 0.88, 0.98, 0.95, 1.08) },
  { cbsaCode: "RURAL-IN", name: "Rural Indiana", state: "IN", laborIndex: 0.85, costOfLivingIndex: 0.84, permitBurden: 0.95, urbanDensity: 0.95, climateComplexity: 1.06, compositeIndex: ci(0.85, 0.84, 0.95, 0.95, 1.06) },
  { cbsaCode: "RURAL-OH", name: "Rural Ohio", state: "OH", laborIndex: 0.85, costOfLivingIndex: 0.84, permitBurden: 0.96, urbanDensity: 0.95, climateComplexity: 1.06, compositeIndex: ci(0.85, 0.84, 0.96, 0.95, 1.06) },
  { cbsaCode: "RURAL-MI", name: "Rural Michigan", state: "MI", laborIndex: 0.88, costOfLivingIndex: 0.86, permitBurden: 0.96, urbanDensity: 0.95, climateComplexity: 1.10, compositeIndex: ci(0.88, 0.86, 0.96, 0.95, 1.10) },

  // South Central Rural
  { cbsaCode: "RURAL-TX", name: "Rural Texas", state: "TX", laborIndex: 0.82, costOfLivingIndex: 0.86, permitBurden: 0.92, urbanDensity: 0.95, climateComplexity: 0.98, compositeIndex: ci(0.82, 0.86, 0.92, 0.95, 0.98) },
  { cbsaCode: "RURAL-OK", name: "Rural Oklahoma", state: "OK", laborIndex: 0.80, costOfLivingIndex: 0.84, permitBurden: 0.93, urbanDensity: 0.95, climateComplexity: 1.02, compositeIndex: ci(0.80, 0.84, 0.93, 0.95, 1.02) },
  { cbsaCode: "RURAL-AR", name: "Rural Arkansas", state: "AR", laborIndex: 0.75, costOfLivingIndex: 0.82, permitBurden: 0.93, urbanDensity: 0.95, climateComplexity: 1.02, compositeIndex: ci(0.75, 0.82, 0.93, 0.95, 1.02) },
  { cbsaCode: "RURAL-LA", name: "Rural Louisiana", state: "LA", laborIndex: 0.78, costOfLivingIndex: 0.83, permitBurden: 0.93, urbanDensity: 0.95, climateComplexity: 0.98, compositeIndex: ci(0.78, 0.83, 0.93, 0.95, 0.98) },

  // Southeast Rural
  { cbsaCode: "RURAL-FL", name: "Rural Florida", state: "FL", laborIndex: 0.85, costOfLivingIndex: 0.92, permitBurden: 0.98, urbanDensity: 0.95, climateComplexity: 0.96, compositeIndex: ci(0.85, 0.92, 0.98, 0.95, 0.96) },
  { cbsaCode: "RURAL-GA", name: "Rural Georgia", state: "GA", laborIndex: 0.78, costOfLivingIndex: 0.84, permitBurden: 0.94, urbanDensity: 0.95, climateComplexity: 0.98, compositeIndex: ci(0.78, 0.84, 0.94, 0.95, 0.98) },
  { cbsaCode: "RURAL-NC", name: "Rural North Carolina", state: "NC", laborIndex: 0.80, costOfLivingIndex: 0.86, permitBurden: 0.95, urbanDensity: 0.95, climateComplexity: 1.00, compositeIndex: ci(0.80, 0.86, 0.95, 0.95, 1.00) },
  { cbsaCode: "RURAL-SC", name: "Rural South Carolina", state: "SC", laborIndex: 0.78, costOfLivingIndex: 0.84, permitBurden: 0.94, urbanDensity: 0.95, climateComplexity: 0.98, compositeIndex: ci(0.78, 0.84, 0.94, 0.95, 0.98) },
  { cbsaCode: "RURAL-VA", name: "Rural Virginia", state: "VA", laborIndex: 0.82, costOfLivingIndex: 0.87, permitBurden: 0.95, urbanDensity: 0.95, climateComplexity: 1.04, compositeIndex: ci(0.82, 0.87, 0.95, 0.95, 1.04) },
  { cbsaCode: "RURAL-TN", name: "Rural Tennessee", state: "TN", laborIndex: 0.78, costOfLivingIndex: 0.84, permitBurden: 0.94, urbanDensity: 0.95, climateComplexity: 1.02, compositeIndex: ci(0.78, 0.84, 0.94, 0.95, 1.02) },
  { cbsaCode: "RURAL-AL", name: "Rural Alabama", state: "AL", laborIndex: 0.73, costOfLivingIndex: 0.82, permitBurden: 0.92, urbanDensity: 0.95, climateComplexity: 0.96, compositeIndex: ci(0.73, 0.82, 0.92, 0.95, 0.96) },
  { cbsaCode: "RURAL-MS", name: "Rural Mississippi", state: "MS", laborIndex: 0.70, costOfLivingIndex: 0.80, permitBurden: 0.92, urbanDensity: 0.95, climateComplexity: 0.95, compositeIndex: ci(0.70, 0.80, 0.92, 0.95, 0.95) },
  { cbsaCode: "RURAL-KY", name: "Rural Kentucky", state: "KY", laborIndex: 0.78, costOfLivingIndex: 0.83, permitBurden: 0.94, urbanDensity: 0.95, climateComplexity: 1.04, compositeIndex: ci(0.78, 0.83, 0.94, 0.95, 1.04) },
  { cbsaCode: "RURAL-WV", name: "Rural West Virginia", state: "WV", laborIndex: 0.76, costOfLivingIndex: 0.82, permitBurden: 0.94, urbanDensity: 0.95, climateComplexity: 1.06, compositeIndex: ci(0.76, 0.82, 0.94, 0.95, 1.06) },

  // Northeast Rural
  { cbsaCode: "RURAL-NY", name: "Rural New York", state: "NY", laborIndex: 0.98, costOfLivingIndex: 0.92, permitBurden: 1.02, urbanDensity: 0.95, climateComplexity: 1.10, compositeIndex: ci(0.98, 0.92, 1.02, 0.95, 1.10) },
  { cbsaCode: "RURAL-NJ", name: "Rural New Jersey", state: "NJ", laborIndex: 1.12, costOfLivingIndex: 1.02, permitBurden: 1.06, urbanDensity: 0.96, climateComplexity: 1.04, compositeIndex: ci(1.12, 1.02, 1.06, 0.96, 1.04) },
  { cbsaCode: "RURAL-PA", name: "Rural Pennsylvania", state: "PA", laborIndex: 0.90, costOfLivingIndex: 0.88, permitBurden: 0.98, urbanDensity: 0.95, climateComplexity: 1.08, compositeIndex: ci(0.90, 0.88, 0.98, 0.95, 1.08) },
  { cbsaCode: "RURAL-CT", name: "Rural Connecticut", state: "CT", laborIndex: 1.15, costOfLivingIndex: 1.06, permitBurden: 1.04, urbanDensity: 0.96, climateComplexity: 1.08, compositeIndex: ci(1.15, 1.06, 1.04, 0.96, 1.08) },
  { cbsaCode: "RURAL-MA", name: "Rural Massachusetts", state: "MA", laborIndex: 1.12, costOfLivingIndex: 1.04, permitBurden: 1.04, urbanDensity: 0.96, climateComplexity: 1.08, compositeIndex: ci(1.12, 1.04, 1.04, 0.96, 1.08) },
  { cbsaCode: "RURAL-RI", name: "Rural Rhode Island", state: "RI", laborIndex: 1.10, costOfLivingIndex: 1.02, permitBurden: 1.04, urbanDensity: 0.96, climateComplexity: 1.06, compositeIndex: ci(1.10, 1.02, 1.04, 0.96, 1.06) },
  { cbsaCode: "RURAL-NH", name: "Rural New Hampshire", state: "NH", laborIndex: 1.05, costOfLivingIndex: 1.00, permitBurden: 0.98, urbanDensity: 0.95, climateComplexity: 1.10, compositeIndex: ci(1.05, 1.00, 0.98, 0.95, 1.10) },
  { cbsaCode: "RURAL-VT", name: "Rural Vermont", state: "VT", laborIndex: 1.00, costOfLivingIndex: 0.98, permitBurden: 1.00, urbanDensity: 0.95, climateComplexity: 1.12, compositeIndex: ci(1.00, 0.98, 1.00, 0.95, 1.12) },
  { cbsaCode: "RURAL-ME", name: "Rural Maine", state: "ME", laborIndex: 0.92, costOfLivingIndex: 0.94, permitBurden: 0.98, urbanDensity: 0.95, climateComplexity: 1.12, compositeIndex: ci(0.92, 0.94, 0.98, 0.95, 1.12) },
  { cbsaCode: "RURAL-MD", name: "Rural Maryland", state: "MD", laborIndex: 0.95, costOfLivingIndex: 0.94, permitBurden: 0.98, urbanDensity: 0.95, climateComplexity: 1.04, compositeIndex: ci(0.95, 0.94, 0.98, 0.95, 1.04) },
  { cbsaCode: "RURAL-DE", name: "Rural Delaware", state: "DE", laborIndex: 1.00, costOfLivingIndex: 0.98, permitBurden: 1.00, urbanDensity: 0.95, climateComplexity: 1.02, compositeIndex: ci(1.00, 0.98, 1.00, 0.95, 1.02) },
  { cbsaCode: "RURAL-DC", name: "Rural District of Columbia", state: "DC", laborIndex: 1.30, costOfLivingIndex: 1.15, permitBurden: 1.08, urbanDensity: 1.04, climateComplexity: 1.02, compositeIndex: ci(1.30, 1.15, 1.08, 1.04, 1.02) },
];

// Quick lookup by CBSA code
const _indexMap = new Map<string, CbsaCostEntry>();
export function lookupCbsaCost(cbsaCode: string): CbsaCostEntry | null {
  if (_indexMap.size === 0) {
    for (const entry of CBSA_COST_INDEX) _indexMap.set(entry.cbsaCode, entry);
  }
  return _indexMap.get(cbsaCode) ?? null;
}
