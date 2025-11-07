<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue';

// Зареждаме @vueform/slider CSS САМО на страници с филтри
import '@vueform/slider/themes/default.css';

const {
  loadProductsPageOptimized,
  jumpToPageOptimized,
  products,
  isLoading,
  resetProductsState,
  pageInfo,
  currentPage,
  productsPerPage,
} = useProducts();
const { buildGraphQLFilters } = useFiltering();
const { storeSettings } = useAppConfig();
const { frontEndUrl } = useHelpers();
const route = useRoute();

// Проследяваме дали някога сме зареждали данни
const hasEverLoaded = ref(false);

interface Brand {
  slug?: string | null;
  name?: string | null;
  description?: string | null;
  count?: number | null;
  databaseId?: number | null;
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

const currentSlug = ref('');
const currentPageNumber = ref(1);

const routeSlug = route.params.brandSlug || route.params.slug;
const decodedSlug = routeSlug ? decodeURIComponent(String(routeSlug)) : '';
const slug = decodedSlug;

// ⚡ SMART CACHING
const BRAND_CACHE_KEY = `woonuxt_brand_${slug}`;
const CACHE_DURATION = 30 * 60 * 1000; // 30 минути
const CACHE_VERSION = 'v1';

// Функции за кеширане
const getCachedBrandData = (): { brand: Brand | null; count: number | null } | null => {
  if (!process.client) return null;

  try {
    const cached = sessionStorage.getItem(BRAND_CACHE_KEY);
    if (!cached) return null;

    const { brand, count, timestamp, version } = JSON.parse(cached);
    const now = Date.now();

    if (version !== CACHE_VERSION || now - timestamp > CACHE_DURATION) {
      sessionStorage.removeItem(BRAND_CACHE_KEY);
      return null;
    }

    return { brand, count };
  } catch (error) {
    return null;
  }
};

const setCachedBrandData = (brand: Brand, count: number): void => {
  if (!process.client) return;

  try {
    const cacheData = {
      brand,
      count,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    sessionStorage.setItem(BRAND_CACHE_KEY, JSON.stringify(cacheData));
  } catch {
    // Ignore cache errors
  }
};

// ⚡ ВАЖНО: При SSR намираме марката от продукти
let matchingBrand: Brand | null = null;
let realProductCount: number | null = null;

if (process.server) {
  const { data: productsData } = await useAsyncGql('getProducts', {
    first: 50,
    orderby: 'DATE',
    order: 'DESC',
  });

  if (productsData.value?.products?.nodes) {
    const allProducts = productsData.value.products.nodes;

    for (const product of allProducts) {
      if (product?.pwbBrands && product.pwbBrands.length > 0) {
        for (const brand of product.pwbBrands) {
          const brandSlug = brand.slug?.toLowerCase();
          const searchSlug = slug.toLowerCase();

          if (brandSlug === searchSlug || brandSlug?.includes(searchSlug) || searchSlug?.includes(brandSlug || '')) {
            matchingBrand = {
              slug: brand.slug,
              name: brand.name,
              description: brand.description,
              count: brand.count,
              databaseId: brand.databaseId,
            };

            realProductCount = brand.count || 0;
            break;
          }
        }
        if (matchingBrand) break;
      }
    }
  }

  if (!matchingBrand) {
    throw showError({ statusCode: 404, statusMessage: 'Марката не е намерена' });
  }
} else {
  const cachedData = getCachedBrandData();
  if (cachedData) {
    matchingBrand = cachedData.brand;
    realProductCount = cachedData.count;
  }
}

// Reactive ref за runtime промени
const matchingBrandRef = ref<Brand | null>(matchingBrand);

// Ref за филтриран count при филтриране
const filteredBrandCount = ref<number | null>(null);

// Функция за генериране на SEO данни според страницата
const generateBrandSeoMeta = () => {
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

  const brand = matchingBrandRef.value || matchingBrand;
  const baseTitle = brand?.seo?.title || (brand?.name ? `Марка: ${brand.name}` : 'Марка');
  const baseDescription = brand?.seo?.metaDesc || brand?.description || `Продукти от марка ${brand?.name}`;

  let finalTitle = baseTitle;
  let finalDescription = baseDescription;

  if (pageNumber > 1) {
    finalTitle = `${baseTitle} - Страница ${pageNumber}`;
    finalDescription = `${baseDescription} - Страница ${pageNumber}`;
  }

  const canonicalUrl =
    pageNumber === 1 ? `${frontEndUrl || 'https://bgfreak.store'}/marka-produkt/${slug}` : `${frontEndUrl || 'https://bgfreak.store'}/marka-produkt/${slug}/page/${pageNumber}`;

  return {
    title: finalTitle,
    description: finalDescription,
    canonicalUrl: canonicalUrl,
    pageNumber: pageNumber,
  };
};

// Генерираме SEO метаданните
const ssrBrandSeoMeta = generateBrandSeoMeta();
const initialBrandSeoMeta = computed(() => {
  const seoMeta = generateBrandSeoMeta();
  return seoMeta.title && seoMeta.title !== 'undefined' ? seoMeta : ssrBrandSeoMeta;
});

useSeoMeta({
  title: () => initialBrandSeoMeta.value.title || ssrBrandSeoMeta.title,
  description: () => initialBrandSeoMeta.value.description || ssrBrandSeoMeta.description,
  ogTitle: () => (matchingBrandRef.value || matchingBrand)?.seo?.opengraphTitle || initialBrandSeoMeta.value.title,
  ogDescription: () => (matchingBrandRef.value || matchingBrand)?.seo?.opengraphDescription || initialBrandSeoMeta.value.description,
  ogType: 'website',
  ogUrl: () => initialBrandSeoMeta.value.canonicalUrl || ssrBrandSeoMeta.canonicalUrl,
  ogImage: () => (matchingBrandRef.value || matchingBrand)?.seo?.opengraphImage?.sourceUrl,
  twitterCard: 'summary_large_image',
  twitterTitle: () => (matchingBrandRef.value || matchingBrand)?.seo?.twitterTitle || initialBrandSeoMeta.value.title,
  twitterDescription: () => (matchingBrandRef.value || matchingBrand)?.seo?.twitterDescription || initialBrandSeoMeta.value.description,
  twitterImage: () => (matchingBrandRef.value || matchingBrand)?.seo?.twitterImage?.sourceUrl,
  robots: () => ((matchingBrandRef.value || matchingBrand)?.seo?.metaRobotsNoindex === 'noindex' ? 'noindex' : 'index, follow'),
});

// Reactive refs за SEO links
const headLinks = ref([{ rel: 'canonical', href: ssrBrandSeoMeta.canonicalUrl }]);

useHead({
  link: headLinks,
});

// Schema markup ако е наличен
if (matchingBrand?.seo?.schema?.raw) {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: matchingBrand.seo.schema.raw,
      },
    ],
  });
}

