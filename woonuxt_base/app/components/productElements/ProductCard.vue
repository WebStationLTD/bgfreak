<script setup lang="ts">
import { ProductTypesEnum, StockStatusEnum } from '#woo';

const route = useRoute();
const { storeSettings } = useAppConfig();
const { addToCart, isUpdatingCart, cart } = useCart();
const { t } = useI18n();
const { sortVariations: sortProductVariations } = useProductVariations();

const props = defineProps({
  node: { type: Object as PropType<Product>, required: true },
  index: { type: Number, default: 1 },
});

const imgWidth = 280;
const imgHeight = imgWidth; // Квадратни снимки

// example: ?filter=pa_color[green,blue],pa_size[large]
const filterQuery = ref(route.query?.filter as string);
const paColor = ref(filterQuery.value?.split('pa_color[')[1]?.split(']')[0]?.split(',') || []);

// watch filterQuery
watch(
  () => route.query,
  () => {
    filterQuery.value = route.query.filter as string;
    paColor.value = filterQuery.value?.split('pa_color[')[1]?.split(']')[0]?.split(',') || [];
  },
);

const mainImage = computed<string>(() => props.node?.image?.producCardSourceUrl || props.node?.image?.sourceUrl || '/images/placeholder.jpg');
const imagetoDisplay = computed<string>(() => {
  if (paColor.value.length) {
    const activeColorImage = props.node?.variations?.nodes.filter((variation) => {
      const hasMatchingAttributes = variation.attributes?.nodes.some((attribute) => paColor.value.some((color) => attribute?.value?.includes(color)));
      const hasMatchingSlug = paColor.value.some((color) => variation.slug?.includes(color));
      return hasMatchingAttributes || hasMatchingSlug;
    });
    if (activeColorImage?.length) return activeColorImage[0]?.image?.producCardSourceUrl || activeColorImage[0]?.image?.sourceUrl || mainImage.value;
  }
  return mainImage.value;
});

// Локален стейт
const isLoading = ref(false);
const quantity = ref(1);
const variationError = ref('');
const selectedVariationId = ref<number | null>(null);

// Изчисляване на продуктов тип
const isVariableProduct = computed(() => props.node?.type === ProductTypesEnum.VARIABLE);
const isSimpleProduct = computed(() => props.node?.type === ProductTypesEnum.SIMPLE);
const hasVariations = computed(() => isVariableProduct.value && props.node?.variations?.nodes && props.node.variations.nodes.length > 0);

// Проверка дали продуктът е изчерпан
const isOutOfStock = computed(() => {
  if (isVariableProduct.value) {
    // За вариационни продукти проверяваме дали всички вариации са изчерпани
    const allVariations = props.node?.variations?.nodes || [];
    return allVariations.length > 0 && allVariations.every((variation: any) => variation.stockStatus === StockStatusEnum.OUT_OF_STOCK);
  }

  return props.node?.stockStatus === StockStatusEnum.OUT_OF_STOCK;
});

// Изчисляване дали да показваме вариации и бутон
const shouldShowCart = computed(() => {
  // Не показваме секцията за покупка ако продуктът е изчерпан
  return (isVariableProduct.value || isSimpleProduct.value) && !isOutOfStock.value;
});

// Логика за бутона
const isButtonDisabled = computed(() => isLoading.value || (hasVariations.value && !selectedVariationId.value));

// Увеличаване/намаляване на количество
const incrementQuantity = () => quantity.value++;
const decrementQuantity = () => {
  if (quantity.value > 1) quantity.value--;
};

// Функция за избиране на вариация
const selectVariation = (varId: number) => {
  selectedVariationId.value = varId;
  variationError.value = '';
};

// Добавяне в количката
const addProductToCart = async () => {
  if (!props.node?.databaseId) return;

  // Проверка за продукти с вариации
  if (hasVariations.value && !selectedVariationId.value) {
    variationError.value = `Моля, изберете ${primaryAttributeName.value.toLowerCase()}`;
    return;
  }

  isLoading.value = true;
  variationError.value = '';

  try {
    const input = {
      productId: props.node.databaseId,
      quantity: quantity.value,
      variationId: selectedVariationId.value,
    };

    await addToCart(input);
  } catch (error) {
    variationError.value = 'Възникна грешка при добавяне в количката';
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 500);
  }
};

