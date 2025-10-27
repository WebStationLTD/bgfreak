# Стъпки за тестване и оправяне на VPS connection

## 1️⃣ Провери SSH достъпа (от твоя компютър)

Отвори Command Prompt или PowerShell и тествай:

```bash
ssh bgfreak@101.99.94.10
```

### Възможни резултати:

**A) Ако работи:**

- Ще те попита за парола
- Въведи паролата
- Ако влезеш успешно → SSH работи! Проблемът е друг.

**Б) Ако получиш "Connection refused":**

- SSH не работи на порт 22
- Провери дали използваш друг порт

**В) Ако получиш "Connection timeout":**

- Firewall блокира връзката
- Или IP адресът е грешен

---

## 2️⃣ Провери SSH порта

Опитай с различен порт (често е 2222 или 22022):

```bash
ssh -p 2222 bgfreak@101.99.94.10
```

---

## 3️⃣ Провери IP адреса на VPS

Възможно е IP адресът да е променен. Виж в control panel-а на хостинга какъв е точният IP.

---

## 4️⃣ Генерирай SSH ключ за GitHub Actions

След като потвърдиш, че SSH работи, направи това на VPS:

### На VPS (след като се логнеш):

```bash
# Генерирай SSH ключ
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_actions

# Добави публичния ключ към authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Покажи private key (ще го копираш)
cat ~/.ssh/github_actions
```

### В GitHub:

1. Отиди в Repository → Settings → Secrets and variables → Actions
2. Намери secret наречен `VPS_PASSWORD`
3. Или добави нов secret наречен `VPS_SSH_KEY`
4. Постави private key-я там

---

## 5️⃣ Обнови GitHub Actions workflow

След като имаш SSH key, ще обновя deploy.yml да използва ключ вместо парола.

---

## ⚠️ ВАЖНО: Провери първо стъпки 1-3!

Кажи ми какво получаваш и ще продължим оттам.
