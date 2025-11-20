<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue';

// Зареждаме @vueform/slider CSS САМО на страници с филтри
import '@vueform/slider/themes/default.css';

const { loadProductsPageOptimized, jumpToPageOptimized, products, isLoading, resetProductsState, pageInfo, currentPage, productsPerPage } = useProducts();
const { buildGraphQLFilters } = useFiltering();
const { storeSettings } = useAppConfig();
const { frontEndUrl } = useHelpers();
const route = useRoute();
const runtimeConfig = useRuntimeConfig();

// Проследяваме дали някога сме зареждали данни
const hasEverLoaded = ref(false);

interface Category {
  slug?: string | null;
  name?: string | null;
  description?: string | null;
  count?: number | null;
  databaseId?: number | null;
  image?: {
    sourceUrl?: string | null;
    altText?: string | null;
    title?: string | null;
  } | null;
  children?: {
    nodes?: Category[] | null;
  } | null;
  parent?: {
    node?: {
      slug?: string | null;
      name?: string | null;
      databaseId?: number | null;
    } | null;
  } | null;
  seo?: {
    title?: string | null;
    metaDesc?: string | null;
    opengraphTitle?: string | null;
    opengraphDescription?: string | null;
    canonical?: string | null;
    metaKeywords?: string | null;
    metaRobotsNoindex?: string | null;
    metaRobotsNofollow?: string | null;
    twitterTitle?: string | null;
    twitterDescription?: string | null;
    opengraphImage?: {
      sourceUrl?: string | null;
      altText?: string | null;
    } | null;
    twitterImage?: {
      sourceUrl?: string | null;
      altText?: string | null;
    } | null;
    schema?: {
      raw?: string | null;
    } | null;
  } | null;
}

// Парсваме пътя от URL-а
const fullPath = route.path;
const categoryPart = fullPath.replace('/product-cat/', '').replace(/\/page\/\d+$/, '');
const decodedPart = decodeURIComponent(categoryPart);
const urlSegments = decodedPart.split('/').filter(Boolean);

// Получаваме текущия slug (последният сегмент)
const currentSlug = ref(urlSegments[urlSegments.length - 1] || '');
const currentPageNumber = ref(1);

// ⚡ ПОПРАВКА: Правим slug computed за да се обновява при промяна на route
const slug = computed(() => currentSlug.value);

// ⚡ SMART CACHING (като в magazin.vue) - използваме функция за динамичен ключ
const getCategoryCacheKey = () => `woonuxt_category_${slug.value}`;
const CACHE_DURATION = 30 * 60 * 1000; // 30 минути
const CACHE_VERSION = 'v1';

// Функции за кеширане
const getCachedCategoryData = (): { category: Category | null; count: number | null } | null => {
  if (!process.client) return null;

  try {
    const cacheKey = getCategoryCacheKey();
    const cached = sessionStorage.getItem(cacheKey);
    if (!cached) return null;

    const { category, count, timestamp, version } = JSON.parse(cached);
    const now = Date.now();

    if (version !== CACHE_VERSION || now - timestamp > CACHE_DURATION) {
      sessionStorage.removeItem(cacheKey);
      return null;
    }

    return { category, count };
  } catch (error) {
    return null;
  }
};

