<template>
  <div v-if="showPoints" class="product-points-section my-6">
    <!-- Точки които се печелят при покупка -->
    <div v-if="pointsData.earnPoints" class="points-earned mb-4">
      <div class="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
        <div class="flex items-center justify-center w-10 h-10 bg-green-500 rounded-full">
          <Icon name="ion:gift-outline" class="text-white" size="20" />
        </div>
        <div class="flex-1">
          <h4 class="font-semibold text-green-800 text-base">Спечели бонус точки!</h4>
          <p class="text-sm text-green-700">
            Купи и спечели <strong>{{ formatPoints(pointsData.earnPoints) }}</strong> промо точки
          </p>
        </div>
        <div class="text-right">
          <div class="text-lg font-bold text-green-600">+{{ pointsData.earnPoints }}</div>
          <div class="text-xs text-green-500 uppercase tracking-wide">точки</div>
        </div>
      </div>
    </div>

    <!-- Информация за изкупуване с точки (ако е налично) -->
    <div v-if="pointsData.canRedeem && pointsData.redeemPoints" class="points-redeem mb-4">
      <div class="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
        <div class="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full">
          <Icon name="ion:diamond-outline" class="text-white" size="20" />
        </div>
        <div class="flex-1">
          <h4 class="font-semibold text-blue-800 text-base">Изкупи с точки</h4>
          <p class="text-sm text-blue-700">
            Използвай <strong>{{ formatPoints(pointsData.redeemPoints) }}</strong> промо точки за отстъпка
          </p>
        </div>
        <div class="text-right">
          <div class="text-lg font-bold text-blue-600">{{ pointsData.redeemPoints }}</div>
          <div class="text-xs text-blue-500 uppercase tracking-wide">точки</div>
        </div>
      </div>
    </div>

    <!-- Общо точки информация -->
    <div v-if="showTotalInfo" class="points-total">
      <div class="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div class="flex items-center justify-center w-8 h-8 bg-gray-400 rounded-full">
          <Icon name="ion:information-circle-outline" class="text-white" size="16" />
        </div>
        <div class="flex-1 text-sm text-gray-600">
          Ще получиш <strong>{{ totalPointsForQuantity }}</strong> промо точки с този продукт
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  product?: any;
  variation?: any;
  quantity?: number;
  showTotalInfo?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  quantity: 1,
  showTotalInfo: false,
});

const { getProductPoints, getVariationPoints, calculateEarnedPoints, hasPointsReward, formatPointsMessage } = usePoints();

// Извличаме данните за точки
const pointsData = computed(() => {
  if (props.variation) {
    return getVariationPoints(props.variation);
  }
  return getProductPoints(props.product);
});

// Проверяваме дали да показваме секцията с точки
const showPoints = computed(() => {
  return hasPointsReward(props.product) || (props.variation && hasPointsReward(props.variation));
});

// Изчисляваме общо точки за количеството
const totalPointsForQuantity = computed(() => {
  const baseProduct = props.variation || props.product;
  return calculateEarnedPoints(baseProduct, props.quantity);
});

// Форматиране на точки
const formatPoints = (points: number | string): string => {
  const numPoints = typeof points === 'string' ? parseFloat(points) : points;
  return formatPointsMessage(numPoints);
};
</script>

<style scoped>
.product-points-section {
  opacity: 1;
  transition: all 0.3s ease;
}

.points-earned,
.points-redeem,
.points-total {
  transition: all 0.3s ease;
}

.points-earned:hover,
.points-redeem:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Subtle glow effects */
.points-earned .bg-green-500 {
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
}

.points-redeem .bg-blue-500 {
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}
</style>
