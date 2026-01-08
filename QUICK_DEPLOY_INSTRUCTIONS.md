# ⚡ БЪРЗИ ИНСТРУКЦИИ: Първоначален Deploy

## 🎯 Цел: От SSG (93 мин build) → Node.js + ISR (3 мин deploy)

---

## ✅ ЩЕ ТРЯБВА ДА НАПРАВИТЕ САМО ВЕДНЪЖ

### 1. Build локално (5 минути)

```bash
cd "d:\1-Projects\1-Clients SEO and WEBSITES\Github Projects\bgfreak"
npm install
npm run build
```

Проверка: Трябва да има `.output/` папка с `server/` и `public/`

### 2. Архивирайте файловете (2 минути)

Създайте `bgfreak-deploy.zip` с:
- `.output/` (цялата папка)
- `package.json`
- `package-lock.json`

### 3. Upload в cPanel (5 минути)

```
cPanel → File Manager
  
1. Отворете: /home/bgfreak/
2. Създайте папка: "bgfreak-app"
3. Влезте в bgfreak-app/
4. Upload bgfreak-deploy.zip
5. Extract архива
6. Изтрийте .zip файла
```

Резултат:
```
/home/bgfreak/bgfreak-app/
├── .output/
├── package.json
└── package-lock.json
```

### 4. Инсталирайте dependencies на сървъра (3 минути)

```
cPanel → Terminal

cd /home/bgfreak/bgfreak-app
npm install --production --no-optional
```

### 5. Register в Application Manager (5 минути)

```
cPanel → SOFTWARE → Application Manager → Register Application

┌─────────────────────────────────────────────┐
│ Application Name: BGFreak Store             │
│ Deployment Domain: bgfreak.store            │
│ Base Application URL: /                     │
│ Application Path: bgfreak-app               │
│ Application Startup File:                   │
│   .output/server/index.mjs                  │
│ Deployment Environment: Production          │
└─────────────────────────────────────────────┘
```

**Environment Variables** (Click "Add Variable"):

| Variable Name | Value |
|--------------|-------|
| `GQL_HOST` | `https://admin.bgfreak.store/graphql` |
| `FRONT_END_URL` | `https://bgfreak.store` |
| `NODE_ENV` | `production` |
| `NITRO_HOST` | `0.0.0.0` |
| `NITRO_PORT` | `3000` |

### 6. Deploy! (1 минута)

Click **"Deploy"** бутона.

Passenger ще:
- ✅ Стартира приложението
- ✅ Настрои reverse proxy
- ✅ Auto-restart при crash

---

## 🧪 ТЕСТВАНЕ (2 минути)

Отворете в браузър:

```
✅ https://bgfreak.store/
✅ https://bgfreak.store/magazin
✅ https://bgfreak.store/marki     ← Трябва да работи сега!
✅ https://bgfreak.store/contact   ← Трябва да работи сега!
✅ https://bgfreak.store/produkt/[някакъв-продукт]
```

Проверете статуса:
```
cPanel → Application Manager
  
Status трябва да е: ✅ Enabled (зелено)
```

---

## 🚀 АВТОМАТИЧЕН DEPLOY (ВЕДНЪЖ SETUP-НАТ)

### След първоначалния setup:

```bash
# Правите промени в кода локално
git add .
git commit -m "Промяна X"
git push origin master
```

**GitHub Actions автоматично ще deploy-не!**

Проследете прогреса:
```
GitHub → Repository → Actions tab
```

Deploy ще завърши за **3-5 минути** (вместо 93!)

---

## 📊 КАКВО СЕ ПРОМЕНЯ?

### Преди (SSG):
```
Push → GitHub Actions → 93 мин build → Deploy → 404 на /marki
```

### След (Node.js + ISR):
```
Push → GitHub Actions → 3 мин build → Deploy → Всичко работи!
```

### ISR Магията:
```
Нов продукт в WordPress → Посещение на URL → Генерира се веднага!
(не чака deploy)
```

---

## 🔄 ЕЖЕДНЕВНА РАБОТА

### Промяна на код:
```bash
git push origin master
# Автоматичен deploy за 3-5 мин
```

### Нов продукт в WordPress:
```
1. Добавете продукт в WooCommerce
2. Продуктът е достъпен ВЕДНАГА (ISR)
3. Не чака deploy!
```

### Ръчен рестарт (ако е нужен):
```bash
touch /home/bgfreak/tmp/restart.txt
```

---

## ❓ ЧЕСТО ЗАДАВАНИ ВЪПРОСИ

**Q: Трябва ли да качвам ръчно след първия път?**
A: НЕ! GitHub Actions автоматично deploy-ва.

**Q: Какво става при нов продукт?**
A: ISR автоматично го генерира при първа заявка (0 секунди).

**Q: Какво става при промяна на цена?**
A: След 5 минути кешът изтича и се обновява автоматично.

**Q: Има ли downtime при deploy?**
A: НЕ! Passenger прави zero-downtime restart.

**Q: Трябва ли да deploy-вам всяка нощ?**
A: НЕ! ISR е достатъчен. Scheduled deploy е опционален.

---

## ✅ ОБОБЩЕНИЕ

### Първи deploy: ~20 минути (веднъж)
- Build (5 мин)
- Upload (5 мин)  
- Setup cPanel (10 мин)

### След това: АВТОМАТИЧНО
- Push към GitHub = 3-5 мин deploy
- Нов продукт = 0 секунди (ISR)
- Промяна на цена = Auto refresh след 5 мин

---

🎉 **Готово! Сега имате супер бърз автоматичен deployment!** 🚀

