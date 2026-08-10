const vm = require('vm');
async function test() {
  const url = 'https://www.ica.se/butiker/maxi/uppsala/maxi-ica-stormarknad-stenhagen-uppsala-1004488/erbjudanden/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }});
  const html = await res.text();
  const match = html.match(/window\.__INITIAL_DATA__\s*=\s*({[\s\S]*?});\s*<\/script>/);
  if (match) {
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext('window.__INITIAL_DATA__ = ' + match[1], sandbox);
    const data = sandbox.window.__INITIAL_DATA__;
    const rawOffers = data?.offers?.weeklyOffers || [];
    console.log(rawOffers.slice(0, 10).map(o => o.category?.name || o.category?.articleGroupName || o.productCategory || o.categoryName || 'Unknown'));
    console.log(rawOffers[0]);
  }
}
test();
