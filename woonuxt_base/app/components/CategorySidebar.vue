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
  <aside class="w-full lg:w-1/4">
    <div class="bg-gray-50 rounded-lg shadow-lg p-2 sm:p-4 sticky top-4">
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
</template>

<style scoped>
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
