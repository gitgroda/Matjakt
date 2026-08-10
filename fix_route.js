const fs = require('fs');
let content = fs.readFileSync('src/app/api/sync-offers/route.ts', 'utf-8');

// Add import if missing
if (!content.includes('import { normalizeCategory }')) {
  content = content.replace(
    /import vm from 'vm';/,
    "import vm from 'vm';\nimport { normalizeCategory } from '@/lib/utils/categoryMapper';"
  );
}

// Replace the ICA usage
content = content.replace(/category:\s*mapCategoryName\(.*?\),/g, "category: normalizeCategory('ICA', categoryName, finalTitle),");
content = content.replace(/category:\s*normalizeCategory\(cat\),/g, "category: normalizeCategory(chain, cat, item.name),");

fs.writeFileSync('src/app/api/sync-offers/route.ts', content);
