export type MasterCategory =
  | 'Kött, fågel & fläsk'
  | 'Chark & Färdigmat'
  | 'Mejeri, Ost & Ägg'
  | 'Frukt & Grönt'
  | 'Skafferi'
  | 'Fisk & Skaldjur'
  | 'Dryck & Godis'
  | 'Bröd & Bageri'
  | 'Frys'
  | 'Hem & Hushåll'
  | 'Hälsa & Hygien'
  | 'Övrigt';

const CATEGORY_MAP: Record<string, MasterCategory> = {
  // Axfood Categories
  'Kott-chark-och-fagel': 'Kött, fågel & fläsk', // Will be refined by keyword if needed
  'kott-fagel-och-chark': 'Kött, fågel & fläsk',
  'Mejeri-ost-och-agg': 'Mejeri, Ost & Ägg',
  'mejeri-ost-och-agg': 'Mejeri, Ost & Ägg',
  'Frukt-och-gront': 'Frukt & Grönt',
  'frukt-och-gront': 'Frukt & Grönt',
  'Skafferi': 'Skafferi',
  'skafferi': 'Skafferi',
  'Fisk-och-skaldjur': 'Fisk & Skaldjur',
  'fisk-och-skaldjur': 'Fisk & Skaldjur',
  'Frys': 'Frys',
  'fryst': 'Frys',
  'Dryck': 'Dryck & Godis',
  'dryck': 'Dryck & Godis',
  'Godis-och-snacks': 'Dryck & Godis',
  'godis-snacks-och-glass': 'Dryck & Godis',
  'fardigmat': 'Chark & Färdigmat',
  'Brod-och-kakor': 'Bröd & Bageri',
  'brod-och-kakor': 'Bröd & Bageri',
  'Hem-och-hushall': 'Hem & Hushåll',
  'hem-och-hushall': 'Hem & Hushåll',
  'Halsa-och-skonhet': 'Hälsa & Hygien',
  'halsa-och-skonhet': 'Hälsa & Hygien',
  'Barn': 'Hälsa & Hygien',
  'barn': 'Hälsa & Hygien',
  'Apotek': 'Hälsa & Hygien',

  // ICA Categories (approximations based on common ICA group names)
  'Frukt & Grönt': 'Frukt & Grönt',
  'Kött': 'Kött, fågel & fläsk',
  'Fågel': 'Kött, fågel & fläsk',
  'Fläsk': 'Kött, fågel & fläsk',
  'Chark': 'Chark & Färdigmat',
  'Färdigmat': 'Chark & Färdigmat',
  'Mejeri': 'Mejeri, Ost & Ägg',
  'Ost': 'Mejeri, Ost & Ägg',
  'Fisk': 'Fisk & Skaldjur',
  'Bröd': 'Bröd & Bageri',
  'Frysvaror': 'Frys',
  'Godis': 'Dryck & Godis',
  'Kiosk': 'Dryck & Godis',
  'Hem & Fritid': 'Hem & Hushåll',
  'Hygien': 'Hälsa & Hygien',
  'Djur': 'Hälsa & Hygien' // Maybe a separate category later, but hygien/hem for now
};

const hasWord = (title: string, words: string[]) => {
  return words.some(word => new RegExp(`\\b${word}\\b`, 'i').test(title));
};

const hasSub = (title: string, words: string[]) => {
  return words.some(word => title.toLowerCase().includes(word.toLowerCase()));
};