// Спираме loading индикатора при промяна на количката
watch(cart, () => {
  setTimeout(() => {
    isLoading.value = false;
    variationError.value = '';
  }, 300);
});

// Извличане на имената на атрибутите от вариациите (не от основния продукт)
const attributeNames = computed(() => {
  if (!hasVariations.value) return [];

  const firstVariation = props.node?.variations?.nodes?.[0];
  if (!firstVariation?.attributes?.nodes) return [];

  // Получаваме уникалните имена на атрибутите от първата вариация
  const uniqueNames = new Set<string>();

  firstVariation.attributes.nodes.forEach((attr: any) => {
    if (attr.name) {
      let cleanName = attr.name;

      // Почистваме техническото име
      if (cleanName.startsWith('pa_')) {
        cleanName = cleanName.replace('pa_', '');
      }

      // Декодиране на URL encoded кирилица
      try {
        cleanName = decodeURIComponent(cleanName);
      } catch (e) {
        // Ако декодирането се провали, оставяме оригинала
      }

      // Допълнително декодиране за различни encoding формати
      const commonEncodings: { [key: string]: string } = {
        tsvyat: 'цвят',
        cvyat: 'цвят',
        razmer: 'размер',
        material: 'материал',
      };

      if (commonEncodings[cleanName.toLowerCase()]) {
        cleanName = commonEncodings[cleanName.toLowerCase()];
      }

      // Hardcoded mapping за често използваните атрибути
      const nameMap: { [key: string]: string } = {
        размер: 'Размер',
        razmer: 'Размер',
        size: 'Размер',
        цвят: 'Цвят',
        tsvyat: 'Цвят',
        cvyat: 'Цвят',
        color: 'Цвят',
        материал: 'Материал',
        material: 'Материал',
      };

      const mappedName = nameMap[cleanName.toLowerCase()];
      if (mappedName) {
        uniqueNames.add(mappedName);
      } else {
        // Правим първата буква главна за неразпознати атрибути
        uniqueNames.add(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  });

  return Array.from(uniqueNames);
});

// Получаване на главното име на атрибута (първото)
const primaryAttributeName = computed((): string => {
  return (attributeNames.value[0] as string) || 'Вариации';
});

// Функция за преобразуване на slug към име на термин
const getTermNameFromSlug = (slug: string, attributeName: string): string => {
  if (!props.node?.attributes?.nodes) return slug;

  // Търсим атрибута по име - проверяваме различни формати
  const attribute = props.node.attributes.nodes.find((attr: any) => {
    if (!attr.name) return false;

    // Точно съвпадение
    if (attr.name === attributeName) return true;

    // Проверяваме с pa_ префикс
    if (attr.name === `pa_${attributeName}`) return true;

    // Проверяваме без pa_ префикс
    if (attr.name.replace('pa_', '') === attributeName) return true;

    // Проверяваме ако attributeName има pa_ а attr.name няма
    if (attributeName.startsWith('pa_') && attr.name === attributeName.replace('pa_', '')) return true;

    return false;
  });

  if (!attribute?.terms?.nodes) {
    // console.log('Не намерих атрибут за:', attributeName, 'в продукт:', props.node.name);
    // console.log('Налични атрибути:', props.node.attributes.nodes.map((a) => a.name));
    return slug;
  }

  // Търсим термина по slug
  const term = attribute.terms.nodes.find((term: any) => term.slug === slug);

  if (!term) {
    // console.log('Не намерих термин с slug:', slug, 'в атрибут:', attribute.name);
    // console.log('Налични термини:', attribute.terms.nodes.map((t) => ({ slug: t.slug, name: t.name })));
    return slug;
  }

  return term.name || slug;
};

// Функция за показване на името на вариацията вместо slug
const getVariationDisplayName = (variation: any): string => {
  if (!variation?.attributes?.nodes?.length) return variation?.name || '';

  return variation.attributes.nodes
    .map((attr: any) => {
      if (!attr.value) return '';

      // Опитваме се да намерим името на термина вместо slug-а
      const termName = getTermNameFromSlug(attr.value, attr.name);
      return termName;
    })
    .filter(Boolean)
    .join(' / ');
};

// Сортирани вариации за използване в селекта
const sortedVariations = computed(() => {
  if (!hasVariations.value || !props.node?.variations?.nodes) return [];
  return sortProductVariations(props.node.variations.nodes);
});
</script>

<template>
  <div class="relative group">
    <NuxtLink v-if="node.slug" :to="`/produkt/${decodeURIComponent(node.slug)}`" :title="node.name">
      <SaleBadge :node class="absolute top-2 right-2" />
      <OutOfStockBadge :node class="absolute top-2 right-2" />
      <ProductWishlistButton :product="node" />
      <NuxtImg
        v-if="imagetoDisplay"
        :width="imgWidth"
        :height="imgHeight"
        :src="imagetoDisplay"
        :alt="node.image?.altText || node.name || 'Product image'"
        :title="node.image?.title || node.name"
        :loading="index <= 3 ? 'eager' : 'lazy'"
        :sizes="`sm:${imgWidth / 2}px md:${imgWidth}px`"
        class="rounded-lg object-center object-contain w-full aspect-square bg-white"
        placeholder
        placeholder-class="blur-xl" />
    </NuxtLink>
    <div>
      <StarRating v-if="storeSettings.showReviews" :rating="node.averageRating || 0" :count="node.reviewCount || 0" />
      <NuxtLink v-if="node.slug" :to="`/produkt/${decodeURIComponent(node.slug)}`" :title="node.name">
        <h2 class="mb-2 font-light leading-tight group-hover:text-primary">{{ node.name }}</h2>
      </NuxtLink>

      <!-- Показваме цената и вариациите на един ред -->
      <div class="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between mb-3 min-h-[26px]">
        <ProductPrice class="text-sm" :sale-price="node.salePrice" :regular-price="node.regularPrice" />

        <!-- Селект за вариации (само за вариационни продукти) -->
        <div v-if="hasVariations" class="flex w-full mt-2 sm:mt-0 sm:justify-end sm:w-[100px]">
          <select
            :id="`variations-${node.databaseId}`"
            class="text-xs py-1 px-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400 bg-white w-full sm:max-w-[160px]"
            @change="(e) => selectVariation(Number((e.target as HTMLSelectElement).value))">
            <option value="" disabled selected>{{ primaryAttributeName }}</option>
            <option
              v-for="variation in sortedVariations"
              :key="variation.databaseId"
              :value="variation.databaseId"
              :selected="selectedVariationId === variation.databaseId">
              {{ getVariationDisplayName(variation) || variation.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Показваме грешки за вариациите -->
      <div v-if="variationError" class="text-red-500 text-xs -mt-2 mb-3">
        {{ variationError }}
      </div>

      <!-- Само показваме следващите елементи ако е продукт, който може да се купи -->
      <div v-if="shouldShowCart">
        <!-- Брояч и бутон Купи -->
        <div class="flex items-center justify-between space-x-2">
          <div class="flex items-center h-8 bg-white border border-gray-300 rounded-md">
            <button
              @click.prevent="decrementQuantity"
              type="button"
              class="flex items-center justify-center w-6 h-full text-xs text-gray-500 transition-colors border-r border-gray-300 hover:bg-gray-50"
              :disabled="quantity <= 1">
              <Icon name="ion:remove" size="14" />
            </button>
            <input
              :id="`quantity-${node.databaseId}`"
              v-model.number="quantity"
              type="number"
              min="1"
              class="w-8 h-full text-xs text-center bg-transparent focus:outline-none" />
            <button
              @click.prevent="incrementQuantity"
              type="button"
              class="flex items-center justify-center w-6 h-full text-xs text-gray-500 transition-colors border-l border-gray-300 hover:bg-gray-50">
              <Icon name="ion:add" size="14" />
            </button>
          </div>

          <button
            @click.prevent="addProductToCart"
            type="button"
            :disabled="isButtonDisabled"
            class="flex items-center justify-center flex-1 h-8 px-3 text-xs font-medium text-white transition-colors bg-[#dd3737] rounded-md hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed">
            <span>Купи</span>
            <LoadingIcon v-if="isLoading" stroke="3" size="10" color="#fff" class="ml-1" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
