// Run: npx tsx scripts/build-zip-cbsa-map.ts
// Requires: ANTHROPIC_API_KEY in .env
// Generates: data/zip-to-cbsa.json (~42k entries, ~3.4MB)
// Takes: ~20-30 minutes (rate-limited API calls)

import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT_PATH = join(ROOT, 'data', 'zip-to-cbsa.json');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ClimateZone =
  | 'northeast'
  | 'southeast'
  | 'midwest'
  | 'south_central'
  | 'mid_atlantic'
  | 'mountain'
  | 'desert'
  | 'west_coast'
  | 'northwest';

interface ZipEntry {
  cbsa: string;
  state: string;
  lat: number;
  lon: number;
  climate: ClimateZone;
}

type ZipMap = Record<string, ZipEntry>;

// ---------------------------------------------------------------------------
// Valid CBSA codes (extracted from data/cbsa-cost-index.ts)
// ---------------------------------------------------------------------------

const VALID_CBSA_CODES = new Set([
  "10180","10420","10500","10580","10740","10780","10900","11100","11180","11260",
  "11460","11500","11540","11700","12020","12060","12100","12220","12260","12420",
  "12540","12580","12620","12700","12940","12980","13140","13380","13460","13740",
  "13780","13820","13900","13980","14010","14020","14260","14460","14500","14540",
  "14740","14860","15180","15380","15500","15540","15940","15980","16180","16220",
  "16300","16540","16580","16620","16700","16740","16820","16860","16940","16980",
  "17020","17140","17420","17460","17660","17780","17820","17860","17900","17980",
  "18140","18180","18580","18700","19060","19100","19260","19340","19380","19460",
  "19500","19660","19740","19780","19820","20020","20100","20220","20260","20500",
  "20700","20740","20940","21060","21140","21300","21340","21500","21580","21660",
  "21780","21820","22020","22180","22220","22380","22420","22500","22520","22540",
  "22660","22900","23060","23420","23460","23540","23580","24020","24140","24220",
  "24260","24300","24340","24500","24540","24580","24660","24780","24860","25060",
  "25180","25260","25420","25500","25540","25620","25740","25860","25940","26100",
  "26380","26420","26580","26620","26820","26900","26980","27060","27140","27180",
  "27260","27340","27500","27740","27780","27860","27900","27980","28020","28060",
  "28100","28140","28420","28660","28700","28740","28940","29020","29100","29180",
  "29200","29340","29420","29460","29540","29620","29700","29740","29820","30020",
  "30140","30340","30460","30580","30620","30700","30780","30860","30980","31080",
  "31140","31180","31340","31420","31460","31540","31700","31740","31860","31900",
  "32580","32780","32820","32900","33100","33260","33340","33460","33540","33660",
  "33700","33740","33860","34060","34620","34740","34820","34940","34980","35100",
  "35300","35380","35580","35620","35840","35980","36084","36100","36140","36220",
  "36260","36350","36420","36500","36540","36740","36780","36980","37100","37340",
  "37380","37620","37860","37900","37980","38060","38220","38300","38340","38460",
  "38540","38860","38900","38940","39150","39260","39300","39340","39460","39540",
  "39580","39660","39740","39820","39900","40060","40140","40220","40340","40380",
  "40420","40580","40900","40980","41060","41100","41140","41180","41420","41540",
  "41620","41660","41700","41740","41860","41940","42020","42100","42140","42200",
  "42220","42340","42540","42660","43100","43300","43340","43420","43580","43620",
  "43780","43900","44060","44100","44140","44180","44300","44420","44940","45060",
  "45220","45300","45460","45500","45580","45780","45820","45940","46020","46060",
  "46140","46180","46220","46300","46340","46520","46540","46660","46700","47020",
  "47220","47260","47300","47380","47580","47860","47900","47940","48060","48140",
  "48260","48620","48660","48700","48900","48980","49340","49420","49620","49660",
  "49700","49740","73450",
]);

const VALID_CLIMATES = new Set<string>([
  'northeast', 'southeast', 'midwest', 'south_central',
  'mid_atlantic', 'mountain', 'desert', 'west_coast', 'northwest',
]);

// ---------------------------------------------------------------------------
// 3-digit prefix → state/region hints
// This helps Claude produce accurate data by providing geographic context.
// Ranges are approximate; some prefixes span state lines.
// ---------------------------------------------------------------------------

interface PrefixRegion {
  state: string;       // Primary state abbreviation(s)
  region: string;      // Human-readable region hint for the prompt
  climate: ClimateZone; // Default climate for the region
}

