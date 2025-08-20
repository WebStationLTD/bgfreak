<script lang="ts" setup>
const { frontEndUrl } = useHelpers();

// Получаване на SEO данни от Yoast SEO за страницата с всички категории
const { data: seoData } = await useAsyncGql('getCategoriesPage');
const categoriesSeo = seoData.value?.page?.seo || null;

// Получаване на всички продуктови категории
const { data } = await useAsyncGql('getProductCategories', { first: 100, hideEmpty: true });
const productCategories = data.value.productCategories?.nodes as ProductCategory[];

// Организиране на категориите - разделяне на родителски и подкатегории
const parentCategories = computed(() => {
  if (!productCategories) return [];

  // Филтрираме само родителските категории (тези без родител)
  return productCategories.filter((category) => category.parent === null);
});

// Функция за намиране на подкатегориите на дадена родителска категория
const getSubcategories = (parentCategory: ProductCategory) => {
  if (!productCategories || !parentCategory) return [];

  return productCategories.filter((category) => category.parent?.node?.databaseId === parentCategory.databaseId);
};

// Подреждане на категориите по азбучен ред
const sortedCategories = computed(() => {
  if (!parentCategories.value) return [];

  return [...parentCategories.value].sort((a, b) => {
    const nameA = a.name?.toLowerCase() || '';
    const nameB = b.name?.toLowerCase() || '';
    return nameA.localeCompare(nameB, 'bg');
  });
});

// Групиране на категориите в последователни блокове
const categoryGroups = computed(() => {
  const groups: Array<{
    type: 'simple' | 'complex';
    categories: ProductCategory[];
  }> = [];

  let currentSimpleGroup: ProductCategory[] = [];

  sortedCategories.value.forEach((category) => {
    const hasSubcategories = getSubcategories(category).length > 0;

    if (hasSubcategories) {
      // Ако имаме натрупани прости категории, добавяме ги като група
      if (currentSimpleGroup.length > 0) {
        groups.push({
          type: 'simple',
          categories: [...currentSimpleGroup],
        });
        currentSimpleGroup = [];
      }

      // Добавяме комплексната категория като отделна група
      groups.push({
        type: 'complex',
        categories: [category],
      });
    } else {
      // Добавяме простата категория към текущата група
      currentSimpleGroup.push(category);
    }
  });

  // Ако остават прости категории в края, добавяме ги
  if (currentSimpleGroup.length > 0) {
    groups.push({
      type: 'simple',
      categories: currentSimpleGroup,
    });
  }

  return groups;
});

// Използване на SEO данни от Yoast ако са налични
const categoriesTitle = categoriesSeo?.title || 'Leaderfitness - всички продуктови категории';
const categoriesDescription = categoriesSeo?.metaDesc || 'Leaderfitness - всички продуктови категории | Фитнес екипировка, дрехи, тренировъчно оборудване';

useHead({
  title: categoriesTitle,
  meta: [
    { name: 'description', content: categoriesDescription },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:title', content: categoriesSeo?.opengraphTitle || categoriesTitle },
    { property: 'og:description', content: categoriesSeo?.opengraphDescription || categoriesDescription },
  ],
  link: [{ rel: 'canonical', href: categoriesSeo?.canonical || `${frontEndUrl || 'https://bgfreak.vercel.app'}/categories` }],
});

// Добавяне на структурирани данни (schema.org) ако са налични в Yoast
if (categoriesSeo?.schema?.raw) {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: categoriesSeo.schema.raw,
      },
    ],
  });
}
</script>

