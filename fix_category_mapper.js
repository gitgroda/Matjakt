const fs = require('fs');

let content = fs.readFileSync('src/lib/utils/categoryMapper.ts', 'utf-8');

const regex = /export const normalizeCategory = \([\s\S]*?\};/m;

const newLogic = `export const normalizeCategory = (store: string, originalCategory: string, productName: string): MasterCategory => {
  const cat = (originalCategory || '').trim();
  const c = cat.toLowerCase();
  const title = (productName || '').toLowerCase();

  // 1. Explicit Overrides (Axfood mixes Chark into Meat, ICA mixes it everywhere)
  const isGenericCategory = !cat || c === 'kampanj' || c === 'färskvaror' || c === 'skafferi';
  
  if (isGenericCategory || c.includes('kott') || c.includes('kött') || c.includes('fågel')) {
    const charkFardigKeywords = ['blodpudding', 'bacon', 'skinka', 'salami', 'leverpastej', 'kassler', 'pastej', 'kalkonbröst', 'prinskorv', 'falukorv', 'medvurst', 'prosciutto', 'parma', 'färdigmat', 'köttbullar', 'pizza', 'paj', 'lasagne', 'soppa', 'pannkaka', 'sushi', 'pyttipanna'];
    if (hasWord(title, charkFardigKeywords) || hasSub(title, ['färdigrätt', 'korv'])) {
      return 'Chark & Färdigmat';
    }
  }

  // 2. Exact Match in Mapper
  if (CATEGORY_MAP[cat]) {
    // Wait, if it's "Skafferi" exact match, but the item is a kastrull, we want the fallback to catch it!
    // That's why we allowed isGenericCategory to run before!
    if (!isGenericCategory) {
      return CATEGORY_MAP[cat];
    }
  }

  // 3. Fallback Substring Matching on the category string itself
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

  // 4. Keyword Fallbacks on Title (If category is generic, OR if no category matched above)
  if (hasWord(title, ['tallrik', 'tallrikar', 'stekpanna', 'glas', 'apparat', 'maskin', 'kastrull'])) return 'Hem & Hushåll';
  if (hasWord(title, ['toalettpapper', 'tvättmedel', 'blöjor', 'schampo', 'tandkräm', 'tvål', 'duschkräm'])) return 'Hälsa & Hygien';
  if (hasWord(title, ['bröd', 'fralla', 'baguette', 'limpa', 'toast', 'kaka', 'bulle', 'bullar', 'frallor', 'korvbröd', 'hamburgerbröd'])) return 'Bröd & Bageri';
  if (hasWord(title, ['lax', 'torsk', 'räkor', 'sill', 'kräftor', 'fisk', 'fiskpinnar', 'tonfisk', 'spätta', 'sej']) || hasSub(title, ['lax', 'torsk', 'räkor'])) return 'Fisk & Skaldjur';
  if (hasWord(title, ['halloumi', 'mjölk', 'grädde', 'yoghurt', 'kvarg', 'smör', 'margarin', 'feta', 'mozzarella', 'parmesan', 'brie', 'ägg', 'creme fraiche']) || hasSub(title, ['ost'])) return 'Mejeri, Ost & Ägg';
  if (hasWord(title, ['pulled pork', 'entrecote', 'kött', 'fläsk', 'nöt']) || hasSub(title, ['kyckling', 'färs', 'biff', 'karré', 'filé'])) return 'Kött, fågel & fläsk';
  if (hasWord(title, ['äpple', 'banan', 'tomat', 'gurka', 'sallad', 'potatis', 'lök', 'morot', 'paprika', 'apelsin', 'citron', 'druvor', 'melon'])) return 'Frukt & Grönt';
  if (hasWord(title, ['läsk', 'saft', 'juice', 'chips', 'choklad', 'cola', 'fanta', 'sprite', 'vatten', 'öl', 'cider', 'kexchoklad', 'godis', 'nötter', 'bilar'])) return 'Dryck & Godis';
  if (hasWord(title, ['fryst', 'glass', 'is', 'frysta', 'isbitar'])) return 'Frys';
  if (hasWord(title, ['pastasås', 'pasta', 'ris', 'olja', 'sås', 'krydda', 'kaffe', 'te', 'mjöl', 'socker', 'knäckebröd', 'ketchup', 'senap', 'majonnäs'])) return 'Skafferi';

  return 'Skafferi';
};`;

content = content.replace(regex, newLogic);
fs.writeFileSync('src/lib/utils/categoryMapper.ts', content);
