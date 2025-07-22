<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { useRoute, useHead, showError, useRuntimeConfig, useAsyncGql, navigateTo } from '#imports';
import { useProducts, useAppConfig, useHelpers, useFiltering } from '#imports';

const { products, isLoading, resetProductsState, pageInfo, productsPerPage, loadProductsPage, currentPage } = useProducts();
const { storeSettings } = useAppConfig();
const { frontEndUrl } = useHelpers();
const route = useRoute();

const parentSlug = route.params.parent as string;
const childSlug = route.params.child as string;
const pageNumber = computed(() => Number(route.params.pageNumber) || 1);

const { data: categoryData } = await useAsyncGql('getProductCategories', { slug: [childSlug] });
const category = computed(() => categoryData.value?.productCategories?.nodes?.[0] || null);
const parentCategory = computed(() => category.value?.parent?.node || null);

if (!category.value) {
  throw showError({ statusCode: 404, statusMessage: 'Category not found' });
}

const canonicalUrl = computed(() => {
  const url = `${frontEndUrl || 'https://bgfreak.vercel.app'}/product-cat/${parentSlug}/${childSlug}`;
  return pageNumber.value > 1 ? `${url}/page/${pageNumber.value}` : url;
});

useHead({
  title: computed(() => category.value?.seo?.title || `${category.value?.name} | ${parentCategory.value?.name}`),
  // ... other meta tags
});

onMounted(async () => {
  resetProductsState();
  await loadProductsPage(pageNumber.value, [childSlug]);
});

watch(
  () => route.query,
  () => {
    if (process.client) {
      loadProductsPage(pageNumber.value, [childSlug]);
    }
  },
  { deep: true },
);
</script>

<template>
  <div class="container mx-auto px-2 py-4 sm:py-6">
    <div :key="`${parentSlug}-${childSlug}` || 'no-category'" class="flex flex-col lg:flex-row gap-0 sm:gap-8">
      <aside v-if="storeSettings?.showFilters" class="hidden lg:block lg:w-80 flex-shrink-0">
        <div class="sticky top-4">
          <Filters :hide-categories="true" :category-slug="childSlug" />
        </div>
      </aside>
      <main v-if="childSlug" class="flex-1 min-w-0">
        <nav v-if="parentCategory && category" class="mb-6 text-sm text-gray-600">
          <ol class="flex items-center space-x-2">
            <li>
              <NuxtLink to="/" class="hover:text-gray-900">Начало</NuxtLink>
            </li>
            <li>
              <span class="mx-2">/</span>
              <NuxtLink :to="`/product-cat/${parentCategory.slug}`" class="hover:text-gray-900">
                {{ parentCategory.name }}
              </NuxtLink>
            </li>
            <li>
              <span class="mx-2">/</span>
              <span class="text-gray-900 font-medium">{{ category.name }}</span>
            </li>
          </ol>
        </nav>
        <div v-if="isLoading" class="space-y-8">
          <div class="flex items-center justify-between w-full gap-4 mb-8 c6">
            <div class="h-6 bg-gray-200 rounded-md w-32 animate-pulse"></div>
            <div class="flex items-center gap-4">
              <div class="h-8 bg-gray-200 rounded-md w-24 animate-pulse hidden lg:block"></div>
              <div class="h-8 bg-gray-200 rounded-md w-10 animate-pulse lg:hidden"></div>
            </div>
          </div>
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
          <div class="flex justify-center mt-8">
            <div class="flex gap-2">
              <div v-for="i in 5" :key="i" class="h-10 w-10 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
        <div v-else-if="products?.length" class="space-y-8">
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
          <ProductGrid :products="products" />
          <PaginationServer v-if="category" :category-count="category.count" />
          <TaxonomyDescription v-if="category?.description" :description="category.description" :name="category.name" :max-height="200" />
        </div>
        <NoProductsFound v-else-if="!isLoading && !products?.length">
          <div class="text-center">
            <h2 class="text-xl font-bold mb-4">Не са намерени продукти в тази категория</h2>
            <div class="mt-4 text-sm text-gray-600">
              <p>Опитайте да промените филтрите или изберете друга категория.</p>
              <div v-if="category?.name && parentCategory?.name" class="mt-2">
                <p>Категория: {{ parentCategory.name }} > {{ category.name }}</p>
              </div>
            </div>
          </div>
        </NoProductsFound>
      </main>
    </div>
  </div>
</template>
