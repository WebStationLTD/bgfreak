<script setup>
import CategorySidebar from '~/components/CategorySidebar.vue';

// SEO данни за страницата
const { frontEndUrl } = useHelpers();

// SEO настройки
const seoTitle = 'FAQs - Често задавани въпроси | BGFreak';
const seoDescription =
  'Често задавани въпроси за анаболни стероиди, секс стимуланти и хранителни добавки. Отговори на всички въпроси относно поръчки, доставка, качество и употреба на продуктите от BGFreak.';
const canonicalUrl = `${frontEndUrl}/faqs/`;

// Структурирани данни за FAQ страницата
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  name: 'Често задавани въпроси',
  description: seoDescription,
  url: canonicalUrl,
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Как да направя поръчка?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Можете да направите поръчка онлайн чрез нашия сайт или да се свържете с нашия оператор на телефон (+359) 876 360 518.',
      },
    },
    {
      '@type': 'Question',
      name: 'Колко време отнема доставката?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Доставката в България отнема 1 работен ден. За Европа доставката е 2-4 работни дни.',
      },
    },
    {
      '@type': 'Question',
      name: 'Дискретна ли е доставката?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Да, гарантираме 100% дискретност при опаковането и изпращането на всички продукти.',
      },
    },
  ],
};

useHead({
  title: seoTitle,
  meta: [
    { name: 'description', content: seoDescription },
    { name: 'keywords', content: 'FAQs BGFreak, въпроси анаболи, как да поръчам стероиди, често задавани въпроси' },
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
            <h1 class="text-3xl font-bold text-gray-900 mb-4">Често задавани въпроси (FAQs)</h1>
            <p class="text-lg text-gray-600">
              Отговори на най-честите въпроси относно нашите <strong>анаболни стероиди</strong>, <strong>секс стимуланти</strong> и
              <strong>хранителни добавки</strong>
            </p>
          </header>

          <div class="space-y-8">
            <!-- Поръчки и плащания -->
            <section>
              <h2 class="text-2xl font-bold text-gray-900 mb-6 border-l-4 border-red-500 pl-4">Поръчки и плащания</h2>

              <div class="space-y-6">
                <div class="bg-gray-50 rounded-lg p-4">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Как да направя поръчка?</h3>
                  <p class="text-gray-700">
                    Можете да направите поръчка директно от нашия сайт, като добавите желаните продукти в количката. Алтернативно, можете да се свържете с нашия
                    оператор на телефон <strong>(+359) 876 360 518</strong> в работно време от 10:00 до 17:00, понеделник до петък.
                  </p>
                </div>

                <div class="bg-gray-50 rounded-lg p-4">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Какви са възможностите за плащане?</h3>
                  <p class="text-gray-700">Приемаме два вида плащане:</p>
                  <ul class="list-disc list-inside text-gray-700 mt-2 space-y-1">
                    <li><strong>Наложен платеж</strong> - плащате на куриера при получаване</li>
                    <li><strong>Криптовалути</strong> - Bitcoin и други популярни криптовалути</li>
                  </ul>
                </div>

                <div class="bg-gray-50 rounded-lg p-4">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Има ли минимална сума за поръчка?</h3>
                  <p class="text-gray-700">Няма минимална сума за поръчка. При поръчки над <strong>100 лв.</strong> доставката е безплатна в България.</p>
                </div>
              </div>
            </section>

            <!-- Продукти и качество -->
            <section>
              <h2 class="text-2xl font-bold text-gray-900 mb-6 border-l-4 border-red-500 pl-4">Продукти и качество</h2>

              <div class="space-y-6">
                <div class="bg-gray-50 rounded-lg p-4">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Оригинални ли са продуктите ви?</h3>
                  <p class="text-gray-700">
                    Да, предлагаме само <strong>100% оригинални продукти</strong> от доказани в бранша марки. Всички продукти са внимателно подбрани и проверени
                    за качество.
                  </p>
                </div>

                <div class="bg-gray-50 rounded-lg p-4">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Как да проверя автентичността на продукта?</h3>
                  <p class="text-gray-700">
                    Всички наши продукти идват с оригинални холограми, серийни номера и други защитни елементи от производителя. При съмнения можете да се
                    свържете с нас за верификация.
                  </p>
                </div>

                <div class="bg-gray-50 rounded-lg p-4">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Предлагате ли консултации за употреба?</h3>
                  <p class="text-gray-700">
                    Да, нашите специалисти могат да ви предоставят основна информация за правилната употреба на продуктите. Препоръчваме винаги да се
                    консултирате с лекар преди започване на курс.
                  </p>
                </div>
              </div>
            </section>

            <!-- Доставка -->
            <section>
              <h2 class="text-2xl font-bold text-gray-900 mb-6 border-l-4 border-red-500 pl-4">Доставка</h2>

              <div class="space-y-6">
                <div class="bg-gray-50 rounded-lg p-4">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Колко време отнема доставката?</h3>
                  <p class="text-gray-700">
                    В България доставката отнема <strong>1 работен ден</strong>. За Гърция и Румъния - 2-4 работни дни. За други европейски страни - моля
                    свържете се с нас за информация.
                  </p>
                </div>

                <div class="bg-gray-50 rounded-lg p-4">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Дискретна ли е доставката?</h3>
                  <p class="text-gray-700">
                    Да, гарантираме <strong>100% дискретност</strong> при опаковането и изпращането. Опаковката не разкрива съдържанието и се изпраща в
                    неутрална кутия.
                  </p>
                </div>

                <div class="bg-gray-50 rounded-lg p-4">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Мога ли да проверя пратката преди плащане?</h3>
                  <p class="text-gray-700">
                    Не, поради спецификата на продуктите, опцията "преглед" не е възможна. Всички продукти са внимателно опаковани и проверени преди изпращане.
                  </p>
                </div>
              </div>
            </section>

            <!-- Връщания и рекламации -->
            <section>
              <h2 class="text-2xl font-bold text-gray-900 mb-6 border-l-4 border-red-500 pl-4">Връщания и рекламации</h2>

              <div class="space-y-6">
                <div class="bg-gray-50 rounded-lg p-4">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Мога ли да върна продукт?</h3>
                  <p class="text-gray-700">
                    Връщанията се разглеждат само в случай на доказан дефект или грешка от наша страна. Поради спецификата на продуктите, не приемаме връщания
                    поради промяна на решението.
                  </p>
                </div>

                <div class="bg-gray-50 rounded-lg p-4">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Какво да правя ако има проблем с продукта?</h3>
                  <p class="text-gray-700">
                    При всякакви проблеми се свържете незабавно с нас на телефон <strong>(+359) 876 360 518</strong> или чрез онлайн съпорта. Ще разгледаме
                    случая индивидуално.
                  </p>
                </div>
              </div>
            </section>

            <!-- Поверителност и сигурност -->
            <section>
              <h2 class="text-2xl font-bold text-gray-900 mb-6 border-l-4 border-red-500 pl-4">Поверителност и сигурност</h2>

              <div class="space-y-6">
                <div class="bg-gray-50 rounded-lg p-4">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Сигурни ли са моите данни?</h3>
                  <p class="text-gray-700">
                    Да, използваме най-съвременните технологии за защита на данните. Всички лични данни се съхраняват сигурно и не се предоставят на трети
                    страни.
                  </p>
                </div>

                <div class="bg-gray-50 rounded-lg p-4">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Пазите ли историята на поръчките?</h3>
                  <p class="text-gray-700">
                    Пазим минимална информация необходима за обслужването ви. Можете да поискате изтриване на данните си по всяко време.
                  </p>
                </div>
              </div>
            </section>

            <!-- Контакт -->
            <section>
              <h2 class="text-2xl font-bold text-gray-900 mb-6 border-l-4 border-red-500 pl-4">Контакт и поддръжка</h2>

              <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 class="text-lg font-semibold text-blue-900 mb-4">Не намерихте отговор на въпроса си?</h3>
                <p class="text-blue-800 mb-4">Свържете се с нашия екип и ще получите професионален отговор:</p>
                <div class="space-y-2 text-blue-800">
                  <p><strong>Телефон:</strong> (+359) 876 360 518</p>
                  <p><strong>Работно време:</strong> 10:00 - 17:00, понеделник - петък</p>
                  <p><strong>24/7 онлайн съпорт:</strong> Чрез иконката в долният ляв ъгъл</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
