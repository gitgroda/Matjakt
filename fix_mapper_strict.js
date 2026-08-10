const fs = require('fs');

let content = fs.readFileSync('src/lib/utils/categoryMapper.ts', 'utf-8');

const regex = /export const normalizeCategory = \([\s\S]*?\};/m;

const newLogic = `export const normalizeCategory = (store: string, originalCategory: string, productName: string): MasterCategory => {
  const cat = (originalCategory || '').trim();
  const c = cat.toLowerCase();
  const title = (productName || '').toLowerCase();

  const isGenericCategory = !cat || c === 'kampanj' || c === 'färskvaror' || c === 'skafferi' || c === 'övrigt';
  
  if (isGenericCategory || c.includes('kott') || c.includes('kött') || c.includes('fågel')) {
    const charkFardigKeywords = ['blodpudding', 'bacon', 'skinka', 'salami', 'leverpastej', 'kassler', 'pastej', 'kalkonbröst', 'prinskorv', 'falukorv', 'medvurst', 'prosciutto', 'parma', 'färdigmat', 'köttbullar', 'pizza', 'paj', 'lasagne', 'soppa', 'pannkaka', 'sushi', 'pyttipanna', 'korv', 'grillkorv', 'varmkorv', 'wienerkorv', 'frukostkorv', 'tjockkorv', 'kabanoss', 'chorizo', 'färdigrätt'];
    if (hasWord(title, charkFardigKeywords)) {
      return 'Chark & Färdigmat';
    }
  }

  // Exact Match in Mapper
  if (CATEGORY_MAP[cat]) {
    if (!isGenericCategory) {
      return CATEGORY_MAP[cat];
    }
  }

  // Fallback Substring Matching on the category string itself
  if (!isGenericCategory) {
    if (c.includes('hem') || c.includes('kök') || c.includes('leksaker') || c.includes('fritid')) return 'Hem & Hushåll';
    if (c.includes('hälsa') || c.includes('hygien') || c.includes('apotek') || c.includes('djur')) return 'Hälsa & Hygien';
    if (c.includes('bröd') || c.includes('bageri')) return 'Bröd & Bageri';
    if (c.includes('fisk') || c.includes('skaldjur')) return 'Fisk & Skaldjur';
    if (c.includes('mejeri') || c.includes('ost') || c.includes('ägg')) return 'Mejeri, Ost & Ägg';
    if (c.includes('chark') || c.includes('färdigmat')) return 'Chark & Färdigmat';
    if (c.includes('kött') || c.includes('fågel') || c.includes('fläsk')) return 'Kött, fågel & fläsk';
    if (c.includes('frukt') || c.includes('grönt')) return 'Frukt & Grönt';
    if (c.includes('dryck') || c.includes('godis') || c.includes('snacks') || c.includes('kiosk')) return 'Dryck & Godis';
    if (c.includes('frys')) return 'Frys';
    if (c.includes('skafferi')) return 'Skafferi';
  }

  // Keyword Fallbacks on Title (Using strict hasWord matching, no hasSub to avoid false positives like ostsås)
  if (hasWord(title, ['tallrik', 'tallrikar', 'stekpanna', 'glas', 'apparat', 'maskin', 'kastrull'])) return 'Hem & Hushåll';
  if (hasWord(title, ['toalettpapper', 'tvättmedel', 'blöjor', 'schampo', 'tandkräm', 'tvål', 'duschkräm'])) return 'Hälsa & Hygien';
  if (hasWord(title, ['bröd', 'fralla', 'baguette', 'limpa', 'toast', 'kaka', 'bulle', 'bullar', 'frallor', 'korvbröd', 'hamburgerbröd', 'fikabröd'])) return 'Bröd & Bageri';
  if (hasWord(title, ['lax', 'torsk', 'räkor', 'sill', 'kräftor', 'fisk', 'fiskpinnar', 'tonfisk', 'spätta', 'sej', 'kaviar', 'laxfilé', 'torskfilé', 'skaldjur'])) return 'Fisk & Skaldjur';
  if (hasWord(title, ['halloumi', 'mjölk', 'grädde', 'yoghurt', 'kvarg', 'smör', 'margarin', 'feta', 'mozzarella', 'parmesan', 'brie', 'ägg', 'creme fraiche', 'ost', 'prästost', 'hushållsost', 'herrgårdsost', 'gouda', 'edamer', 'grevé', 'västerbottensost', 'gräddfil'])) return 'Mejeri, Ost & Ägg';
  if (hasWord(title, ['pulled pork', 'entrecote', 'kött', 'fläsk', 'nöt', 'kyckling', 'färs', 'biff', 'karré', 'filé', 'kycklingfilé', 'kycklingbröst', 'kycklinglår', 'kycklingben', 'nötfärs', 'blandfärs', 'fläskfärs', 'fläskfilé', 'ryggbiff', 'oxfilé'])) return 'Kött, fågel & fläsk';
  if (hasWord(title, ['äpple', 'banan', 'tomat', 'gurka', 'sallad', 'potatis', 'lök', 'morot', 'paprika', 'apelsin', 'citron', 'druvor', 'melon', 'päron', 'kiwi', 'mango', 'avokado', 'morötter', 'tomater', 'isbergssallad'])) return 'Frukt & Grönt';
  if (hasWord(title, ['läsk', 'saft', 'juice', 'chips', 'choklad', 'cola', 'fanta', 'sprite', 'vatten', 'öl', 'cider', 'kexchoklad', 'godis', 'nötter', 'bilar', 'chokladkaka', 'ostbågar', 'mineralvatten'])) return 'Dryck & Godis';
  if (hasWord(title, ['fryst', 'glass', 'is', 'frysta', 'isbitar', 'piggelin', 'nogger', 'magnum', 'isglass', 'strut', 'pinnglass'])) return 'Frys';
  if (hasWord(title, ['pastasås', 'pasta', 'ris', 'olja', 'sås', 'krydda', 'kaffe', 'te', 'mjöl', 'socker', 'knäckebröd', 'ketchup', 'senap', 'majonnäs', 'ostsås', 'bearnaise', 'dressing', 'sirap', 'flingor', 'müsli', 'havregryn', 'sylt', 'marmelad'])) return 'Skafferi';

  // Default if absolutely nothing matches
  return 'Övrigt';
};`;

content = content.replace(regex, newLogic);
// Also modify hasWord to optionally match word boundaries OR allow dashes/compound parts.
// Let's keep hasWord as strict \b for now since we expanded the vocabulary.
fs.writeFileSync('src/lib/utils/categoryMapper.ts', content);
