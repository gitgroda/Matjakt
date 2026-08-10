const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf-8');

// The rewrite_page.js left some selectedChain and selectedCategory.
// Let's replace them carefully.

// useEffect dependencies:
content = content.replace(/searchQuery, selectedChain, selectedCategory/g, 'searchQuery, selectedChains, selectedCategories, selectedIcaStores, isMultiBuyOnly');

// handleLoadOffers or others:
content = content.replace(/setSelectedChain\('Alla'\)/g, 'setSelectedChains([])');
content = content.replace(/setSelectedCategory\('Alla'\)/g, 'setSelectedCategories([])');
content = content.replace(/selectedChain !== 'Alla'/g, 'selectedChains.length > 0');
content = content.replace(/selectedCategory !== 'Alla'/g, 'selectedCategories.length > 0');

content = content.replace(/selectedChain/g, 'selectedChains');
content = content.replace(/selectedCategory/g, 'selectedCategories');

// Wait, the previous empty state still had selectedChain: any because of a missed replace:
content = content.replace(/<EmptyState \n                    searchQuery=\{searchQuery\}\n                    selectedChain=\{selectedChains\}/g, 
  `<EmptyState 
                    searchQuery={searchQuery}
                    selectedChains={selectedChains}`);

fs.writeFileSync('src/app/page.tsx', content);
