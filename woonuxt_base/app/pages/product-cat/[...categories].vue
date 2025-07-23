<script setup lang="ts">
import { useRoute, useHead, showError, useRuntimeConfig, useAsyncGql, onMounted, watch, ref, computed } from '#imports';
import { useProducts, useAppConfig } from '#imports';

interface ExtendedCategory {
  slug?: string | null;
  name?: string | null;
  databaseId?: number | null;
  description?: string | null;
  count?: number | null;
  parent?: {
    node?: {
      slug?: string | null;
      name?: string | null;
      databaseId?: number | null;
    } | null;
  } | null;
  children?: {
    nodes?: ExtendedCategory[] | null;
  } | null;
  seo?: {
    title?: string | null;
    metaDesc?: string | null;
    opengraphTitle?: string | null;
  } | null;
}

const { products, isLoading, loadProductsPage, resetProductsState } = useProducts();
const { storeSettings } = useAppConfig();
const { findCategoryBySlug, validateCategoryPath, getBreadcrumbData, generateUrlFromPath } = useCategoryUrls();
const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const hasEverLoaded = ref(false);

// Парсваме пътя от URL-а
const fullPath = route.path;
const categoryPart = fullPath.replace('/product-cat/', '').replace(/\/page\/\d+$/, '');
// Декодираме URL кодираните символи (кирилица)
const decodedPart = decodeURIComponent(categoryPart);
const urlSegments = decodedPart.split('/').filter(Boolean);

const pageNumber = Number(route.params.pageNumber) || 1;

// Получаваме текущия slug
const currentCategorySlug = urlSegments[urlSegments.length - 1] || '';

// Зареждаме конкретната категория директно по slug (като старите страници)
const { data: categoryData } = await useAsyncGql('getProductCategories', {
  slug: currentCategorySlug ? [currentCategorySlug] : [],
  hideEmpty: false,
});

const category = categoryData.value?.productCategories?.nodes?.[0] || null;

// ВРЕМЕННО: Пропускаме валидирането на пътя, защото има проблем
// За валидиране на пътя, зареждаме всички категории само ако е нужно
// const { data: allCategoriesData } = await useAsyncGql('getProductCategories', { first: 100, hideEmpty: false });
// const allCategories = (allCategoriesData.value?.productCategories?.nodes || []) as ExtendedCategory[];

// // Валидираме дали пътят съществува
// const isValidPath = validateCategoryPath(urlSegments.value, allCategories);

// console.log('🔍 Path validation:');
// console.log('- Path segments:', urlSegments.value);
// console.log('- Is valid path:', isValidPath);
// console.log('- Category found:', !!category);
// console.log('- Should show 404:', !category || !isValidPath);

// Breadcrumb данни
// const breadcrumbs = currentCategorySlug ? getBreadcrumbData(currentCategorySlug, allCategories) : [];
const breadcrumbs: any[] = [];

// 404 ако категорията не съществува или пътят е невалиден
if (!category) {
  console.log('❌ Throwing 404 error - Category not found');
  throw showError({ statusCode: 404, message: 'Category not found' });
}

// SEO данни
const frontEndUrl = runtimeConfig.public.FRONT_END_URL;
const canonicalUrl = computed(() => {
  const baseUrl = `${frontEndUrl}/product-cat/${urlSegments.join('/')}`;
  return pageNumber > 1 ? `${baseUrl}/page/${pageNumber}` : baseUrl;
});

const pageTitle = computed(() => {
  const cat = category;
  if (!cat) return 'Категория не е намерена';

  if (pageNumber > 1) {
    return `${cat.seo?.title || cat.name} - Страница ${pageNumber}`;
  }

  return cat.seo?.title || cat.name || 'Категория';
});

useHead({
  title: pageTitle,
  meta: [
    { name: 'description', content: computed(() => category?.seo?.metaDesc || category?.description) },
    { property: 'og:title', content: computed(() => category?.seo?.opengraphTitle || pageTitle.value) },
  ],
  link: [{ rel: 'canonical', href: canonicalUrl }],
});

// Зареждаме продуктите и на сървъра (SSR) и на клиента
try {
  if (currentCategorySlug) {
    const page = pageNumber || 1;
    await loadProductsPage(page, [currentCategorySlug]);
  }
} catch (error) {
  console.error('SSR loading error:', error);
}

onMounted(async () => {
  resetProductsState();
  if (currentCategorySlug && (!products.value || products.value.length === 0)) {
    // Зареждаме продуктите само ако не са вече заредени (за да избегнем двойно зареждане)
    const page = pageNumber || 1;
    await loadProductsPage(page, [currentCategorySlug]);
  }
  hasEverLoaded.value = true;
});

watch(
  () => route.query,
  async () => {
    if (process.client && currentCategorySlug) {
      await loadProductsPage(pageNumber, [currentCategorySlug]);
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
    <div v-if="category" :key="currentCategorySlug" class="flex flex-col lg:flex-row gap-0 sm:gap-8">
      <aside v-if="storeSettings?.showFilters" class="hidden lg:block lg:w-80 flex-shrink-0">
        <div class="sticky top-4">
          <Filters :hide-categories="true" :category-slug="currentCategorySlug" />
        </div>
      </aside>

      <main class="flex-1 min-w-0">
        <!-- Breadcrumb навигация -->
        <!-- <nav v-if="breadcrumbs.length > 1" class="mb-6 text-sm text-gray-600">
          <ol class="flex items-center space-x-2">
            <li>
              <NuxtLink to="/" class="hover:text-gray-900">Начало</NuxtLink>
            </li>
            <li v-for="(crumb, index) in breadcrumbs" :key="crumb.slug || index">
              <span class="mx-2">/</span>
              <NuxtLink v-if="!crumb.isLast" :to="crumb.url" class="hover:text-gray-900">
                {{ crumb.name }}
              </NuxtLink>
              <span v-else class="text-gray-900 font-medium">{{ crumb.name }}</span>
            </li>
          </ol>
        </nav> -->

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

          <!-- Подкатегории ако има такива -->
          <SubcategoriesSection
            v-if="category.children?.nodes?.length && pageNumber === 1 && !route.query.filter"
            :category="category"
            :current-path="urlSegments" />

          <ProductGrid v-if="!shouldShowNoProducts" :products="products" />
          <NoProductsFound v-if="shouldShowNoProducts">Няма намерени продукти в тази категория.</NoProductsFound>
          <PaginationServer :category-count="category.count || 0" />
          <TaxonomyDescription v-if="category.description" :description="category.description" :name="category.name" :max-height="200" />
        </div>
      </main>
    </div>
  </div>
</template>
