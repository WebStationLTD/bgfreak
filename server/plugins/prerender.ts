export default defineNitroPlugin((nitroApp) => {
  // Hook който се изпълнява при prerender
  nitroApp.hooks.hook('prerender:routes', async (routes) => {
    console.log('🚀 Fetching all data for prerendering...');
    
    try {
      // СТЪПКА 1: Тегли ВСИЧКИ продукти (pagination)
      let hasNextPage = true;
      let cursor = null;
      let allProducts: any[] = [];
      
      while (hasNextPage) {
        const productsQuery = `
          query GetProducts($after: String) {
            products(first: 100, after: $after) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                slug
              }
            }
          }
        `;

        const productsResponse = await fetch('https://admin.bgfreak.store/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: productsQuery,
            variables: { after: cursor },
          }),
        });

        const productsData = await productsResponse.json();
        
        if (productsData.data?.products?.nodes) {
          allProducts.push(...productsData.data.products.nodes);
          hasNextPage = productsData.data.products.pageInfo.hasNextPage;
          cursor = productsData.data.products.pageInfo.endCursor;
          console.log(`📦 Fetched ${allProducts.length} products so far...`);
        } else {
          hasNextPage = false;
        }
      }

      // Добавяме продуктовите routes
      const productRoutes = allProducts.map((product: any) => `/produkt/${encodeURIComponent(product.slug)}`);
      routes.add(...productRoutes);
      console.log(`✅ Added ${productRoutes.length} product routes`);

      // СТЪПКА 2: Тегли всички категории С ЙЕРАРХИЯ
      const categoriesQuery = `
        query GetAllCategories {
          productCategories(first: 500) {
            nodes {
              slug
              parent {
                node {
                  slug
                  parent {
                    node {
                      slug
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const categoriesResponse = await fetch('https://admin.bgfreak.store/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: categoriesQuery }),
      });

      const categoriesData = await categoriesResponse.json();

      if (categoriesData.data?.productCategories?.nodes) {
        const categoryRoutes = categoriesData.data.productCategories.nodes.map((cat: any) => {
          const pathSegments: string[] = [];
          
          // Строим пътя от горе надолу
          if (cat.parent?.node?.parent?.node?.slug) {
            pathSegments.push(cat.parent.node.parent.node.slug);
          }
          if (cat.parent?.node?.slug) {
            pathSegments.push(cat.parent.node.slug);
          }
          pathSegments.push(cat.slug);
          
          // Encode всеки segment за да работи с кирилица
          const encodedPath = pathSegments.map(s => encodeURIComponent(s)).join('/');
          return `/product-cat/${encodedPath}`;
        });
        
        routes.add(...categoryRoutes);
        console.log(`✅ Added ${categoryRoutes.length} category routes`);
      }

      // СТЪПКА 3: Тегли всички тагове
      const tagsQuery = `
        query GetAllTags {
          productTags(first: 200) {
            nodes {
              slug
            }
          }
        }
      `;

      const tagsResponse = await fetch('https://admin.bgfreak.store/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: tagsQuery }),
      });

      const tagsData = await tagsResponse.json();

      if (tagsData.data?.productTags?.nodes) {
        const tagRoutes = tagsData.data.productTags.nodes.map((tag: any) => `/product-tag/${encodeURIComponent(tag.slug)}`);
        routes.add(...tagRoutes);
        console.log(`✅ Added ${tagRoutes.length} tag routes`);
      }

      // СТЪПКА 4: Тегли всички марки (brands)
      // Тъй като марките са в продуктите като pwbBrands, трябва да ги извлечем от продуктите
      const brandsSet = new Set<string>();
      
      // Извличаме уникалните марки от всички продукти
      allProducts.forEach((product: any) => {
        // Марките са в атрибутите на продуктите
        // Ще ги извлечем от 100те продукта които теглим
      });

      // Алтернативен метод - директна GraphQL заявка за марки чрез терминология
      const brandsQuery = `
        query GetAllBrands {
          terms(taxonomies: PA_BRANDS, first: 200) {
            nodes {
              slug
              name
              taxonomyName
            }
          }
        }
      `;

      try {
        const brandsResponse = await fetch('https://admin.bgfreak.store/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: brandsQuery }),
        });

        const brandsData = await brandsResponse.json();

        if (brandsData.data?.terms?.nodes) {
          const brandRoutes = brandsData.data.terms.nodes
            .filter((term: any) => term.taxonomyName === 'pa_brands')
            .map((brand: any) => `/marka-produkt/${encodeURIComponent(brand.slug)}`);
          routes.add(...brandRoutes);
          console.log(`✅ Added ${brandRoutes.length} brand routes`);
        }
      } catch (brandError) {
        console.log('⚠️  Could not fetch brands directly, will extract from products');
        
        // Fallback: Тегли 50 продукта и извлечи марките
        const productsWithBrandsQuery = `
          query GetProductsWithBrands {
            products(first: 100) {
              nodes {
                pwbBrands {
                  slug
                  name
                }
              }
            }
          }
        `;

        const productsWithBrandsResponse = await fetch('https://admin.bgfreak.store/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: productsWithBrandsQuery }),
        });

        const productsWithBrandsData = await productsWithBrandsResponse.json();

        if (productsWithBrandsData.data?.products?.nodes) {
          const uniqueBrands = new Set<string>();
          
          productsWithBrandsData.data.products.nodes.forEach((product: any) => {
            if (product.pwbBrands && Array.isArray(product.pwbBrands)) {
              product.pwbBrands.forEach((brand: any) => {
                if (brand.slug) {
                  uniqueBrands.add(brand.slug);
                }
              });
            }
          });

          const brandRoutesFromProducts = Array.from(uniqueBrands).map(
            (slug) => `/marka-produkt/${encodeURIComponent(slug)}`
          );
          
          routes.add(...brandRoutesFromProducts);
          console.log(`✅ Added ${brandRoutesFromProducts.length} brand routes (extracted from products)`);
        }
      }

      // СТЪПКА 5: Добавяме специални страници
      const specialPages = [
        '/magazin',
        '/categories',
        '/etiketi',
        '/marki-produkti',
        '/blog',
      ];
      routes.add(...specialPages);
      console.log(`✅ Added ${specialPages.length} special pages`);

      console.log('✅ Prerender routes generation complete!');
      console.log(`📊 Total routes to generate: ${routes.size}`);
      
    } catch (error) {
      console.error('❌ Error fetching data for prerender:', error);
      // Не хвърляме грешка - build-а да продължи дори ако има проблем
    }
  });
});