const setCachedCategoryData = (category: Category, count: number): void => {
  if (!process.client) return;

  try {
    const cacheKey = getCategoryCacheKey();
    const cacheData = {
      category,
      count,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch {
    // Ignore cache errors
  }
};

// ⚡ ФАЗА 1.2: ПРЕМАХНАТ TOP-LEVEL AWAIT - ще зареждаме async в onMounted
let matchingCategory: Category | null = null;
let realProductCount: number | null = null;

// ⚡ ВАЖНО: При SSR зареждаме category data И products count ПАРАЛЕЛНО
if (process.server) {
  // ⚡ ОПТИМИЗАЦИЯ: Promise.all зарежда 2те заявки едновременно!
  const [categoryData, productsCountData] = await Promise.all([
    useAsyncGql('getProductCategories', {
      slug: [slug.value],
      hideEmpty: false,
      first: 10,
    }),
    useAsyncGql('getProductsCount', {
      slug: [slug.value],
      first: 2000,
    }),
  ]);

  if (categoryData.data.value?.productCategories?.nodes?.[0]) {
    matchingCategory = categoryData.data.value.productCategories.nodes[0] as Category;
    // Използваме точния count от getProductsCount
    realProductCount = productsCountData.data.value?.products?.edges?.length || matchingCategory.count || 0;
  }

  if (!matchingCategory) {
    throw showError({ statusCode: 404, statusMessage: 'Категорията не е намерена' });
  }
} else {
  // ⚡ При CLIENT - проверяваме кеша веднага
  const cachedData = getCachedCategoryData();
  if (cachedData) {
    matchingCategory = cachedData.category;
    realProductCount = cachedData.count;
  }
}

// Reactive ref за runtime промени
const matchingCategoryRef = ref<Category | null>(matchingCategory);

// Ref за филтриран count при филтриране
const filteredCategoryCount = ref<number | null>(null);

// Функция за генериране на SEO данни според страницата
const generateCategorySeoMeta = () => {
  let pageNumber = 1;

  if (route.query.page) {
    const parsedPage = parseInt(route.query.page as string);
    if (!isNaN(parsedPage) && parsedPage > 0) {
      pageNumber = parsedPage;
    }
  } else if (route.params.pageNumber) {
    const parsedPage = parseInt(route.params.pageNumber as string);
    if (!isNaN(parsedPage) && parsedPage > 0) {
      pageNumber = parsedPage;
    }
  }

  const category = matchingCategoryRef.value || matchingCategory;
  const baseTitle = category?.seo?.title || category?.name || 'Категория';
  const baseDescription = category?.seo?.metaDesc || category?.description || `Продукти в категория ${category?.name}`;

  let finalTitle = baseTitle;
  let finalDescription = baseDescription;

  if (pageNumber > 1) {
    finalTitle = `${baseTitle} - Страница ${pageNumber}`;
    finalDescription = `${baseDescription} - Страница ${pageNumber}`;
  }

  const canonicalUrl =
    pageNumber === 1
      ? `${frontEndUrl || 'https://bgfreak.store'}/product-cat/${urlSegments.join('/')}`
      : `${frontEndUrl || 'https://bgfreak.store'}/product-cat/${urlSegments.join('/')}/page/${pageNumber}`;

  return {
    title: finalTitle,
    description: finalDescription,
    canonicalUrl: canonicalUrl,
    pageNumber: pageNumber,
  };
};

// Генерираме SEO метаданните
const ssrCategorySeoMeta = generateCategorySeoMeta();
const initialCategorySeoMeta = computed(() => {
  const seoMeta = generateCategorySeoMeta();
  return seoMeta.title && seoMeta.title !== 'undefined' ? seoMeta : ssrCategorySeoMeta;
});

useSeoMeta({
  title: () => initialCategorySeoMeta.value.title || ssrCategorySeoMeta.title,
  description: () => initialCategorySeoMeta.value.description || ssrCategorySeoMeta.description,
  ogTitle: () => (matchingCategoryRef.value || matchingCategory)?.seo?.opengraphTitle || initialCategorySeoMeta.value.title,
  ogDescription: () => (matchingCategoryRef.value || matchingCategory)?.seo?.opengraphDescription || initialCategorySeoMeta.value.description,
  ogType: 'website',
  ogUrl: () => initialCategorySeoMeta.value.canonicalUrl || ssrCategorySeoMeta.canonicalUrl,
  ogImage: () => (matchingCategoryRef.value || matchingCategory)?.seo?.opengraphImage?.sourceUrl,
  twitterCard: 'summary_large_image',
  twitterTitle: () => (matchingCategoryRef.value || matchingCategory)?.seo?.twitterTitle || initialCategorySeoMeta.value.title,
  twitterDescription: () => (matchingCategoryRef.value || matchingCategory)?.seo?.twitterDescription || initialCategorySeoMeta.value.description,
  twitterImage: () => (matchingCategoryRef.value || matchingCategory)?.seo?.twitterImage?.sourceUrl,
  robots: () => ((matchingCategoryRef.value || matchingCategory)?.seo?.metaRobotsNoindex === 'noindex' ? 'noindex' : 'index, follow'),
});

// Reactive refs за SEO links
const headLinks = ref([{ rel: 'canonical', href: ssrCategorySeoMeta.canonicalUrl }]);

useHead({
  link: headLinks,
});

// Schema markup ако е наличен
if (matchingCategory?.seo?.schema?.raw) {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: matchingCategory.seo.schema.raw,
      },
    ],
  });
}

