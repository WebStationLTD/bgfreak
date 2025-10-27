# 🚀 Ръководство за оправяне на VPS Deployment

## 📋 Текущо състояние

- ✅ Vercel deployment работи
- ❌ VPS deployment чрез GitHub Actions не работи
- ⚠️ Грешка: `connection refused` на порт 22

---

## 🔍 Диагностика (НАПРАВИ ТОВА ПЪРВО!)

### Стъпка 1: Тествай SSH връзката

Отвори **PowerShell** или **Command Prompt** и изпълни:

```powershell
ssh bgfreak@101.99.94.10
```

#### Какво може да се случи:

**✅ Вариант А: Работи**

```
Password:
```

→ Супер! SSH работи. Премини към **Решение 1**.

**❌ Вариант Б: Connection refused**

```
ssh: connect to host 101.99.94.10 port 22: Connection refused
```

→ SSH не е на порт 22. Премини към **Решение 2**.

**❌ Вариант В: Timeout**

```
ssh: connect to host 101.99.94.10 port 22: Connection timed out
```

→ Firewall блокира или IP е грешен. Премини към **Решение 3**.

**❌ Вариант Г: Host key verification failed**
→ Не е проблем, само натисни `yes`

---

## ✅ Решение 1: SSH работи - Настрой SSH ключ

### Стъпка 1.1: Логни се на VPS

```bash
ssh bgfreak@101.99.94.10
# Въведи паролата
```

### Стъпка 1.2: Генерирай SSH ключ за GitHub Actions

```bash
# Създай .ssh папка ако не съществува
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Генерирай нов SSH ключ
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions -N ""

# Добави публичния ключ към authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Покажи private key (ще го копираш за GitHub)
cat ~/.ssh/github_actions
```

**ВАЖНО:** Копирай ЦЕЛИЯ private key (включително `-----BEGIN` и `-----END` редовете)!

### Стъпка 1.3: Добави SSH key в GitHub Secrets

1. Отиди в GitHub Repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Натисни **New repository secret**
4. Създай следните secrets:

| Name           | Value                          |
| -------------- | ------------------------------ |
| `VPS_HOST`     | `101.99.94.10`                 |
| `VPS_USERNAME` | `bgfreak`                      |
| `VPS_SSH_KEY`  | _Private key-ят от стъпка 1.2_ |
| `VPS_PORT`     | `22`                           |

5. Изтрий стария `VPS_PASSWORD` secret (вече не ти трябва)

### Стъпка 1.4: Обнови GitHub Actions workflow

Използвай файла `.github/workflows/deploy-with-key.yml.example` като нов `deploy.yml`

---

## 🔧 Решение 2: SSH е на друг порт

Много хостинг провайдъри използват нестандартен SSH порт (2222, 22022, и т.н.)

### Стъпка 2.1: Намери правилния порт

Провери в:

- Control Panel на хостинга
- Welcome email от хостинга
- Документация на VPS провайдъра

Или опитай често използвани портове:

```bash
ssh -p 2222 bgfreak@101.99.94.10
ssh -p 22022 bgfreak@101.99.94.10
ssh -p 2022 bgfreak@101.99.94.10
```

### Стъпка 2.2: Обнови workflow

След като намериш порта, обнови GitHub Secret `VPS_PORT` с правилната стойност.

---

## 🌐 Решение 3: IP адресът е грешен или Firewall блокира

### Стъпка 3.1: Провери IP адреса

Логни се в control panel на VPS хостинга и виж какъв е точният IP адрес.

### Стъпка 3.2: Провери Firewall

Ако имаш достъп до VPS control panel:

1. Отиди в **Firewall Settings**
2. Провери дали порт 22 (или SSH порта) е отворен
3. Провери дали има IP whitelist (GitHub Actions използват динамични IP-та)

### Стъпка 3.3: GitHub Actions IP Range (Ако има firewall whitelist)

GitHub Actions използват динамични IP адреси. Има 2 варианта:

**Вариант A:** Позволи всички GitHub IP-та (виж https://api.github.com/meta)

**Вариант Б:** Използвай deploy през SSH tunnel или VPN

---

## 🎯 Алтернативни методи за deployment

### Метод 1: Ръчен Git Pull на VPS

Ако GitHub Actions не проработи, можеш да:

1. Логни се на VPS
2. Navigate към project папката:

```bash
cd /home/bgfreak/public_html
```

3. Pull промените:

```bash
git pull origin master
npm install
npm run generate
```

### Метод 2: FTP/SFTP Upload

Използвай FileZilla или друг FTP клиент:

1. Build локално: `npm run generate`
2. Upload папката `.output/public/` към `/home/bgfreak/public_html/`

### Метод 3: Deploy Hook от хостинг панела

Много хостинг провайдъри предлагат **Git Deploy Hooks**:

1. Отиди в cPanel/Plesk/Custom Panel
2. Намери "Git Version Control" или "Deploy Hooks"
3. Добави GitHub repo URL
4. Настрой автоматичен deploy при push

---

## 🔄 След оправянето

След като оправиш SSH връзката и обновиш workflow-а:

1. Commit и push промените
2. Отиди в GitHub → Actions tab
3. Виж дали workflow-ът минава успешно
4. Провери сайта на VPS дали е обновен

---

## 📞 Нужна ли ти е помощ?

Кажи ми:

1. Какво получи при тестване на SSH връзката (Вариант А, Б, В или Г)?
2. Имаш ли достъп до VPS control panel?
3. Какъв хостинг провайдър използваш?

И ще продължа със специфични инструкции за твоя случай! 🚀