<template>
  <main class="container">
    <div v-if="parentCategories?.length" class="my-6 space-y-8">
      <!-- Заглавие на страницата -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Категории</h1>
        <p class="text-gray-600">Разгледайте всички продуктови категории, подредени по азбучен ред</p>
      </div>

      <!-- Итерация през групите от категории -->
      <div v-for="(group, groupIndex) in categoryGroups" :key="`group-${groupIndex}`" class="category-group-wrapper">
        <!-- Група от прости категории БЕЗ подкатегории -->
        <div v-if="group.type === 'simple'" class="simple-categories-group mb-8">
          <!-- Разделителна линия с заглавие (показваме ако има предишна група от различен тип) -->
          <div v-if="groupIndex > 0 && categoryGroups[groupIndex - 1]?.type === 'complex'" class="flex items-center mb-6">
            <div class="h-1 bg-gradient-to-r from-blue-500 to-blue-300 flex-1 mr-4"></div>
            <h3 class="text-lg font-semibold text-gray-700 px-4">Основни категории</h3>
            <div class="h-1 bg-gradient-to-l from-blue-500 to-blue-300 flex-1 ml-4"></div>
          </div>

          <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            <CategoryCard
              v-for="(category, categoryIndex) in group.categories"
              :key="category.databaseId"
              :node="category"
              :all-categories="productCategories"
              :image-loading="groupIndex === 0 && categoryIndex <= 7 ? 'eager' : 'lazy'"
              class="simple-category-card hover:shadow-lg transition-all duration-200" />
          </div>
        </div>

        <!-- Група с комплексна категория (С подкатегории) -->
        <div v-else-if="group.type === 'complex'" class="complex-category-group mb-12">
          <div v-for="(parentCategory, parentIndex) in group.categories" :key="parentCategory.databaseId">
            <!-- Родителската категория - отличава се визуално -->
            <div class="parent-category-section mb-6">
              <div class="flex items-center mb-6">
                <div class="h-1 bg-gradient-to-r from-red-500 to-red-300 flex-1 mr-4"></div>
                <h2 class="text-2xl font-bold text-gray-900 px-4">{{ parentCategory.name }}</h2>
                <div class="h-1 bg-gradient-to-l from-red-500 to-red-300 flex-1 ml-4"></div>
              </div>

              <!-- Родителската категория като по-голяма карта -->
              <div class="flex justify-center mb-8">
                <div class="w-full max-w-md">
                  <CategoryCard
                    :node="parentCategory"
                    :all-categories="productCategories"
                    :image-loading="groupIndex <= 1 && parentIndex === 0 ? 'eager' : 'lazy'"
                    class="parent-category-card transform hover:scale-105 transition-transform duration-300 shadow-lg" />
                </div>
              </div>
            </div>

            <!-- Подкатегориите - в grid layout -->
            <div class="subcategories-section">
              <h3 class="text-lg font-semibold text-gray-700 mb-4 text-center">Подкатегории в {{ parentCategory.name }}</h3>
              <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                <CategoryCard
                  v-for="(subcategory, subIndex) in getSubcategories(parentCategory)"
                  :key="subcategory.databaseId"
                  :node="subcategory"
                  :all-categories="productCategories"
                  :image-loading="groupIndex === 0 && subIndex <= 3 ? 'eager' : 'lazy'"
                  class="subcategory-card hover:shadow-md transition-shadow duration-200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ако няма категории -->
      <div v-if="!parentCategories?.length && productCategories?.length === 0" class="text-center py-12">
        <p class="text-gray-500 text-lg">Няма налични категории в момента.</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Стилове за родителските категории с подкатегории */
.parent-category-card {
  border: 3px solid transparent;
  background:
    linear-gradient(white, white) padding-box,
    linear-gradient(45deg, #ef4444, #f87171) border-box;
}

.parent-category-card:hover {
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Стилове за простите категории без подкатегории */
.simple-category-card {
  border: 2px solid transparent;
  background:
    linear-gradient(white, white) padding-box,
    linear-gradient(45deg, #3b82f6, #60a5fa) border-box;
  transition: all 0.2s ease-in-out;
}

.simple-category-card:hover {
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

/* Стилове за подкатегориите */
.subcategory-card {
  opacity: 0.95;
  transform: scale(0.98);
  transition: all 0.2s ease-in-out;
}

.subcategory-card:hover {
  opacity: 1;
  transform: scale(1);
}

/* Стилове за групите от категории */
.category-group {
  position: relative;
}

.category-group::after {
  content: '';
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #d1d5db, transparent);
}

.category-group:last-child::after {
  display: none;
}

/* Стилове за групите от категории */
.category-group-wrapper {
  position: relative;
}

.simple-categories-group {
  position: relative;
}

.complex-category-group {
  position: relative;
}

/* Responsive дизайн */
@media (max-width: 768px) {
  .parent-category-card {
    max-width: 280px;
    margin: 0 auto;
  }

  .subcategories-section .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .simple-categories-group .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .simple-categories-group .grid {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>