// Функция за динамично обновяване на next/prev links
const updateCategoryNextPrevLinks = () => {
  const currentSeoMeta = generateCategorySeoMeta();
  const updatedCategoryLinks: any[] = [];

  const totalProductCount = realProductCount || matchingCategory?.count || 0;
  const totalPages = Math.ceil(totalProductCount / productsPerPage.value);

  // Prev link
  if (currentSeoMeta.pageNumber > 1) {
    const prevUrl =
      currentSeoMeta.pageNumber === 2
        ? `${frontEndUrl || 'https://bgfreak.store'}/product-cat/${urlSegments.join('/')}`
        : `${frontEndUrl || 'https://bgfreak.store'}/product-cat/${urlSegments.join('/')}/page/${currentSeoMeta.pageNumber - 1}`;

    updatedCategoryLinks.push({ rel: 'prev', href: prevUrl });
  }

  // Next link
  let hasNextPage = false;
  const hasFilters = route.query.filter;
  if (hasFilters) {
    hasNextPage = pageInfo?.hasNextPage || false;
  } else {
    hasNextPage = realProductCount ? currentSeoMeta.pageNumber < totalPages : pageInfo?.hasNextPage;
  }

  if (hasNextPage) {
    const nextUrl = `${frontEndUrl || 'https://bgfreak.store'}/product-cat/${urlSegments.join('/')}/page/${currentSeoMeta.pageNumber + 1}`;
    updatedCategoryLinks.push({ rel: 'next', href: nextUrl });
  }

  updatedCategoryLinks.push({ rel: 'canonical', href: currentSeoMeta.canonicalUrl });
  headLinks.value = updatedCategoryLinks;
};

// Функция за извличане на параметри от route
const extractRouteParams = () => {
  let pageNumber = 1;

  if (route.query.page) {
    const parsed = parseInt(String(route.query.page));
    if (!isNaN(parsed) && parsed > 0) {
      pageNumber = parsed;
    }
  } else if (route.params.pageNumber) {
    const parsed = parseInt(String(route.params.pageNumber));
    if (!isNaN(parsed) && parsed > 0) {
      pageNumber = parsed;
    }
  }

  return { slug: currentSlug.value, pageNumber };
};

// Race condition protection
let isNavigating = false;

// Проследяване на предишни query параметри
let previousQuery = ref({
  orderby: null as string | null,
  order: null as string | null,
  filter: null as string | null,
});

// Функция за парсене на филтри от URL
const parseFiltersFromQuery = (filterQuery: string) => {
  const filters: any = {};
  const runtimeConfig = useRuntimeConfig();

  if (!filterQuery || typeof filterQuery !== 'string') return filters;

  const getFilterValues = (filterName: string): string[] => {
    const match = filterQuery.match(new RegExp(`${filterName}\\[([^\\]]*)\\]`));
    if (!match || !match[1]) return [];
    return match[1].split(',').filter((val) => val && val.trim());
  };

  // Ценови филтър
  const priceRange = getFilterValues('price');
  if (priceRange.length === 2 && priceRange[0] && priceRange[1]) {
    const minPrice = parseFloat(priceRange[0]);
    const maxPrice = parseFloat(priceRange[1]);
    if (!isNaN(minPrice) && !isNaN(maxPrice)) {
      filters.minPrice = minPrice;
      filters.maxPrice = maxPrice;
    }
  }

  // OnSale филтър
  const onSale = getFilterValues('sale');
  if (onSale.length > 0 && onSale.includes('true')) {
    filters.onSale = true;
  }

  // Search филтър
  const searchTerm = getFilterValues('search');
  if (searchTerm.length > 0 && searchTerm[0]) {
    filters.search = searchTerm[0];
  }

  // Атрибутни филтри
  const globalProductAttributes = (runtimeConfig?.public?.GLOBAL_PRODUCT_ATTRIBUTES as any[]) || [];
  globalProductAttributes.forEach((attr) => {
    const attributeValues = getFilterValues(attr.slug);
    if (attributeValues.length > 0) {
      filters[attr.slug] = attributeValues;
    }
  });

  return filters;
};

