const fs = require('fs');

async function test() {
  try {
    const res = await fetch('https://www.willys.se/leftMenu/categorytree');
    const data = await res.json();
    const categories = data.children.map(c => c.title);
    console.log("Willys Categories:");
    console.log(categories);
    
    // Also we can fetch offers and see what they have
    const offersRes = await fetch('https://www.willys.se/search/campaigns?offline=true&page=0&size=500');
    const offersData = await offersRes.json();
    const offerCats = [...new Set(offersData.results.map(r => r.category?.title || r.category?.url || 'Missing'))];
    console.log("Willys Offer Categories:");
    console.log(offerCats);

  } catch(e) {
    console.error(e);
  }
}
test();