// Map of 3-digit prefix (as number) to region hint
const PREFIX_REGIONS: Record<string, PrefixRegion> = {
  // New England
  "010": { state: "MA", region: "Springfield MA area", climate: "northeast" },
  "011": { state: "MA", region: "Springfield MA area", climate: "northeast" },
  "012": { state: "MA", region: "Pittsfield MA area", climate: "northeast" },
  "013": { state: "MA", region: "Central MA (Worcester area)", climate: "northeast" },
  "014": { state: "MA", region: "Central MA (Worcester area)", climate: "northeast" },
  "015": { state: "MA", region: "Worcester MA area", climate: "northeast" },
  "016": { state: "MA", region: "Worcester/Fitchburg MA", climate: "northeast" },
  "017": { state: "MA", region: "Framingham/Waltham MA", climate: "northeast" },
  "018": { state: "MA", region: "Lowell/Lawrence MA", climate: "northeast" },
  "019": { state: "MA", region: "Lynn/Salem MA North Shore", climate: "northeast" },
  "020": { state: "MA", region: "Boston MA area", climate: "northeast" },
  "021": { state: "MA", region: "Boston MA city", climate: "northeast" },
  "022": { state: "MA", region: "Boston MA area", climate: "northeast" },
  "023": { state: "MA", region: "Brockton/Taunton MA South Shore", climate: "northeast" },
  "024": { state: "MA", region: "Cape Cod MA", climate: "northeast" },
  "025": { state: "MA", region: "Cape Cod/Martha's Vineyard MA", climate: "northeast" },
  "026": { state: "MA", region: "Martha's Vineyard/Nantucket MA", climate: "northeast" },
  "027": { state: "MA", region: "Providence RI area", climate: "northeast" },
  "028": { state: "RI", region: "Providence RI area", climate: "northeast" },
  "029": { state: "RI", region: "Providence RI area", climate: "northeast" },
  "030": { state: "NH", region: "Manchester NH area", climate: "northeast" },
  "031": { state: "NH", region: "Manchester NH area", climate: "northeast" },
  "032": { state: "NH", region: "Concord NH area", climate: "northeast" },
  "033": { state: "NH", region: "Concord/Laconia NH", climate: "northeast" },
  "034": { state: "NH", region: "Keene NH area", climate: "northeast" },
  "035": { state: "NH", region: "Littleton NH area", climate: "northeast" },
  "036": { state: "NH", region: "North Conway NH area", climate: "northeast" },
  "037": { state: "NH", region: "Claremont NH area", climate: "northeast" },
  "038": { state: "NH", region: "Portsmouth NH area", climate: "northeast" },
  "039": { state: "ME", region: "Kittery/Portsmouth ME", climate: "northeast" },
  "040": { state: "ME", region: "Portland ME area", climate: "northeast" },
  "041": { state: "ME", region: "Portland ME area", climate: "northeast" },
  "042": { state: "ME", region: "Auburn/Lewiston ME", climate: "northeast" },
  "043": { state: "ME", region: "Augusta ME area", climate: "northeast" },
  "044": { state: "ME", region: "Bangor ME area", climate: "northeast" },
  "045": { state: "ME", region: "Bath ME coastal", climate: "northeast" },
  "046": { state: "ME", region: "Rockland ME coastal", climate: "northeast" },
  "047": { state: "ME", region: "Houlton ME northern", climate: "northeast" },
  "048": { state: "ME", region: "Rockland ME coastal", climate: "northeast" },
  "049": { state: "ME", region: "Waterville ME area", climate: "northeast" },
  "050": { state: "VT", region: "White River Junction VT", climate: "northeast" },
  "051": { state: "VT", region: "Bellows Falls VT", climate: "northeast" },
  "052": { state: "VT", region: "Bennington VT area", climate: "northeast" },
  "053": { state: "VT", region: "Brattleboro VT area", climate: "northeast" },
  "054": { state: "VT", region: "Burlington VT area", climate: "northeast" },
  "056": { state: "VT", region: "Montpelier VT area", climate: "northeast" },
  "057": { state: "VT", region: "Rutland VT area", climate: "northeast" },
  "058": { state: "VT", region: "St. Johnsbury VT area", climate: "northeast" },
  "059": { state: "VT", region: "St. Albans VT area", climate: "northeast" },
  "060": { state: "CT", region: "Hartford CT area", climate: "northeast" },
  "061": { state: "CT", region: "Hartford CT area", climate: "northeast" },
  "062": { state: "CT", region: "Hartford CT area", climate: "northeast" },
  "063": { state: "CT", region: "New Haven CT area", climate: "northeast" },
  "064": { state: "CT", region: "New Haven CT area", climate: "northeast" },
  "065": { state: "CT", region: "New Haven CT area", climate: "northeast" },
  "066": { state: "CT", region: "Bridgeport/Stamford CT", climate: "northeast" },
  "067": { state: "CT", region: "Waterbury CT area", climate: "northeast" },
  "068": { state: "CT", region: "Norwalk/Stamford CT", climate: "northeast" },
  "069": { state: "CT", region: "Greenwich CT area", climate: "northeast" },
  // Mid-Atlantic
  "070": { state: "NJ", region: "Newark/Jersey City NJ", climate: "mid_atlantic" },
  "071": { state: "NJ", region: "Newark NJ area", climate: "mid_atlantic" },
  "072": { state: "NJ", region: "Elizabeth NJ area", climate: "mid_atlantic" },
  "073": { state: "NJ", region: "Jersey City NJ area", climate: "mid_atlantic" },
  "074": { state: "NJ", region: "Paterson NJ area", climate: "mid_atlantic" },
  "075": { state: "NJ", region: "Paterson NJ area", climate: "mid_atlantic" },
  "076": { state: "NJ", region: "Hackensack NJ area", climate: "mid_atlantic" },
  "077": { state: "NJ", region: "Long Branch NJ area", climate: "mid_atlantic" },
  "078": { state: "NJ", region: "Dover NJ area", climate: "mid_atlantic" },
  "079": { state: "NJ", region: "Summit NJ area", climate: "mid_atlantic" },
  "080": { state: "NJ", region: "South Jersey/Camden NJ", climate: "mid_atlantic" },
  "081": { state: "NJ", region: "Camden NJ area", climate: "mid_atlantic" },
  "082": { state: "NJ", region: "Atlantic City NJ area", climate: "mid_atlantic" },
  "083": { state: "NJ", region: "Vineland NJ area", climate: "mid_atlantic" },
  "084": { state: "NJ", region: "Atlantic City NJ area", climate: "mid_atlantic" },
  "085": { state: "NJ", region: "Trenton NJ area", climate: "mid_atlantic" },
  "086": { state: "NJ", region: "Trenton NJ area", climate: "mid_atlantic" },
  "087": { state: "NJ", region: "Trenton NJ area", climate: "mid_atlantic" },
  "088": { state: "NJ", region: "New Brunswick NJ area", climate: "mid_atlantic" },
  "089": { state: "NJ", region: "New Brunswick NJ area", climate: "mid_atlantic" },
  "100": { state: "NY", region: "New York City Manhattan", climate: "northeast" },
  "101": { state: "NY", region: "New York City Manhattan", climate: "northeast" },
  "102": { state: "NY", region: "New York City Manhattan", climate: "northeast" },
  "103": { state: "NY", region: "Staten Island NY", climate: "northeast" },
  "104": { state: "NY", region: "Bronx NY", climate: "northeast" },
  "105": { state: "NY", region: "Westchester NY (Yonkers/White Plains)", climate: "northeast" },
  "106": { state: "NY", region: "Westchester NY (White Plains)", climate: "northeast" },
  "107": { state: "NY", region: "Westchester NY (Yonkers)", climate: "northeast" },
  "108": { state: "NY", region: "Westchester NY", climate: "northeast" },
  "109": { state: "NY", region: "Westchester NY (Ossining)", climate: "northeast" },
  "110": { state: "NY", region: "Queens NY", climate: "northeast" },
  "111": { state: "NY", region: "Queens NY (Long Island City)", climate: "northeast" },
  "112": { state: "NY", region: "Brooklyn NY", climate: "northeast" },
  "113": { state: "NY", region: "Queens NY (Flushing)", climate: "northeast" },
  "114": { state: "NY", region: "Queens NY (Jamaica)", climate: "northeast" },
  "115": { state: "NY", region: "Nassau County NY (Long Island)", climate: "northeast" },
  "116": { state: "NY", region: "Nassau County NY (Long Island)", climate: "northeast" },
  "117": { state: "NY", region: "Suffolk County NY (Long Island)", climate: "northeast" },
  "118": { state: "NY", region: "Suffolk County NY (Long Island)", climate: "northeast" },
  "119": { state: "NY", region: "Suffolk County NY (Long Island)", climate: "northeast" },
  "120": { state: "NY", region: "Albany NY area", climate: "northeast" },
  "121": { state: "NY", region: "Albany NY area", climate: "northeast" },
  "122": { state: "NY", region: "Albany NY area", climate: "northeast" },
  "123": { state: "NY", region: "Schenectady NY area", climate: "northeast" },
  "124": { state: "NY", region: "Kingston/Poughkeepsie NY", climate: "northeast" },
  "125": { state: "NY", region: "Poughkeepsie NY area", climate: "northeast" },
  "126": { state: "NY", region: "Poughkeepsie NY area", climate: "northeast" },
  "127": { state: "NY", region: "Monticello NY area", climate: "northeast" },
  "128": { state: "NY", region: "Glens Falls NY area", climate: "northeast" },
  "129": { state: "NY", region: "Plattsburgh NY area", climate: "northeast" },
  "130": { state: "NY", region: "Syracuse NY area", climate: "northeast" },
  "131": { state: "NY", region: "Syracuse NY area", climate: "northeast" },
  "132": { state: "NY", region: "Syracuse NY area", climate: "northeast" },
  "133": { state: "NY", region: "Utica NY area", climate: "northeast" },
  "134": { state: "NY", region: "Utica NY area", climate: "northeast" },
  "135": { state: "NY", region: "Watertown NY area", climate: "northeast" },
  "136": { state: "NY", region: "Watertown NY area", climate: "northeast" },
  "137": { state: "NY", region: "Binghamton NY area", climate: "northeast" },
  "138": { state: "NY", region: "Binghamton NY area", climate: "northeast" },
  "139": { state: "NY", region: "Elmira NY area", climate: "northeast" },
  "140": { state: "NY", region: "Buffalo NY area", climate: "northeast" },
  "141": { state: "NY", region: "Buffalo NY area", climate: "northeast" },
  "142": { state: "NY", region: "Buffalo NY area", climate: "northeast" },
  "143": { state: "NY", region: "Niagara Falls NY area", climate: "northeast" },
  "144": { state: "NY", region: "Rochester NY area", climate: "northeast" },
  "145": { state: "NY", region: "Rochester NY area", climate: "northeast" },
  "146": { state: "NY", region: "Rochester NY area", climate: "northeast" },
  "147": { state: "NY", region: "Corning NY area", climate: "northeast" },
  "148": { state: "NY", region: "Ithaca NY area", climate: "northeast" },
  "149": { state: "NY", region: "Elmira NY area", climate: "northeast" },
  "150": { state: "PA", region: "Pittsburgh PA area", climate: "mid_atlantic" },
  "151": { state: "PA", region: "Pittsburgh PA area", climate: "mid_atlantic" },
  "152": { state: "PA", region: "Pittsburgh PA area", climate: "mid_atlantic" },
  "153": { state: "PA", region: "Pittsburgh PA area", climate: "mid_atlantic" },
  "154": { state: "PA", region: "Pittsburgh PA area", climate: "mid_atlantic" },
  "155": { state: "PA", region: "Greensburg PA area", climate: "mid_atlantic" },
  "156": { state: "PA", region: "Greensburg PA area", climate: "mid_atlantic" },
  "157": { state: "PA", region: "Indiana PA area", climate: "mid_atlantic" },
  "158": { state: "PA", region: "DuBois PA area", climate: "mid_atlantic" },
  "159": { state: "PA", region: "Johnstown PA area", climate: "mid_atlantic" },
  "160": { state: "PA", region: "Butler PA area", climate: "mid_atlantic" },
  "161": { state: "PA", region: "New Castle PA area", climate: "mid_atlantic" },
  "162": { state: "PA", region: "Kittanning PA area", climate: "mid_atlantic" },
  "163": { state: "PA", region: "Oil City PA area", climate: "mid_atlantic" },
  "164": { state: "PA", region: "Erie PA area", climate: "mid_atlantic" },
  "165": { state: "PA", region: "Erie PA area", climate: "mid_atlantic" },
  "166": { state: "PA", region: "Altoona PA area", climate: "mid_atlantic" },
  "167": { state: "PA", region: "Bradford PA area", climate: "mid_atlantic" },
  "168": { state: "PA", region: "State College PA area", climate: "mid_atlantic" },
  "169": { state: "PA", region: "Wellsboro PA area", climate: "mid_atlantic" },
  "170": { state: "PA", region: "Harrisburg PA area", climate: "mid_atlantic" },
  "171": { state: "PA", region: "Harrisburg PA area", climate: "mid_atlantic" },
  "172": { state: "PA", region: "Harrisburg PA area", climate: "mid_atlantic" },
  "173": { state: "PA", region: "York PA area", climate: "mid_atlantic" },
  "174": { state: "PA", region: "York PA area", climate: "mid_atlantic" },
  "175": { state: "PA", region: "Lancaster PA area", climate: "mid_atlantic" },
  "176": { state: "PA", region: "Lancaster PA area", climate: "mid_atlantic" },
  "177": { state: "PA", region: "Williamsport PA area", climate: "mid_atlantic" },
  "178": { state: "PA", region: "Sunbury PA area", climate: "mid_atlantic" },
  "179": { state: "PA", region: "Pottsville PA area", climate: "mid_atlantic" },
  "180": { state: "PA", region: "Allentown/Bethlehem PA area", climate: "mid_atlantic" },
  "181": { state: "PA", region: "Allentown PA area", climate: "mid_atlantic" },
  "182": { state: "PA", region: "Hazleton PA area", climate: "mid_atlantic" },
  "183": { state: "PA", region: "Stroudsburg PA area", climate: "mid_atlantic" },
  "184": { state: "PA", region: "Scranton PA area", climate: "mid_atlantic" },
  "185": { state: "PA", region: "Scranton PA area", climate: "mid_atlantic" },
  "186": { state: "PA", region: "Wilkes-Barre PA area", climate: "mid_atlantic" },
  "187": { state: "PA", region: "Wilkes-Barre PA area", climate: "mid_atlantic" },
  "188": { state: "PA", region: "Montrose PA area", climate: "mid_atlantic" },
  "189": { state: "PA", region: "Doylestown PA area (Philadelphia suburbs)", climate: "mid_atlantic" },
  "190": { state: "PA", region: "Philadelphia PA area", climate: "mid_atlantic" },
  "191": { state: "PA", region: "Philadelphia PA area", climate: "mid_atlantic" },
  "192": { state: "PA", region: "Philadelphia PA suburbs", climate: "mid_atlantic" },
  "193": { state: "PA", region: "Chester/Delaware County PA", climate: "mid_atlantic" },
  "194": { state: "PA", region: "Philadelphia suburbs (Norristown)", climate: "mid_atlantic" },
  "195": { state: "PA", region: "Reading PA area", climate: "mid_atlantic" },
  "196": { state: "PA", region: "Reading PA area", climate: "mid_atlantic" },
  // Delaware & Maryland
  "197": { state: "DE", region: "Wilmington DE area", climate: "mid_atlantic" },
  "198": { state: "DE", region: "Wilmington DE area", climate: "mid_atlantic" },
  "199": { state: "DE", region: "Dover DE area", climate: "mid_atlantic" },
  "200": { state: "DC", region: "Washington DC", climate: "mid_atlantic" },
  "201": { state: "DC", region: "Washington DC area", climate: "mid_atlantic" },
  "202": { state: "DC", region: "Washington DC", climate: "mid_atlantic" },
  "203": { state: "DC", region: "Washington DC", climate: "mid_atlantic" },
  "204": { state: "DC", region: "Washington DC area", climate: "mid_atlantic" },
  "205": { state: "DC", region: "Washington DC area", climate: "mid_atlantic" },
  "206": { state: "MD", region: "Maryland suburbs DC (Waldorf)", climate: "mid_atlantic" },
  "207": { state: "MD", region: "Maryland suburbs DC (College Park)", climate: "mid_atlantic" },
  "208": { state: "MD", region: "Maryland suburbs DC (Rockville/Bethesda)", climate: "mid_atlantic" },
  "209": { state: "MD", region: "Maryland suburbs DC (Silver Spring)", climate: "mid_atlantic" },
  "210": { state: "MD", region: "Baltimore MD area", climate: "mid_atlantic" },
  "211": { state: "MD", region: "Baltimore MD area", climate: "mid_atlantic" },
  "212": { state: "MD", region: "Baltimore MD area", climate: "mid_atlantic" },
  "213": { state: "MD", region: "Cumberland MD area", climate: "mid_atlantic" },
  "214": { state: "MD", region: "Annapolis MD area", climate: "mid_atlantic" },
  "215": { state: "MD", region: "Salisbury MD area", climate: "mid_atlantic" },
  "216": { state: "MD", region: "Easton MD Eastern Shore", climate: "mid_atlantic" },
  "217": { state: "MD", region: "Hagerstown MD area", climate: "mid_atlantic" },
  "218": { state: "MD", region: "Salisbury MD area", climate: "mid_atlantic" },
  "219": { state: "MD", region: "Elkton MD area", climate: "mid_atlantic" },
  // Virginia
  "220": { state: "VA", region: "Northern Virginia (Fairfax/Arlington)", climate: "mid_atlantic" },
  "221": { state: "VA", region: "Northern Virginia (Alexandria)", climate: "mid_atlantic" },
  "222": { state: "VA", region: "Northern Virginia (Arlington)", climate: "mid_atlantic" },
  "223": { state: "VA", region: "Northern Virginia (Fairfax)", climate: "mid_atlantic" },
  "224": { state: "VA", region: "Northern Virginia (Fredericksburg)", climate: "mid_atlantic" },
  "225": { state: "VA", region: "Northern Virginia (Culpeper)", climate: "mid_atlantic" },
  "226": { state: "VA", region: "Northern Virginia (Winchester)", climate: "mid_atlantic" },
  "227": { state: "VA", region: "Northern Virginia (Culpeper)", climate: "mid_atlantic" },
  "228": { state: "VA", region: "Northern Virginia (Harrisonburg)", climate: "mid_atlantic" },
  "229": { state: "VA", region: "Charlottesville VA area", climate: "mid_atlantic" },
  "230": { state: "VA", region: "Richmond VA area", climate: "mid_atlantic" },
  "231": { state: "VA", region: "Richmond VA area", climate: "mid_atlantic" },
  "232": { state: "VA", region: "Richmond VA area", climate: "mid_atlantic" },
  "233": { state: "VA", region: "Norfolk/Virginia Beach VA area", climate: "mid_atlantic" },
  "234": { state: "VA", region: "Norfolk VA area", climate: "mid_atlantic" },
  "235": { state: "VA", region: "Norfolk VA area", climate: "mid_atlantic" },
  "236": { state: "VA", region: "Norfolk/Virginia Beach VA", climate: "mid_atlantic" },
  "237": { state: "VA", region: "Portsmouth VA area", climate: "mid_atlantic" },
  "238": { state: "VA", region: "Richmond VA area", climate: "mid_atlantic" },
  "239": { state: "VA", region: "Farmville VA area", climate: "mid_atlantic" },
  "240": { state: "VA", region: "Roanoke VA area", climate: "mid_atlantic" },
  "241": { state: "VA", region: "Roanoke VA area", climate: "mid_atlantic" },
  "242": { state: "VA", region: "Bristol VA area", climate: "mid_atlantic" },
  "243": { state: "VA", region: "Pulaski VA area", climate: "mid_atlantic" },
  "244": { state: "VA", region: "Staunton VA area", climate: "mid_atlantic" },
  "245": { state: "VA", region: "Lynchburg VA area", climate: "mid_atlantic" },
  "246": { state: "VA", region: "Bluefield VA/WV area", climate: "mid_atlantic" },
  // West Virginia
  "247": { state: "WV", region: "Bluefield WV area", climate: "mid_atlantic" },
  "248": { state: "WV", region: "Bluefield WV area", climate: "mid_atlantic" },
  "249": { state: "WV", region: "Lewisburg WV area", climate: "mid_atlantic" },
  "250": { state: "WV", region: "Charleston WV area", climate: "mid_atlantic" },
  "251": { state: "WV", region: "Charleston WV area", climate: "mid_atlantic" },
  "252": { state: "WV", region: "Charleston WV area", climate: "mid_atlantic" },
  "253": { state: "WV", region: "Charleston WV area", climate: "mid_atlantic" },
  "254": { state: "WV", region: "Martinsburg WV area", climate: "mid_atlantic" },
  "255": { state: "WV", region: "Huntington WV area", climate: "mid_atlantic" },
  "256": { state: "WV", region: "Huntington WV area", climate: "mid_atlantic" },
  "257": { state: "WV", region: "Huntington WV area", climate: "mid_atlantic" },
  "258": { state: "WV", region: "Beckley WV area", climate: "mid_atlantic" },
  "259": { state: "WV", region: "Beckley WV area", climate: "mid_atlantic" },
  "260": { state: "WV", region: "Wheeling WV area", climate: "mid_atlantic" },
  "261": { state: "WV", region: "Wheeling WV area", climate: "mid_atlantic" },
  "262": { state: "WV", region: "Buckhannon WV area", climate: "mid_atlantic" },
  "263": { state: "WV", region: "Clarksburg WV area", climate: "mid_atlantic" },
  "264": { state: "WV", region: "Clarksburg WV area", climate: "mid_atlantic" },
  "265": { state: "WV", region: "Morgantown WV area", climate: "mid_atlantic" },
  "266": { state: "WV", region: "Morgantown WV area", climate: "mid_atlantic" },
  "267": { state: "WV", region: "Cumberland MD/WV area", climate: "mid_atlantic" },
  "268": { state: "WV", region: "Petersburg WV area", climate: "mid_atlantic" },
  // North Carolina
  "270": { state: "NC", region: "Greensboro NC area", climate: "southeast" },
  "271": { state: "NC", region: "Winston-Salem NC area", climate: "southeast" },
  "272": { state: "NC", region: "Greensboro NC area", climate: "southeast" },
  "273": { state: "NC", region: "Greensboro NC area", climate: "southeast" },
  "274": { state: "NC", region: "High Point NC area", climate: "southeast" },
  "275": { state: "NC", region: "Raleigh NC area", climate: "southeast" },
  "276": { state: "NC", region: "Raleigh/Durham NC area", climate: "southeast" },
  "277": { state: "NC", region: "Durham NC area", climate: "southeast" },
  "278": { state: "NC", region: "Rocky Mount NC area", climate: "southeast" },
  "279": { state: "NC", region: "Elizabeth City NC area", climate: "southeast" },
  "280": { state: "NC", region: "Charlotte NC area", climate: "southeast" },
  "281": { state: "NC", region: "Charlotte NC area", climate: "southeast" },
  "282": { state: "NC", region: "Charlotte NC area", climate: "southeast" },
  "283": { state: "NC", region: "Fayetteville NC area", climate: "southeast" },
  "284": { state: "NC", region: "Fayetteville NC area", climate: "southeast" },
  "285": { state: "NC", region: "Kinston NC area", climate: "southeast" },
  "286": { state: "NC", region: "Hickory NC area", climate: "southeast" },
  "287": { state: "NC", region: "Asheville NC area", climate: "southeast" },
  "288": { state: "NC", region: "Gastonia NC area", climate: "southeast" },
  "289": { state: "NC", region: "Murphy NC area (western mountains)", climate: "southeast" },
  // South Carolina
  "290": { state: "SC", region: "Columbia SC area", climate: "southeast" },
  "291": { state: "SC", region: "Columbia SC area", climate: "southeast" },
  "292": { state: "SC", region: "Columbia SC area", climate: "southeast" },
  "293": { state: "SC", region: "Spartanburg SC area", climate: "southeast" },
  "294": { state: "SC", region: "Charleston SC area", climate: "southeast" },
  "295": { state: "SC", region: "Florence SC area", climate: "southeast" },
  "296": { state: "SC", region: "Greenville SC area", climate: "southeast" },
  "297": { state: "SC", region: "Rock Hill/York County SC", climate: "southeast" },
  "298": { state: "SC", region: "Aiken SC area", climate: "southeast" },
  "299": { state: "SC", region: "Beaufort SC area", climate: "southeast" },
  // Georgia
  "300": { state: "GA", region: "Atlanta GA area", climate: "southeast" },
  "301": { state: "GA", region: "Atlanta GA area", climate: "southeast" },
  "302": { state: "GA", region: "Atlanta GA area", climate: "southeast" },
  "303": { state: "GA", region: "Atlanta GA area", climate: "southeast" },
  "304": { state: "GA", region: "Atlanta GA suburbs (Marietta)", climate: "southeast" },
  "305": { state: "GA", region: "Atlanta GA suburbs (Cumming)", climate: "southeast" },
  "306": { state: "GA", region: "Atlanta GA suburbs (Gainesville)", climate: "southeast" },
  "307": { state: "GA", region: "Dalton GA area", climate: "southeast" },
  "308": { state: "GA", region: "Augusta GA area", climate: "southeast" },
  "309": { state: "GA", region: "Augusta GA area", climate: "southeast" },
  "310": { state: "GA", region: "Macon GA area", climate: "southeast" },
  "311": { state: "GA", region: "Macon GA area", climate: "southeast" },
  "312": { state: "GA", region: "Macon GA area", climate: "southeast" },
  "313": { state: "GA", region: "Savannah GA area", climate: "southeast" },
  "314": { state: "GA", region: "Savannah GA area", climate: "southeast" },
  "315": { state: "GA", region: "Waycross GA area", climate: "southeast" },
  "316": { state: "GA", region: "Valdosta GA area", climate: "southeast" },
  "317": { state: "GA", region: "Albany GA area", climate: "southeast" },
  "318": { state: "GA", region: "Columbus GA area", climate: "southeast" },
  "319": { state: "GA", region: "Columbus GA area", climate: "southeast" },
  // Florida
  "320": { state: "FL", region: "Jacksonville FL area", climate: "southeast" },
  "321": { state: "FL", region: "Daytona Beach FL area", climate: "southeast" },
  "322": { state: "FL", region: "Jacksonville FL area", climate: "southeast" },
  "323": { state: "FL", region: "Tallahassee FL area", climate: "southeast" },
  "324": { state: "FL", region: "Panama City FL area", climate: "southeast" },
  "325": { state: "FL", region: "Pensacola FL area", climate: "southeast" },
  "326": { state: "FL", region: "Gainesville FL area", climate: "southeast" },
  "327": { state: "FL", region: "Orlando FL area", climate: "southeast" },
  "328": { state: "FL", region: "Orlando FL area", climate: "southeast" },
  "329": { state: "FL", region: "Melbourne FL area", climate: "southeast" },
  "330": { state: "FL", region: "Miami FL area", climate: "southeast" },
  "331": { state: "FL", region: "Miami FL area", climate: "southeast" },
  "332": { state: "FL", region: "Miami FL area", climate: "southeast" },
  "333": { state: "FL", region: "Fort Lauderdale FL area", climate: "southeast" },
  "334": { state: "FL", region: "West Palm Beach FL area", climate: "southeast" },
  "335": { state: "FL", region: "Tampa FL area", climate: "southeast" },
  "336": { state: "FL", region: "Tampa FL area", climate: "southeast" },
  "337": { state: "FL", region: "St. Petersburg FL area", climate: "southeast" },
  "338": { state: "FL", region: "Lakeland FL area", climate: "southeast" },
  "339": { state: "FL", region: "Fort Myers FL area", climate: "southeast" },
  "340": { state: "FL", region: "APO/FPO (military)", climate: "southeast" },
  "341": { state: "FL", region: "Fort Myers FL area", climate: "southeast" },
  "342": { state: "FL", region: "Sarasota FL area", climate: "southeast" },
  "344": { state: "FL", region: "Gainesville FL area", climate: "southeast" },
  "346": { state: "FL", region: "Tampa FL area", climate: "southeast" },
  "347": { state: "FL", region: "Orlando FL suburbs", climate: "southeast" },
  "349": { state: "FL", region: "Fort Pierce FL area", climate: "southeast" },
  // Alabama
  "350": { state: "AL", region: "Birmingham AL area", climate: "southeast" },
  "351": { state: "AL", region: "Birmingham AL area", climate: "southeast" },
  "352": { state: "AL", region: "Birmingham AL area", climate: "southeast" },
  "354": { state: "AL", region: "Tuscaloosa AL area", climate: "southeast" },
  "355": { state: "AL", region: "Jasper AL area", climate: "southeast" },
  "356": { state: "AL", region: "Decatur AL area", climate: "southeast" },
  "357": { state: "AL", region: "Huntsville AL area", climate: "southeast" },
  "358": { state: "AL", region: "Huntsville AL area", climate: "southeast" },
  "359": { state: "AL", region: "Gadsden AL area", climate: "southeast" },
  "360": { state: "AL", region: "Montgomery AL area", climate: "southeast" },
  "361": { state: "AL", region: "Montgomery AL area", climate: "southeast" },
  "362": { state: "AL", region: "Anniston AL area", climate: "southeast" },
  "363": { state: "AL", region: "Dothan AL area", climate: "southeast" },
  "364": { state: "AL", region: "Evergreen AL area", climate: "southeast" },
  "365": { state: "AL", region: "Mobile AL area", climate: "southeast" },
  "366": { state: "AL", region: "Mobile AL area", climate: "southeast" },
  "367": { state: "AL", region: "Selma AL area", climate: "southeast" },
  "368": { state: "AL", region: "Opelika AL area", climate: "southeast" },
  "369": { state: "AL", region: "Meridian MS/AL border area", climate: "southeast" },
  // Mississippi
  "370": { state: "TN", region: "Nashville TN area", climate: "southeast" },
  "371": { state: "TN", region: "Nashville TN area", climate: "southeast" },
  "372": { state: "TN", region: "Nashville TN area", climate: "southeast" },
  "373": { state: "TN", region: "Cookeville TN area", climate: "southeast" },
  "374": { state: "TN", region: "Chattanooga TN area", climate: "southeast" },
  "375": { state: "TN", region: "Memphis TN area", climate: "southeast" },
  "376": { state: "TN", region: "Johnson City TN area", climate: "southeast" },
  "377": { state: "TN", region: "Knoxville TN area", climate: "southeast" },
  "378": { state: "TN", region: "Knoxville TN area", climate: "southeast" },
  "379": { state: "TN", region: "Knoxville TN area", climate: "southeast" },
  "380": { state: "TN", region: "Memphis TN area", climate: "southeast" },
  "381": { state: "TN", region: "Memphis TN area", climate: "southeast" },
  "382": { state: "TN", region: "McKenzie TN area", climate: "southeast" },
  "383": { state: "TN", region: "Jackson TN area", climate: "southeast" },
  "384": { state: "TN", region: "Columbia TN area", climate: "southeast" },
  "385": { state: "TN", region: "Cookeville TN area", climate: "southeast" },
  "386": { state: "MS", region: "Clarksdale MS area", climate: "southeast" },
  "387": { state: "MS", region: "Greenville MS area", climate: "southeast" },
  "388": { state: "MS", region: "Tupelo MS area", climate: "southeast" },
  "389": { state: "MS", region: "Greenwood MS area", climate: "southeast" },
  "390": { state: "MS", region: "Jackson MS area", climate: "southeast" },
  "391": { state: "MS", region: "Jackson MS area", climate: "southeast" },
  "392": { state: "MS", region: "Jackson MS area", climate: "southeast" },
  "393": { state: "MS", region: "Meridian MS area", climate: "southeast" },
  "394": { state: "MS", region: "Laurel MS area", climate: "southeast" },
  "395": { state: "MS", region: "Gulfport MS area", climate: "southeast" },
  "396": { state: "MS", region: "McComb MS area", climate: "southeast" },
  "397": { state: "MS", region: "Columbus MS area", climate: "southeast" },
  // Kentucky & Ohio
  "400": { state: "KY", region: "Louisville KY area", climate: "midwest" },
  "401": { state: "KY", region: "Louisville KY area", climate: "midwest" },
  "402": { state: "KY", region: "Louisville KY area", climate: "midwest" },
  "403": { state: "KY", region: "Lexington KY area", climate: "midwest" },
  "404": { state: "KY", region: "Lexington KY area", climate: "midwest" },
  "405": { state: "KY", region: "Lexington KY area", climate: "midwest" },
  "406": { state: "KY", region: "Frankfort KY area", climate: "midwest" },
  "407": { state: "KY", region: "Corbin KY area", climate: "midwest" },
  "408": { state: "KY", region: "Corbin KY area", climate: "midwest" },
  "409": { state: "KY", region: "Hazard KY area", climate: "midwest" },
  "410": { state: "KY", region: "Cincinnati OH/KY area (Covington)", climate: "midwest" },
  "411": { state: "KY", region: "Ashland KY area", climate: "midwest" },
  "412": { state: "KY", region: "Ashland KY area", climate: "midwest" },
  "413": { state: "KY", region: "Campton KY area", climate: "midwest" },
  "414": { state: "KY", region: "Campton KY area", climate: "midwest" },
  "415": { state: "KY", region: "Pikeville KY area", climate: "midwest" },
  "416": { state: "KY", region: "Pikeville KY area", climate: "midwest" },
  "417": { state: "KY", region: "Hazard KY area", climate: "midwest" },
  "418": { state: "KY", region: "London KY area", climate: "midwest" },
  "420": { state: "KY", region: "Bowling Green KY area", climate: "midwest" },
  "421": { state: "KY", region: "Bowling Green KY area", climate: "midwest" },
  "422": { state: "KY", region: "Owensboro KY area", climate: "midwest" },
  "423": { state: "KY", region: "Owensboro KY area", climate: "midwest" },
  "424": { state: "KY", region: "Henderson KY area", climate: "midwest" },
  "425": { state: "KY", region: "Somerset KY area", climate: "midwest" },
  "426": { state: "KY", region: "Elizabethtown KY area", climate: "midwest" },
  "427": { state: "KY", region: "Elizabethtown KY area", climate: "midwest" },
  // Indiana
  "430": { state: "OH", region: "Columbus OH area", climate: "midwest" },
  "431": { state: "OH", region: "Columbus OH area", climate: "midwest" },
  "432": { state: "OH", region: "Columbus OH area", climate: "midwest" },
  "433": { state: "OH", region: "Columbus OH suburbs", climate: "midwest" },
  "434": { state: "OH", region: "Toledo OH area", climate: "midwest" },
  "435": { state: "OH", region: "Toledo OH area", climate: "midwest" },
  "436": { state: "OH", region: "Toledo OH area", climate: "midwest" },
  "437": { state: "OH", region: "Zanesville OH area", climate: "midwest" },
  "438": { state: "OH", region: "Zanesville OH area", climate: "midwest" },
  "439": { state: "OH", region: "Steubenville OH area", climate: "midwest" },
  "440": { state: "OH", region: "Cleveland OH area", climate: "midwest" },
  "441": { state: "OH", region: "Cleveland OH area", climate: "midwest" },
  "442": { state: "OH", region: "Cleveland OH suburbs", climate: "midwest" },
  "443": { state: "OH", region: "Lorain OH area", climate: "midwest" },
  "444": { state: "OH", region: "Youngstown OH area", climate: "midwest" },
  "445": { state: "OH", region: "Youngstown OH area", climate: "midwest" },
  "446": { state: "OH", region: "Akron OH area", climate: "midwest" },
  "447": { state: "OH", region: "Akron OH area", climate: "midwest" },
  "448": { state: "OH", region: "Mansfield OH area", climate: "midwest" },
  "449": { state: "OH", region: "Mansfield OH area", climate: "midwest" },
  "450": { state: "OH", region: "Cincinnati OH area", climate: "midwest" },
  "451": { state: "OH", region: "Cincinnati OH area", climate: "midwest" },
  "452": { state: "OH", region: "Cincinnati OH area", climate: "midwest" },
  "453": { state: "OH", region: "Dayton OH area", climate: "midwest" },
  "454": { state: "OH", region: "Dayton OH area", climate: "midwest" },
  "455": { state: "OH", region: "Springfield OH area", climate: "midwest" },
  "456": { state: "OH", region: "Chillicothe OH area", climate: "midwest" },
  "457": { state: "OH", region: "Athens OH area", climate: "midwest" },
  "458": { state: "OH", region: "Lima OH area", climate: "midwest" },
  "460": { state: "IN", region: "Indianapolis IN area", climate: "midwest" },
  "461": { state: "IN", region: "Indianapolis IN area", climate: "midwest" },
  "462": { state: "IN", region: "Indianapolis IN area", climate: "midwest" },
  "463": { state: "IN", region: "Gary/Hammond IN area", climate: "midwest" },
  "464": { state: "IN", region: "Gary IN area", climate: "midwest" },
  "465": { state: "IN", region: "South Bend IN area", climate: "midwest" },
  "466": { state: "IN", region: "South Bend IN area", climate: "midwest" },
  "467": { state: "IN", region: "Fort Wayne IN area", climate: "midwest" },
  "468": { state: "IN", region: "Fort Wayne IN area", climate: "midwest" },
  "469": { state: "IN", region: "Kokomo IN area", climate: "midwest" },
  "470": { state: "IN", region: "Bloomington IN area", climate: "midwest" },
  "471": { state: "IN", region: "New Albany IN area", climate: "midwest" },
  "472": { state: "IN", region: "Columbus IN area", climate: "midwest" },
  "473": { state: "IN", region: "Muncie IN area", climate: "midwest" },
  "474": { state: "IN", region: "Bloomington IN area", climate: "midwest" },
  "475": { state: "IN", region: "Washington IN area", climate: "midwest" },
  "476": { state: "IN", region: "Evansville IN area", climate: "midwest" },
  "477": { state: "IN", region: "Evansville IN area", climate: "midwest" },
  "478": { state: "IN", region: "Terre Haute IN area", climate: "midwest" },
  "479": { state: "IN", region: "Lafayette IN area", climate: "midwest" },
  // Michigan
  "480": { state: "MI", region: "Detroit MI area", climate: "midwest" },
  "481": { state: "MI", region: "Detroit MI area", climate: "midwest" },
  "482": { state: "MI", region: "Detroit MI area", climate: "midwest" },
  "483": { state: "MI", region: "Detroit MI area", climate: "midwest" },
  "484": { state: "MI", region: "Flint MI area", climate: "midwest" },
  "485": { state: "MI", region: "Flint MI area", climate: "midwest" },
  "486": { state: "MI", region: "Saginaw MI area", climate: "midwest" },
  "487": { state: "MI", region: "Bay City MI area", climate: "midwest" },
  "488": { state: "MI", region: "Lansing MI area", climate: "midwest" },
  "489": { state: "MI", region: "Lansing MI area", climate: "midwest" },
  "490": { state: "MI", region: "Kalamazoo MI area", climate: "midwest" },
  "491": { state: "MI", region: "Kalamazoo MI area", climate: "midwest" },
  "492": { state: "MI", region: "Jackson MI area", climate: "midwest" },
  "493": { state: "MI", region: "Grand Rapids MI area", climate: "midwest" },
  "494": { state: "MI", region: "Grand Rapids MI area", climate: "midwest" },
  "495": { state: "MI", region: "Grand Rapids MI area", climate: "midwest" },
  "496": { state: "MI", region: "Traverse City MI area", climate: "midwest" },
  "497": { state: "MI", region: "Gaylord MI area", climate: "midwest" },
  "498": { state: "MI", region: "Iron Mountain MI area", climate: "midwest" },
  "499": { state: "MI", region: "Upper Peninsula MI (Houghton)", climate: "midwest" },
  // Wisconsin
  "500": { state: "IA", region: "Des Moines IA area", climate: "midwest" },
  "501": { state: "IA", region: "Des Moines IA area", climate: "midwest" },
  "502": { state: "IA", region: "Des Moines IA area", climate: "midwest" },
  "503": { state: "IA", region: "Des Moines IA area", climate: "midwest" },
  "504": { state: "IA", region: "Mason City IA area", climate: "midwest" },
  "505": { state: "IA", region: "Fort Dodge IA area", climate: "midwest" },
  "506": { state: "IA", region: "Waterloo IA area", climate: "midwest" },
  "507": { state: "IA", region: "Waterloo IA area", climate: "midwest" },
  "508": { state: "IA", region: "Creston IA area", climate: "midwest" },
  "509": { state: "IA", region: "Des Moines IA area", climate: "midwest" },
  "510": { state: "IA", region: "Sioux City IA area", climate: "midwest" },
  "511": { state: "IA", region: "Sioux City IA area", climate: "midwest" },
  "512": { state: "IA", region: "Sioux City IA area", climate: "midwest" },
  "513": { state: "IA", region: "Spencer IA area", climate: "midwest" },
  "514": { state: "IA", region: "Carroll IA area", climate: "midwest" },
  "515": { state: "IA", region: "Council Bluffs IA area", climate: "midwest" },
  "516": { state: "IA", region: "Shenandoah IA area", climate: "midwest" },
  "520": { state: "IA", region: "Dubuque IA area", climate: "midwest" },
  "521": { state: "IA", region: "Decorah IA area", climate: "midwest" },
  "522": { state: "IA", region: "Cedar Rapids IA area", climate: "midwest" },
  "523": { state: "IA", region: "Cedar Rapids IA area", climate: "midwest" },
  "524": { state: "IA", region: "Iowa City IA area", climate: "midwest" },
  "525": { state: "IA", region: "Ottumwa IA area", climate: "midwest" },
  "526": { state: "IA", region: "Burlington IA area", climate: "midwest" },
  "527": { state: "IA", region: "Rock Island IL/Davenport IA", climate: "midwest" },
  "528": { state: "IA", region: "Iowa City IA area", climate: "midwest" },
  "530": { state: "WI", region: "Milwaukee WI area", climate: "midwest" },
  "531": { state: "WI", region: "Milwaukee WI area", climate: "midwest" },
  "532": { state: "WI", region: "Milwaukee WI area", climate: "midwest" },
  "534": { state: "WI", region: "Racine WI area", climate: "midwest" },
  "535": { state: "WI", region: "Racine/Kenosha WI area", climate: "midwest" },
  "537": { state: "WI", region: "Madison WI area", climate: "midwest" },
  "538": { state: "WI", region: "Madison WI area", climate: "midwest" },
  "539": { state: "WI", region: "Portage WI area", climate: "midwest" },
  "540": { state: "WI", region: "St. Croix Falls WI area", climate: "midwest" },
  "541": { state: "WI", region: "Green Bay WI area", climate: "midwest" },
  "542": { state: "WI", region: "Green Bay WI area", climate: "midwest" },
  "543": { state: "WI", region: "Green Bay WI area", climate: "midwest" },
  "544": { state: "WI", region: "Wausau WI area", climate: "midwest" },
  "545": { state: "WI", region: "Rhinelander WI area", climate: "midwest" },
  "546": { state: "WI", region: "La Crosse WI area", climate: "midwest" },
  "547": { state: "WI", region: "Eau Claire WI area", climate: "midwest" },
  "548": { state: "WI", region: "Superior WI area", climate: "midwest" },
  "549": { state: "WI", region: "Oshkosh WI area", climate: "midwest" },
  // Minnesota
  "550": { state: "MN", region: "Minneapolis/St. Paul MN area", climate: "midwest" },
  "551": { state: "MN", region: "Minneapolis/St. Paul MN area", climate: "midwest" },
  "553": { state: "MN", region: "Minneapolis/St. Paul MN area", climate: "midwest" },
  "554": { state: "MN", region: "Minneapolis/St. Paul MN area", climate: "midwest" },
  "555": { state: "MN", region: "Minneapolis/St. Paul MN area", climate: "midwest" },
  "556": { state: "MN", region: "Duluth MN area", climate: "midwest" },
  "557": { state: "MN", region: "Duluth MN area", climate: "midwest" },
  "558": { state: "MN", region: "Duluth MN area", climate: "midwest" },
  "559": { state: "MN", region: "Rochester MN area", climate: "midwest" },
  "560": { state: "MN", region: "Mankato MN area", climate: "midwest" },
  "561": { state: "MN", region: "Winona MN area", climate: "midwest" },
  "562": { state: "MN", region: "Willmar MN area", climate: "midwest" },
  "563": { state: "MN", region: "St. Cloud MN area", climate: "midwest" },
  "564": { state: "MN", region: "Brainerd MN area", climate: "midwest" },
  "565": { state: "MN", region: "Detroit Lakes MN area", climate: "midwest" },
  "566": { state: "MN", region: "Bemidji MN area", climate: "midwest" },
  "567": { state: "MN", region: "Thief River Falls MN area", climate: "midwest" },
  // South Dakota & North Dakota
  "570": { state: "SD", region: "Sioux Falls SD area", climate: "midwest" },
  "571": { state: "SD", region: "Sioux Falls SD area", climate: "midwest" },
  "572": { state: "SD", region: "Watertown SD area", climate: "midwest" },
  "573": { state: "SD", region: "Mitchell SD area", climate: "midwest" },
  "574": { state: "SD", region: "Aberdeen SD area", climate: "midwest" },
  "575": { state: "SD", region: "Pierre SD area", climate: "midwest" },
  "576": { state: "SD", region: "Mobridge SD area", climate: "midwest" },
  "577": { state: "SD", region: "Rapid City SD area", climate: "midwest" },
  "580": { state: "ND", region: "Fargo ND area", climate: "midwest" },
  "581": { state: "ND", region: "Fargo ND area", climate: "midwest" },
  "582": { state: "ND", region: "Grand Forks ND area", climate: "midwest" },
  "583": { state: "ND", region: "Devils Lake ND area", climate: "midwest" },
  "584": { state: "ND", region: "Jamestown ND area", climate: "midwest" },
  "585": { state: "ND", region: "Bismarck ND area", climate: "midwest" },
  "586": { state: "ND", region: "Bismarck ND area", climate: "midwest" },
  "587": { state: "ND", region: "Minot ND area", climate: "midwest" },
  "588": { state: "ND", region: "Minot ND area", climate: "midwest" },
  // Montana & Wyoming
  "590": { state: "MT", region: "Billings MT area", climate: "mountain" },
  "591": { state: "MT", region: "Billings MT area", climate: "mountain" },
  "592": { state: "MT", region: "Wolf Point MT area", climate: "mountain" },
  "593": { state: "MT", region: "Miles City MT area", climate: "mountain" },
  "594": { state: "MT", region: "Great Falls MT area", climate: "mountain" },
  "595": { state: "MT", region: "Havre MT area", climate: "mountain" },
  "596": { state: "MT", region: "Helena MT area", climate: "mountain" },
  "597": { state: "MT", region: "Butte MT area", climate: "mountain" },
  "598": { state: "MT", region: "Missoula MT area", climate: "mountain" },
  "599": { state: "MT", region: "Kalispell MT area", climate: "mountain" },
  // Idaho
  "600": { state: "IL", region: "Chicago IL area (North Shore)", climate: "midwest" },
  "601": { state: "IL", region: "Chicago IL area", climate: "midwest" },
  "602": { state: "IL", region: "Evanston/Chicago area IL", climate: "midwest" },
  "603": { state: "IL", region: "Oak Park/Chicago area IL", climate: "midwest" },
  "604": { state: "IL", region: "Chicago IL suburbs (north)", climate: "midwest" },
  "605": { state: "IL", region: "Chicago IL area", climate: "midwest" },
  "606": { state: "IL", region: "Chicago IL area", climate: "midwest" },
  "607": { state: "IL", region: "Chicago IL area", climate: "midwest" },
  "608": { state: "IL", region: "Chicago IL suburbs (south)", climate: "midwest" },
  "609": { state: "IL", region: "Kankakee IL area", climate: "midwest" },
  "610": { state: "IL", region: "Rockford IL area", climate: "midwest" },
  "611": { state: "IL", region: "Rockford IL area", climate: "midwest" },
  "612": { state: "IL", region: "Rock Island IL area", climate: "midwest" },
  "613": { state: "IL", region: "La Salle IL area", climate: "midwest" },
  "614": { state: "IL", region: "Galesburg IL area", climate: "midwest" },
  "615": { state: "IL", region: "Peoria IL area", climate: "midwest" },
  "616": { state: "IL", region: "Peoria IL area", climate: "midwest" },
  "617": { state: "IL", region: "Bloomington IL area", climate: "midwest" },
  "618": { state: "IL", region: "Champaign IL area", climate: "midwest" },
  "619": { state: "IL", region: "Champaign IL area", climate: "midwest" },
  "620": { state: "IL", region: "East St. Louis IL area", climate: "midwest" },
  "622": { state: "IL", region: "East St. Louis IL area", climate: "midwest" },
  "623": { state: "IL", region: "Quincy IL area", climate: "midwest" },
  "624": { state: "IL", region: "Effingham IL area", climate: "midwest" },
  "625": { state: "IL", region: "Springfield IL area", climate: "midwest" },
  "626": { state: "IL", region: "Springfield IL area", climate: "midwest" },
  "627": { state: "IL", region: "Springfield IL area", climate: "midwest" },
  "628": { state: "IL", region: "Centralia IL area", climate: "midwest" },
  "629": { state: "IL", region: "Carbondale IL area", climate: "midwest" },
  // Missouri
  "630": { state: "MO", region: "St. Louis MO area", climate: "midwest" },
  "631": { state: "MO", region: "St. Louis MO area", climate: "midwest" },
  "633": { state: "MO", region: "St. Louis MO area (Belleville)", climate: "midwest" },
  "634": { state: "MO", region: "Hannibal MO area", climate: "midwest" },
  "635": { state: "MO", region: "Kirksville MO area", climate: "midwest" },
  "636": { state: "MO", region: "Flat River MO area", climate: "midwest" },
  "637": { state: "MO", region: "Cape Girardeau MO area", climate: "midwest" },
  "638": { state: "MO", region: "Sikeston MO area", climate: "midwest" },
  "639": { state: "MO", region: "Poplar Bluff MO area", climate: "midwest" },
  "640": { state: "MO", region: "Kansas City MO area", climate: "midwest" },
  "641": { state: "MO", region: "Kansas City MO area", climate: "midwest" },
  "644": { state: "MO", region: "St. Joseph MO area", climate: "midwest" },
  "645": { state: "MO", region: "St. Joseph MO area", climate: "midwest" },
  "646": { state: "MO", region: "Chillicothe MO area", climate: "midwest" },
  "647": { state: "MO", region: "Harrisonville MO area", climate: "midwest" },
  "648": { state: "MO", region: "Joplin MO area", climate: "midwest" },
  "649": { state: "MO", region: "Joplin MO area", climate: "midwest" },
  "650": { state: "MO", region: "Jefferson City MO area", climate: "midwest" },
  "651": { state: "MO", region: "Jefferson City MO area", climate: "midwest" },
  "652": { state: "MO", region: "Columbia MO area", climate: "midwest" },
  "653": { state: "MO", region: "Sedalia MO area", climate: "midwest" },
  "654": { state: "MO", region: "Springfield MO area", climate: "midwest" },
  "655": { state: "MO", region: "Springfield MO area", climate: "midwest" },
  "656": { state: "MO", region: "Springfield MO area", climate: "midwest" },
  "657": { state: "MO", region: "Springfield MO area", climate: "midwest" },
  "658": { state: "MO", region: "Springfield MO area", climate: "midwest" },
  // Nebraska & Kansas
  "660": { state: "KS", region: "Kansas City KS area", climate: "midwest" },
  "661": { state: "KS", region: "Kansas City KS area", climate: "midwest" },
  "662": { state: "KS", region: "Shawnee Mission KS area", climate: "midwest" },
  "664": { state: "KS", region: "Topeka KS area", climate: "midwest" },
  "665": { state: "KS", region: "Topeka KS area", climate: "midwest" },
  "666": { state: "KS", region: "Topeka KS area", climate: "midwest" },
  "667": { state: "KS", region: "Fort Scott KS area", climate: "midwest" },
  "668": { state: "KS", region: "Emporia KS area", climate: "midwest" },
  "669": { state: "KS", region: "Wichita KS area", climate: "south_central" },
  "670": { state: "KS", region: "Wichita KS area", climate: "south_central" },
  "671": { state: "KS", region: "Wichita KS area", climate: "south_central" },
  "672": { state: "KS", region: "Wichita KS area", climate: "south_central" },
  "673": { state: "KS", region: "Independence KS area", climate: "south_central" },
  "674": { state: "KS", region: "Salina KS area", climate: "south_central" },
  "675": { state: "KS", region: "Hutchinson KS area", climate: "south_central" },
  "676": { state: "KS", region: "Hays KS area", climate: "south_central" },
  "677": { state: "KS", region: "Colby KS area", climate: "south_central" },
  "678": { state: "KS", region: "Dodge City KS area", climate: "south_central" },
  "679": { state: "KS", region: "Liberal KS area", climate: "south_central" },
  "680": { state: "NE", region: "Omaha NE area", climate: "midwest" },
  "681": { state: "NE", region: "Omaha NE area", climate: "midwest" },
  "683": { state: "NE", region: "Lincoln NE area", climate: "midwest" },
  "684": { state: "NE", region: "Lincoln NE area", climate: "midwest" },
  "685": { state: "NE", region: "Lincoln NE area", climate: "midwest" },
  "686": { state: "NE", region: "Columbus NE area", climate: "midwest" },
  "687": { state: "NE", region: "Norfolk NE area", climate: "midwest" },
  "688": { state: "NE", region: "Grand Island NE area", climate: "midwest" },
  "689": { state: "NE", region: "Hastings NE area", climate: "midwest" },
  "690": { state: "NE", region: "McCook NE area", climate: "midwest" },
  "691": { state: "NE", region: "North Platte NE area", climate: "midwest" },
  "692": { state: "NE", region: "Valentine NE area", climate: "midwest" },
  "693": { state: "NE", region: "Scottsbluff NE area", climate: "midwest" },
  // Louisiana & Arkansas
  "700": { state: "LA", region: "New Orleans LA area", climate: "southeast" },
  "701": { state: "LA", region: "New Orleans LA area", climate: "southeast" },
  "703": { state: "LA", region: "New Orleans LA area", climate: "southeast" },
  "704": { state: "LA", region: "Hammond LA area", climate: "southeast" },
  "705": { state: "LA", region: "Lafayette LA area", climate: "southeast" },
  "706": { state: "LA", region: "Lake Charles LA area", climate: "southeast" },
  "707": { state: "LA", region: "Baton Rouge LA area", climate: "southeast" },
  "708": { state: "LA", region: "Baton Rouge LA area", climate: "southeast" },
  "710": { state: "LA", region: "Shreveport LA area", climate: "south_central" },
  "711": { state: "LA", region: "Shreveport LA area", climate: "south_central" },
  "712": { state: "LA", region: "Monroe LA area", climate: "south_central" },
  "713": { state: "LA", region: "Alexandria LA area", climate: "south_central" },
  "714": { state: "LA", region: "Alexandria LA area", climate: "south_central" },
  "716": { state: "AR", region: "Pine Bluff AR area", climate: "south_central" },
  "717": { state: "AR", region: "Camden AR area", climate: "south_central" },
  "718": { state: "AR", region: "Texarkana AR area", climate: "south_central" },
  "719": { state: "AR", region: "Hot Springs AR area", climate: "south_central" },
  "720": { state: "AR", region: "Little Rock AR area", climate: "south_central" },
  "721": { state: "AR", region: "Little Rock AR area", climate: "south_central" },
  "722": { state: "AR", region: "Little Rock AR area", climate: "south_central" },
  "723": { state: "AR", region: "West Memphis AR area", climate: "south_central" },
  "724": { state: "AR", region: "Jonesboro AR area", climate: "south_central" },
  "725": { state: "AR", region: "Batesville AR area", climate: "south_central" },
  "726": { state: "AR", region: "Harrison AR area", climate: "south_central" },
  "727": { state: "AR", region: "Fayetteville AR area", climate: "south_central" },
  "728": { state: "AR", region: "Russellville AR area", climate: "south_central" },
  "729": { state: "AR", region: "Fort Smith AR area", climate: "south_central" },
  // Oklahoma & Texas
  "730": { state: "OK", region: "Oklahoma City OK area", climate: "south_central" },
  "731": { state: "OK", region: "Oklahoma City OK area", climate: "south_central" },
  "734": { state: "OK", region: "Ardmore OK area", climate: "south_central" },
  "735": { state: "OK", region: "Lawton OK area", climate: "south_central" },
  "736": { state: "OK", region: "Clinton OK area", climate: "south_central" },
  "737": { state: "OK", region: "Enid OK area", climate: "south_central" },
  "738": { state: "OK", region: "Woodward OK area", climate: "south_central" },
  "739": { state: "OK", region: "Liberal KS/OK area", climate: "south_central" },
  "740": { state: "OK", region: "Tulsa OK area", climate: "south_central" },
  "741": { state: "OK", region: "Tulsa OK area", climate: "south_central" },
  "743": { state: "OK", region: "Miami OK area", climate: "south_central" },
  "744": { state: "OK", region: "Muskogee OK area", climate: "south_central" },
  "745": { state: "OK", region: "McAlester OK area", climate: "south_central" },
  "746": { state: "OK", region: "Ponca City OK area", climate: "south_central" },
  "747": { state: "OK", region: "Durant OK area", climate: "south_central" },
  "748": { state: "OK", region: "Shawnee OK area", climate: "south_central" },
  "749": { state: "OK", region: "Poteau OK area", climate: "south_central" },
  "750": { state: "TX", region: "Dallas TX area", climate: "south_central" },
  "751": { state: "TX", region: "Dallas TX area", climate: "south_central" },
  "752": { state: "TX", region: "Dallas TX area", climate: "south_central" },
  "753": { state: "TX", region: "Dallas TX area", climate: "south_central" },
  "754": { state: "TX", region: "Greenville TX area", climate: "south_central" },
  "755": { state: "TX", region: "Texarkana TX area", climate: "south_central" },
  "756": { state: "TX", region: "Longview TX area", climate: "south_central" },
  "757": { state: "TX", region: "Tyler TX area", climate: "south_central" },
  "758": { state: "TX", region: "Palestine TX area", climate: "south_central" },
  "759": { state: "TX", region: "Lufkin TX area", climate: "south_central" },
  "760": { state: "TX", region: "Fort Worth TX area", climate: "south_central" },
  "761": { state: "TX", region: "Fort Worth TX area", climate: "south_central" },
  "762": { state: "TX", region: "Denton TX area", climate: "south_central" },
  "763": { state: "TX", region: "Wichita Falls TX area", climate: "south_central" },
  "764": { state: "TX", region: "Wichita Falls TX area", climate: "south_central" },
  "765": { state: "TX", region: "Waco TX area", climate: "south_central" },
  "766": { state: "TX", region: "Waco TX area", climate: "south_central" },
  "767": { state: "TX", region: "Waco TX area", climate: "south_central" },
  "768": { state: "TX", region: "Brownwood TX area", climate: "south_central" },
  "769": { state: "TX", region: "San Angelo TX area", climate: "south_central" },
  "770": { state: "TX", region: "Houston TX area", climate: "south_central" },
  "771": { state: "TX", region: "Houston TX area", climate: "south_central" },
  "772": { state: "TX", region: "Houston TX area", climate: "south_central" },
  "773": { state: "TX", region: "Houston TX area", climate: "south_central" },
  "774": { state: "TX", region: "Houston TX suburbs", climate: "south_central" },
  "775": { state: "TX", region: "Houston TX area", climate: "south_central" },
  "776": { state: "TX", region: "Beaumont TX area", climate: "south_central" },
  "777": { state: "TX", region: "Beaumont TX area", climate: "south_central" },
  "778": { state: "TX", region: "Bryan/College Station TX area", climate: "south_central" },
  "779": { state: "TX", region: "Victoria TX area", climate: "south_central" },
  "780": { state: "TX", region: "San Antonio TX area", climate: "south_central" },
  "781": { state: "TX", region: "San Antonio TX area", climate: "south_central" },
  "782": { state: "TX", region: "San Antonio TX area", climate: "south_central" },
  "783": { state: "TX", region: "Corpus Christi TX area", climate: "south_central" },
  "784": { state: "TX", region: "Corpus Christi TX area", climate: "south_central" },
  "785": { state: "TX", region: "McAllen TX area (Rio Grande Valley)", climate: "south_central" },
  "786": { state: "TX", region: "Austin TX area", climate: "south_central" },
  "787": { state: "TX", region: "Austin TX area", climate: "south_central" },
  "788": { state: "TX", region: "Laredo TX area", climate: "south_central" },
  "789": { state: "TX", region: "Giddings TX area", climate: "south_central" },
  "790": { state: "TX", region: "Amarillo TX area", climate: "south_central" },
  "791": { state: "TX", region: "Amarillo TX area", climate: "south_central" },
  "792": { state: "TX", region: "Childress TX area", climate: "south_central" },
  "793": { state: "TX", region: "Lubbock TX area", climate: "south_central" },
  "794": { state: "TX", region: "Lubbock TX area", climate: "south_central" },
  "795": { state: "TX", region: "Abilene TX area", climate: "south_central" },
  "796": { state: "TX", region: "Abilene TX area", climate: "south_central" },
  "797": { state: "TX", region: "Midland TX area", climate: "south_central" },
  "798": { state: "TX", region: "El Paso TX area", climate: "desert" },
  "799": { state: "TX", region: "El Paso TX area", climate: "desert" },
  // Colorado & New Mexico
  "800": { state: "CO", region: "Denver CO area", climate: "mountain" },
  "801": { state: "CO", region: "Denver CO area", climate: "mountain" },
  "802": { state: "CO", region: "Denver CO area", climate: "mountain" },
  "803": { state: "CO", region: "Denver CO area", climate: "mountain" },
  "804": { state: "CO", region: "Denver CO suburbs (Longmont)", climate: "mountain" },
  "805": { state: "CO", region: "Denver CO suburbs (Fort Collins)", climate: "mountain" },
  "806": { state: "CO", region: "Greeley CO area", climate: "mountain" },
  "807": { state: "CO", region: "Fort Morgan CO area", climate: "mountain" },
  "808": { state: "CO", region: "Colorado Springs CO area", climate: "mountain" },
  "809": { state: "CO", region: "Colorado Springs CO area", climate: "mountain" },
  "810": { state: "CO", region: "Pueblo CO area", climate: "mountain" },
  "811": { state: "CO", region: "Alamosa CO area", climate: "mountain" },
  "812": { state: "CO", region: "Salida CO area", climate: "mountain" },
  "813": { state: "CO", region: "Durango CO area", climate: "mountain" },
  "814": { state: "CO", region: "Montrose CO area", climate: "mountain" },
  "815": { state: "CO", region: "Grand Junction CO area", climate: "mountain" },
  "816": { state: "CO", region: "Glenwood Springs CO area", climate: "mountain" },
  "820": { state: "WY", region: "Cheyenne WY area", climate: "mountain" },
  "821": { state: "WY", region: "Yellowstone/Cody WY area", climate: "mountain" },
  "822": { state: "WY", region: "Wheatland WY area", climate: "mountain" },
  "823": { state: "WY", region: "Rawlins WY area", climate: "mountain" },
  "824": { state: "WY", region: "Worland WY area", climate: "mountain" },
  "825": { state: "WY", region: "Riverton WY area", climate: "mountain" },
  "826": { state: "WY", region: "Casper WY area", climate: "mountain" },
  "827": { state: "WY", region: "Newcastle WY area", climate: "mountain" },
  "828": { state: "WY", region: "Sheridan WY area", climate: "mountain" },
  "829": { state: "WY", region: "Rock Springs WY area", climate: "mountain" },
  "830": { state: "WY", region: "Rock Springs WY area", climate: "mountain" },
  "831": { state: "WY", region: "Rock Springs WY area", climate: "mountain" },
  // Idaho
  "832": { state: "ID", region: "Pocatello ID area", climate: "mountain" },
  "833": { state: "ID", region: "Twin Falls ID area", climate: "mountain" },
  "834": { state: "ID", region: "Twin Falls ID area", climate: "mountain" },
  "835": { state: "ID", region: "Lewiston ID area", climate: "northwest" },
  "836": { state: "ID", region: "Boise ID area", climate: "mountain" },
  "837": { state: "ID", region: "Boise ID area", climate: "mountain" },
  "838": { state: "ID", region: "Coeur d'Alene ID area", climate: "northwest" },
  // Nevada
  "889": { state: "NV", region: "Las Vegas NV area", climate: "desert" },
  "890": { state: "NV", region: "Las Vegas NV area", climate: "desert" },
  "891": { state: "NV", region: "Las Vegas NV area", climate: "desert" },
  "893": { state: "NV", region: "Las Vegas NV area", climate: "desert" },
  "894": { state: "NV", region: "Reno NV area", climate: "mountain" },
  "895": { state: "NV", region: "Reno NV area", climate: "mountain" },
  "897": { state: "NV", region: "Carson City NV area", climate: "mountain" },
  "898": { state: "NV", region: "Elko NV area", climate: "mountain" },
  // New Mexico
  "870": { state: "NM", region: "Albuquerque NM area", climate: "desert" },
  "871": { state: "NM", region: "Albuquerque NM area", climate: "desert" },
  "872": { state: "NM", region: "Albuquerque NM area", climate: "desert" },
  "873": { state: "NM", region: "Gallup NM area", climate: "desert" },
  "874": { state: "NM", region: "Farmington NM area", climate: "desert" },
  "875": { state: "NM", region: "Santa Fe NM area", climate: "desert" },
  "877": { state: "NM", region: "Las Vegas NM area", climate: "desert" },
  "878": { state: "NM", region: "Socorro NM area", climate: "desert" },
  "879": { state: "NM", region: "Truth or Consequences NM area", climate: "desert" },
  "880": { state: "NM", region: "Las Cruces NM area", climate: "desert" },
  "881": { state: "NM", region: "Clovis NM area", climate: "desert" },
  "882": { state: "NM", region: "Roswell NM area", climate: "desert" },
  "883": { state: "NM", region: "Carrizozo NM area", climate: "desert" },
  "884": { state: "NM", region: "Tucumcari NM area", climate: "desert" },
  // Arizona
  "850": { state: "AZ", region: "Phoenix AZ area", climate: "desert" },
  "851": { state: "AZ", region: "Phoenix AZ area", climate: "desert" },
  "852": { state: "AZ", region: "Phoenix AZ area", climate: "desert" },
  "853": { state: "AZ", region: "Phoenix AZ suburbs", climate: "desert" },
  "855": { state: "AZ", region: "Globe AZ area", climate: "desert" },
  "856": { state: "AZ", region: "Tucson AZ area", climate: "desert" },
  "857": { state: "AZ", region: "Tucson AZ area", climate: "desert" },
  "859": { state: "AZ", region: "Show Low AZ area", climate: "desert" },
  "860": { state: "AZ", region: "Flagstaff AZ area", climate: "mountain" },
  "863": { state: "AZ", region: "Prescott AZ area", climate: "desert" },
  "864": { state: "AZ", region: "Kingman AZ area", climate: "desert" },
  "865": { state: "AZ", region: "Flagstaff AZ area", climate: "mountain" },
  // Utah
  "840": { state: "UT", region: "Salt Lake City UT area", climate: "mountain" },
  "841": { state: "UT", region: "Salt Lake City UT area", climate: "mountain" },
  "842": { state: "UT", region: "Ogden UT area", climate: "mountain" },
  "843": { state: "UT", region: "Ogden UT area", climate: "mountain" },
  "844": { state: "UT", region: "Provo UT area", climate: "mountain" },
  "845": { state: "UT", region: "Price UT area", climate: "mountain" },
  "846": { state: "UT", region: "Provo UT area", climate: "mountain" },
  "847": { state: "UT", region: "Provo UT area", climate: "mountain" },
  "848": { state: "UT", region: "Vernal UT area", climate: "mountain" },
  "849": { state: "UT", region: "Logan UT area", climate: "mountain" },
  // California
  "900": { state: "CA", region: "Los Angeles CA area", climate: "west_coast" },
  "901": { state: "CA", region: "Los Angeles CA area (El Monte)", climate: "west_coast" },
  "902": { state: "CA", region: "Los Angeles CA area (Inglewood)", climate: "west_coast" },
  "903": { state: "CA", region: "Los Angeles CA area (Compton)", climate: "west_coast" },
  "904": { state: "CA", region: "Los Angeles CA area (Santa Monica)", climate: "west_coast" },
  "905": { state: "CA", region: "Los Angeles CA area (Torrance)", climate: "west_coast" },
  "906": { state: "CA", region: "Los Angeles CA area (Long Beach)", climate: "west_coast" },
  "907": { state: "CA", region: "Long Beach CA area", climate: "west_coast" },
  "908": { state: "CA", region: "Long Beach CA area", climate: "west_coast" },
  "910": { state: "CA", region: "Pasadena CA area", climate: "west_coast" },
  "911": { state: "CA", region: "Pasadena CA area", climate: "west_coast" },
  "912": { state: "CA", region: "Glendale CA area", climate: "west_coast" },
  "913": { state: "CA", region: "Los Angeles CA area (Van Nuys)", climate: "west_coast" },
  "914": { state: "CA", region: "Los Angeles CA area (Van Nuys)", climate: "west_coast" },
  "915": { state: "CA", region: "Burbank CA area", climate: "west_coast" },
  "916": { state: "CA", region: "Los Angeles CA area (North Hollywood)", climate: "west_coast" },
  "917": { state: "CA", region: "Alhambra CA area", climate: "west_coast" },
  "918": { state: "CA", region: "Los Angeles CA area (Rosemead)", climate: "west_coast" },
  "919": { state: "CA", region: "San Diego CA area", climate: "west_coast" },
  "920": { state: "CA", region: "San Diego CA area", climate: "west_coast" },
  "921": { state: "CA", region: "San Diego CA area", climate: "west_coast" },
  "922": { state: "CA", region: "San Diego CA area (San Bernardino)", climate: "west_coast" },
  "923": { state: "CA", region: "San Bernardino CA area", climate: "west_coast" },
  "924": { state: "CA", region: "Anaheim CA area", climate: "west_coast" },
  "925": { state: "CA", region: "Orange County CA (Santa Ana)", climate: "west_coast" },
  "926": { state: "CA", region: "Orange County CA (Anaheim)", climate: "west_coast" },
  "927": { state: "CA", region: "Orange County CA (Santa Ana)", climate: "west_coast" },
  "928": { state: "CA", region: "Riverside CA area", climate: "west_coast" },
  "930": { state: "CA", region: "Oxnard/Ventura CA area", climate: "west_coast" },
  "931": { state: "CA", region: "Santa Barbara CA area", climate: "west_coast" },
  "932": { state: "CA", region: "Bakersfield CA area", climate: "west_coast" },
  "933": { state: "CA", region: "Bakersfield CA area", climate: "west_coast" },
  "934": { state: "CA", region: "San Luis Obispo CA area", climate: "west_coast" },
  "935": { state: "CA", region: "Mojave CA area (desert)", climate: "desert" },
  "936": { state: "CA", region: "Fresno CA area", climate: "west_coast" },
  "937": { state: "CA", region: "Fresno CA area", climate: "west_coast" },
  "938": { state: "CA", region: "Fresno CA area", climate: "west_coast" },
  "939": { state: "CA", region: "Salinas CA area", climate: "west_coast" },
  "940": { state: "CA", region: "San Francisco CA area", climate: "west_coast" },
  "941": { state: "CA", region: "San Francisco CA area", climate: "west_coast" },
  "942": { state: "CA", region: "Sacramento CA area", climate: "west_coast" },
  "943": { state: "CA", region: "Palo Alto CA area", climate: "west_coast" },
  "944": { state: "CA", region: "San Mateo CA area", climate: "west_coast" },
  "945": { state: "CA", region: "Oakland/East Bay CA area", climate: "west_coast" },
  "946": { state: "CA", region: "Oakland/East Bay CA area", climate: "west_coast" },
  "947": { state: "CA", region: "Berkeley CA area", climate: "west_coast" },
  "948": { state: "CA", region: "Richmond CA area (East Bay)", climate: "west_coast" },
  "949": { state: "CA", region: "San Jose CA area (Santa Cruz area)", climate: "west_coast" },
  "950": { state: "CA", region: "San Jose CA area", climate: "west_coast" },
  "951": { state: "CA", region: "San Jose CA area", climate: "west_coast" },
  "952": { state: "CA", region: "Stockton CA area", climate: "west_coast" },
  "953": { state: "CA", region: "Stockton CA area", climate: "west_coast" },
  "954": { state: "CA", region: "Santa Rosa CA area", climate: "west_coast" },
  "955": { state: "CA", region: "Eureka CA area (North Coast)", climate: "northwest" },
  "956": { state: "CA", region: "Sacramento CA area", climate: "west_coast" },
  "957": { state: "CA", region: "Sacramento CA area", climate: "west_coast" },
  "958": { state: "CA", region: "Sacramento CA area", climate: "west_coast" },
  "959": { state: "CA", region: "Marysville CA area", climate: "west_coast" },
  "960": { state: "CA", region: "Red Bluff CA area", climate: "west_coast" },
  "961": { state: "CA", region: "Redding CA area", climate: "west_coast" },
  // Oregon
  "970": { state: "OR", region: "Portland OR area", climate: "northwest" },
  "971": { state: "OR", region: "Portland OR area", climate: "northwest" },
  "972": { state: "OR", region: "Portland OR area", climate: "northwest" },
  "973": { state: "OR", region: "Salem OR area", climate: "northwest" },
  "974": { state: "OR", region: "Eugene OR area", climate: "northwest" },
  "975": { state: "OR", region: "Medford OR area", climate: "northwest" },
  "976": { state: "OR", region: "Klamath Falls OR area", climate: "northwest" },
  "977": { state: "OR", region: "Bend OR area", climate: "mountain" },
  "978": { state: "OR", region: "Corvallis OR area", climate: "northwest" },
  "979": { state: "OR", region: "Beaverton/Hillsboro OR area", climate: "northwest" },
  // Washington
  "980": { state: "WA", region: "Seattle WA area", climate: "northwest" },
  "981": { state: "WA", region: "Seattle WA area", climate: "northwest" },
  "982": { state: "WA", region: "Seattle WA area", climate: "northwest" },
  "983": { state: "WA", region: "Tacoma WA area", climate: "northwest" },
  "984": { state: "WA", region: "Tacoma WA area", climate: "northwest" },
  "985": { state: "WA", region: "Olympia WA area", climate: "northwest" },
  "986": { state: "WA", region: "Vancouver WA area", climate: "northwest" },
  "988": { state: "WA", region: "Wenatchee WA area", climate: "mountain" },
  "989": { state: "WA", region: "Ellensburg WA area", climate: "mountain" },
  "990": { state: "WA", region: "Spokane WA area", climate: "mountain" },
  "991": { state: "WA", region: "Spokane WA area", climate: "mountain" },
  "992": { state: "WA", region: "Spokane WA area", climate: "mountain" },
  "993": { state: "WA", region: "Richland/Kennewick WA area", climate: "mountain" },
  "994": { state: "WA", region: "Clarkston WA area", climate: "mountain" },
  // Alaska
  "995": { state: "AK", region: "Anchorage AK area", climate: "mountain" },
  "996": { state: "AK", region: "Anchorage AK area", climate: "mountain" },
  "997": { state: "AK", region: "Fairbanks AK area", climate: "mountain" },
  "998": { state: "AK", region: "Juneau AK area", climate: "northwest" },
  "999": { state: "AK", region: "Ketchikan AK area", climate: "northwest" },
  // Hawaii
  "967": { state: "HI", region: "Honolulu HI area", climate: "west_coast" },
  "968": { state: "HI", region: "Honolulu HI area", climate: "west_coast" },
};

