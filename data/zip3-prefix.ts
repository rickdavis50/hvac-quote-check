// 3-digit ZIP prefix → state + CBSA mapping
// Covers all ~900 active US ZIP prefixes
// Source: USPS prefix assignments + Census CBSA definitions
//
// Format: ZIP3_TO_STATE maps prefix ranges to 2-letter state codes
// ZIP3_TO_CBSA maps specific metro-area prefixes to CBSA codes
// Unknown prefixes fall back to RURAL-{state}

// ─── State from 3-digit prefix (range-based for compactness) ───

const STATE_RANGES: Array<[number, number, string]> = [
  // Northeast
  [5, 5, 'NY'],     // 005 (Schenectady area)
  [6, 9, 'PR'],     // Puerto Rico + VI
  [10, 14, 'MA'],   // 010-014 Springfield/Worcester
  [15, 16, 'CT'],   // 015-016 (shared)
  [17, 17, 'MA'],   // 017
  [18, 19, 'RI'],   // 018-019 Providence
  [20, 20, 'NH'],   // 020 (shared w/ MA)
  [21, 21, 'MA'],   // 021 Boston
  [22, 22, 'MA'],   // 022 Boston suburbs
  [23, 24, 'MA'],   // 023-024
  [25, 26, 'MA'],   // 025-026 Cape Cod
  [27, 27, 'CT'],   // 027 (shared)
  [28, 29, 'RI'],   // 028-029
  [30, 30, 'NH'],   // 030 Manchester
  [31, 31, 'NH'],   // 031 Manchester
  [32, 33, 'NH'],   // 032-033
  [34, 34, 'NH'],   // 034
  [35, 35, 'VT'],   // 035 (shared)
  [36, 36, 'NH'],   // 036
  [37, 37, 'VT'],   // 037 (shared)
  [38, 38, 'NH'],   // 038
  [39, 39, 'ME'],   // 039 (shared)
  [40, 41, 'CT'],   // 040-041 (note: some ME)
  [42, 42, 'CT'],   // 042
  [43, 49, 'ME'],   // 043-049
  [50, 54, 'VT'],   // 050-054
  [55, 55, 'MA'],   // 055
  [56, 56, 'VT'],   // 056
  [57, 59, 'CT'],   // 057-059 (shared)
  [60, 69, 'CT'],   // 060-069
  [70, 89, 'NJ'],   // 070-089
  [90, 99, 'NY'],   // Military/APO (treat as NY for simplicity)

  // New York
  [100, 119, 'NY'],  // NYC area
  [120, 129, 'NY'],  // Albany area
  [130, 139, 'NY'],  // Syracuse area
  [140, 149, 'NY'],  // Buffalo area

  // Pennsylvania
  [150, 162, 'PA'],  // Pittsburgh area
  [163, 168, 'PA'],  // Central PA
  [169, 174, 'PA'],  // Harrisburg
  [175, 179, 'PA'],  // Allentown/Lehigh
  [180, 187, 'PA'],  // Northeast PA / Philly suburbs
  [188, 196, 'PA'],  // Philadelphia area

  // Delaware
  [197, 199, 'DE'],

  // DC / Maryland / Virginia
  [200, 205, 'DC'],
  [206, 212, 'MD'],
  [214, 219, 'MD'],
  [220, 246, 'VA'],

  // West Virginia
  [247, 268, 'WV'],

  // North Carolina
  [270, 289, 'NC'],

  // South Carolina
  [290, 299, 'SC'],

  // Georgia
  [300, 319, 'GA'],

  // Florida
  [320, 349, 'FL'],

  // Alabama
  [350, 369, 'AL'],

  // Tennessee
  [370, 385, 'TN'],

  // Mississippi
  [386, 397, 'MS'],

  // Kentucky
  [400, 427, 'KY'],

  // Ohio
  [430, 458, 'OH'],

  // Indiana
  [460, 479, 'IN'],

  // Michigan
  [480, 499, 'MI'],

  // Iowa
  [500, 528, 'IA'],

  // Wisconsin
  [530, 549, 'WI'],

  // Minnesota
  [550, 567, 'MN'],

  // South Dakota
  [570, 577, 'SD'],

  // North Dakota
  [580, 588, 'ND'],

  // Montana
  [590, 599, 'MT'],

  // Illinois
  [600, 629, 'IL'],

  // Missouri
  [630, 658, 'MO'],

  // Kansas
  [660, 679, 'KS'],

  // Nebraska
  [680, 693, 'NE'],

  // Louisiana
  [700, 714, 'LA'],

  // Arkansas
  [716, 729, 'AR'],

  // Oklahoma
  [730, 749, 'OK'],

  // Texas
  [750, 799, 'TX'],

  // Colorado
  [800, 816, 'CO'],

  // Wyoming
  [820, 831, 'WY'],

  // Idaho
  [832, 838, 'ID'],

  // Utah
  [840, 847, 'UT'],

  // Arizona
  [850, 865, 'AZ'],

  // New Mexico
  [870, 884, 'NM'],

  // Nevada
  [889, 898, 'NV'],

  // California
  [900, 935, 'CA'],
  [936, 966, 'CA'],

  // Hawaii
  [967, 968, 'HI'],

  // Oregon (Guam 969 treated as HI for simplicity)
  [969, 969, 'GU'],
  [970, 979, 'OR'],

  // Washington
  [980, 994, 'WA'],

  // Alaska
  [995, 999, 'AK'],
];

