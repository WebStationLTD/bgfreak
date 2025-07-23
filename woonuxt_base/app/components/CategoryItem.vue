<script setup>
import { ref, computed } from 'vue';
import { PlusIcon, MinusIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  category: Object,
  level: {
    type: Number,
    default: 0,
  },
  parentPath: {
    type: Array,
    default: () => [],
  },
});

const { generateUrlFromPath } = useCategoryUrls();

const isOpen = ref(false);
const hasChildren = computed(() => props.category.children && props.category.children.nodes.length > 0);

const categoryUrl = computed(() => {
  if (!props.category?.slug) return '/';

  const fullPath = [...props.parentPath, props.category.slug];
  return generateUrlFromPath(fullPath);
});

const childrenPath = computed(() => {
  return [...props.parentPath, props.category.slug];
});
</script>

<template>
  <li>
    <div
      class="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
      :class="{ 'bg-gray-50': level > 0 }"
      :style="{ paddingLeft: `${level * 1.5 + 0.5}rem` }">
      <NuxtLink :to="categoryUrl" class="font-semibold hover:text-red-500 transition-colors duration-200 flex-1" :class="level === 0 ? 'text-base' : 'text-sm'">
        {{ category.name }}
      </NuxtLink>
      <button v-if="hasChildren" @click="isOpen = !isOpen" class="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200">
        <PlusIcon v-if="!isOpen" class="h-5 w-5 text-gray-600" />
        <MinusIcon v-else class="h-5 w-5 text-gray-600" />
      </button>
    </div>
    <transition name="slide-fade">
      <ul v-if="isOpen && hasChildren" class="mt-1 space-y-1">
        <CategoryItem v-for="child in category.children.nodes" :key="child.databaseId" :category="child" :level="level + 1" :parent-path="childrenPath" />
      </ul>
    </transition>
  </li>
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
