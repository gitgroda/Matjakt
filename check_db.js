const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('offers').select('title, category, store:stores(chain)').eq('category', 'Skafferi');
  if (data) {
    console.log(`Found ${data.length} items in Skafferi`);
    const examples = data.map(d => `${d.store.chain}: ${d.title}`);
    console.log(examples.slice(0, 50).join('\n'));
  }
}
run();
