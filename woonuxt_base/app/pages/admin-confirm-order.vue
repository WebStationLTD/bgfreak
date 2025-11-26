<script setup lang="ts">
/**
 * 🔐 ADMIN ORDER CONFIRMATION PAGE
 * Обработва бързи линкове от админ имейла за потвърждаване/анулиране на поръчки
 */

const route = useRoute();
const runtimeConfig = useRuntimeConfig();

// SEO
useSeoMeta({
  title: 'Обработка на поръчка',
  robots: 'noindex, nofollow', // Не индексираме тази страница
});

// Състояние
const loading = ref(true);
const error = ref<string | null>(null);
const success = ref(false);
const orderData = ref<any>(null);
const statusAction = ref<string>('');

// Параметри от URL
const orderId = computed(() => route.query.ord as string);
const status = computed(() => route.query.status as string);
const token = computed(() => route.query.token as string);

// Валидация на параметри
const isValidRequest = computed(() => {
  return orderId.value && status.value && token.value;
});

// Текстове според статус
const getStatusText = (statusValue: string) => {
  switch (statusValue) {
    case 'completed':
      return 'Потвърждаване';
    case 'cancelled':
      return 'Анулиране';
    case 'view':
      return 'Преглеждане';
    default:
      return 'Обработка';
  }
};

// Икони според статус
const getStatusIcon = (statusValue: string) => {
  switch (statusValue) {
    case 'completed':
      return 'ion:checkmark-circle';
    case 'cancelled':
      return 'ion:close-circle';
    case 'view':
      return 'ion:eye';
    default:
      return 'ion:information-circle';
  }
};

// Цвят според статус
const getStatusColor = (statusValue: string) => {
  switch (statusValue) {
    case 'completed':
      return 'text-green-600';
    case 'cancelled':
      return 'text-red-600';
    case 'view':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
};

// Обработка на поръчката
const processOrder = async () => {
  if (!isValidRequest.value) {
    error.value = 'Невалидни параметри. Моля, използвайте линка от имейла.';
    loading.value = false;
    return;
  }

  statusAction.value = getStatusText(status.value);

  try {
    // Извикваме WordPress REST API endpoint
    const apiUrl = `${runtimeConfig.public.GRAPHQL_HOST.replace('/graphql', '')}/wp-json/woonuxt/v1/confirm-order`;

    const response = await $fetch(apiUrl, {
      method: 'POST',
      body: {
        order_id: orderId.value,
        status: status.value,
        token: token.value,
      },
    });

    // Успешна обработка
    orderData.value = response.order;
    success.value = true;
    error.value = null;
  } catch (err: any) {
    console.error('Order confirmation error:', err);

    // Обработка на грешки
    if (err.data?.message) {
      error.value = err.data.message;
    } else if (err.message) {
      error.value = err.message;
    } else {
      error.value = 'Възникна грешка при обработка на поръчката.';
    }

    success.value = false;
  } finally {
    loading.value = false;
  }
};

// Форматиране на дата
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('bg-BG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Форматиране на цена
const formatPrice = (price: number | string, currency: string = 'BGN') => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency: currency,
  }).format(numPrice);
};

// Автоматично зареждане при mount
onMounted(() => {
  processOrder();
});
</script>

