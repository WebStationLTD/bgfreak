<script setup>
import { ref, computed } from 'vue';
import { PlusIcon, MinusIcon } from '@heroicons/vue/24/outline';
import { useWindowSize } from '@vueuse/core';
import CategoryItem from './CategoryItem.vue';

// Зареждаме всички категории, включително празните, за да покажем пълната структура
const { data } = await useAsyncGql('getProductCategories', { first: 100, hideEmpty: false });
const allCategories = data.value?.productCategories?.nodes || [];

// Филтрираме само родителските категории (тези без родител)
const parentCategories = allCategories.filter((c) => c.parent === null);

// Променлива за видимостта на категориите на мобилни устройства
const isMobileMenuOpen = ref(false);

// Следим размера на екрана
const { width } = useWindowSize();
const isMobileScreen = computed(() => width.value < 1024);
</script>

<template>
  <section class="container mx-auto my-16 px-4">
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Лява колона: Категории -->
      <aside class="w-full lg:w-1/4">
        <div class="bg-gray-50 rounded-lg shadow-lg p-4">
          <div class="lg:hidden">
            <button
              @click="isMobileMenuOpen = !isMobileMenuOpen"
              class="w-full flex justify-between items-center text-lg font-bold text-gray-800 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors">
              Категории
              <PlusIcon v-if="!isMobileMenuOpen" class="h-5 w-5" />
              <MinusIcon v-else class="h-5 w-5" />
            </button>
          </div>
          <h2 class="text-xl font-bold mb-4 hidden lg:block text-gray-800 border-b-2 border-red-500 pb-2">Категории</h2>

          <transition name="slide-fade">
            <ul v-show="isMobileMenuOpen || !isMobileScreen" class="space-y-2">
              <CategoryItem v-for="category in parentCategories" :key="category.databaseId" :category="category" :parent-path="[]" />
            </ul>
          </transition>
        </div>
      </aside>

      <!-- Дясна колона: Информация и карусел -->
      <main class="w-full lg:w-3/4">
        <div class="prose max-w-none">
          <h1>BGFREAK – Най-големият онлайн магазин за дискретна и сигурна поръчка на анаболни стероиди</h1>
          <p>
            Нарекохме се BGFREAK, защото искаме да се отличаваме, искаме да покажем надмощие, да Ви дадем продуктите, с които Вие да се превърнете в истински
            изроди! Анаболни стероиди, хормон на растежа, пептиди, секс стимуланти, прохормони – всичко за сериозни резултати, само от проверени производители и
            с гарантирано качество!
          </p>
          <h2>Купи най-добрите анаболни стероиди сега от BGFREAK</h2>
          <p>
            Без фалшиви продукти, без неработещи продукти, само изпробвани от нас или изследвани в лаборатория анаболи, които ще Ви гарантират сигурни зверски
            резултати – взривна сила, нечовешка маса, максимално повишено либидо – превърни се в изрод със стероидите от BGFREAK!
          </p>
          <h2>BGFREAK – Нашата мисия</h2>
          <p>
            Нашата цел е да направим доволен всеки наш потребител и клиент и да го накараме да се върне обратно. Ние не искаме да Ви излъжем, напротив – искаме
            доверието Ви и няма да го предадем!
          </p>
          <p>
            BGFREAK е първия по рода си онлайн магазин за добрите анаболи с реален склад, обучен персонал, изграден от действащи по настоящем или бивши
            професионални атлети в различни дисциплини. Благодарение на това можете да получите адекватни съвети и консултация от нас от нашите онлайн
            консултанти, които са на Ваше разположение 24/7!
          </p>
          <p>
            BGFREAK доставя експресно бързо – само за един работен ден, сигурно и дискретно. Само ние използваме така нареченото “стелт” опаковане т.е.
            поръчаните от Вас продукти са пакетирани като нещо съвсем различно, така че Вие запазвате своята сигурност и дискретност и пратката Ви е напълно
            защитена, което Ви дава абсолютна гаранция, че ще бъде доставена, без значение до коя точка в България или Европа трябва да стане това.
          </p>
        </div>

        <div class="mt-16">
          <NewProductsCarousel />
        </div>
      </main>
    </div>
  </section>
</template>

<style>
.prose h1 {
  @apply text-3xl font-bold mb-4;
}
.prose h2 {
  @apply text-2xl font-bold mt-8 mb-4;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