// Основна функция за зареждане на продукти (ОПТИМИЗИРАНА!)
const loadCategoryProducts = async () => {
  console.log('🔵 DEBUG loadCategoryProducts: START');
  
  // ⚡ ПОПРАВКА: Предотвратяваме race conditions
  if (isNavigating) {
    console.log('⚠️ DEBUG loadCategoryProducts: isNavigating=true, ABORT');
    return;
  }

  try {
    const { slug, pageNumber } = extractRouteParams();
    console.log('🔵 DEBUG loadCategoryProducts: slug=', slug, 'pageNumber=', pageNumber);

    if (!slug) {
      console.log('⚠️ DEBUG loadCategoryProducts: Няма slug, ABORT');
      resetProductsState();
      currentSlug.value = '';
      hasEverLoaded.value = true;
      return;
    }

    const targetPageNumber = pageNumber;

    console.log('🔵 DEBUG loadCategoryProducts: Започвам зареждане...');
    isLoading.value = true;
    resetProductsState();
    currentSlug.value = slug;
    currentPageNumber.value = targetPageNumber;

    // Проверка за невалидни страници
    if (pageNumber > 1 && process.client && !route.query.filter) {
      const totalProducts = realProductCount || matchingCategory?.count || 0;
      if (totalProducts > 0) {
        const maxPages = Math.ceil(totalProducts / productsPerPage.value);
        if (pageNumber > maxPages) {
          throw showError({ statusCode: 404, statusMessage: `Страница ${pageNumber} не съществува. Максимална страница: ${maxPages}` });
        }
      }
    }

    const hasFilters = route.query.filter;
    const hasOrderBy = route.query.orderby;
    const categoryIdentifier = [slug];

    console.log('🔵 DEBUG loadCategoryProducts: hasFilters=', hasFilters, 'hasOrderBy=', hasOrderBy);

    if (hasFilters || hasOrderBy) {
      console.log('🔵 DEBUG loadCategoryProducts: Зареждам С ФИЛТРИ');
      const filters = hasFilters ? parseFiltersFromQuery(route.query.filter as string) : {};

      let graphqlOrderBy = 'DATE';
      const orderBy = Array.isArray(route.query.orderby) ? route.query.orderby[0] : route.query.orderby;
      if (orderBy && typeof orderBy === 'string') {
        if (orderBy === 'price') graphqlOrderBy = 'PRICE';
        else if (orderBy === 'rating') graphqlOrderBy = 'RATING';
        else if (orderBy === 'alphabetically') graphqlOrderBy = 'NAME_IN';
        else if (orderBy === 'date') graphqlOrderBy = 'DATE';
        else if (orderBy === 'discount') graphqlOrderBy = 'DATE';
      }

      // Добавяме attributeFilter
      const runtimeConfig = useRuntimeConfig();
      const globalProductAttributes = Array.isArray(runtimeConfig?.public?.GLOBAL_PRODUCT_ATTRIBUTES) ? runtimeConfig.public.GLOBAL_PRODUCT_ATTRIBUTES : [];

      const attributeFilters: any[] = [];
      globalProductAttributes.forEach((attr: any) => {
        if (filters[attr.slug] && Array.isArray(filters[attr.slug])) {
          attributeFilters.push({
            taxonomy: attr.slug,
            terms: filters[attr.slug],
            operator: 'IN',
          });
        }
      });

      console.log('🔵 DEBUG loadCategoryProducts: Извиквам loadProductsPageOptimized/jumpToPageOptimized');
      if (pageNumber === 1) {
        await loadProductsPageOptimized(pageNumber, categoryIdentifier, graphqlOrderBy, { ...filters, attributeFilter: attributeFilters });
      } else {
        await jumpToPageOptimized(pageNumber, categoryIdentifier, graphqlOrderBy, { ...filters, attributeFilter: attributeFilters });
      }
      console.log('🔵 DEBUG loadCategoryProducts: loadProductsPageOptimized/jumpToPageOptimized ЗАВЪРШИ');

      if (process.client && hasFilters && pageNumber > 1 && (!products.value || products.value.length === 0)) {
        throw showError({ statusCode: 404, statusMessage: `Страница ${pageNumber} не съществува с тези филтри` });
      }

      await loadCategoryCount(filters);
    } else {
      console.log('🔵 DEBUG loadCategoryProducts: Зареждам БЕЗ ФИЛТРИ');
      if (pageNumber === 1) {
        console.log('🔵 DEBUG loadCategoryProducts: Извиквам loadProductsPageOptimized (page 1)');
        await loadProductsPageOptimized(pageNumber, categoryIdentifier);
        console.log('🔵 DEBUG loadCategoryProducts: loadProductsPageOptimized ЗАВЪРШИ');
      } else {
        console.log('🔵 DEBUG loadCategoryProducts: Извиквам jumpToPageOptimized (page', pageNumber, ')');
        await jumpToPageOptimized(pageNumber, categoryIdentifier);
        console.log('🔵 DEBUG loadCategoryProducts: jumpToPageOptimized ЗАВЪРШИ');
      }

      if (process.client && pageNumber > 1 && (!products.value || products.value.length === 0)) {
        const maxPages = realProductCount ? Math.ceil(realProductCount / productsPerPage.value) : 1;
        throw showError({ statusCode: 404, statusMessage: `Страница ${pageNumber} не съществува. Максимална страница: ${maxPages}` });
      }

      filteredCategoryCount.value = null;
    }

    console.log('🔵 DEBUG loadCategoryProducts: products.value.length=', products.value?.length);
    console.log('🔵 DEBUG loadCategoryProducts: Маркирам hasEverLoaded=true');
    
    hasEverLoaded.value = true;
    currentPage.value = targetPageNumber;

    await nextTick();
    updateCategoryNextPrevLinks();

    await nextTick();
    
    console.log('✅ DEBUG loadCategoryProducts: ЗАВЪРШИ УСПЕШНО');
  } catch (error) {
    console.error('❌ DEBUG loadCategoryProducts: ГРЕШКА:', error);
    hasEverLoaded.value = true;
  }
};