<template>
  <main class="container min-h-screen py-8 mx-auto">
    <div class="max-w-2xl mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <Icon name="ion:hourglass" size="48" class="mx-auto mb-4 text-primary animate-spin" />
        <h2 class="text-xl font-semibold mb-2">Обработване на поръчката...</h2>
        <p class="text-gray-600">Моля, изчакайте.</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <Icon name="ion:close-circle" size="64" class="mx-auto mb-4 text-red-600" />
        <h2 class="text-2xl font-bold mb-2 text-red-800">Грешка</h2>
        <p class="text-red-700 mb-6">{{ error }}</p>
        <NuxtLink to="/" class="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          Към началото
        </NuxtLink>
      </div>

      <!-- Success State -->
      <div v-else-if="success && orderData" class="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
        <!-- Header -->
        <div :class="['p-6 text-center', status === 'completed' ? 'bg-green-50' : status === 'cancelled' ? 'bg-red-50' : 'bg-blue-50']">
          <Icon :name="getStatusIcon(status)" size="64" :class="['mx-auto mb-4', getStatusColor(status)]" />
          <h1 class="text-3xl font-bold mb-2">
            {{ statusAction }} успешно!
          </h1>
          <p v-if="status === 'completed'" class="text-green-700">
            Поръчката е потвърдена и клиентът ще получи известие.
          </p>
          <p v-else-if="status === 'cancelled'" class="text-red-700">
            Поръчката е анулирана и клиентът ще получи известие.
          </p>
          <p v-else class="text-blue-700">
            Преглеждате детайли на поръчката.
          </p>
        </div>

        <!-- Order Details -->
        <div class="p-6 space-y-6">
          <!-- Order Info -->
          <div class="border-b pb-4">
            <h3 class="text-lg font-semibold mb-3">Информация за поръчката</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-600">Номер:</span>
                <strong class="ml-2">#{{ orderData.order_number }}</strong>
              </div>
              <div>
                <span class="text-gray-600">Статус:</span>
                <strong class="ml-2 capitalize">{{ orderData.status }}</strong>
              </div>
              <div>
                <span class="text-gray-600">Дата:</span>
                <span class="ml-2">{{ formatDate(orderData.date_created) }}</span>
              </div>
              <div>
                <span class="text-gray-600">Обща сума:</span>
                <strong class="ml-2">{{ formatPrice(orderData.total, orderData.currency) }}</strong>
              </div>
            </div>
          </div>

          <!-- Customer Info -->
          <div class="border-b pb-4">
            <h3 class="text-lg font-semibold mb-3">Данни на клиента</h3>
            <div class="space-y-2 text-sm">
              <div>
                <span class="text-gray-600">Име:</span>
                <strong class="ml-2">{{ orderData.billing.first_name }} {{ orderData.billing.last_name }}</strong>
              </div>
              <div>
                <span class="text-gray-600">Имейл:</span>
                <a :href="`mailto:${orderData.billing.email}`" class="ml-2 text-primary hover:underline">
                  {{ orderData.billing.email }}
                </a>
              </div>
              <div v-if="orderData.billing.phone">
                <span class="text-gray-600">Телефон:</span>
                <a :href="`tel:${orderData.billing.phone}`" class="ml-2 text-primary hover:underline">
                  {{ orderData.billing.phone }}
                </a>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div v-if="orderData.items && orderData.items.length" class="border-b pb-4">
            <h3 class="text-lg font-semibold mb-3">Продукти</h3>
            <div class="space-y-2">
              <div v-for="(item, index) in orderData.items" :key="index" class="flex justify-between items-center text-sm py-2 border-b last:border-0">
                <div>
                  <strong>{{ item.name }}</strong>
                  <span class="text-gray-600 ml-2">x{{ item.quantity }}</span>
                </div>
                <div class="font-semibold">
                  {{ formatPrice(item.total, orderData.currency) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <NuxtLink
              :to="`https://admin.bgfreak.store/wp-admin/post.php?post=${orderData.id}&action=edit`"
              target="_blank"
              class="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
              <Icon name="ion:create" size="20" class="mr-2" />
              Редактирай в WP Admin
            </NuxtLink>
            <NuxtLink to="/" class="inline-flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
              <Icon name="ion:home" size="20" class="mr-2" />
              Към началото
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Invalid Request -->
      <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <Icon name="ion:warning" size="64" class="mx-auto mb-4 text-yellow-600" />
        <h2 class="text-2xl font-bold mb-2 text-yellow-800">Невалидна заявка</h2>
        <p class="text-yellow-700 mb-6">Моля, използвайте линка от имейла.</p>
        <NuxtLink to="/" class="inline-block px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
          Към началото
        </NuxtLink>
      </div>
    </div>
  </main>
</template>