// ---------------------------------------------------------------------------
// Helper: get default region for a prefix
// ---------------------------------------------------------------------------
function getRegionForPrefix(prefix: string): PrefixRegion {
  const hint = PREFIX_REGIONS[prefix];
  if (hint) return hint;
  // Fallback based on leading digit
  const lead = parseInt(prefix[0]);
  if (lead <= 2) return { state: "NY", region: "Northeast", climate: "northeast" };
  if (lead <= 4) return { state: "OH", region: "Midwest", climate: "midwest" };
  if (lead <= 5) return { state: "IA", region: "Midwest", climate: "midwest" };
  if (lead <= 6) return { state: "IL", region: "Midwest", climate: "midwest" };
  if (lead <= 7) return { state: "TX", region: "South Central", climate: "south_central" };
  if (lead <= 8) return { state: "CO", region: "Mountain West", climate: "mountain" };
  return { state: "CA", region: "West Coast", climate: "west_coast" };
}

// ---------------------------------------------------------------------------
// Validate and sanitize a single ZipEntry from Claude's output
// ---------------------------------------------------------------------------
function validateEntry(zip: string, raw: Record<string, unknown>, defaultState: string, defaultClimate: ClimateZone): ZipEntry | null {
  const cbsa = String(raw.cbsa ?? '').trim();
  const state = String(raw.state ?? defaultState).trim().toUpperCase();
  const lat = parseFloat(String(raw.lat ?? 'NaN'));
  const lon = parseFloat(String(raw.lon ?? 'NaN'));
  const climate = String(raw.climate ?? defaultClimate).trim() as ClimateZone;

  if (isNaN(lat) || isNaN(lon)) return null;
  if (!VALID_CLIMATES.has(climate)) return null;

  // Validate CBSA code — fall back to RURAL if not in our index
  let validatedCbsa = cbsa;
  if (!cbsa.startsWith('RURAL-')) {
    if (!VALID_CBSA_CODES.has(cbsa)) {
      validatedCbsa = `RURAL-${state}`;
    }
  }

  return { cbsa: validatedCbsa, state, lat, lon, climate };
}

