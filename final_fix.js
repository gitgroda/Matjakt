const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf-8');
content = content.replace(/selectedChainss/g, 'selectedChains');
content = content.replace(/selectedChains === 'Alla'/g, 'selectedChains.length === 0');
content = content.replace(/selectedCategories === 'Alla'/g, 'selectedCategories.length === 0');
content = content.replace(/setSelectedChain/g, 'setSelectedChains');
content = content.replace(/setSelectedCategory/g, 'setSelectedCategories');

// Fix the EmptyState props (it was looking for selectedChains but missing selectedIcaStores/isMultiBuyOnly)
content = content.replace(/<EmptyState[\s\S]*?\/>/, 
  `<EmptyState 
                    searchQuery={searchQuery}
                    selectedChains={selectedChains}
                    selectedCategories={selectedCategories}
                    selectedIcaStores={selectedIcaStores}
                    isMultiBuyOnly={isMultiBuyOnly}
                    onClearFilters={handleResetFilters}
                  />`
);

// Fix the handeResetFilters to reset everything properly
content = content.replace(/const handleResetFilters = \(\) => {[\s\S]*?};/,
  `const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedChains([]);
    setSelectedCategories([]);
    setSelectedIcaStores([]);
    setIsMultiBuyOnly(false);
    setSortBy('best-price');
  };`
);
fs.writeFileSync('src/app/page.tsx', content);