export function stateFromZip3(prefix: string): string | null {
  const num = parseInt(prefix, 10);
  if (isNaN(num)) return null;
  for (const [lo, hi, state] of STATE_RANGES) {
    if (num >= lo && num <= hi) return state;
  }
  return null;
}

// ─── 3-digit prefix → CBSA code for metro areas ───
// Only major metro prefixes are mapped; unlisted prefixes → RURAL-{state}

const ZIP3_CBSA: Record<string, string> = {
  // New York-Newark-Jersey City (35620)
  '100': '35620', '101': '35620', '102': '35620', '103': '35620', '104': '35620',
  '105': '35620', '106': '35620', '107': '35620', '108': '35620', '109': '35620',
  '110': '35620', '111': '35620', '112': '35620', '113': '35620', '114': '35620',
  '115': '35620', '116': '35620',
  '070': '35620', '071': '35620', '072': '35620', '073': '35620', '074': '35620',
  '075': '35620', '076': '35620', '077': '35620', '078': '35620', '079': '35620',

  // Boston-Cambridge-Newton (14460)
  '021': '14460', '022': '14460', '023': '14460', '024': '14460', '017': '14460',

  // Providence-Warwick (39300)
  '028': '39300', '029': '39300',

  // Hartford-East Hartford-Middletown (25540)
  '060': '25540', '061': '25540',

  // New Haven-Milford (35300)
  '064': '35300', '065': '35300',

  // Bridgeport-Stamford-Norwalk (14860)
  '066': '14860', '068': '14860', '069': '14860',

  // Albany-Schenectady-Troy (10580)
  '120': '10580', '121': '10580', '122': '10580', '123': '10580',

  // Syracuse (45060)
  '130': '45060', '131': '45060', '132': '45060',

  // Rochester (40380)
  '144': '40380', '145': '40380', '146': '40380',

  // Buffalo-Cheektowaga (15380)
  '140': '15380', '141': '15380', '142': '15380', '143': '15380',

  // Pittsburgh (38300)
  '150': '38300', '151': '38300', '152': '38300', '153': '38300',

  // Philadelphia-Camden-Wilmington (37980)
  '189': '37980', '190': '37980', '191': '37980', '192': '37980', '193': '37980',
  '080': '37980', '081': '37980', '082': '37980', '083': '37980',
  '197': '37980', '198': '37980',

  // Harrisburg-Carlisle (25420)
  '170': '25420', '171': '25420',

  // Allentown-Bethlehem-Easton (10900)
  '180': '10900', '181': '10900',

  // Scranton-Wilkes-Barre (42540)
  '184': '42540', '185': '42540', '186': '42540',

  // Washington-Arlington-Alexandria (47900)
  '200': '47900', '201': '47900', '202': '47900', '203': '47900', '204': '47900', '205': '47900',
  '206': '47900', '207': '47900', '208': '47900', '209': '47900',
  '220': '47900', '221': '47900', '222': '47900', '223': '47900',

  // Baltimore-Columbia-Towson (12580)
  '210': '12580', '211': '12580', '212': '12580', '214': '12580',

  // Richmond (40060)
  '230': '40060', '231': '40060', '232': '40060',

  // Virginia Beach-Norfolk-Newport News (47260)
  '233': '47260', '234': '47260', '235': '47260', '236': '47260',

  // Raleigh-Cary (39580)
  '275': '39580', '276': '39580',

  // Charlotte-Concord-Gastonia (16740)
  '280': '16740', '281': '16740', '282': '16740',

  // Durham-Chapel Hill (20500)
  '277': '20500',

  // Greensboro-High Point (24660)
  '270': '24660', '271': '24660', '272': '24660',

  // Charleston-North Charleston (16700) SC
  '294': '16700',

  // Columbia (17900) SC
  '290': '17900', '291': '17900', '292': '17900',

  // Greenville-Anderson (24860) SC
  '296': '24860',

  // Atlanta-Sandy Springs-Alpharetta (12060)
  '300': '12060', '301': '12060', '302': '12060', '303': '12060',
  '304': '12060', '305': '12060', '306': '12060',

  // Savannah (42340) GA
  '313': '42340', '314': '42340',

  // Jacksonville (27260) FL
  '320': '27260', '321': '27260', '322': '27260',

  // Miami-Fort Lauderdale-Pompano Beach (33100)
  '330': '33100', '331': '33100', '332': '33100', '333': '33100', '334': '33100',

  // Orlando-Kissimmee-Sanford (36740)
  '327': '36740', '328': '36740', '347': '36740',

  // Tampa-St. Petersburg-Clearwater (45300)
  '335': '45300', '336': '45300', '337': '45300', '346': '45300',

  // Cape Coral-Fort Myers (15980)
  '339': '15980',

  // Sarasota-Bradenton (42200 — note: not same as Santa Maria)
  '342': '35840',

  // Naples-Marco Island (34940)
  '341': '34940',

  // Lakeland-Winter Haven (29460)
  '338': '29460',

  // Palm Bay-Melbourne-Titusville (37340)
  '329': '37340',

  // Pensacola-Ferry Pass-Brent (37860)
  '325': '37860',

  // Tallahassee (45220)
  '323': '45220',

  // Birmingham-Hoover (13820) AL
  '350': '13820', '351': '13820', '352': '13820',

  // Huntsville (26620) AL
  '357': '26620', '358': '26620',

  // Mobile (33660) AL
  '365': '33660', '366': '33660',

  // Montgomery (33860) AL
  '360': '33860', '361': '33860',

  // Nashville-Davidson-Murfreesboro (34980) TN
  '370': '34980', '371': '34980', '372': '34980',

  // Memphis (32820) TN
  '380': '32820', '381': '32820', '382': '32820',

  // Knoxville (28940) TN
  '377': '28940', '378': '28940', '379': '28940',

  // Chattanooga (16860) TN
  '373': '16860', '374': '16860',

  // Jackson (27140) MS
  '390': '27140', '391': '27140', '392': '27140',

  // Louisville-Jefferson County (31140) KY
  '400': '31140', '401': '31140', '402': '31140',

  // Lexington-Fayette (30460) KY
  '403': '30460', '404': '30460', '405': '30460',

  // Cincinnati (17140) OH/KY
  '410': '17140', '411': '17140', '412': '17140',
  '450': '17140', '451': '17140', '452': '17140',

  // Columbus (18140) OH
  '430': '18140', '431': '18140', '432': '18140', '433': '18140',

  // Cleveland-Elyria (17460) OH
  '440': '17460', '441': '17460', '442': '17460', '443': '17460', '444': '17460',

  // Dayton-Kettering (19380) OH
  '453': '19380', '454': '19380', '455': '19380',

  // Toledo (45780) OH
  '434': '45780', '435': '45780', '436': '45780',

  // Indianapolis-Carmel-Anderson (26900) IN
  '460': '26900', '461': '26900', '462': '26900',

  // Fort Wayne (23060) IN
  '467': '23060', '468': '23060',

  // South Bend-Mishawaka (43780)
  '465': '43780', '466': '43780',

  // Detroit-Warren-Dearborn (19820) MI
  '480': '19820', '481': '19820', '482': '19820', '483': '19820', '484': '19820', '485': '19820',

  // Grand Rapids-Kentwood (24340) MI
  '493': '24340', '494': '24340', '495': '24340',

  // Lansing-East Lansing (29620) MI
  '488': '29620', '489': '29620',

  // Des Moines-West Des Moines (19780) IA
  '500': '19780', '501': '19780', '502': '19780', '503': '19780',

  // Cedar Rapids (16300) IA
  '522': '16300', '523': '16300', '524': '16300',

  // Milwaukee-Waukesha (33340) WI
  '530': '33340', '531': '33340', '532': '33340', '534': '33340',

  // Madison (31540) WI
  '535': '31540', '536': '31540', '537': '31540',

  // Minneapolis-St. Paul-Bloomington (33460) MN
  '550': '33460', '551': '33460', '553': '33460', '554': '33460', '555': '33460', '556': '33460',

  // Sioux Falls (43620) SD
  '570': '43620', '571': '43620',

  // Fargo (22020) ND
  '580': '22020', '581': '22020',

  // Chicago-Naperville-Elgin (16980) IL
  '600': '16980', '601': '16980', '602': '16980', '603': '16980', '604': '16980', '605': '16980',
  '606': '16980', '607': '16980', '608': '16980',

  // Peoria (37900) IL
  '615': '37900', '616': '37900',

  // Springfield (44100) IL
  '625': '44100', '626': '44100', '627': '44100',

  // St. Louis (41180) MO/IL
  '620': '41180', '622': '41180',
  '630': '41180', '631': '41180', '633': '41180', '634': '41180',

  // Kansas City (28140) MO/KS
  '640': '28140', '641': '28140',
  '660': '28140', '661': '28140', '662': '28140',

  // Wichita (48620) KS
  '670': '48620', '671': '48620', '672': '48620',

  // Omaha-Council Bluffs (36540) NE
  '680': '36540', '681': '36540',
  '510': '36540', '511': '36540', '515': '36540', '516': '36540',

  // Lincoln (30700) NE
  '683': '30700', '684': '30700', '685': '30700',

  // New Orleans-Metairie (35380) LA
  '700': '35380', '701': '35380',

  // Baton Rouge (12940) LA
  '707': '12940', '708': '12940',

  // Shreveport-Bossier City (43340) LA
  '710': '43340', '711': '43340',

  // Little Rock-North Little Rock (30780) AR
  '720': '30780', '721': '30780', '722': '30780',

  // Oklahoma City (36420) OK
  '730': '36420', '731': '36420',

  // Tulsa (46140) OK
  '740': '46140', '741': '46140',

  // Dallas-Fort Worth-Arlington (19100) TX
  '750': '19100', '751': '19100', '752': '19100', '753': '19100',
  '760': '19100', '761': '19100', '762': '19100',

  // Houston-The Woodlands-Sugar Land (26420) TX
  '770': '26420', '771': '26420', '772': '26420', '773': '26420', '774': '26420', '775': '26420',

  // San Antonio-New Braunfels (41700) TX
  '780': '41700', '781': '41700', '782': '41700',

  // Austin-Round Rock-Georgetown (12420) TX
  '786': '12420', '787': '12420',

  // El Paso (21340) TX
  '798': '21340', '799': '21340',

  // McAllen-Edinburg-Mission (32580)
  '785': '32580',

  // Corpus Christi (18580) TX
  '783': '18580', '784': '18580',

  // Denver-Aurora-Lakewood (19740) CO
  '800': '19740', '801': '19740', '802': '19740', '803': '19740', '804': '19740', '805': '19740',

  // Colorado Springs (17820) CO
  '808': '17820', '809': '17820',

  // Salt Lake City (41620) UT
  '840': '41620', '841': '41620',

  // Provo-Orem (39340) UT
  '846': '39340',

  // Ogden-Clearfield (36260) UT
  '843': '36260', '844': '36260',

  // Phoenix-Mesa-Chandler (38060) AZ
  '850': '38060', '851': '38060', '852': '38060', '853': '38060',

  // Tucson (46060) AZ
  '856': '46060', '857': '46060',

  // Albuquerque (10740) NM
  '870': '10740', '871': '10740',

  // Las Vegas-Henderson-Paradise (29820) NV
  '889': '29820', '890': '29820', '891': '29820',

  // Reno-Sparks (39900) NV
  '893': '39900', '894': '39900', '895': '39900',

  // Los Angeles-Long Beach-Anaheim (31080) CA
  '900': '31080', '901': '31080', '902': '31080', '903': '31080', '904': '31080', '905': '31080',
  '906': '31080', '907': '31080', '908': '31080', '910': '31080', '911': '31080', '912': '31080',
  '913': '31080', '914': '31080', '915': '31080', '916': '31080', '917': '31080', '918': '31080',

  // Riverside-San Bernardino-Ontario (40140) CA
  '921': '40140', '922': '40140', '923': '40140', '924': '40140', '925': '40140',

  // San Diego-Chula Vista-Carlsbad (41740) CA
  '919': '41740', '920': '41740',

  // Oxnard-Thousand Oaks-Ventura (37100) CA
  '930': '37100',

  // Santa Barbara (42200 — Santa Maria-Santa Barbara)
  '931': '42200',

  // San Luis Obispo (42020)
  '934': '42020',

  // Bakersfield (12540) CA
  '932': '12540', '933': '12540',

  // Fresno (23420) CA
  '936': '23420', '937': '23420',

  // Stockton (46700) CA
  '952': '46700',

  // Modesto (33700) CA
  '953': '33700',

  // Sacramento-Roseville-Folsom (40900) CA
  '942': '40900', '956': '40900', '957': '40900', '958': '40900',

  // San Francisco-Oakland-Berkeley (41860) CA
  '940': '41860', '941': '41860', '943': '41860', '944': '41860', '945': '41860',
  '946': '41860', '947': '41860', '948': '41860', '949': '41860',

  // San Jose-Sunnyvale-Santa Clara (41940) CA
  '950': '41940', '951': '41940',

  // Note: Santa Rosa (42220), Napa (36140), Santa Cruz (42100) are smaller metros
  // within the 940-951 range. They share prefixes with SF/San Jose, so we map
  // to the dominant metro (SF/San Jose) for pricing purposes.

  // Honolulu (46520) HI
  '967': '46520', '968': '46520',

  // Portland-Vancouver-Hillsboro (38900) OR
  '970': '38900', '971': '38900', '972': '38900',

  // Salem (41420) OR
  '973': '41420',

  // Eugene-Springfield (21660) OR
  '974': '21660',

  // Medford (32780) OR
  '975': '32780',

  // Bend (13460) OR
  '977': '13460',

  // Seattle-Tacoma-Bellevue (42660) WA
  '980': '42660', '981': '42660', '982': '42660', '983': '42660', '984': '42660',

  // Spokane-Spokane Valley (44060) WA
  '990': '44060', '991': '44060', '992': '44060',

  // Anchorage (11260) AK
  '995': '11260', '996': '11260',
};

