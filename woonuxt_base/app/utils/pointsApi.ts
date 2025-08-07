/**
 * REST API функции за работа с WooCommerce Points and Rewards
 */

interface UserPointsResponse {
  user_id: number;
  points_balance: number;
  points_label: string;
}

interface PointsTransactionResponse {
  success: boolean;
  message: string;
  new_balance?: number;
}

export class PointsAPI {
  private baseUrl: string;
  private consumerKey: string;
  private consumerSecret: string;

  constructor() {
    const config = useRuntimeConfig();
    this.baseUrl = config.public.WORDPRESS_URL || '';
    this.consumerKey = config.public.WC_CONSUMER_KEY || '';
    this.consumerSecret = config.public.WC_CONSUMER_SECRET || '';
  }

  /**
   * Извлича точките на потребител
   */
  async getUserPoints(userId: number): Promise<number> {
    try {
      // Първо опитваме през специализиран endpoint за точки
      const pointsResponse = await this.makeRequest(`/wp-json/wc/v3/points/users/${userId}`);

      if (pointsResponse?.points_balance !== undefined) {
        return pointsResponse.points_balance;
      }

      // Ако няма специализиран endpoint, опитваме през user meta
      const userResponse = await this.makeRequest(`/wp-json/wp/v2/users/${userId}`, {
        context: 'edit',
      });

      // Търсим в meta полетата
      const pointsKeys = ['wc_points_balance', '_wc_points_balance', 'points_balance', '_points_balance'];

      for (const key of pointsKeys) {
        if (userResponse?.meta?.[key]) {
          return parseInt(userResponse.meta[key], 10) || 0;
        }
      }

      return 0;
    } catch (error) {
      console.error('Грешка при извличане на точки:', error);
      return 0;
    }
  }

  /**
   * Прилага точки за отстъпка
   */
  async applyPointsDiscount(points: number, orderId?: number): Promise<PointsTransactionResponse> {
    try {
      const response = await this.makeRequest('/wp-json/wc/v3/points/apply', {
        method: 'POST',
        body: {
          points,
          order_id: orderId,
        },
      });

      return {
        success: true,
        message: response.message || 'Точките са приложени успешно',
        new_balance: response.new_balance,
      };
    } catch (error) {
      console.error('Грешка при прилагане на точки:', error);
      return {
        success: false,
        message: 'Грешка при прилагане на точки',
      };
    }
  }

  /**
   * Премахва приложени точки
   */
  async removePointsDiscount(): Promise<PointsTransactionResponse> {
    try {
      const response = await this.makeRequest('/wp-json/wc/v3/points/remove', {
        method: 'POST',
      });

      return {
        success: true,
        message: response.message || 'Точките са премахнати успешно',
      };
    } catch (error) {
      console.error('Грешка при премахване на точки:', error);
      return {
        success: false,
        message: 'Грешка при премахване на точки',
      };
    }
  }

  /**
   * Изчислява отстъпката за дадени точки
   */
  async calculatePointsDiscount(points: number): Promise<number> {
    try {
      const response = await this.makeRequest(`/wp-json/wc/v3/points/calculate?points=${points}`);
      return response.discount || 0;
    } catch (error) {
      console.error('Грешка при изчисляване на отстъпка:', error);
      return 0;
    }
  }

  /**
   * Извлича историята на точки за потребител
   */
  async getPointsHistory(userId: number, limit: number = 10): Promise<any[]> {
    try {
      const response = await this.makeRequest(`/wp-json/wc/v3/points/users/${userId}/history?limit=${limit}`);
      return response.history || [];
    } catch (error) {
      console.error('Грешка при извличане на история:', error);
      return [];
    }
  }

  /**
   * Общ метод за правене на заявки
   */
  private async makeRequest(endpoint: string, options: any = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    const requestOptions: RequestInit = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    if (options.body) {
      requestOptions.body = JSON.stringify(options.body);
    }

    // Добавяме query параметри ако има
    const finalUrl = options.params ? `${url}?${new URLSearchParams(options.params).toString()}` : url;

    const response = await fetch(finalUrl, requestOptions);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Генерира authentication headers
   */
  private getAuthHeaders(): Record<string, string> {
    if (!this.consumerKey || !this.consumerSecret) {
      return {};
    }

    // За HTTPS използваме Basic Auth
    const credentials = btoa(`${this.consumerKey}:${this.consumerSecret}`);
    return {
      Authorization: `Basic ${credentials}`,
    };
  }
}

// Инстанция за експорт
export const pointsApi = new PointsAPI();

/**
 * Composable за лесна употреба на Points API
 */
export function usePointsAPI() {
  const api = new PointsAPI();

  return {
    getUserPoints: api.getUserPoints.bind(api),
    applyPointsDiscount: api.applyPointsDiscount.bind(api),
    removePointsDiscount: api.removePointsDiscount.bind(api),
    calculatePointsDiscount: api.calculatePointsDiscount.bind(api),
    getPointsHistory: api.getPointsHistory.bind(api),
  };
}