// ⚡ ОПТИМИЗИРАН onMounted
onMounted(async () => {
  previousQuery.value = {
    orderby: (route.query.orderby as string | null) || null,
    order: (route.query.order as string | null) || null,
    filter: (route.query.filter as string | null) || null,
  };

  if (process.client) {
    const actualSlug = currentSlug.value;
    const needsRefresh = !matchingCategory || matchingCategory.slug !== actualSlug;

    if (needsRefresh) {
      try {
        console.log('🔄 DEBUG: Зареждам category данни за:', actualSlug);
        
        // ⚡ ПОПРАВКА: Използваме GQL функция директно вместо useAsyncGql след mount
        const GQL = useGql();
        
        const [categoryResponse, productsCountResponse] = await Promise.all([
          GQL('getProductCategories', { slug: [actualSlug], hideEmpty: false, first: 10 }),
          GQL('getProductsCount', { slug: [actualSlug], first: 2000 }),
        ]);
        
        const categoryData = categoryResponse?.data || categoryResponse;
        const productsCountData = productsCountResponse?.data || productsCountResponse;

        console.log('🔄 DEBUG: Category data:', categoryData);
        console.log('🔄 DEBUG: Products count data:', productsCountData);

        if (categoryData?.productCategories?.nodes?.[0]) {
          matchingCategory = categoryData.productCategories.nodes[0] as Category;
          matchingCategoryRef.value = matchingCategory;
          console.log('✅ DEBUG: Зареден category:', matchingCategory.name);
        } else {
          console.error('❌ DEBUG: Категорията не е намерена в отговора');
          throw showError({ statusCode: 404, statusMessage: 'Категорията не е намерена' });
        }

        if (productsCountData?.products?.edges) {
          realProductCount = productsCountData.products.edges.length;
          console.log('✅ DEBUG: Product count:', realProductCount);
        }

        setCachedCategoryData(matchingCategory, realProductCount || 0);
      } catch (error) {
        console.error('❌ DEBUG: Failed to load category:', error);
        throw showError({ statusCode: 404, statusMessage: 'Категорията не е намерена' });
      }
    } else {
      matchingCategoryRef.value = matchingCategory;
      console.log('✅ DEBUG: Използвам кеширан category:', matchingCategory?.name);
    }
  }

  // ⚡ КРИТИЧНО: ВИНАГИ зареждаме продуктите при mount за да избегнем старо състояние
  // Това е ключът за правилна работа при refresh (F5)
  console.log('🚀 DEBUG: Започвам зареждане на продукти в onMounted');
  loadCategoryProducts().then(() => {
    console.log('✅ DEBUG: Продуктите са заредени успешно');
    nextTick(() => {
      updateCategoryNextPrevLinks();
    });
  }).catch((error) => {
    console.error('❌ DEBUG: Грешка при зареждане на продукти:', error);
  });
});

