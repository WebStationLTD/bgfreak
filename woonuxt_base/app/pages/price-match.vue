<script setup>
import CategorySidebar from '~/components/CategorySidebar.vue';

// SEO данни за страницата
const { frontEndUrl } = useHelpers();

// SEO настройки
const seoTitle = 'Price Match - Гаранция за най-добра цена | BGFreak';
const seoDescription =
  'BGFreak ви гарантира най-добрата цена на анаболни стероиди и хранителни добавки. Намерихте по-ниска цена? Ще я съпоставим и ще ви върнем разликата.';
const canonicalUrl = `${frontEndUrl}/price-match/`;

// Структурирани данни за страницата
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Price Match - Гаранция за най-добра цена',
  description: seoDescription,
  url: canonicalUrl,
  mainEntity: {
    '@type': 'Service',
    name: 'Price Match гаранция',
    provider: {
      '@type': 'Organization',
      name: 'BGFreak',
      url: frontEndUrl,
    },
    description: 'Гарантираме най-добрата цена на анаболни стероиди и хранителни добавки',
    offers: {
      '@type': 'Offer',
      name: 'Price Match гаранция',
      description: 'Ще съпоставим всяка валидна по-ниска цена от конкурент',
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: 'BGN',
        eligibleTransactionVolume: {
          '@type': 'QuantitativeValue',
          name: 'Възстановяване на разликата в цената',
        },
      },
    },
  },
};

