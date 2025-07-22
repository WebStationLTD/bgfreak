<script setup lang="ts">
import { PhoneIcon } from '@heroicons/vue/24/outline';
</script>

<template>
  <div class="w-full bg-gray-800 text-white border-b border-gray-700 py-2">
    <div class="w-full px-4">
      <div class="flex flex-col lg:flex-row h-auto lg:h-8 items-center justify-between py-2 lg:py-0">
        <!-- Лява част: Viber и телефон -->
        <div class="flex items-center mb-2 lg:mb-0">
          <img src="/viber.png" alt="Viber" class="mr-2" />
          <div class="flex items-center text-sm font-medium">
            <a href="tel:+359877277595" class="hover:text-gray-300 transition-colors"> +359 876 360 518 </a>
          </div>
        </div>

        <!-- Дясна част: Текст -->
        <div class="flex items-center text-center lg:text-right">
          <p class="text-xs font-bold uppercase tracking-wider">#1 МАГАЗИН ЗА АНАБОЛНИ СТЕРОИДИ, СЪЗДАДЕН ОТ ИСТИНСКИ ИЗРОДИ!</p>
        </div>
      </div>
    </div>
  </div>
</template>