export function cbsaFromZip3(prefix: string): string | null {
  return ZIP3_CBSA[prefix] ?? null;
}

// ─── Climate region from state ───

const STATE_CLIMATE: Record<string, string> = {
  ME: 'northeast', NH: 'northeast', VT: 'northeast', MA: 'northeast',
  CT: 'northeast', RI: 'northeast', NY: 'northeast', NJ: 'northeast',
  PA: 'mid_atlantic', DE: 'mid_atlantic', MD: 'mid_atlantic', DC: 'mid_atlantic',
  VA: 'mid_atlantic', WV: 'mid_atlantic',
  NC: 'southeast', SC: 'southeast', GA: 'southeast', FL: 'southeast',
  AL: 'southeast', MS: 'southeast', TN: 'southeast',
  KY: 'midwest', OH: 'midwest', IN: 'midwest', MI: 'midwest',
  WI: 'midwest', IL: 'midwest', MN: 'midwest', IA: 'midwest',
  MO: 'midwest', ND: 'midwest', SD: 'midwest',
  NE: 'midwest', KS: 'midwest',
  TX: 'south_central', OK: 'south_central', AR: 'south_central', LA: 'south_central',
  CO: 'mountain', WY: 'mountain', MT: 'mountain', ID: 'mountain', UT: 'mountain',
  AZ: 'desert', NM: 'desert', NV: 'desert',
  CA: 'west_coast', HI: 'west_coast',
  OR: 'northwest', WA: 'northwest', AK: 'northwest',
  PR: 'southeast', GU: 'west_coast', VI: 'southeast',
};

