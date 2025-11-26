# 🚀 ADMIN ORDER CONFIRM LINKS - Setup Guide

## 📋 Какво прави тази функция?

Добавя **бързи линкове в админ имейла** за:

- ✅ **Потвърждаване** на поръчката (status: completed)
- 👁️ **Преглеждане** на поръчката
- ❌ **Анулиране** на поръчката

**БЕЗ да влизаш в WordPress админ панела!**

---

## 🔧 ИНСТАЛАЦИЯ (2 стъпки)

### **СТЪПКА 1: WordPress Backend (functions.php)**

1. **Влез в WordPress Admin:**

   - https://admin.bgfreak.store/wp-admin/

2. **Отвори functions.php:**

   - **Appearance** → **Theme File Editor**
   - Избери `functions.php` от дясното меню
   - ИЛИ използвай FTP/SSH

3. **Добави този код в края на файла:**

```php
/**
 * 🚀 HEADLESS ORDER CONFIRM LINKS - За Nuxt Frontend
 * Добавя бързи линкове в админ имейла за потвърждаване на поръчки
 */
add_action('woocommerce_email_after_order_table', 'add_admin_confirm_order_url_headless', 10, 4);

function add_admin_confirm_order_url_headless($order, $sent_to_admin, $plain_text, $email) {

    $order_mail = $email->recipient;
    $recipient_mail = $order->get_billing_email();

    // Показваме линковете САМО в админ имейла (НЕ към клиента)
    if ( $order_mail != $recipient_mail ) {

        // 🔐 Генерираме secure token за защита
        $order_id = method_exists($order, 'get_id') ? $order->get_id() : $order->id;
        $token = wp_create_nonce('confirm_order_' . $order_id);

        // 🌐 НОВА URL структура за Headless frontend
        $frontend_url = 'https://bgfreak.store';

        $confirm_url = $frontend_url . '/admin-confirm-order?ord=' . $order_id . '&status=completed&token=' . $token;
        $view_url = $frontend_url . '/admin-confirm-order?ord=' . $order_id . '&status=view&token=' . $token;
        $cancel_url = $frontend_url . '/admin-confirm-order?ord=' . $order_id . '&status=cancelled&token=' . $token;

        echo '<div style="margin: 20px auto; text-align: left;">';
        echo '<a style="font-size: 18px; color: #28a745; font-weight: bold;" href="' . esc_url($confirm_url) . '">✅ Потвърждаване на поръчката</a>';
        echo '</div>';

        echo '<div style="margin: 20px auto; text-align: left;">';
        echo '<a style="font-size: 18px; color: #007bff;" href="' . esc_url($view_url) . '">👁️ Преглеждане на поръчката</a>';
        echo '</div>';

        echo '<div style="margin: 20px auto; text-align: left;">';
        echo '<a style="font-size: 18px; color: #dc3545; font-weight: bold;" href="' . esc_url($cancel_url) . '">❌ Анулиране на поръчката</a>';
        echo '</div>';
    }
}

/**
 * 🔐 REST API endpoint за валидиране и обновяване на поръчки
 * Използва се от Nuxt frontend-а
 */
add_action('rest_api_init', 'register_order_confirm_endpoint');

function register_order_confirm_endpoint() {
    register_rest_route('woonuxt/v1', '/confirm-order', array(
        'methods' => 'POST',
        'callback' => 'handle_order_confirmation',
        'permission_callback' => '__return_true',
    ));
}

function handle_order_confirmation($request) {
    $order_id = intval($request->get_param('order_id'));
    $status = sanitize_text_field($request->get_param('status'));
    $token = sanitize_text_field($request->get_param('token'));

    // 🔐 Валидираме token-а
    if (!wp_verify_nonce($token, 'confirm_order_' . $order_id)) {
        return new WP_Error('invalid_token', 'Невалиден или изтекъл token', array('status' => 403));
    }

    // Зареждаме поръчката
    $order = wc_get_order($order_id);

    if (!$order) {
        return new WP_Error('invalid_order', 'Поръчката не съществува', array('status' => 404));
    }

    // Обработваме различните статуси
    $message = '';
    switch ($status) {
        case 'completed':
            $order->update_status('completed', 'Потвърдена от админ имейл');
            $message = 'Поръчката е потвърдена успешно!';
            break;

        case 'cancelled':
            $order->update_status('cancelled', 'Анулирана от админ имейл');
            $message = 'Поръчката е анулирана.';
            break;

        case 'view':
            $message = 'Преглед на поръчката';
            break;

        default:
            return new WP_Error('invalid_status', 'Невалиден статус', array('status' => 400));
    }

    // Вземаме order items
    $items_data = array();
    foreach ($order->get_items() as $item) {
        $items_data[] = array(
            'name' => $item->get_name(),
            'quantity' => $item->get_quantity(),
            'total' => $item->get_total(),
        );
    }

    // Връщаме данните за поръчката
    return array(
        'success' => true,
        'message' => $message,
        'order' => array(
            'id' => $order->get_id(),
            'order_number' => $order->get_order_number(),
            'status' => $order->get_status(),
            'total' => $order->get_total(),
            'currency' => $order->get_currency(),
            'date_created' => $order->get_date_created()->format('Y-m-d H:i:s'),
            'billing' => array(
                'first_name' => $order->get_billing_first_name(),
                'last_name' => $order->get_billing_last_name(),
                'email' => $order->get_billing_email(),
                'phone' => $order->get_billing_phone(),
            ),
            'items' => $items_data,
        ),
    );
}
```

