# 🚀 CosmoLost MCP Portal: Керівництво користувача, Дизайн сторінки та Інструкції з підключення

> **Ціль документа:** Специфікація інтерактивної веб-сторінки порталу CosmoLost (`/connect` або `/mcp`), яка пояснює протокол MCP настільки просто, щоб його міг підключити школяр або пенсіонер у 2 кліки без встановлення програм — використовуючи офіційні конектори **Google Gemini Web (`gemini.google.com/customize/connectors`)**, а також надає deep links для Cursor/Copilot/Claude та універсальний системний промпт.

---

## 📑 Зміст
1. [Концепція: "MCP для кожного" (Пояснення на пальцях)](#1-концепція-mcp-для-кожного-пояснення-на-пальцях)
2. [⭐ Google Gemini Web: Підключення в 2 кліки для звичайних людей](#2--google-gemini-web-підключення-в-2-кліки-для-звичайних-людей)
3. [💻 Специфікація компонента для фронтенд-розробника (Chakra UI v3 / React)](#3--специфікація-компонента-для-фронтенд-розробника-chakra-ui-v3--react)
4. [Deep Links та 1-Click Підключення для IDE (Cursor, Copilot, Claude)](#4-deep-links-та-1-click-підключення-для-ide-cursor-copilot-claude)
5. [Покрокові інструкції для інших агентів (Windsurf, Cline, Continue)](#5-покрокові-інструкції-для-інших-агентів)
6. [🌟 "Золотий" Системний Промпт для ШІ-агентів](#6--золотий-системний-промпт-для-ші-агентів)
7. [Приклади готових запитів (для школи, онуків та науки)](#7-приклади-готових-запитів-для-школи-онуків-та-науки)

---

## 1. Концепція: "MCP для кожного" (Пояснення на пальцях)

### 👵 Як пояснити дідусеві, бабусі або людині, далекій від комп'ютерів:
> «Уявіть, що ваш безкоштовний помічник **Google Gemini** у телефоні чи браузері — це розумний співрозмовник, але він не бачить справжніх космічних картотек.
> 
> **Конектор CosmoLost** — це як телефонна книга космічних апаратів, яку ви підключаєте за 30 секунд. Ви просто вставляєте одне посилання в налаштуваннях Gemini — і помічник одразу знає точні місця посадки "Аполлонів", чи цілі марсоходи, і показує їхні 3D-моделі!»

### 🧒 Як пояснити школяреві:
> «Робиш презентацію або реферат про космос? Звичайний ШІ часто вигадує неіснуючі факти.
> 
> Зайди в налаштування свого безкоштовного Gemini, натисни **"+ Інша"** і встав посилання CosmoLost. Тепер твій Gemini перетворюється на науковий суперкомп'ютер NASA: ти питаєш людською мовою, а він видає координати, скільки метрів проїхав марсохід за останній день, і посилання на 3D-моделі кратерів!»

---

## 2. ⭐ Google Gemini Web та інші безкоштовні Web-агенти (Підключення в 2 кліки)

Це **найпростіший та 100% безкоштовний** спосіб для будь-якої людини. Не потрібно нічого встановлювати, не потрібен термінал чи знання програмування.

### 🥇 1. Google Gemini Web (`gemini.google.com/customize/connectors`)
Найпопулярніший сервіс у світі з офіційною нативною підтримкою підключення сторонніх MCP-серверів:
1. Відкрийте браузер і перейдіть за адресою: **`https://gemini.google.com/customize/connectors`**
2. Натисніть кнопку **`+ Інша`** поруч із рядком пошуку (відкриється модальне вікно *"Підключитися до сервера MCP"*).
3. Вставте офіційне посилання:
   ```text
   https://api.cosmolost.space/mcp/sse
   ```
4. Натисніть кнопку **"Далі"**. Готово! Тепер у чаті Gemini можна просто запитувати будь-що про космос.

---

### 🥈 2. ChatMCP Web (`chatmcp.app` / браузерна версія)
Спеціалізований безкоштовний веб-чат для роботи з MCP-інструментами прямо у вкладці браузера:
1. Відкрийте сайт ChatMCP у браузері.
2. У полі **"MCP Server URL"** вставте `https://api.cosmolost.space/mcp/sse`.
3. Усі 10 інструментів CosmoLost завантажуються миттєво з інтерактивними картками та візуалізаціями.

---

### 🥉 3. LibreChat Web UI (`librechat.ai`)
Найпопулярніший відкритий веб-інтерфейс (аналог ChatGPT/Claude):
1. У бічному меню перейдіть у **Settings** ➔ **MCP Settings**.
2. Натисніть кнопку **`+` (Add Server)**.
3. Виберіть тип транспорту: **`SSE`** або **`Streamable HTTP`**.
4. Вставте адресу `https://api.cosmolost.space/mcp/sse`.
5. Працює з будь-якими моделями (GPT-4o, Claude 3.5 Sonnet, Gemini Pro)!

---

### 🏅 4. TypingMind Web (`typingmind.com`)
Популярний веб-клієнт штучного інтелекту, що працює 100% у браузері без серверного бекенду:
1. Зайдіть у **Settings** ➔ **Plugins / Model Context Protocol**.
2. Натисніть **Add Custom MCP Server**.
3. Вставте `https://api.cosmolost.space/mcp/sse`.

---

### 🎖️ 5. Open WebUI (`openwebui.com`)
Потужний веб-інтерфейс для AI:
1. Відкрийте **Admin / User Settings** ➔ **Integrations**.
2. У блоці **External ToolServers** натисніть **`+ Add Connection`**.
3. Виберіть тип: **`MCP (Streamable HTTP / SSE)`** та вставте URL `https://api.cosmolost.space/mcp/sse`.

### Як користуватися в чаті Gemini:
Після підключення відкрийте звичайний чат Gemini (`gemini.google.com`) і просто запитайте:
- *«Знайди через CosmoLost всі апарати на Місяці з масою понад 1000 кг»*
- *«Де розбився посадковий модуль Скіапареллі на Марсі? Покажи координати.»*
- *«Скільки метрів проїхав Perseverance за останні 30 солів?»*

Gemini автоматично викличе сервер CosmoLost, отримає дані з бази і дасть точну відповідь з джерелами!

---

## 3. 💻 Специфікація компонента для фронтенд-розробника (Chakra UI v3 / React)

Для розробників сайту CosmoLost (`web-client/src/widgets/mcp-connector`):

### Візуальний макет блоку на сайті:
```
┌────────────────────────────────────────────────────────────────────────┐
│ 🌟 ПІДКЛЮЧИ ДО GOOGLE GEMINI ЗА 30 СЕКУНД (БЕЗКОШТОВНО)                │
│ Працює прямо у вашому браузері на телефоні чи комп'ютері. Без програм. │
├────────────────────────────────────────────────────────────────────────┤
│ Крок 1: Отримайте посилання на сервер:                                 │
│ [ https://api.cosmolost.space/mcp/sse                      ] [📋 Копія]│
├────────────────────────────────────────────────────────────────────────┤
│ Крок 2: Відкрийте конектори у вашому акаунті Google:                  │
│ [ 🌐 Відкрити Google Gemini Connectors ↗ ]                             │
├────────────────────────────────────────────────────────────────────────┤
│ Крок 3: Натисніть кнопку "+ Інша", вставте посилання і тисніть "Далі". │
│ (Показуємо інтерактивне прев'ю вікна Gemini з підсвіченими полями)     │
└────────────────────────────────────────────────────────────────────────┘
```

### Код компонента React / Chakra UI v3:
```tsx
import React, { useState } from 'react';
import { Box, Button, Flex, Heading, Text, Input, HStack, Badge, Image } from '@chakra-ui/react';

export const GeminiConnectorWidget: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const mcpUrl = "https://api.cosmolost.space/mcp/sse";

  const handleCopy = () => {
    navigator.clipboard.writeText(mcpUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Box p={6} borderWidth="1px" borderRadius="2xl" bg="bg.panel" shadow="md">
      <HStack justify="space-between" mb={4}>
        <Heading size="md">🪐 Підключити CosmoLost до Google Gemini</Heading>
        <Badge colorPalette="green" variant="solid">Безкоштовно • 2 кліки</Badge>
      </HStack>

      <Text color="fg.muted" mb={6}>
        Найпростіший спосіб для школярів, студентів та допитливих дослідників. 
        Не вимагає встановлення програм чи знання коду.
      </Text>

      {/* Крок 1 */}
      <Box mb={4} p={4} bg="bg.subtle" borderRadius="xl">
        <Text fontWeight="semibold" mb={2}>Крок 1. Скопіюйте посилання на сервер:</Text>
        <Flex gap={2}>
          <Input value={mcpUrl} readOnly bg="bg" />
          <Button colorPalette="blue" onClick={handleCopy}>
            {copied ? '✅ Скопійовано!' : '📋 Скопіювати'}
          </Button>
        </Flex>
      </Box>

      {/* Крок 2 */}
      <Box mb={4} p={4} bg="bg.subtle" borderRadius="xl">
        <Text fontWeight="semibold" mb={2}>Крок 2. Відкрийте налаштування Gemini:</Text>
        <Button 
          as="a" 
          href="https://gemini.google.com/customize/connectors" 
          target="_blank" 
          rel="noopener noreferrer"
          colorPalette="teal"
          width="full"
        >
          🚀 Перейти до Конекторів Gemini ↗
        </Button>
      </Box>

      {/* Крок 3 */}
      <Box p={4} bg="bg.subtle" borderRadius="xl">
        <Text fontWeight="semibold" mb={1}>Крок 3. Натисніть кнопку "+ Інша":</Text>
        <Text fontSize="sm" color="fg.muted">
          У вікні <i>"Підключитися до сервера MCP"</i> вставте скопійовану адресу та натисніть <b>"Далі"</b>.
        </Text>
      </Box>
    </Box>
  );
};
```

---

## 4. Deep Links та 1-Click Підключення для IDE (Cursor, Copilot, Claude)

Якщо користувач — розробник, інженер чи аналітик:

### 1. Cursor IDE (Deep Link в 1 клік):
```text
cursor://anysphere.cursor-mcp/install?name=cosmolost&transport=sse&url=https%3A%2F%2Fapi.cosmolost.space%2Fmcp%2Fsse
```
При натисканні браузер запитує дозвіл відкрити Cursor, і сервер додається без редагування файлів.

### 2. VS Code / GitHub Copilot:
Файл `.vscode/mcp.json` у проєкті:
```json
{
  "mcpServers": {
    "cosmolost": {
      "command": "uv",
      "args": ["run", "python", "-m", "mcp.server"],
      "env": {
        "PYTHONPATH": "backend",
        "DJANGO_SETTINGS_MODULE": "config.settings"
      }
    }
  }
}
```

### 3. Claude Desktop (Anthropic):
Кнопка на сайті генерує файл `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "cosmolost": {
      "command": "uv",
      "args": ["run", "python", "-m", "mcp.server"]
    }
  }
}
```

---

## 5. Покрокові інструкції для інших агентів

- **Windsurf Editor (Codeium):** Додається в `~/.codeium/windsurf/mcp_config.json`.
- **Cline (VS Code Extension):** Додається через панель MCP з прапорцем `autoApprove` для безпечних операцій пошуку.
- **Continue.dev:** Додається в `.continue/config.json`.
- **ChatGPT (OpenAI Custom GPTs):** Налаштовується як Custom Action з OpenAPI-специфікацією або через SSE-проксі.

---

## 6. 🌟 "Золотий" Системний Промпт для ШІ-агентів

> **Вставте цей текст у Custom Instructions будь-якого чат-бота:**

```markdown
Ти — провідний космічний навігатор та архівіст платформи CosmoLost.
Тобі підключено офіційний MCP-сервер CosmoLost з 10 інструментами:
search_artifacts, get_artifact_details, get_mission_manifest, get_last_sol_chronology,
get_science_discoveries, get_verified_citations, get_3d_and_media_assets, 
list_active_passive_artifacts, list_celestial_bodies, list_missions.

ПРАВИЛА РОБОТИ:
1. НІКОЛИ НЕ ВИГАДУЙ координати, масу або дати. Спочатку викликай search_artifacts або get_artifact_details.
2. МАРСІАНСЬКИЙ ЧАС: Пояснюй значення Sol (доба на Марсі ~24г 39хв) і додавай земну дату.
3. 3D ТА ФОТО: Завжди надавай посилання на 3D-моделі (.glb), якщо вони є в get_3d_and_media_assets.
4. ДЛЯ ВСІХ: Школярам пояснюй захопливо і просто, науковцям надавай DOI через get_verified_citations.
```

---

## 7. Приклади готових запитів (для школи, онуків та науки)

1. **Для шкільного уроку астрономії:**
   - *«Розкажи про апарат Луноход-1: коли він сів, де зупинився і скільки кілометрів проїхав?»*
2. **Для сімейної бесіди про космос:**
   - *«Які речі люди залишили на Місяці після місій Аполлон? Чи є там пам'ятні знаки чи прапори?»*
3. **Для точних розрахунків:**
   - *«Виведи координати всіх розбитих апаратів на Марсі для посадкової траєкторії.»*