useHead({
  title: seoTitle,
  meta: [
    { name: 'description', content: seoDescription },
    { name: 'keywords', content: 'price match BGFreak, най-добра цена анаболи, гаранция цена стероиди, върни разликата' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:title', content: seoTitle },
    { property: 'og:description', content: seoDescription },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:site_name', content: 'BGFreak' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: seoTitle },
    { name: 'twitter:description', content: seoDescription },
  ],
  link: [{ rel: 'canonical', href: canonicalUrl }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(structuredData),
    },
  ],
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Сайдбар с категории - вляво -->
      <CategorySidebar />

      <!-- Основно съдържание - отдясно -->
      <main class="w-full lg:w-3/4">
        <div class="bg-white rounded-lg shadow-lg p-6">
          <header class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-4">Price Match - Гаранция за най-добра цена</h1>
            <p class="text-lg text-gray-600">
              Гарантираме ви най-добрата цена на <strong>анаболни стероиди</strong>, <strong>секс стимуланти</strong> и <strong>хранителни добавки</strong>
            </p>
          </header>

          <div class="space-y-8">
            <!-- Основна информация -->
            <section>
              <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <h2 class="text-2xl font-bold text-green-900 mb-4">🎯 Нашето обещание</h2>
                <p class="text-green-800 text-lg leading-relaxed">
                  В <strong>BGFreak</strong> се стремим да ви предоставим не само най-качествените продукти, но и най-добрите цени на пазара. Ако намерите същия
                  продукт на по-ниска цена при друг доверен търговец, <strong>ще съпоставим цената и ще ви върнем разликата!</strong>
                </p>
              </div>
            </section>

            <!-- Как работи -->
            <section>
              <h2 class="text-2xl font-bold text-gray-900 mb-6 border-l-4 border-red-500 pl-4">Как работи нашата Price Match гаранция?</h2>

              <div class="grid md:grid-cols-3 gap-6 mb-8">
                <div class="bg-blue-50 rounded-lg p-6 text-center">
                  <div class="text-3xl mb-4">🔍</div>
                  <h3 class="text-lg font-semibold text-blue-900 mb-2">1. Намерете по-ниска цена</h3>
                  <p class="text-blue-800 text-sm">Намерихте същия продукт на по-ниска цена при конкурент? Отлично!</p>
                </div>

                <div class="bg-yellow-50 rounded-lg p-6 text-center">
                  <div class="text-3xl mb-4">📧</div>
                  <h3 class="text-lg font-semibold text-yellow-900 mb-2">2. Свържете се с нас</h3>
                  <p class="text-yellow-800 text-sm">Изпратете ни линк или доказателство за по-ниската цена</p>
                </div>

                <div class="bg-green-50 rounded-lg p-6 text-center">
                  <div class="text-3xl mb-4">💰</div>
                  <h3 class="text-lg font-semibold text-green-900 mb-2">3. Получете възстановяване</h3>
                  <p class="text-green-800 text-sm">Ще съпоставим цената и ще върнем разликата</p>
                </div>
              </div>
            </section>

            <!-- Условия -->
            <section>
              <h2 class="text-2xl font-bold text-gray-900 mb-6 border-l-4 border-red-500 pl-4">Условия за Price Match</h2>

              <div class="space-y-6">
                <div class="bg-gray-50 rounded-lg p-4">
                  <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span class="text-green-500 mr-2">✓</span>
                    Какво включва нашата гаранция:
                  </h3>
                  <ul class="space-y-2 text-gray-700 ml-6">
                    <li class="flex items-start">
                      <span class="text-green-500 mr-2 mt-1">•</span>
                      <span>Съпоставяме цени на идентични продукти от същия производител</span>
                    </li>
                    <li class="flex items-start">
                      <span class="text-green-500 mr-2 mt-1">•</span>
                      <span>Валидно за продукти, които са налични в склад при конкурента</span>
                    </li>
                    <li class="flex items-start">
                      <span class="text-green-500 mr-2 mt-1">•</span>
                      <span>Възстановяване на разликата до 7 дни след покупката</span>
                    </li>
                    <li class="flex items-start">
                      <span class="text-green-500 mr-2 mt-1">•</span>
                      <span>Включваме разходите за доставка в крайната цена</span>
                    </li>
                  </ul>
                </div>

                <div class="bg-red-50 rounded-lg p-4">
                  <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span class="text-red-500 mr-2">✗</span>
                    Изключения от гаранцията:
                  </h3>
                  <ul class="space-y-2 text-gray-700 ml-6">
                    <li class="flex items-start">
                      <span class="text-red-500 mr-2 mt-1">•</span>
                      <span>Промоционални цени, разпродажби и временни намаления</span>
                    </li>
                    <li class="flex items-start">
                      <span class="text-red-500 mr-2 mt-1">•</span>
                      <span>Цени от aukциони, пазари или неоторизирани продавачи</span>
                    </li>
                    <li class="flex items-start">
                      <span class="text-red-500 mr-2 mt-1">•</span>
                      <span>Грешни или очевидно невярни цени</span>
                    </li>
                    <li class="flex items-start">
                      <span class="text-red-500 mr-2 mt-1">•</span>
                      <span>Продукти с различни срокове на годност или серийни номера</span>
                    </li>
                    <li class="flex items-start">
                      <span class="text-red-500 mr-2 mt-1">•</span>
                      <span>Комбинирани оферти или пакетни сделки</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <!-- Процедура -->
            <section>
              <h2 class="text-2xl font-bold text-gray-900 mb-6 border-l-4 border-red-500 pl-4">Процедура за заявяване</h2>

              <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 class="text-lg font-semibold text-blue-900 mb-4">За да заявите Price Match:</h3>

                <div class="space-y-4 text-blue-800">
                  <div class="flex items-start">
                    <span class="bg-blue-200 text-blue-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1 flex-shrink-0"
                      >1</span
                    >
                    <div><strong>Свържете се с нас</strong> на телефон <strong>(+359) 876 360 518</strong> или чрез онлайн съпорта</div>
                  </div>

                  <div class="flex items-start">
                    <span class="bg-blue-200 text-blue-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1 flex-shrink-0"
                      >2</span
                    >
                    <div>
                      <strong>Предоставете информация:</strong>
                      <ul class="list-disc list-inside mt-2 ml-4 space-y-1">
                        <li>Точното име на продукта</li>
                        <li>Линк към сайта с по-ниската цена</li>
                        <li>Снимка или screenshot на офертата</li>
                        <li>Номер на вашата поръчка (ако вече сте купили)</li>
                      </ul>
                    </div>
                  </div>

                  <div class="flex items-start">
                    <span class="bg-blue-200 text-blue-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1 flex-shrink-0"
                      >3</span
                    >
                    <div><strong>Проверка и одобрение</strong> - нашият екип ще провери информацията в рамките на 24 часа</div>
                  </div>

                  <div class="flex items-start">
                    <span class="bg-blue-200 text-blue-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1 flex-shrink-0"
                      >4</span
                    >
                    <div><strong>Възстановяване</strong> - ще върнем разликата в цената чрез същия метод на плащане</div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Примери -->
            <section>
              <h2 class="text-2xl font-bold text-gray-900 mb-6 border-l-4 border-red-500 pl-4">Примери за Price Match</h2>

              <div class="grid md:grid-cols-2 gap-6">
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div class="text-green-600 text-lg font-semibold mb-2">✓ Валиден Price Match</div>
                  <div class="text-sm text-green-800">
                    <p class="mb-2">
                      <strong>Сценарий:</strong> Намерихте същия протеин от същия производител в друг магазин за 85 лв., докато при нас е 95 лв.
                    </p>
                    <p><strong>Резултат:</strong> Ще върнем 10 лв. разлика + евентуални разходи за доставка.</p>
                  </div>
                </div>

                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div class="text-red-600 text-lg font-semibold mb-2">✗ Невалиден Price Match</div>
                  <div class="text-sm text-red-800">
                    <p class="mb-2"><strong>Сценарий:</strong> Намерихте подобен протеин с различен вкус на промоция с 50% отстъпка.</p>
                    <p><strong>Резултат:</strong> Не може да се приложи, защото е различен вкус и промоционална цена.</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Защо да изберете нас -->
            <section>
              <h2 class="text-2xl font-bold text-gray-900 mb-6 border-l-4 border-red-500 pl-4">Защо да изберете BGFreak?</h2>

              <div class="grid md:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <div class="flex items-start">
                    <span class="text-2xl mr-3">🏆</span>
                    <div>
                      <h3 class="font-semibold text-gray-900">Най-добро качество</h3>
                      <p class="text-gray-700 text-sm">100% оригинални продукти от доказани производители</p>
                    </div>
                  </div>

                  <div class="flex items-start">
                    <span class="text-2xl mr-3">🚚</span>
                    <div>
                      <h3 class="font-semibold text-gray-900">Бърза доставка</h3>
                      <p class="text-gray-700 text-sm">1 работен ден в България, дискретно опаковане</p>
                    </div>
                  </div>
                </div>

                <div class="space-y-4">
                  <div class="flex items-start">
                    <span class="text-2xl mr-3">🔒</span>
                    <div>
                      <h3 class="font-semibold text-gray-900">100% Дискретност</h3>
                      <p class="text-gray-700 text-sm">Защитаваме вашата поверителност и сигурност</p>
                    </div>
                  </div>

                  <div class="flex items-start">
                    <span class="text-2xl mr-3">💬</span>
                    <div>
                      <h3 class="font-semibold text-gray-900">24/7 Поддръжка</h3>
                      <p class="text-gray-700 text-sm">Винаги готови да ви помогнем и консултираме</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Контакт -->
            <section>
              <div class="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
                <h3 class="text-xl font-bold text-red-900 mb-4">Готови за Price Match?</h3>
                <p class="text-red-800 mb-4">Свържете се с нас сега и получете най-добрата цена на пазара!</p>
                <div class="space-y-2 text-red-800">
                  <p><strong>📞 Телефон:</strong> (+359) 876 360 518</p>
                  <p><strong>🕒 Работно време:</strong> 10:00 - 17:00, понеделник - петък</p>
                  <p><strong>💬 24/7 онлайн съпорт:</strong> Чрез иконката в долния ляв ъгъл</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