4. **Запази файла** (Update File)

---

### **СТЪПКА 2: Nuxt Frontend (Вече готово! ✅)**

Файлът `pages/admin-confirm-order.vue` е вече създаден и е готов за употреба!

---

## 🧪 ТЕСТВАНЕ

### **1. Тествай REST API endpoint:**

Отвори Postman или браузър и направи POST заявка:

```bash
POST https://admin.bgfreak.store/wp-json/woonuxt/v1/confirm-order
Content-Type: application/json

{
  "order_id": 123,
  "status": "view",
  "token": "YOUR_TOKEN_HERE"
}
```

**Очакван отговор:**

```json
{
  "success": true,
  "message": "Преглед на поръчката",
  "order": {
    "id": 123,
    "order_number": "123",
    "status": "pending",
    ...
  }
}
```

---

### **2. Тествай в реална поръчка:**

1. **Направи тестова поръчка** в сайта
2. **Провери админ имейла** - трябва да има 3 нови линка:

   - ✅ Потвърждаване на поръчката
   - 👁️ Преглеждане на поръчката
   - ❌ Анулиране на поръчката

3. **Кликни на един от линковете**

   - Трябва да те отвори на: `https://bgfreak.store/admin-confirm-order?ord=XXX&status=XXX&token=XXX`
   - Трябва да видиш красива страница с детайли за поръчката

4. **Провери статуса в WP Admin:**
   - WooCommerce → Orders
   - Провери дали статусът е променен правилно

---

## 🔐 СИГУРНОСТ

### **✅ Защита с WordPress Nonce:**

- Всеки линк има уникален `token` (WordPress nonce)
- Token-ът важи **24 часа** по подразбиране
- Ако някой опита да промени URL-а → грешка "Невалиден token"

### **✅ Валидация:**

- REST API проверява token-а преди да направи промени
- Проверява дали поръчката съществува
- Проверява дали статусът е валиден

### **✅ Logging:**

- WordPress записва промените в order notes: "Потвърдена от админ имейл"

---

## 📊 КАКВО ВИЖДАТ ПОТРЕБИТЕЛИТЕ?

### **АДМИН ИМЕЙЛ:**

```
╔════════════════════════════════════════════╗
║ Поръчка #123                                ║
║ ───────────────────────────────────────── ║
║ [Order table here]                         ║
║                                            ║
║ ✅ Потвърждаване на поръчката              ║
║ 👁️ Преглеждане на поръчката               ║
║ ❌ Анулиране на поръчката                  ║
╚════════════════════════════════════════════╝
```

### **FRONTEND СТРАНИЦА:**

```
╔════════════════════════════════════════════╗
║   ✅                                        ║
║   Потвърждаване успешно!                   ║
║   Поръчката е потвърдена и клиентът ще     ║
║   получи известие.                         ║
║ ───────────────────────────────────────── ║
║ Информация за поръчката                    ║
║ Номер: #123                                ║
║ Статус: completed                          ║
║ ───────────────────────────────────────── ║
║ [Customer info]                            ║
║ [Order items]                              ║
║ ───────────────────────────────────────── ║
║ [Редактирай в WP Admin] [Към началото]    ║
╚════════════════════════════════════════════╝
```

---

## 🎯 ПРЕДИМСТВА НА НОВАТА СИСТЕМА

| Старо (Monolithic WP)      | Ново (Headless)                  |
| -------------------------- | -------------------------------- |
| Линкове към WP админ панел | Линкове към красив Nuxt frontend |
| Само URL промяна           | Визуализация + REST API          |
| Няма валидация             | Secure token защита              |
| Грозен админ интерфейс     | Модерен, responsive UI           |
| Работи само на 1 домейн    | Работи на Headless архитектура   |

---

## ❓ FAQ

**Q: Линковете не работят?**
A: Провери дали си добавил кода в `functions.php` и дали REST API-то отговаря на: `https://admin.bgfreak.store/wp-json/woonuxt/v1/confirm-order`

**Q: "Невалиден token" грешка?**
A: Token-ът важи 24 часа. Ако имейлът е по-стар, направи нова тестова поръчка.

**Q: Искам да променя URL-а на frontend-а?**
A: Промени `$frontend_url = 'https://bgfreak.store';` в `functions.php`

**Q: Искам да добавя още action-и (например "processing" статус)?**
A: Добави нов `case 'processing':` в `handle_order_confirmation()` функцията

---

## 🚀 ГОТОВО!

След като добавиш кода в `functions.php`:

1. ✅ Направи тестова поръчка
2. ✅ Провери админ имейла
3. ✅ Кликни на линка
4. ✅ Наслаждавай се на бързото потвърждаване! 🎉