// ---------------------------------------------------------------------------
// Parse Claude's JSON response, tolerating common wrapping patterns
// ---------------------------------------------------------------------------
function parseClaudeResponse(content: string): Record<string, Record<string, unknown>> {
  // Strip markdown code fences if present
  const stripped = content
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```\s*$/m, '')
    .trim();

  try {
    const parsed = JSON.parse(stripped);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, Record<string, unknown>>;
    }
  } catch {
    // Try to find a JSON object in the response
    const match = stripped.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as Record<string, Record<string, unknown>>;
      } catch { /* ignore */ }
    }
  }
  return {};
}

// ---------------------------------------------------------------------------
// Build prompt for a batch of 3-digit prefixes
// ---------------------------------------------------------------------------
function buildPrompt(prefixes: string[], validCbsaCodes: string[]): string {
  const prefixDescriptions = prefixes.map(p => {
    const r = getRegionForPrefix(p);
    return `  - Prefix ${p}xx: ${r.region} (${r.state}, climate: ${r.climate})`;
  }).join('\n');

  // Include top 50 CBSA codes as a hint so Claude uses real codes
  const cbsaSample = validCbsaCodes.slice(0, 50).join(', ');

  return `You are a US geographic data expert. Generate a JSON mapping of ZIP codes to CBSA (Core-Based Statistical Area) metadata for all active US ZIP codes with the following 3-digit prefixes:

${prefixDescriptions}

For EACH active ZIP code in these prefixes (approximately 40-80 ZIPs per prefix), output a JSON entry in this format:
{
  "ZIPCODE": {
    "cbsa": "CBSA_CODE_OR_RURAL",
    "state": "ST",
    "lat": LATITUDE,
    "lon": LONGITUDE,
    "climate": "CLIMATE_ZONE"
  }
}

Rules:
1. Only include real, active ZIP codes (skip discontinued/unused ones)
2. cbsa must be one of the valid CBSA codes OR use "RURAL-{STATE}" for non-metro areas
3. Valid CBSA codes (sample): ${cbsaSample}
4. climate must be one of: northeast, southeast, midwest, south_central, mid_atlantic, mountain, desert, west_coast, northwest
5. lat/lon must be accurate decimal coordinates
6. Include both city/suburban ZIPs and rural ZIPs
7. Be comprehensive — include all active ZIPs for these prefixes

Return ONLY a valid JSON object with no explanation, no markdown, no code fences.`;
}

// ---------------------------------------------------------------------------
// Call Claude API with retry
// ---------------------------------------------------------------------------
async function callClaudeWithRetry(
  client: Anthropic,
  prefixes: string[],
  validCbsaCodes: string[],
  maxRetries = 3
): Promise<Record<string, Record<string, unknown>>> {
  const prompt = buildPrompt(prefixes, validCbsaCodes);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const message = await client.messages.create({
        model: 'claude-opus-4-8',
        max_tokens: 16000,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = message.content
        .filter(b => b.type === 'text')
        .map(b => (b as { type: 'text'; text: string }).text)
        .join('');

      return parseClaudeResponse(content);
    } catch (err) {
      console.error(`  Attempt ${attempt}/${maxRetries} failed:`, err instanceof Error ? err.message : err);
      if (attempt < maxRetries) {
        await sleep(2000 * attempt); // exponential back-off
      }
    }
  }
  return {};
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('Error: ANTHROPIC_API_KEY is not set in .env');
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });
  const validCbsaCodes = Array.from(VALID_CBSA_CODES);

  // Build full list of 3-digit prefixes (000-999)
  const allPrefixes: string[] = [];
  for (let i = 0; i <= 999; i++) {
    allPrefixes.push(String(i).padStart(3, '0'));
  }

  // Load existing data if present (idempotent / resume support)
  let zipMap: ZipMap = {};
  if (existsSync(OUTPUT_PATH)) {
    try {
      const existing = readFileSync(OUTPUT_PATH, 'utf-8');
      zipMap = JSON.parse(existing) as ZipMap;
      console.log(`Loaded ${Object.keys(zipMap).length} existing ZIP entries from ${OUTPUT_PATH}`);
    } catch {
      console.warn('Warning: could not parse existing zip-to-cbsa.json — starting fresh');
      zipMap = {};
    }
  }

  // Determine which prefixes already have data (skip if we already have ≥30 ZIPs for a prefix)
  const coveredPrefixes = new Set<string>();
  for (const zip of Object.keys(zipMap)) {
    const prefix = zip.substring(0, 3);
    const count = Object.keys(zipMap).filter(z => z.startsWith(prefix)).length;
    if (count >= 30) coveredPrefixes.add(prefix);
  }

  const pendingPrefixes = allPrefixes.filter(p => !coveredPrefixes.has(p));
  console.log(`\nTotal prefixes: ${allPrefixes.length}`);
  console.log(`Already covered: ${coveredPrefixes.size}`);
  console.log(`To process: ${pendingPrefixes.length}`);

  // Process in batches of 10 prefixes per API call
  const BATCH_SIZE = 10;
  const batches: string[][] = [];
  for (let i = 0; i < pendingPrefixes.length; i += BATCH_SIZE) {
    batches.push(pendingPrefixes.slice(i, i + BATCH_SIZE));
  }

  console.log(`\nProcessing ${batches.length} batches of up to ${BATCH_SIZE} prefixes each...\n`);

  let totalGenerated = 0;
  let totalValid = 0;
  let totalFallback = 0;
  let batchNum = 0;

  for (const batch of batches) {
    batchNum++;
    const prefixRange = `${batch[0]}-${batch[batch.length - 1]}`;
    process.stdout.write(`[${batchNum}/${batches.length}] Processing prefixes ${prefixRange}... `);

    const raw = await callClaudeWithRetry(client, batch, validCbsaCodes);
    const rawCount = Object.keys(raw).length;
    totalGenerated += rawCount;

    let batchValid = 0;
    let batchFallback = 0;

    for (const [zip, entry] of Object.entries(raw)) {
      // ZIP must be 5 digits and start with one of our batch prefixes
      if (!/^\d{5}$/.test(zip)) continue;
      const prefix = zip.substring(0, 3);
      if (!batch.includes(prefix)) continue;

      const region = getRegionForPrefix(prefix);
      const validated = validateEntry(zip, entry as Record<string, unknown>, region.state, region.climate);
      if (!validated) continue;

      if (validated.cbsa.startsWith('RURAL-') && !(entry as Record<string, unknown>).cbsa?.toString().startsWith('RURAL-')) {
        batchFallback++;
      }

      zipMap[zip] = validated;
      batchValid++;
    }

    totalValid += batchValid;
    totalFallback += batchFallback;

    console.log(`generated ${rawCount} raw, ${batchValid} valid (${batchFallback} RURAL fallbacks)`);

    // Write intermediate results after every batch for safety
    writeFileSync(OUTPUT_PATH, JSON.stringify(zipMap, null, 2), 'utf-8');

    // Rate limiting: 1 second between API calls
    if (batchNum < batches.length) {
      await sleep(1000);
    }
  }

  // Final write (compact format for production)
  writeFileSync(OUTPUT_PATH, JSON.stringify(zipMap), 'utf-8');

  const totalZips = Object.keys(zipMap).length;
  const fileSizeKB = Math.round(Buffer.byteLength(JSON.stringify(zipMap)) / 1024);

  console.log('\n=== Complete ===');
  console.log(`Total ZIP entries: ${totalZips.toLocaleString()}`);
  console.log(`Total generated (this run): ${totalGenerated.toLocaleString()}`);
  console.log(`Total validated (this run): ${totalValid.toLocaleString()}`);
  console.log(`Total RURAL fallbacks (this run): ${totalFallback.toLocaleString()}`);
  console.log(`Output file: ${OUTPUT_PATH} (${fileSizeKB} KB)`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
