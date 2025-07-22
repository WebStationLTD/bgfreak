<script setup lang="ts">
import { useRoute, useHead, showError, useRuntimeConfig, useAsyncGql, onMounted, watch, ref, computed } from '#imports';
import { useProducts, useAppConfig } from '#imports';

const { products, isLoading, loadProductsPage, resetProductsState } = useProducts();
const { storeSettings } = useAppConfig();
const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const hasEverLoaded = ref(false);

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
  hasEverLoaded.value = true;
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

const shouldShowLoading = computed(() => {
  return isLoading.value || !hasEverLoaded.value;
});

const shouldShowNoProducts = computed(() => {
  return hasEverLoaded.value && !isLoading.value && (!products.value || products.value.length === 0);
});
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
        <div v-if="shouldShowLoading" class="space-y-8">
          <!-- Header skeleton -->
          <div class="flex items-center justify-between w-full gap-4 mb-8">
            <div class="h-6 bg-gray-200 rounded-md w-32 animate-pulse"></div>
            <div class="flex items-center gap-4">
              <div class="h-8 bg-gray-200 rounded-md w-24 animate-pulse hidden lg:block"></div>
              <div class="h-8 bg-gray-200 rounded-md w-10 animate-pulse lg:hidden"></div>
            </div>
          </div>

          <!-- Products grid skeleton -->
          <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            <div v-for="i in 12" :key="i" class="space-y-3">
              <div class="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
              <div class="space-y-2">
                <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div class="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                <div class="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          </div>

          <!-- Pagination skeleton -->
          <div class="flex justify-center mt-8">
            <div class="flex gap-2">
              <div v-for="i in 5" :key="i" class="h-10 w-10 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
        <div v-else>
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
          <ProductGrid v-if="!shouldShowNoProducts" :products="products" />
          <NoProductsFound v-if="shouldShowNoProducts">Няма намерени продукти в тази категория.</NoProductsFound>
          <PaginationServer :category-count="category.count" />
          <TaxonomyDescription v-if="category.description" :description="category.description" :name="category.name" :max-height="200" />
        </div>
      </main>
    </div>
  </div>
</template>
