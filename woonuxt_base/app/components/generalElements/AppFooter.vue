<script setup lang="ts">
const { wooNuxtVersionInfo } = useHelpers();
const { wishlistLink } = useAuth();

// Добавяме структурирани данни чрез useHead()
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'BgFreak',
        description:
          'BgFreak е водещ вносител и представител на голямо разнообразие от анаболи, секс стимуланти, пептиди, хормон на растежа (HGH) и други продукти',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'ул. "Георги Димитров" 12',
          addressLocality: 'София',
          postalCode: '1000',
          addressCountry: 'BG',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+359876360518',
          email: 'office@bgfreak.com',
          contactType: 'customer service',
        },
        sameAs: ['https://www.facebook.com/www.bgfreak.com/', 'https://www.instagram.com/bgfreak/'],
      }),
    },
  ],
});
</script>

<template>
  <footer class="bg-gray-900 text-white order-last" itemscope itemtype="https://schema.org/Organization">
    <div class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Лява колона: Лого и описание -->
        <div class="lg:col-span-4">
          <div class="mb-6">
            <Logo />
          </div>
          <div class="text-gray-300 text-sm leading-relaxed">
            <p itemprop="description">
              Само при нас ще намериш 100% оригинални продукти от доказани в бранша марки. Ние ти даваме дискретна “стелт” доставка и гарантирани изродски
              постижения!
            </p>
          </div>
        </div>

        <!-- Дясна част: 4 колони с информация -->
        <div class="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Колона 1: Навигация -->
          <div>
            <h3 class="text-white font-semibold text-lg mb-4">Навигация</h3>
            <nav class="space-y-2" aria-label="Основни страници">
              <ul class="text-sm space-y-2">
                <li><NuxtLink to="/dostavka" class="text-gray-300 hover:text-white transition-colors">Доставка</NuxtLink></li>
                <li><NuxtLink to="/faqs" class="text-gray-300 hover:text-white transition-colors">FAQs</NuxtLink></li>
                <li><NuxtLink to="/price-match" class="text-gray-300 hover:text-white transition-colors">Price Match</NuxtLink></li>
              </ul>
            </nav>
          </div>

          <!-- Колона 2: Топ категории -->
          <div>
            <h3 class="text-white font-semibold text-lg mb-4">Топ категории</h3>
            <nav class="space-y-2" aria-label="Основни категории продукти">
              <ul class="text-sm space-y-2">
                <li><a href="/product-cat/анаболи" class="text-gray-300 hover:text-white transition-colors">Анаболи</a></li>
                <li><a href="/product-cat/секс-стимуланти" class="text-gray-300 hover:text-white transition-colors">Секс стимуланти</a></li>
                <li>
                  <a href="/product-cat/анаболи/инжекционни-форми-стероиди" class="text-gray-300 hover:text-white transition-colors">Инжекционни форми</a>
                </li>
                <li><a href="/product-cat/пептиди-peptides" class="text-gray-300 hover:text-white transition-colors">Пептиди</a></li>
                <li><a href="/product-cat/хормон-на-растежа-hgh" class="text-gray-300 hover:text-white transition-colors">Хормон на растежа (HGH)</a></li>
              </ul>
            </nav>
          </div>

          <!-- Колона 3: Контакти -->
          <div>
            <h3 class="text-white font-semibold text-lg mb-4">Контакти</h3>
            <p>Можете да се свържете с наш телефонен оператор от 10:00 до 17:00, от понеделник до петък на тел. (+359) 876 360 518</p>
            <br />
            <p>Можете да използвате и 24 часовия ни онлайн съпорт през иконката долу вляво на Вашия браузър.</p>
          </div>
        </div>
      </div>

      <!-- Долна част с копирайт -->
      <div class="border-t border-gray-700 pt-6 mt-12">
        <div class="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <div class="mb-4 md:mb-0">
            <p>© 2025 BgFreak. Всички права запазени.</p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="postcss">
a {
  @apply hover:underline;
}

/* Премахваме подчертаването за социалните иконки */
a[aria-label] {
  @apply hover:no-underline;
}
</style>
