/**
 * Composable за работа с WooCommerce Points and Rewards
 */

export interface PointsData {
  earnPoints?: number | string;
  pointsValue?: number | string;
  canRedeem?: boolean;
  redeemPoints?: number | string;
  pointsLabel?: string;
}

export function usePoints() {
  /**
   * Извлича информацията за точки от продукт
   */
  const getProductPoints = (product: any): PointsData => {
    if (!product?.metaData) {
      return {};
    }

    const metaData = product.metaData;
    const points: PointsData = {};

    // Търсим meta полета свързани с точки
    // Възможни ключове за точки за продукт
    const pointsKeys = [
      '_wc_points_earned', // Стандартно поле за точки
      'wc_points_earned',
      '_woocommerce_points_earned',
      'woocommerce_points_earned',
      '_points_earned',
      'points_earned',
      '_product_points',
      'product_points',
    ];

    // Търсим стойност за точки
    const pointsValueKeys = ['_wc_points_value', 'wc_points_value', '_woocommerce_points_value', 'woocommerce_points_value', '_points_value', 'points_value'];

    // Търсим за точки които се печелят
    for (const key of pointsKeys) {
      const meta = metaData.find((m: any) => m.key === key);
      if (meta?.value) {
        points.earnPoints = meta.value;
        break;
      }
    }

    // Търсим за стойност на точките
    for (const key of pointsValueKeys) {
      const meta = metaData.find((m: any) => m.key === key);
      if (meta?.value) {
        points.pointsValue = meta.value;
        break;
      }
    }

    // Ако не намерим специфични полета, ще използваме общи правила
    // Обикновено точките се изчисляват от цената на продукта
    if (!points.earnPoints && product.price) {
      // По default 1 точка за всеки лев (може да се конфигурира)
      const priceNumber = parseFloat(product.price.replace(/[^\d.]/g, ''));
      if (!isNaN(priceNumber)) {
        points.earnPoints = Math.floor(priceNumber);
      }
    }

    // Добавяме етикет по default
    points.pointsLabel = 'точки';

    return points;
  };

  /**
   * Извлича информацията за точки от вариация
   */
  const getVariationPoints = (variation: any): PointsData => {
    if (!variation?.metaData) {
      return getProductPoints(variation); // Fallback към общата логика
    }

    return getProductPoints(variation); // Използваме същата логика
  };

  /**
   * Проверява дали потребителят може да използва точки
   */
  const canUsePoints = (userPoints?: number, requiredPoints?: number): boolean => {
    if (!userPoints || !requiredPoints) return false;
    return userPoints >= requiredPoints;
  };

  /**
   * Форматира съобщение за точки
   */
  const formatPointsMessage = (points: number | string, label: string = 'точки'): string => {
    return `${points} ${label}`;
  };

  /**
   * Извлича точките на потребителя от REST API
   * (ще бъде имплементирано когато е нужно)
   */
  const getUserPoints = async (userId?: number): Promise<number> => {
    // TODO: Имплементация на REST API заявка към WordPress
    // за извличане на точките на потребителя
    return 0;
  };

  /**
   * Изчислява колко точки ще получи потребителят за покупка
   */
  const calculateEarnedPoints = (product: any, quantity: number = 1): number => {
    const pointsData = getProductPoints(product);

    if (pointsData.earnPoints) {
      const points = typeof pointsData.earnPoints === 'string' ? parseFloat(pointsData.earnPoints) : pointsData.earnPoints;

      return Math.floor(points * quantity);
    }

    return 0;
  };

  /**
   * Проверява дали продуктът дава точки
   */
  const hasPointsReward = (product: any): boolean => {
    const pointsData = getProductPoints(product);
    return !!(pointsData.earnPoints && Number(pointsData.earnPoints) > 0);
  };

  return {
    getProductPoints,
    getVariationPoints,
    canUsePoints,
    formatPointsMessage,
    getUserPoints,
    calculateEarnedPoints,
    hasPointsReward,
  };
}
