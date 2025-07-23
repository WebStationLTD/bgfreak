<script setup>
import CategorySidebar from '~/components/CategorySidebar.vue';

// SEO данни за страницата
const { frontEndUrl } = useHelpers();

// SEO настройки
const seoTitle = 'Доставка | BGFreak - Дискретна доставка на анаболни стероиди и добавки';
const seoDescription =
  'Дискретна и сигурна доставка на анаболни стероиди, секс стимуланти и хранителни добавки от BGFreak. Безплатна доставка над 100 лв. Бърза доставка в България и Европа.';
const canonicalUrl = `${frontEndUrl}/dostavka/`;

// Структурирани данни за страницата
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Доставка',
  description: seoDescription,
  url: canonicalUrl,
  mainEntity: {
    '@type': 'Service',
    name: 'Доставка на анаболни стероиди и хранителни добавки',
    provider: {
      '@type': 'Organization',
      name: 'BGFreak',
      url: frontEndUrl,
    },
    areaServed: {
      '@type': 'Place',
      name: 'България и Европа',
    },
    offers: {
      '@type': 'Offer',
      name: 'Безплатна доставка',
      description: 'Безплатна доставка при поръчки над 100 лв.',
      eligibilityCondition: 'Минимална стойност на поръчката 100 лв.',
    },
  },
};

useHead({
  title: seoTitle,
  meta: [
    { name: 'description', content: seoDescription },
    { name: 'keywords', content: 'доставка анаболи, доставка стероиди, безплатна доставка BGFreak, куриерска доставка' },
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
            <h1 class="text-3xl font-bold text-gray-900 mb-4">Доставка</h1>
            <p class="text-lg text-gray-600">
              Доставка <strong>анаболи</strong>, <strong>стероиди</strong>, <strong>секс стимуланти</strong> и <strong>хранителни добавки</strong> от
              <strong>BGFreak.STORE</strong>
            </p>
          </header>

          <div class="prose max-w-none">
            <p class="text-gray-700 leading-relaxed">
              Чрез тази страница <strong>BGFreak.STORE</strong> Ви предоставя възможността да се запознаете с условията за доставка на Вашата поръчка до Вашата
              врата или офис на куриерската фирма. Наши партньори за доставките в рамките на цялата страна са куриерски фирми с традиции и коректност в
              обслужването.
            </p>

            <p class="text-gray-700 leading-relaxed">
              Напомняме Ви, че имайки предвид спецификата на предлаганите от нас продукти (Циалис, Вигор 300, Камагра, Виагра, Кленбутерол, Липовон и други) ние
              Ви гарантираме <strong>100% дискретност</strong> при опаковането и изпращането им, така че да не бъде нарушен Вашия комфорт, без значение дали
              получавате пратката си на домашния Ви адрес, на работното си място или в офис на куриерската фирма.
            </p>

            <div class="bg-red-50 border-l-4 border-red-500 p-4 my-6">
              <p class="text-red-800 font-semibold">
                <strong>BGFreak.STORE</strong> изрично Ви уведомява, че опция "Преглед" на пратката в офис на куриерската фирма не е възможен и няма как да го
                позволим, поради естеството на продуктите.
              </p>
            </div>

            <section class="my-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">Кога получавате безплатна доставка?</h2>
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <p class="text-green-800 font-semibold">
                  <strong
                    >С абсолютно всяка поръчка на стойност над 100,00 лв. в България при нас, без значение доставката до Ваш адрес или офис на куриерската фирма
                    е 100% безплатна</strong
                  >
                  и Вие ще трябва да заплатите само стойността на поръчаните от Вас продукти; ние оценяваме това, че сте избрали да бъдете наш клиент и Ви се
                  отблагодаряваме с този комплимент; за поръчки извън територията на България доставката е винаги за сметка на клиента.
                </p>
              </div>
            </section>

            <section class="my-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">Условия, цени, време за доставка и възможни платежни методи:</h2>

              <p class="text-gray-700 mb-4">Цената на доставката се формира спрямо тарифите на куриерските фирми, които използваме.</p>

              <h3 class="text-xl font-semibold text-gray-900 mb-2">1. Време за доставка</h3>
              <p class="text-gray-700 mb-4">1 работен ден през работни дни от понеделник до петък и след потвърждение от оператор.</p>

              <h3 class="text-xl font-semibold text-gray-900 mb-2">2. Цена на доставка:</h3>
              <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Цена на доставка до офис на куриерската фирма – <strong>7,00 BGN</strong></li>
                <li>Цена на доставка до точен адрес – <strong>9,00 BGN</strong></li>
              </ul>

              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <ul class="text-yellow-800 space-y-1">
                  <li><strong>*За доставка в съботни или полуработни дни се начисляват 3,00 BGN допълнително</strong></li>
                  <li><strong>*Всички обявени цени за доставка са в български лева (BGN)</strong></li>
                  <li><strong>*Всички обявени по-горе цени за доставка са с ДДС</strong></li>
                </ul>
              </div>

              <h3 class="text-xl font-semibold text-gray-900 mb-2">3. Възможни платежни методи:</h3>
              <ul class="list-disc list-inside text-gray-700 mb-6 space-y-1">
                <li><strong>Наложен платеж</strong> – плащате на място на куриера при получаването на Вашата поръчка</li>
                <li>
                  <strong>Bitcoin и други известни криптовалути</strong> – използвайте най-популярните криптовалути, за да заплатите своята поръчка, при избор
                  на този метод ще получите адрес на съответния портфейл, по който трябва да пуснете съответната сума до 2 часа след завършване на поръчката си
                </li>
              </ul>
            </section>

            <section class="my-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">II. УСЛОВИЯ ЗА ДОСТАВКА НА ТЕРИТОРИЯТА НА ЕВРОПА</h2>

              <h3 class="text-xl font-semibold text-gray-900 mb-4">1. Доставка до Гърция и Румъния</h3>

              <div class="space-y-4">
                <div>
                  <h4 class="font-semibold text-gray-900">1.1. Време за доставка</h4>
                  <p class="text-gray-700">2 до 4 работни дни, в някой по-отдалечени населени места може да отнеме над 5 дни.</p>
                </div>

                <div>
                  <h4 class="font-semibold text-gray-900">1.2. Цени за доставка</h4>
                  <ul class="list-disc list-inside text-gray-700 space-y-1">
                    <li>Цена за доставка до офис на куриерска фирма – <strong>5,00 EUR</strong></li>
                    <li>Цена за доставка до адрес – <strong>10,00 EUR</strong></li>
                  </ul>
                </div>

                <div>
                  <h4 class="font-semibold text-gray-900">1.3. Възможни платежни методи</h4>
                  <ul class="list-disc list-inside text-gray-700 space-y-1">
                    <li><strong>Наложен платеж</strong> – плащате на място на куриера при получаването на Вашата поръчка</li>
                    <li><strong>Bitcoin и други известни криптовалути</strong> – използвайте най-популярните криптовалути</li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="my-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">Контакти за доставка</h2>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-gray-700 mb-2">За въпроси относно доставката можете да се свържете с нас:</p>
                <p class="text-gray-700">
                  <strong>Телефон:</strong> (+359) 876 360 518<br />
                  <strong>Работно време:</strong> 10:00 - 17:00, понеделник - петък
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
