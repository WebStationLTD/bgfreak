# 🚀 BGFreak Deployment Guide - Node.js + Passenger

## 📋 Обобщение

BGFreak е Nuxt.js приложение деплой-нато на cPanel с **Phusion Passenger** и използва **ISR (Incremental Static Regeneration)** за оптимално performance.

## 🏗️ Архитектура

```
WordPress/WooCommerce (admin.bgfreak.store)
         ↓ GraphQL API
Node.js Nuxt App (bgfreak-app/)
         ↓ Passenger
Apache/NGINX → bgfreak.store
```

## 🔄 Deployment Процес

### 1️⃣ **Автоматичен Deploy (Препоръчително)**

Всеки push към `master` branch автоматично тригърва deploy:

```bash
git add .
git commit -m "Your changes"
git push origin master
```

GitHub Actions автоматично:
- ✅ Build-ва приложението (2-3 минути)
- ✅ Upload-ва към cPanel
- ✅ Инсталира dependencies
- ✅ Рестартира Passenger (zero-downtime)

### 2️⃣ **Ръчен Deploy (За първоначална настройка)**

#### Стъпка 1: Build локално

```bash
npm install
npm run build
```

#### Стъпка 2: Upload в cPanel

```
cPanel → File Manager
  → /home/bgfreak/bgfreak-app/
  → Upload .output/, package.json, package-lock.json
```

#### Стъпка 3: Инсталирай dependencies

```bash
ssh root@101.99.94.10 -p 20203
cd /home/bgfreak/bgfreak-app
npm install --production
```

#### Стъпка 4: Рестартирай Passenger

```bash
touch /home/bgfreak/tmp/restart.txt
```

## 🎯 ISR Кеш Конфигурация

| Route Type | Cache Time | Поведение |
|------------|-----------|-----------|
| `/produkt/**` | 5 минути | On-demand generation |
| `/product-cat/**` | 10 минути | On-demand generation |
| `/product-tag/**` | 10 минути | On-demand generation |
| `/marka-produkt/**` | 10 минути | On-demand generation |
| `/blog/**` | 10 минути | On-demand generation |
| Статични страници | Forever | Pre-rendered при build |

### Как работи ISR?

```
Първа заявка → Генерира HTML → Кешира → Връща резултат
     ↓
Втора заявка (< 5-10 мин) → Връща кеширан HTML (супер бързо!)
     ↓
След 5-10 мин → Регенерира на фона → Обновен HTML
```

## 🔧 cPanel Application Manager

### Конфигурация:

```
Application Name: BGFreak Store
Deployment Domain: bgfreak.store
Application Path: bgfreak-app
Application Startup File: .output/server/index.mjs
Deployment Environment: Production
```

### Environment Variables:

| Variable | Value |
|----------|-------|
| `GQL_HOST` | `https://admin.bgfreak.store/graphql` |
| `FRONT_END_URL` | `https://bgfreak.store` |
| `NODE_ENV` | `production` |
| `NITRO_HOST` | `0.0.0.0` |
| `NITRO_PORT` | `3000` |

## 📊 Performance Metrics

### Преди (SSG):
- ❌ Build: 93 минути
- ❌ Deploy: 93 минути
- ❌ Нов продукт: Чака 93 минути

### След (Node.js + ISR):
- ✅ Build: 2-3 минути
- ✅ Deploy: 3-5 минути
- ✅ Нов продукт: Мигновено! (ISR)
- ✅ Zero-downtime restarts

## 🔍 Troubleshooting

### Проверка на статус

```bash
# cPanel → Application Manager → View Status
# Трябва да е: ✅ Enabled (зелено)
```

### Проверка на logs

```bash
# cPanel → Application Manager → View Logs
# Или:
tail -f /home/bgfreak/bgfreak-app/logs/passenger.log
```

### Ръчен рестарт

```bash
touch /home/bgfreak/tmp/restart.txt
```

### Проверка дали работи

```bash
curl -I https://bgfreak.store/
# Очаквано: HTTP/2 200
```

## 📝 Важни команди

```bash
# Build локално
npm run build

# Preview локално (след build)
npm run preview

# Development mode
npm run dev

# Production dependencies only
npm ci --production
```

## 🚨 Важни забележки

1. **Никога не изтривайте `.output/` папката** на production без backup
2. **Passenger автоматично рестартира** при crash - не ви трябва PM2
3. **Zero-downtime deploys** - потребителите не виждат прекъсване
4. **ISR кешът е на сървъра** - супер бързо зареждане
5. **Scheduled deploy (03:00)** е опционален - ISR е достатъчен

## 📞 Support

За проблеми с deployment, проверете:
1. GitHub Actions logs: https://github.com/[your-repo]/actions
2. cPanel Application Manager logs
3. Passenger error logs

---

✅ **Deployment-ът е автоматичен! Просто push към master!** 🚀