export const normalizeCategory = (store: string, originalCategory: string, productName: string): MasterCategory => {
  const cat = (originalCategory || '').trim();
  const c = cat.toLowerCase();
  const title = (productName || '').toLowerCase();

  // 1. Determine base category from API (using EXACT matches and substrings)
  let baseCategory: MasterCategory = 'Övrigt';

  if (CATEGORY_MAP[cat]) {
    baseCategory = CATEGORY_MAP[cat];
  } else if (c.includes('hem') || c.includes('kök') || c.includes('leksaker') || c.includes('fritid')) {
    baseCategory = 'Hem & Hushåll';
  } else if (c.includes('hälsa') || c.includes('hygien') || c.includes('apotek') || c.includes('djur')) {
    baseCategory = 'Hälsa & Hygien';
  } else if (c.includes('bröd') || c.includes('bageri') || c.includes('kex')) {
    baseCategory = 'Bröd & Bageri';
  } else if (c.includes('fisk') || c.includes('skaldjur')) {
    baseCategory = 'Fisk & Skaldjur';
  } else if (c.includes('mejeri') || c.includes('ost') || c.includes('ägg')) {
    baseCategory = 'Mejeri, Ost & Ägg';
  } else if (c.includes('chark') || c.includes('färdigmat')) {
    baseCategory = 'Chark & Färdigmat';
  } else if (c.includes('kott') || c.includes('kött') || c.includes('fågel') || c.includes('fläsk')) {
    baseCategory = 'Kött, fågel & fläsk';
  } else if (c.includes('frukt') || c.includes('grönt')) {
    baseCategory = 'Frukt & Grönt';
  } else if (c.includes('dryck') || c.includes('godis') || c.includes('snacks') || c.includes('kiosk')) {
    baseCategory = 'Dryck & Godis';
  } else if (c.includes('frys')) {
    baseCategory = 'Frys';
  } else if (c.includes('skafferi') || c.includes('kolonial')) {
    baseCategory = 'Skafferi';
  }

  // 2. Keyword-based overrides based on the title
  // This fixes cases where API says "Skafferi" or "Färskvaror" or "Kött-chark-fågel" 
  // but the title clearly belongs elsewhere.
  
  if (hasWord(title, ['tallrik', 'tallrikar', 'stekpanna', 'glas', 'apparat', 'maskin', 'kastrull', 'bestick', 'strumpor', 'handduk', 'kalsonger', 'trosor', 'grill', 'kol', 'briketter'])) return 'Hem & Hushåll';
  if (hasWord(title, ['toalettpapper', 'tvättmedel', 'blöjor', 'schampo', 'tandkräm', 'tvål', 'duschkräm', 'balsam', 'deo', 'deodorant', 'bindor', 'tamponger'])) return 'Hälsa & Hygien';
  
  const charkFardigKeywords = ['blodpudding', 'bacon', 'skinka', 'salami', 'leverpastej', 'kassler', 'pastej', 'kalkon', 'kalkonbröst', 'kalkonskivor', 'rostbiff', 'pålägg', 'prinskorv', 'falukorv', 'medvurst', 'prosciutto', 'parma', 'färdigmat', 'köttbullar', 'pizza', 'paj', 'lasagne', 'soppa', 'pannkaka', 'sushi', 'pyttipanna', 'korv', 'grillkorv', 'varmkorv', 'wienerkorv', 'frukostkorv', 'tjockkorv', 'kabanoss', 'chorizo', 'färdigrätt'];
  if (hasWord(title, charkFardigKeywords)) return 'Chark & Färdigmat';
  
  if (hasWord(title, ['lax', 'torsk', 'räkor', 'sill', 'kräftor', 'fisk', 'fiskpinnar', 'tonfisk', 'spätta', 'sej', 'kaviar', 'laxfilé', 'torskfilé', 'skaldjur'])) return 'Fisk & Skaldjur';
  if (hasWord(title, ['halloumi', 'mjölk', 'grädde', 'yoghurt', 'kvarg', 'smör', 'margarin', 'feta', 'mozzarella', 'parmesan', 'brie', 'ägg', 'creme fraiche', 'ost', 'prästost', 'hushållsost', 'herrgårdsost', 'gouda', 'edamer', 'grevé', 'västerbottensost', 'gräddfil'])) return 'Mejeri, Ost & Ägg';
  if (hasWord(title, ['pulled pork', 'entrecote', 'kött', 'fläsk', 'nöt', 'kyckling', 'färs', 'biff', 'karré', 'filé', 'kycklingfilé', 'kycklingbröst', 'kycklinglår', 'kycklingben', 'nötfärs', 'blandfärs', 'fläskfärs', 'fläskfilé', 'ryggbiff', 'oxfilé'])) return 'Kött, fågel & fläsk';
  if (hasWord(title, ['äpple', 'banan', 'tomat', 'gurka', 'sallad', 'potatis', 'lök', 'morot', 'paprika', 'apelsin', 'citron', 'druvor', 'melon', 'päron', 'kiwi', 'mango', 'avokado', 'morötter', 'tomater', 'isbergssallad'])) return 'Frukt & Grönt';
  if (hasWord(title, ['läsk', 'saft', 'juice', 'chips', 'choklad', 'cola', 'fanta', 'sprite', 'vatten', 'öl', 'cider', 'kexchoklad', 'godis', 'nötter', 'bilar', 'chokladkaka', 'ostbågar', 'mineralvatten', 'kex'])) return 'Dryck & Godis';
  if (hasWord(title, ['fryst', 'glass', 'is', 'frysta', 'isbitar', 'piggelin', 'nogger', 'magnum', 'isglass', 'strut', 'pinnglass'])) return 'Frys';
  if (hasWord(title, ['pastasås', 'pasta', 'ris', 'olja', 'sås', 'krydda', 'kaffe', 'te', 'mjöl', 'socker', 'knäckebröd', 'ketchup', 'senap', 'majonnäs', 'bearnaise', 'dressing', 'sirap', 'flingor', 'müsli', 'havregryn', 'sylt', 'marmelad', 'ostsås'])) return 'Skafferi';
  if (hasWord(title, ['bröd', 'fralla', 'baguette', 'limpa', 'toast', 'kaka', 'bulle', 'bullar', 'frallor', 'korvbröd', 'hamburgerbröd', 'fikabröd'])) return 'Bröd & Bageri';

  // If no specific keyword override triggered, trust the API's base category!
  return baseCategory;
};
