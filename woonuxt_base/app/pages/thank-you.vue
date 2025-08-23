<script setup lang="ts">
// Извличане на информация за последната поръчка от localStorage
const order = ref<any>(null);
const { formatDate } = useHelpers();
const { t } = useI18n();

onMounted(() => {
  // Проверка дали сме в браузър
  if (process.client) {
    try {
      const savedOrder = localStorage.getItem('lastOrder');
      if (savedOrder) {
        order.value = JSON.parse(savedOrder);
      }
    } catch (e) {
      // Грешка при извличане на данни за поръчката
    }
  }
});

// SEO настройки
useHead({
  title: 'Благодарим за поръчката - BGFreak',
  meta: [
    { name: 'description', content: 'Благодарим за поръчката в BGFreak. Поръчката е успешно обработена.' },
    { name: 'robots', content: 'noindex, follow' },
  ],
});
</script>

<template>
  <div class="container my-8">
    <h1 class="mb-8 text-3xl font-semibold text-primary">{{ $t('messages.shop.orderReceived') }}</h1>

    <div v-if="order" class="my-8 p-6 bg-white rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">{{ $t('messages.shop.orderSummary') }}</h2>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <div class="text-sm text-gray-500 mb-1">{{ $t('messages.shop.order') }}:</div>
          <div class="font-semibold">#{{ order.id }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-500 mb-1">{{ $t('messages.general.date') }}:</div>
          <div class="font-semibold">{{ formatDate(order.date) }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-500 mb-1">{{ $t('messages.general.status') }}:</div>
          <div class="font-semibold">{{ order.status }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-500 mb-1">{{ $t('messages.general.paymentMethod') }}:</div>
          <div class="font-semibold">{{ order.paymentMethodTitle }}</div>
        </div>
      </div>

      <div class="border-t pt-4">
        <div class="flex justify-between items-center mb-2">
          <div class="font-semibold">{{ $t('messages.shop.total') }}</div>
          <div class="font-bold text-xl">{{ order.total }}</div>
        </div>
      </div>
    </div>

    <div class="my-8 prose">
      <p>{{ $t('messages.shop.orderThanks') }} 🎉</p>
      <p>
        За въпроси можете да се свържете с нас на телефон
        <a href="tel:+359876360518" class="text-primary underline">(+359) 876 360 518</a>
        в работно време от 10:00 до 17:00, понеделник до петък.
      </p>
      <p>
        {{ $t('messages.shop.continueShopping') }}
        <NuxtLink to="/" class="text-primary underline">{{ $t('messages.general.home') }}</NuxtLink>
        {{ $t('messages.shop.or') }}
        <NuxtLink to="/magazin" class="text-primary underline">{{ $t('messages.general.allProducts') }}</NuxtLink
        >.
      </p>
    </div>
  </div>
</template>