// SMART UNIFIED ROUTE WATCHER с DEBOUNCE
let navigationDebounceTimer: NodeJS.Timeout | null = null;

watch(
  () => route.fullPath,
  async (newFullPath, oldFullPath) => {
    if (!process.client) return;
    if (newFullPath === oldFullPath) return;

    if (navigationDebounceTimer) {
      clearTimeout(navigationDebounceTimer);
    }

    navigationDebounceTimer = setTimeout(async () => {
      isNavigating = true;

      try {
        const newOrderBy = route.query.orderby as string | null;
        const newOrder = route.query.order as string | null;
        const newFilter = route.query.filter as string | null;

        const sortingOrFilteringChanged =
          newOrderBy !== previousQuery.value.orderby || newOrder !== previousQuery.value.order || newFilter !== previousQuery.value.filter;

        if (sortingOrFilteringChanged && route.params.pageNumber) {
          const currentPageNumber = parseInt(String(route.params.pageNumber) || '1');

          if (currentPageNumber > 1) {
            const queryParams = new URLSearchParams();
            if (newOrderBy) queryParams.set('orderby', newOrderBy);
            if (newOrder) queryParams.set('order', newOrder);
            if (newFilter) queryParams.set('filter', newFilter);

            const queryString = queryParams.toString();
            const newUrl = `/product-cat/${urlSegments.join('/')}${queryString ? `?${queryString}` : ''}`;

            previousQuery.value = {
              orderby: newOrderBy,
              order: newOrder,
              filter: newFilter,
            };

            await navigateTo(newUrl, { replace: true });
            return;
          }
        }

        previousQuery.value = {
          orderby: newOrderBy,
          order: newOrder,
          filter: newFilter,
        };

        hasEverLoaded.value = false;
        await loadCategoryProducts();
      } finally {
        isNavigating = false;
        navigationDebounceTimer = null;
      }
    }, 100);
  },
  { deep: true },
);

// Watcher за промени в pageInfo
watch(
  () => pageInfo,
  () => {
    if (process.client) {
      updateCategoryNextPrevLinks();
    }
  },
  { deep: true },
);

// Watcher за филтри
let filterCountDebounceTimer: NodeJS.Timeout | null = null;
watch(
  () => route.query.filter,
  async (newFilter) => {
    if (!process.client) return;

    if (filterCountDebounceTimer) {
      clearTimeout(filterCountDebounceTimer);
    }

    filterCountDebounceTimer = setTimeout(async () => {
      if (newFilter) {
        if (!isNavigating) {
          const filters = parseFiltersFromQuery(newFilter as string);
          await loadCategoryCount(filters);
        }
      } else {
        filteredCategoryCount.value = null;
      }
    }, 150);
  },
);

// Computed за показване на loading състояние
const shouldShowLoading = computed(() => {
  return isLoading.value || !hasEverLoaded.value;
});

// Computed за показване на NoProductsFound
const shouldShowNoProducts = computed(() => {
  return hasEverLoaded.value && !isLoading.value && (!products.value || products.value.length === 0);
});

// Computed за правилен count за pagination
const categoryCount = computed(() => {
  const hasFilters = route.query.filter;

  if (hasFilters) {
    const filters = parseFiltersFromQuery(route.query.filter as string);

    const hasAnyFilters =
      (filters.categorySlug && filters.categorySlug.length > 0) ||
      filters.onSale ||
      filters.search ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined ||
      Object.keys(filters).some((key) => key.startsWith('pa_'));

    if (hasAnyFilters) {
      return filteredCategoryCount.value;
    }
  }

  return realProductCount || matchingCategory?.count;
});

