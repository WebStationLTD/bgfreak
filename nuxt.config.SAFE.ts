export default defineNuxtConfig({
  extends: ["./woonuxt_base"],

  components: [{ path: "./components", pathPrefix: false }],

  modules: [
    "nuxt-graphql-client",
    "@nuxtjs/sitemap",
    "@nuxt/image",
    "@nuxtjs/critters", // ⚡ Critical CSS extraction - инлайнва само критичния CSS
  ],

  // Оптимизации за изображения
  image: {
    quality: 80,
    format: ["webp", "jpg"],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
    densities: [1, 2],
    presets: {
      product: {
        modifiers: {
          format: "webp",
          quality: 85,
          width: 280,
          height: 315,
        },
      },
    },
  },

  experimental: {
    payloadExtraction: true,
    inlineSSRStyles: false, // FALSE - @nuxtjs/critters се грижи за critical CSS extraction
    defaults: {
      nuxtLink: {
        // ⚡ SMART PREFETCH - Само при interaction (hover/focus) - НЕ viewport
        // Предотвратява агресивен prefetch който може да забавя навигацията
        prefetch: false, // ИЗКЛЮЧЕН viewport prefetch
        prefetchOn: {
          interaction: true, // ✅ ЗАПАЗЕН hover/focus prefetch
          visibility: false, // ❌ ИЗКЛЮЧЕН visibility prefetch
        },
      },
    },
  },

  // ⚡ CRITICAL CSS КОНФИГУРАЦИЯ - Елиминира render-blocking CSS (~150ms спестени)
  critters: {
    config: {
      preload: "swap", // Preload non-critical CSS асинхронно
      pruneSource: false, // Запазва оригиналния CSS файл за browser cache
      reduceInlineStyles: false, // false за да инлайнва повече critical CSS
      preloadFonts: true, // Preload критични шрифтове
      inlineFonts: true, // Инлайнва critical fonts като data URIs
      minimumExternalSize: 0, // Инлайнва всички малки CSS файлове
      compress: true, // Компресира инлайнвания CSS
      logLevel: "info", // За debugging
    },
  },

  // ✅ SSR активно за Node.js + ISR
  ssr: true,

  // ❌ ПРЕМАХНАТО: generate fallback (не ни трябва за Node.js app)
  // generate: {
  //   fallback: true,
  // },

  runtimeConfig: {
    public: {
      GQL_HOST: "https://admin.bgfreak.store/graphql",
      FRONT_END_URL: "https://bgfreak.store",
      PRODUCT_CATEGORY_PERMALINK: "/product-cat/",
      PRODUCT_TAG_PERMALINK: "/product-tag/",
      PRODUCT_BRAND_PERMALINK: "/marka-produkt/",
      PRODUCTS_PER_PAGE: 12,
      // ВРЕМЕННА конфигурация за тестване на атрибутите
      // TODO: Премахнете това след като конфигурирате woonuxt-settings плъгина в WordPress
      GLOBAL_PRODUCT_ATTRIBUTES: [
        {
          slug: "pa_brands", // Този работи!
          label: "Марка",
          showCount: false,
          openByDefault: false,
        },
        {
          slug: "pa_razmer", // Размер атрибут
          label: "Размер",
          showCount: false,
          openByDefault: false,
        },
      ],
    },
  },

  app: {
    head: {
      link: [
        // ⚡ Preconnect за GraphQL API (критично за performance)
        {
          rel: "preconnect",
          href: "https://admin.bgfreak.store",
          crossorigin: "",
        },
        { rel: "dns-prefetch", href: "https://admin.bgfreak.store" },
        // ⚡ FONT OPTIMIZATION - Preconnect за Google Fonts (спестява ~150ms)
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
          crossorigin: "",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        { rel: "dns-prefetch", href: "https://fonts.googleapis.com" },
        { rel: "dns-prefetch", href: "https://fonts.gstatic.com" },
        // ⚡ Preconnect за Google Analytics (оптимизация)
        {
          rel: "preconnect",
          href: "https://www.googletagmanager.com",
        },
        { rel: "dns-prefetch", href: "https://www.googletagmanager.com" },
      ],
      script: [
        // 📊 Google Analytics (gtag.js)
        {
          src: "https://www.googletagmanager.com/gtag/js?id=G-EMXSRFEJW9",
          async: true,
        },
        {
          children: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-EMXSRFEJW9');
          `,
          type: "text/javascript",
        },
      ],
    },
  },

  // ⚡ Global CSS за font optimization
  css: ["~/assets/css/fonts.css"],

  // 🌐 Site config - ИЗИСКВА СЕ за @nuxt/sitemap модула
  site: {
    url: "https://bgfreak.store",
    name: "BGFreak",
  },

  sitemap: {
    excludes: [
      "/checkout/order-received/**",
      "/order-summary/**",
      "/my-account/**",
      "/oauth/**",
    ],
    cacheTime: 1000 * 60 * 15,
    routes: [
      "/",
      "/magazin",
      "/categories",
      "/etiketi",
      "/marki",
      "/contact",
      "/wishlist",
    ],
  },

  "graphql-client": {
    clients: {
      default: {
        host: "https://admin.bgfreak.store/graphql",
        retainQuery: true,
        tokenStorage: {
          cookieOptions: {
            name: "authToken",
            maxAge: 60 * 60 * 24 * 7,
            sameSite: "None",
            secure: true,
          },
        },
        cacheOptions: {
          maxAge: 1000 * 60 * 2, // ⚡ 2 минути кеш (ISR се грижи за кеша)
        },
      },
    },
  },

  nitro: {
    // 🔥 КЛЮЧОВА ПРОМЯНА: Node.js server preset за Passenger
    preset: "node-server",

    prerender: {
      // ❌ НЕ crawl-ваме автоматично - ISR генерира on-demand
      crawlLinks: false,

      // ✅ САМО основни статични страници при build
      routes: [
        "/",
        "/magazin",
        "/categories",
        "/etiketi",
        "/marki",
        "/contact",
        "/blog",
      ],

      // ❌ ПРЕМАХНАТО: Няма нужда от много retry/concurrency за малко страници
      failOnError: false,
    },

    minify: true,
    compressPublicAssets: {
      brotli: true,
      gzip: true,
    },

    routeRules: {
      // ✅ Статични страници - cache forever при build
      "/": { prerender: true },
      "/magazin": { prerender: true },
      "/categories": { prerender: true },
      "/etiketi": { prerender: true },
      "/marki": { prerender: true },
      "/contact": { prerender: true },
      "/blog": { prerender: true },

      // 🔥 ПРОДУКТИ - ISR с 5 минути кеш (автоматично генериране)
      "/produkt/**": {
        swr: 300, // 5 минути stale-while-revalidate
        isr: true, // Incremental Static Regeneration
      },

      // 🔥 КАТЕГОРИИ - ISR с 10 минути кеш
      "/product-cat/**": {
        swr: 600, // 10 минути
        isr: true,
      },

      // 🔥 ТАГОВЕ - ISR с 10 минути кеш
      "/product-tag/**": {
        swr: 600,
        isr: true,
      },

      // 🔥 МАРКИ - ISR с 10 минути кеш
      "/marka-produkt/**": {
        swr: 600,
        isr: true,
      },

      // 🔥 БЛОГ ПОСТОВЕ - ISR с 10 минути кеш
      "/blog/**": {
        swr: 600,
        isr: true,
      },

      // 🔥 МАГАЗИН страници - ISR с 5 минути кеш
      "/magazin/**": {
        swr: 300,
        isr: true,
      },

      // Динамични страници - CSR (само клиентска страна)
      "/checkout/**": { ssr: false },
      "/cart": { ssr: false },
      "/my-account/**": { ssr: false },
      "/order-summary/**": { ssr: false },

      // Статични assets - дълъг кеш
      "/_nuxt/**": {
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      },
    },
  },

  // Оптимизации за build
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            "product-components": [
              "./woonuxt_base/app/components/productElements/ProductCard.vue",
              "./woonuxt_base/app/components/shopElements/ProductGrid.vue",
            ],
          },
        },
      },
    },
    esbuild: {
      // ⚡ Премахване на console.log в production за по-добър performance
      drop:
        process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
    },
  },

  compatibilityDate: "2025-05-03",

  // ❌ ПРЕМАХНАТО: hooks за SSG product routes
  // С ISR не ни трябва да генерираме всички продукти при build!
  // Те ще се генерират автоматично при първа заявка (on-demand)
});