// Функция за динамично обновяване на next/prev links
const updateBrandNextPrevLinks = () => {
  const currentSeoMeta = generateBrandSeoMeta();
  const updatedBrandLinks: any[] = [];

  const totalProductCount = realProductCount || matchingBrand?.count || 0;
  const totalPages = Math.ceil(totalProductCount / productsPerPage.value);

  // Prev link
  if (currentSeoMeta.pageNumber > 1) {
    const prevUrl =
      currentSeoMeta.pageNumber === 2
        ? `${frontEndUrl || 'https://bgfreak.store'}/marka-produkt/${slug}`
        : `${frontEndUrl || 'https://bgfreak.store'}/marka-produkt/${slug}/page/${currentSeoMeta.pageNumber - 1}`;

    updatedBrandLinks.push({ rel: 'prev', href: prevUrl });
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
    const nextUrl = `${frontEndUrl || 'https://bgfreak.store'}/marka-produkt/${slug}/page/${currentSeoMeta.pageNumber + 1}`;
    updatedBrandLinks.push({ rel: 'next', href: nextUrl });
  }

  updatedBrandLinks.push({ rel: 'canonical', href: currentSeoMeta.canonicalUrl });
  headLinks.value = updatedBrandLinks;
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
const loadBrandProducts = async () => {
  try {
    const { slug, pageNumber } = extractRouteParams();

    if (!slug) {
      resetProductsState();
      currentSlug.value = '';
      hasEverLoaded.value = true;
      return;
    }

    const targetPageNumber = pageNumber;

    isLoading.value = true;
    resetProductsState();
    currentSlug.value = slug;
    currentPageNumber.value = targetPageNumber;

    // Проверка за невалидни страници
    if (pageNumber > 1 && process.client && !route.query.filter) {
      const totalProducts = realProductCount || matchingBrand?.count || 0;
      if (totalProducts > 0) {
        const maxPages = Math.ceil(totalProducts / productsPerPage.value);
        if (pageNumber > maxPages) {
          throw showError({ statusCode: 404, statusMessage: `Страница ${pageNumber} не съществува. Максимална страница: ${maxPages}` });
        }
      }
    }

    const hasFilters = route.query.filter;
    const hasOrderBy = route.query.orderby;

    // ⚡ ВАЖНО: Използваме search по име на марка
    const brandSearchFilter = { search: matchingBrand?.name || '' };

    if (hasFilters || hasOrderBy) {
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

      // Комбинираме search филтъра с марката
      if (filters.search && !filters.search.includes(matchingBrand?.name || '')) {
        filters.search = `${filters.search} ${matchingBrand?.name}`;
      } else {
        filters.search = matchingBrand?.name || '';
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

      if (pageNumber === 1) {
        await loadProductsPageOptimized(pageNumber, [], graphqlOrderBy, { ...filters, attributeFilter: attributeFilters });
      } else {
        await jumpToPageOptimized(pageNumber, [], graphqlOrderBy, { ...filters, attributeFilter: attributeFilters });
      }

      if (process.client && hasFilters && pageNumber > 1 && (!products.value || products.value.length === 0)) {
        throw showError({ statusCode: 404, statusMessage: `Страница ${pageNumber} не съществува с тези филтри` });
      }

      await loadBrandCount(filters);
    } else {
      if (pageNumber === 1) {
        await loadProductsPageOptimized(pageNumber, [], 'DATE', brandSearchFilter);
      } else {
        await jumpToPageOptimized(pageNumber, [], 'DATE', brandSearchFilter);
      }

      if (process.client && pageNumber > 1 && (!products.value || products.value.length === 0)) {
        const maxPages = realProductCount ? Math.ceil(realProductCount / productsPerPage.value) : 1;
        throw showError({ statusCode: 404, statusMessage: `Страница ${pageNumber} не съществува. Максимална страница: ${maxPages}` });
      }

      filteredBrandCount.value = null;
    }

    hasEverLoaded.value = true;
    currentPage.value = targetPageNumber;

    await nextTick();
    updateBrandNextPrevLinks();

    await nextTick();
  } catch (error) {
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
    const needsRefresh = !matchingBrand || matchingBrand.slug !== actualSlug;

    if (needsRefresh) {
      try {
        const { data: productsData } = await useAsyncGql('getProducts', {
          first: 50,
          orderby: 'DATE',
          order: 'DESC',
        });

        if (productsData.value?.products?.nodes) {
          const allProducts = productsData.value.products.nodes;

          for (const product of allProducts) {
            if (product?.pwbBrands && product.pwbBrands.length > 0) {
              for (const brand of product.pwbBrands) {
                const brandSlug = brand.slug?.toLowerCase();
                const searchSlug = actualSlug.toLowerCase();

                if (brandSlug === searchSlug || brandSlug?.includes(searchSlug) || searchSlug?.includes(brandSlug || '')) {
                  matchingBrand = {
                    slug: brand.slug,
                    name: brand.name,
                    description: brand.description,
                    count: brand.count,
                    databaseId: brand.databaseId,
                  };

                  matchingBrandRef.value = matchingBrand;
                  realProductCount = brand.count || 0;
                  break;
                }
              }
              if (matchingBrand) break;
            }
          }
        }

        if (!matchingBrand) {
          throw showError({ statusCode: 404, statusMessage: 'Марката не е намерена' });
        }

        setCachedBrandData(matchingBrand, realProductCount || 0);
      } catch (error) {
        console.error('Failed to load brand:', error);
        throw showError({ statusCode: 404, statusMessage: 'Марката не е намерена' });
      }
    } else {
      matchingBrandRef.value = matchingBrand;
    }
  }

  if (products.value.length === 0 || !hasEverLoaded.value) {
    // ⚡ НЕ ЧАКАМЕ - зареждаме асинхронно за да не блокираме UI
    loadBrandProducts().then(() => {
      nextTick(() => {
        updateBrandNextPrevLinks();
      });
    });
  } else {
    nextTick(() => {
      updateBrandNextPrevLinks();
    });
  }
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
            const newUrl = `/marka-produkt/${slug}${queryString ? `?${queryString}` : ''}`;

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
        await loadBrandProducts();
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
      updateBrandNextPrevLinks();
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

          // Комбинираме search с марката
          if (filters.search && !filters.search.includes(matchingBrand?.name || '')) {
            filters.search = `${filters.search} ${matchingBrand?.name}`;
          } else {
            filters.search = matchingBrand?.name || '';
          }

          await loadBrandCount(filters);
        }
      } else {
        filteredBrandCount.value = null;
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
const brandCount = computed(() => {
  const hasFilters = route.query.filter;

  if (hasFilters) {
    const filters = parseFiltersFromQuery(route.query.filter as string);

    const hasAnyFilters =
      filters.onSale ||
      (filters.search && filters.search !== matchingBrand?.name) ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined ||
      Object.keys(filters).some((key) => key.startsWith('pa_'));

    if (hasAnyFilters) {
      return filteredBrandCount.value;
    }
  }

  return realProductCount || matchingBrand?.count;
});

// Функция за зареждане на filtered count
const loadBrandCount = async (filters: any) => {
  if (!process.client) return;

  const hasAnyFilters =
    filters.onSale ||
    (filters.search && filters.search !== matchingBrand?.name) ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    Object.keys(filters).some((key) => key.startsWith('pa_'));

  if (hasAnyFilters) {
    try {
      const variables: any = {
        search: filters.search || matchingBrand?.name,
        first: 2000,
      };

      if (filters.minPrice !== undefined) variables.minPrice = filters.minPrice;
      if (filters.maxPrice !== undefined) variables.maxPrice = filters.maxPrice;
      if (filters.onSale !== undefined) variables.onSale = filters.onSale;

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
        filteredBrandCount.value = data.value.products.edges.length;
      } else {
        filteredBrandCount.value = null;
      }
    } catch (error) {
      filteredBrandCount.value = null;
    }
  } else {
    filteredBrandCount.value = null;
  }
};
</script>

<template>
  <div class="container mx-auto px-2 py-4 sm:py-6">
    <div :key="currentSlug || 'no-brand'" class="flex flex-col lg:flex-row gap-0 sm:gap-8">
      <aside v-if="storeSettings?.showFilters" class="hidden lg:block lg:w-80 flex-shrink-0">
        <div class="sticky top-4">
          <Filters :hide-categories="true" />
        </div>
      </aside>

      <main v-if="currentSlug" class="flex-1 min-w-0">
        <!-- Breadcrumb навигация -->
        <nav v-if="matchingBrandRef" class="hidden md:block mb-6 text-sm text-gray-600">
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
              <span class="text-gray-900 font-medium">{{ matchingBrandRef.name }}</span>
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
          <h1 v-if="matchingBrandRef?.name && currentPageNumber === 1" class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {{ matchingBrandRef.name }}
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

          <ProductGrid />

          <PaginationServer :category-count="brandCount || 0" />

          <TaxonomyDescription v-if="matchingBrandRef?.description" :description="matchingBrandRef.description" :name="matchingBrandRef.name" :max-height="200" />
        </div>

        <!-- No products found -->
        <NoProductsFound v-else-if="shouldShowNoProducts"> Няма намерени продукти от тази марка. </NoProductsFound>
      </main>
    </div>
  </div>
</template>
