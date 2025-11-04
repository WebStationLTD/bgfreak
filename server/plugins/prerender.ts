export default defineNitroPlugin((nitroApp) => {
  // Hook който се изпълнява при prerender
  nitroApp.hooks.hook('prerender:routes', async (routes) => {
    console.log('🚀 Fetching products for prerendering...');
    
    try {
      // GraphQL query за теглене на всички продукти
      const query = `
        query GetAllProductSlugs {
          products(first: 1000) {
            nodes {
              slug
            }
          }
          productCategories(first: 100) {
            nodes {
              slug
              parent {
                node {
                  slug
                }
              }
            }
          }
          productTags(first: 100) {
            nodes {
              slug
            }
          }
        }
      `;

      const response = await fetch('https://admin.bgfreak.store/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (data.data?.products?.nodes) {
        // Добавяме всички продуктови страници
        const productRoutes = data.data.products.nodes.map((product: any) => `/produkt/${product.slug}`);
        routes.add(...productRoutes);
        console.log(`✅ Added ${productRoutes.length} product routes`);
      }

      if (data.data?.productCategories?.nodes) {
        // Добавяме всички категории
        const categoryRoutes = data.data.productCategories.nodes.map((cat: any) => {
          if (cat.parent?.node?.slug) {
            return `/product-cat/${cat.parent.node.slug}/${cat.slug}`;
          }
          return `/product-cat/${cat.slug}`;
        });
        routes.add(...categoryRoutes);
        console.log(`✅ Added ${categoryRoutes.length} category routes`);
      }

      if (data.data?.productTags?.nodes) {
        // Добавяме всички тагове
        const tagRoutes = data.data.productTags.nodes.map((tag: any) => `/product-tag/${tag.slug}`);
        routes.add(...tagRoutes);
        console.log(`✅ Added ${tagRoutes.length} tag routes`);
      }

      console.log('✅ Prerender routes generation complete!');
    } catch (error) {
      console.error('❌ Error fetching products for prerender:', error);
    }
  });
});

