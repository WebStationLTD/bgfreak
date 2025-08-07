<template>
  <div v-if="showPointsSummary" class="cart-points-summary my-4">
    <!-- Общо точки които ще се спечелят -->
    <div v-if="totalEarnedPoints > 0" class="earned-points mb-3">
      <div class="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-center gap-2">
          <Icon name="ion:gift-outline" class="text-green-600" size="20" />
          <span class="text-sm text-green-700">Ще спечелиш промо точки:</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="text-lg font-bold text-green-600">{{ totalEarnedPoints }}</span>
          <span class="text-xs text-green-500 uppercase">точки</span>
        </div>
      </div>
    </div>

    <!-- Поле за въвеждане на точки за изкупуване -->
    <div v-if="canRedeemPoints" class="redeem-points">
      <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-center gap-2 mb-3">
          <Icon name="ion:diamond-outline" class="text-blue-600" size="20" />
          <h4 class="text-sm font-semibold text-blue-800">Използвай промо точки</h4>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between text-sm text-blue-700">
            <span>Налични точки:</span>
            <span class="font-semibold">{{ userAvailablePoints }}</span>
          </div>

          <div class="flex gap-2">
            <input
              v-model="pointsToRedeem"
              type="number"
              :min="0"
              :max="userAvailablePoints"
              placeholder="Въведи точки"
              class="flex-1 px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:border-blue-500" />
            <button
              @click="applyPoints"
              :disabled="!pointsToRedeem || pointsToRedeem <= 0"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
              Приложи
            </button>
          </div>

          <div v-if="pointsDiscount > 0" class="text-sm text-blue-700">
            Отстъпка: <strong>{{ formatCurrency(pointsDiscount) }}</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- Прилагани точки (ако има такива) -->
    <div v-if="appliedPoints > 0" class="applied-points mt-3">
      <div class="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div class="flex items-center gap-2">
          <Icon name="ion:checkmark-circle-outline" class="text-yellow-600" size="20" />
          <span class="text-sm text-yellow-700">Приложени точки:</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold text-yellow-600">-{{ appliedPoints }} точки</span>
          <button @click="removePoints" class="text-yellow-500 hover:text-yellow-700" title="Премахни точки">
            <Icon name="ion:close-circle-outline" size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  cartItems?: any[];
  userPoints?: number;
  appliedPoints?: number;
  pointsDiscount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  cartItems: () => [],
  userPoints: 0,
  appliedPoints: 0,
  pointsDiscount: 0,
});

const emit = defineEmits(['apply-points', 'remove-points']);

const { calculateEarnedPoints } = usePoints();

// Локално състояние
const pointsToRedeem = ref<number>(0);

// Изчисляваме общо точки които ще се спечелят
const totalEarnedPoints = computed(() => {
  if (!props.cartItems?.length) return 0;

  return props.cartItems.reduce((total, item) => {
    const itemPoints = calculateEarnedPoints(item.product, item.quantity || 1);
    return total + itemPoints;
  }, 0);
});

// Налични точки на потребителя
const userAvailablePoints = computed(() => {
  return props.userPoints - props.appliedPoints;
});

// Дали да показваме секцията
const showPointsSummary = computed(() => {
  return totalEarnedPoints.value > 0 || props.userPoints > 0;
});

// Дали потребителят може да изкупува точки
const canRedeemPoints = computed(() => {
  return userAvailablePoints.value > 0;
});

// Функции
const applyPoints = () => {
  if (pointsToRedeem.value > 0 && pointsToRedeem.value <= userAvailablePoints.value) {
    emit('apply-points', pointsToRedeem.value);
    pointsToRedeem.value = 0;
  }
};

const removePoints = () => {
  emit('remove-points');
};

// Форматиране на валута (може да се вземе от глобален composable)
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency: 'BGN',
  }).format(amount);
};

// Наблюдаваме промени в приложените точки
watch(
  () => props.appliedPoints,
  (newVal) => {
    if (newVal === 0) {
      pointsToRedeem.value = 0;
    }
  },
);
</script>

<style scoped>
.cart-points-summary {
  @apply transition-all duration-300;
}

input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}
</style>
