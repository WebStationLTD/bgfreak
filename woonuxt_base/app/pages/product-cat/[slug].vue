<script setup lang="ts">
import { useRoute, useHead, showError, useRuntimeConfig, useAsyncGql, onMounted, watch } from '#imports';
import { useProducts, useAppConfig } from '#imports';

const { products, loadProductsPage, resetProductsState } = useProducts();
const { storeSettings } = useAppConfig();
const route = useRoute();
const runtimeConfig = useRuntimeConfig();

const slug = (route.params.slug || route.params.categorySlug) as string;
const pageNumber = Number(route.params.pageNumber) || 1;

const { data: categoryData } = await useAsyncGql('getProductCategories', { slug });
const category = categoryData.value?.productCategories?.nodes?.[0];

if (!category) {
  throw showError({ statusCode: 404, message: 'Category not found' });
}

const frontEndUrl = runtimeConfig.public.FRONT_END_URL;
const canonicalUrl = pageNumber > 1 ? `${frontEndUrl}/product-cat/${slug}/page/${pageNumber}` : `${frontEndUrl}/product-cat/${slug}`;

useHead({
  title: category.seo?.title || category.name,
  meta: [
    { name: 'description', content: category.seo?.metaDesc || category.description },
    { property: 'og:title', content: category.seo?.opengraphTitle || category.seo?.title || category.name },
  ],
  link: [{ rel: 'canonical', href: canonicalUrl }],
});

onMounted(async () => {
  resetProductsState();
  await loadProductsPage(pageNumber, [slug]);
});

watch(
  () => route.query,
  () => {
    if (process.client) {
      loadProductsPage(pageNumber, [slug]);
    }
  },
  { deep: true },
);
</script>

<template>
  <div class="container mx-auto px-2 py-4 sm:py-6">
    <div v-if="category" :key="slug" class="flex flex-col lg:flex-row gap-0 sm:gap-8">
      <aside v-if="storeSettings?.showFilters" class="hidden lg:block lg:w-80 flex-shrink-0">
        <div class="sticky top-4">
          <Filters :hide-categories="true" :category-slug="slug" />
        </div>
      </aside>

      <main class="flex-1 min-w-0">
        <div class="flex items-center justify-between w-full gap-4 mb-2 sm:mb-8">
          <ProductResultCount />
          <div class="flex items-center gap-4">
            <OrderByDropdown class="hidden lg:inline-flex" v-if="storeSettings?.showOrderByDropdown" />
            <div v-if="storeSettings?.showFilters" class="flex items-center gap-2 lg:hidden">
              <span class="text-sm font-light">Филтри</span>
              <ShowFilterTrigger />
            </div>
          </div>
        </div>
        <SubcategoriesSection v-if="category.children?.nodes?.length && pageNumber === 1 && !route.query.filter" :category="category" />
        <ProductGrid :products="products" />
        <PaginationServer :category-count="category.count" />
        <TaxonomyDescription v-if="category.description" :description="category.description" :name="category.name" :max-height="200" />
      </main>
    </div>
  </div>
</template>
