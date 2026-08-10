const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf-8');

// Replace state
content = content.replace(
  /const \[selectedChain, setSelectedChain\] = useState<ChainType>\('Alla'\);\s*const \[selectedCategory, setSelectedCategory\] = useState<string>\('Alla'\);/,
  `const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedIcaStores, setSelectedIcaStores] = useState<string[]>([]);
  const [isMultiBuyOnly, setIsMultiBuyOnly] = useState<boolean>(false);`
);

// Replace filter logic
content = content.replace(
  /const filtered = offers\.filter\(\(offer\) => \{\s*const matchesSearch = .*\s*const matchesChain = selectedChain === 'Alla' \|\| offer\.store\.chain === selectedChain;\s*const matchesCategory = selectedCategory === 'Alla' \|\| offer\.category === selectedCategory;\s*return matchesSearch && matchesChain && matchesCategory;\s*\}\);/,
  `const filtered = offers.filter((offer) => {
      const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          offer.store.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const isIca = offer.store.chain === 'ICA';
      const hasSpecificIca = selectedIcaStores.length > 0;
      const hasChains = selectedChains.length > 0;
      
      let matchesChain = true;
      if (hasChains || hasSpecificIca) {
        if (isIca) {
           const inChains = selectedChains.includes('ICA');
           const inSpecific = selectedIcaStores.includes(offer.store.name);
           matchesChain = (inChains && !hasSpecificIca) || inSpecific || (inChains && hasSpecificIca && inSpecific);
        } else {
           matchesChain = selectedChains.includes(offer.store.chain);
        }
      }
      
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(offer.category);
      const matchesMultiBuy = !isMultiBuyOnly || (offer.price_unit && offer.price_unit.toLowerCase().includes('för'));
      
      return matchesSearch && matchesChain && matchesCategory && matchesMultiBuy;
    });`
);

// Replace Header props
content = content.replace(
  /<Header\s*searchQuery=\{searchQuery\}\s*setSearchQuery=\{setSearchQuery\}\s*selectedChain=\{selectedChain\}\s*setSelectedChain=\{setSelectedChain\}\s*selectedCategory=\{selectedCategory\}\s*setSelectedCategory=\{setSelectedCategory\}/,
  `<Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedChains={selectedChains}
          setSelectedChains={setSelectedChains}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedIcaStores={selectedIcaStores}
          setSelectedIcaStores={setSelectedIcaStores}
          isMultiBuyOnly={isMultiBuyOnly}
          setIsMultiBuyOnly={setIsMultiBuyOnly}
          stores={stores}`
);

// Fix EmptyState props
content = content.replace(
  /<EmptyState\s*searchQuery=\{searchQuery\}\s*selectedChain=\{selectedChain\}\s*selectedCategory=\{selectedCategory\}\s*onClearFilters=\{\(\) => \{\s*setSearchQuery\(''\);\s*setSelectedChain\('Alla'\);\s*setSelectedCategory\('Alla'\);\s*\}\}\s*\/>/,
  `<EmptyState 
                    searchQuery={searchQuery}
                    selectedChains={selectedChains}
                    selectedCategories={selectedCategories}
                    selectedIcaStores={selectedIcaStores}
                    isMultiBuyOnly={isMultiBuyOnly}
                    onClearFilters={() => {
                      setSearchQuery('');
                      setSelectedChains([]);
                      setSelectedCategories([]);
                      setSelectedIcaStores([]);
                      setIsMultiBuyOnly(false);
                    }}
                  />`
);

fs.writeFileSync('src/app/page.tsx', content);