// Функция за зареждане на filtered count
const loadCategoryCount = async (filters: any) => {
  if (!process.client) return;

  const hasAnyFilters =
    (filters.categorySlug && filters.categorySlug.length > 0) ||
    filters.onSale ||
    filters.search ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    Object.keys(filters).some((key) => key.startsWith('pa_'));

  if (hasAnyFilters) {
    try {
      const variables: any = {
        slug: [slug.value],
        first: 2000,
      };

      if (filters.minPrice !== undefined) variables.minPrice = filters.minPrice;
      if (filters.maxPrice !== undefined) variables.maxPrice = filters.maxPrice;
      if (filters.onSale !== undefined) variables.onSale = filters.onSale;
      if (filters.search) variables.search = filters.search;

      const runtimeConfig = useRuntimeConfig();
      const globalProductAttributes = Array.isArray(runtimeConfig?.public?.GLOBAL_PRODUCT_ATTRIBUTES) ? runtimeConfig.public.GLOBAL_PRODUCT_ATTRIBUTES : [];

      const attributeFilters: any[] = [];
      globalProductAttributes.forEach((attr: any) => {
        if (filters[attr.slug] && Array.isArray(filters[attr.slug])) {
          attributeFilters.push({
            taxonomy: attr.slug,
            terms: filters[attr.slug],
            operator: 'IN',
          });
        }
      });

      if (attributeFilters.length > 0) {
        variables.attributeFilter = attributeFilters;
      }

      const { data } = await useAsyncGql('getProductsCount', variables);

      if (data.value?.products?.edges) {
        filteredCategoryCount.value = data.value.products.edges.length;
      } else {
        filteredCategoryCount.value = null;
      }
    } catch (error) {
      filteredCategoryCount.value = null;
    }
  } else {
    filteredCategoryCount.value = null;
  }
};
</script>

<template>
  <div class="container mx-auto px-2 py-4 sm:py-6">
    <div :key="currentSlug || 'no-category'" class="flex flex-col lg:flex-row gap-0 sm:gap-8">
      <aside v-if="storeSettings?.showFilters" class="hidden lg:block lg:w-80 flex-shrink-0">
        <div class="sticky top-4">
          <Filters :hide-categories="true" :category-slug="currentSlug" />
        </div>
      </aside>

      <main v-if="currentSlug" class="flex-1 min-w-0">
        <!-- Breadcrumb навигация -->
        <nav v-if="matchingCategoryRef" class="hidden md:block mb-6 text-sm text-gray-600">
          <ol class="flex items-center space-x-2">
            <li>
              <NuxtLink to="/" class="hover:text-gray-900">Начало</NuxtLink>
            </li>
            <li>
              <span class="mx-2">/</span>
              <NuxtLink to="/magazin" class="hover:text-gray-900">Магазин</NuxtLink>
            </li>
            <li>
              <span class="mx-2">/</span>
              <span class="text-gray-900 font-medium">{{ matchingCategoryRef.name }}</span>
            </li>
          </ol>
        </nav>

        <!-- Loading състояние -->
        <div v-if="shouldShowLoading" class="space-y-8">
          <div class="flex items-center justify-between w-full gap-4 mb-8">
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

        <!-- Заредено съдържание -->
        <div v-else-if="products?.length" class="space-y-8">
          <h1 v-if="matchingCategoryRef?.name && currentPageNumber === 1" class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {{ matchingCategoryRef.name }}
          </h1>

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

          <!-- Подкатегории -->
          <SubcategoriesSection
            v-if="matchingCategoryRef?.children?.nodes?.length && currentPageNumber === 1 && !route.query.filter"
            :category="matchingCategoryRef"
            :current-path="urlSegments" />

          <ProductGrid />

          <PaginationServer :category-count="categoryCount || 0" />

          <TaxonomyDescription
            v-if="matchingCategoryRef?.description"
            :description="matchingCategoryRef.description"
            :name="matchingCategoryRef.name"
            :max-height="200" />
        </div>

        <!-- No products found -->
        <NoProductsFound v-else-if="shouldShowNoProducts"> Няма намерени продукти в тази категория. </NoProductsFound>
      </main>
    </div>
  </div>
</template>