export function climateFromState(state: string): string {
  return STATE_CLIMATE[state] ?? 'midwest';
}

// ─── Approximate centroid lat/lon by state (for nearby quote searches) ───

const STATE_CENTROIDS: Record<string, [number, number]> = {
  AL: [32.7, -86.7], AK: [64.2, -152.5], AZ: [34.0, -111.1], AR: [35.2, -91.8],
  CA: [36.8, -119.4], CO: [39.1, -105.4], CT: [41.6, -72.7], DE: [39.3, -75.5],
  FL: [27.8, -81.7], GA: [32.9, -83.4], HI: [19.9, -155.6], ID: [44.2, -114.4],
  IL: [40.3, -89.0], IN: [40.3, -86.1], IA: [42.0, -93.2], KS: [38.5, -98.0],
  KY: [37.8, -84.3], LA: [30.5, -91.2], ME: [45.3, -69.4], MD: [39.0, -76.6],
  MA: [42.4, -71.4], MI: [44.3, -84.5], MN: [46.7, -94.7], MS: [32.7, -89.5],
  MO: [38.5, -92.3], MT: [46.8, -110.4], NE: [41.1, -98.3], NV: [38.8, -116.4],
  NH: [43.5, -71.5], NJ: [40.1, -74.5], NM: [34.5, -105.9], NY: [42.2, -74.9],
  NC: [35.6, -79.0], ND: [47.5, -100.0], OH: [40.4, -82.7], OK: [35.0, -97.1],
  OR: [43.8, -120.6], PA: [41.2, -77.2], RI: [41.6, -71.5], SC: [34.0, -81.0],
  SD: [43.9, -99.4], TN: [35.7, -86.6], TX: [31.0, -97.6], UT: [39.3, -111.1],
  VT: [44.3, -72.6], VA: [37.4, -78.7], WA: [47.4, -120.7], WV: [38.6, -80.6],
  WI: [43.8, -88.8], WY: [43.1, -107.6], DC: [38.9, -77.0],
  PR: [18.2, -66.6], GU: [13.4, 144.8], VI: [18.3, -64.9],
};

export function centroidFromState(state: string): { lat: number; lon: number } {
  const c = STATE_CENTROIDS[state] ?? [39.8, -98.6]; // geographic center of US
  return { lat: c[0], lon: c[1] };
}
