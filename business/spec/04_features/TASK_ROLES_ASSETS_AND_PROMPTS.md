# Ролі, Каталог Ассетів, Промпти для ШІ та Інтеграція Google OAuth

> **Призначення документа**:  
> 1. Декомпозиція та розподіл задач між **Junior Backend**, **Middle Backend** та **Middle Frontend** розробниками.  
> 2. Повний реєстр ассетів (UI іконки, 3D моделі, текстури, SFX/музика), необхідних для запуску гейміфікації CosmoLost.  
> 3. Готові промпти для генерації графіки та аудіо через нейромережі (**Midjourney v6 / FLUX.1**, **ElevenLabs SFX**, **Suno AI**).  
> 4. Повна наскрізна інструкція налаштування та підключення **Google OAuth 2.0 + JWT** (Google Console → Django Social Auth → React Client).

---

## 1. Матриця розподілу задач за грейдами

Команда розробки розбивається на чіткі зони відповідальності, щоб уникнути блокувань та конфліктів у репозиторії.

```
                    ┌────────────────────────────────────────────────────────┐
                    │            FEAT-10 / FEAT-11 Архітектура               │
                    └──────────────────────────┬─────────────────────────────┘
                                               │
             ┌─────────────────────────────────┼─────────────────────────────────┐
             ▼                                 ▼                                 ▼
   ┌───────────────────┐             ┌───────────────────┐             ┌───────────────────┐
   │  Junior Backend   │             │  Middle Backend   │             │  Middle Frontend  │
   │  (Data, CRUD,     │             │  (Real-Time, WS,  │             │  (FSD, Three.js,  │
   │   Admin, Tests)   │             │   Matchmaker, Pity│             │   Zustand, Arena) │
   └───────────────────┘             └───────────────────┘             └───────────────────┘
```

### 1.1 Junior Backend Developer

**Фокус**: Робота з даними, Django ORM, базова бізнес-логіка розрахунків, серіалізація та тестування.

| ID | Задача | Деталі | Залежності | Результат |
| :--- | :--- | :--- | :--- | :--- |
| **JB-01** | **Моделі бази даних `game`** | Створити застосунок `backend/game`, описати моделі `UserGameProfile`, `ContainerSlot`, `InventoryArtifact`, `GameMatch`, `MatchRound` відповідно до [`FEAT-11`](./FEAT-11_game_implementation_spec.md). Зробити міграції. | — | `backend/game/models.py`, міграція `0001_initial.py` |
| **JB-02** | **Seed-скрипт та симуляція артефактів** | Написати management command `python manage.py seed_game_artifacts`, яка перевіряє 118 артефактів у `backend/core` і призначає їм базові класи обладнання та тири рідкості. | JB-01 | `management/commands/seed_game_artifacts.py` |
| **JB-03** | **Django Unfold Admin інтерфейс** | Зареєструвати ігрові моделі в `game/admin.py` з фільтрами за ELO, тиром рідкості, статусом матчу, красивими бейджами Unfold. | JB-01 | Налаштований Django Admin для гейм-майстрів |
| **JB-04** | **DRF Serializers та базові CRUD Views** | Реалізувати `UserProfileSerializer`, `InventoryItemSerializer`, `ContainerSlotSerializer`, ендпоінти читання інвентарю та публічного профілю (`/api/web/game/profile/{callsign}/`). | JB-01 | Ендпоінти REST API з пермішенами |
| **JB-05** | **Сервіс розрахунку ELO (`EloService`)** | Написати чисті функції для розрахунку нового рейтингу гравця та бота за формулою FIDE: $R_{new} = R + K \cdot (S - E)$. Покрити unit-тестами. | — | `game/services/elo_service.py`, тести в `tests/test_elo.py` |
| **JB-06** | **Юніт-тести Pity та Лут-таблиць** | Перевірити, що після 60 послідовних дропів без Historic+ 61-ше відкриття гарантує Historic або вище; Anomaly guarantee на 500-му не входить до MVP без окремого sign-off. | MB-02 | `tests/test_loot_system.py` |

---

### 1.2 Middle Backend Developer

**Фокус**: Real-time сервіси, безпека, асинхронні черги, WebSocket протокол та інтеграція авторизації.

| ID | Задача | Деталі | Залежності | Результат |
| :--- | :--- | :--- | :--- | :--- |
| **MB-01** | **Google OAuth + JWT Pipeline** | Інтеграція `social-auth-app-django`, створення кастомного пайплайну `create_game_profile`, випуск JWT (access/refresh), генерація callsign гравця. | JB-01 | Працюючий OAuth флоу, створення профілю при першому вході |
| **MB-02** | **Сервіс генерації луту (`LootService`)** | Алгоритм видачі предметів з контейнера з динамічним шансом (Pity Counter), захист від дублікатів з конвертацією в Research Points (RP), нарахування щоденних скриньок. | JB-01 | `game/services/loot_service.py` |
| **MB-03** | **Zero-Knowledge генератор раундів** | Відбирати лише три MVP-режими з повним перевіреним payload: AstroGuessr (карта), ForensicSol, MissionHangar. Маскувати координати/відповіді; за нестачі даних не підміняти режим і не стартувати неповний матч. | JB-02 | `game/services/round_orchestrator.py` |
| **MB-04** | **WebSocket Consumer (`DuelConsumer`)** | Асинхронний споживач Django Channels: JWT-авторизація, таймери та серверний розрахунок. Не розкривати відповідь/оцінку опоненту після першого submit; round result — лише після submit/timeout обох. | JB-05, MB-03 | `backend/game/consumers.py`, `routing.py` |
| **MB-05** | **Matchmaking черга в Redis** | Логіка очікування суперника (до 8 секунд). Якщо суперник не знайдений — безшовне підключення `SpaceBot` з ELO, наближеним до рейтингу гравця. | MB-04 | Redis Matchmaker з fallback на бота |
| **MB-06** | **Налаштування Daphne, ASGI та каналів** | Оновлення `config/asgi.py`, інтеграція `channels_redis`, конфігурація для продакшн середовища з захистом від флуду та розривів зв'язку. | MB-04 | `backend/config/asgi.py` |

---

### 1.3 Middle Frontend Developer

**Фокус**: React 19, архітектура FSD v2.1, Three.js 3D сцени, інтерактивні міні-ігри, анімації та стан.

| ID | Задача | Деталі | Залежності | Результат |
| :--- | :--- | :--- | :--- | :--- |
| **MF-01** | **Скелет FSD v2.1 та WebSocket зв'язка** | Ініціалізація `web-client`, налаштування Vite, Biome, Chakra UI v3, шарів FSD. Створення єдиного WS клієнта `ws-client.ts` та Zustand-стору `useMatchStore`. | — | Робоча структура додатку, глобальний стан матчу |
| **MF-02** | **Google OAuth флоу на клієнті** | Сторінка входу, перенаправлення на Google, обробка callback URL, парсинг JWT токена, збереження у `useAuthStore` (localStorage/cookie), роутинг `RequireAuth`. | MB-01 | Робоча авторизація з автооновленням токенів |
| **MF-03** | **Контейнери та інвентар (UI/State)** | Віджет списку 10 контейнерних слотів з таймером накопичення (кожні 4 години), сітка інвентарю з кольоровим кодуванням рідкостей (7 тирів). | JB-04 | `entities/container`, `entities/inventory` |
| **MF-04** | **Міні-гра AstroGuessr** | Інтерактивна 2D карта NASA з піном; перевірене фото/панорама — необов'язкова підказка. Відправити `{lat, lon}` через WS; цільові координати приховані до блокування відповідей обох гравців. | MF-01, MB-04 | `features/astro-guessr` |
| **MF-05** | **Міні-гра ForensicSol** | Графіки телеметрії марсохода (Recharts: живлення, оптична глибина пилу, кут нахилу), вибір варіанту відповіді за 30 секунд. | MF-01, MB-04 | `features/forensic-sol` |
| **MF-06** | **Міні-гра MissionHangar** | Інтерфейс Drag-and-Drop (@dnd-kit) для розподілу бортових систем по 4 відсіках місії (Science, Propulsion, Comms, Power). | MF-01, MB-04 | `features/mission-hangar` |
| **MF-07** | **Віджет Арени (`BattleArena`)** | HUD бою: таймер раунду, рахунок гравця і суперника, плавне перемикання між 3 раундами, екран підсумків матчу та підрахунку ELO. | MF-04, MF-05, MF-06 | `widgets/battle-arena` |
| **MF-08** | **3D Планетарій («Планетарний тераріум»)** | Three.js сцена з глобусом Місяця/Марса, розстановка виграних 3D артефактів гравця за координатами, клік з плавним наближенням камери (`flyTo`). | JB-04 | `widgets/planetary-terrarium` |
| **MF-09** | **Анімація відкриття скриньки** | Ефект тряски контейнера, розпакування, спалах світла з кольором рідкості (Framer Motion), нарахування Research Points при дублікаті. | MB-02, MF-03 | `features/chest-opening` |

---

## 2. Каталог необхідних ассетів (Asset Register)

Всі ассети поділено на 4 категорії: Графічні UI-іконки, 3D/Текстури, Аудіо (SFX/Музика) та Ілюстрації.

### 2.1 UI Іконки (2D вектор / растр 512x512)

```
web-client/public/assets/icons/
├── containers/
│   ├── container_slot_locked.png       # Закритий слот, що очікує заряду
│   ├── container_standard.png          # Базовий титановий ящик місії
│   ├── container_scientific.png        # Науковий герметичний контейнер
│   ├── container_deep_space.png        # Контейнер глибокого космосу з золотими вставками
│   └── container_alien_anomaly.png     # Аномальний кристалічний контейнер
├── rarities/
│   ├── badge_scrap.svg                 # Сірий (#718096)
│   ├── badge_standard.svg              # Сріблястий (#E2E8F0)
│   ├── badge_specialized.svg           # Зелений смарагд (#38A169)
│   ├── badge_prototype.svg             # Синій кобальт (#3182CE)
│   ├── badge_autonomous.svg            # Фіолетовий аметист (#805AD5)
│   ├── badge_historic.svg              # Золотий янтар (#D69E2E)
│   └── badge_anomaly.svg               # Червоний пульсуючий (#E53E3E)
├── equipment/
│   ├── eq_power.svg                    # Сонячні панелі / РІТЕГ (RTG)
│   ├── eq_optics.svg                   # Камери / Спектрометри
│   ├── eq_chassis.svg                  # Шасі / Колеса / Посадкові опори
│   ├── eq_sensors.svg                  # Метеорологічні датчики / Магнітометри
│   ├── eq_comms.svg                    # High-Gain антени зв'язку з Землею
│   └── eq_manipulators.svg             # Роботизовані маніпулятори / Бури
└── currency/
    ├── rp_token_small.png              # Жетони дослідницьких даних (RP)
    └── elo_rank_cadet.svg              # Рангові емблеми гравців (Кадет, Дослідник, Куратор...)
```

### 2.2 3D Моделі та планетарні текстури

```
web-client/public/assets/3d/
├── planets/
│   ├── moon_diffuse_2k.jpg             # Текстура Місяця (LRO NASA Treks)
│   ├── moon_bump_2k.jpg                # Карта висот кратерів Місяця
│   ├── mars_diffuse_2k.jpg             # Текстура Марса (MRO Mars Treks)
│   └── mars_bump_2k.jpg                # Карта висот каньйонів і вулканів Марса
├── skybox/
│   └── milkyway_cubemap/               # Космічний фон (6 граней або HDRI панорама)
└── artifacts/
    ├── default_fallback_crate.glb      # Лоуполі ящик, якщо модель артефакту ще не готова
    ├── curiosity_mastcam.glb           # Оптимізована лоуполі модель (<2 MB, draco compression)
    ├── apollo_lunar_module.glb         # Лоуполі місячний модуль
    └── voyager_golden_record.glb       # Золота пластинка Вояджера
```

### 2.3 Звукові ефекти (Audio SFX)

| Файл | Опис | Тривалість | Призначення |
| :--- | :--- | :--- | :--- |
| `sfx_chest_click.mp3` | Механічне клацання гідравлічного замка | 0.4 сек | Натискання на контейнер |
| `sfx_chest_open_common.mp3` | Вихід стисненого газу та металевий звук | 1.2 сек | Відкриття Standard/Specialized |
| `sfx_chest_open_historic.mp3` | Глибокий низькочастотний гул + золотий передзвін | 2.5 сек | Відкриття Historic/Anomaly |
| `sfx_timer_tick.mp3` | Механічний сухий пульс таймера | 0.2 сек | Останні 5 секунд раунду |
| `sfx_answer_correct.mp3` | Гармонійний електронний аккорд успіху | 0.8 сек | Точна відповідь / близький пін |
| `sfx_answer_wrong.mp3` | Глухий низький сигнал помилки системи | 0.6 сек | Промах або вичерпаний час |
| `sfx_match_win.mp3` | Тріумфальна космічна фанфара з реверберацією | 3.0 сек | Перемога в дуелі |
| `sfx_match_defeat.mp3` | Згасаючий сигнал відключення телеметрії | 2.5 сек | Поразка в дуелі |
| `bgm_arena_ambient.mp3` | Мінімалістичний ембієнт: глибокий космос, радіоперешкоди | Looped | Фонова музика Арени |

---

## 3. Готові промпти для нейромереж

Використовуйте ці промпти для швидкої та стилістично узгодженої генерації графіки та звуків.

### 3.1 Генерація контейнерів (Midjourney v6 / FLUX.1)

#### 1. Стандартний дослідницький контейнер (Standard Container)
```text
/imagine prompt: Futuristic high-tech space storage container, titanium and white ceramic composite plating, sealed hermetic electronic locking latch, yellow hazard warning stripes, NASA mission stencil logo typography, subtle blue LED status indicator light, weathered surface with cosmic dust, hard surface industrial design, isolated on clean dark slate background, volumetric studio lighting, hyper-realistic, 8k, Unreal Engine 5 render style, photorealistic product photography --ar 1:1 --v 6.1 --style raw
```

#### 2. Контейнер глибокого космосу (Deep Space / Historic Container)
```text
/imagine prompt: Legendary orbital recovery capsule container, heat-shield ablative gold foil insulation wrapping, scorched atmospheric reentry marks, polished beryllium copper handles, engraved Apollo program insignia, glowing amber vacuum tube indicators, retro-futuristic aerospace technology, isolated on pure dark background, dramatic rim lighting, ray tracing reflections, cinematic 8k --ar 1:1 --v 6.1 --style raw
```

#### 3. Аномальний реліктовий ящик (Anomaly Artifact Crate)
```text
/imagine prompt: Mysterious extraterrestrial relic container, forged from dark iridescent meteoric obsidian metal, floating magnetic levitation seals, glowing crimson crystalline fractures with internal energy pulse, alien geometric engraved glyphs, cosmic micro-meteorite impact craters, menacing and awe-inspiring, studio product render, dark void background, volumetric red neon fog --ar 1:1 --v 6.1 --style raw
```

---

### 3.2 Генерація іконок рідкостей та обладнання

#### Іконки класів обладнання (Сет для векторної обробки)
```text
/imagine prompt: Minimalist sci-fi user interface icon set for space game, clean geometric vector style, flat isometric perspective, includes: solar panel array, high-gain parabolic antenna, rover robotic arm claw, multispectral optics sensor camera, radioisotope thermoelectric generator, monocolor crisp lines, glowing cyan accents on pure black background, UI UX asset sheet, SVG style, clean borders --ar 16:9 --v 6.1
```

#### Жетони валюти Research Points (RP)
```text
/imagine prompt: Holographic scientific research data token, translucent cyan and emerald glowing coin, embossed orbit diagram of Mars and Moon with trajectory vectors, floating futuristic credit chip, physical cryptocurrency of space explorers, glowing volumetric edge, isolated on obsidian background, octane render --ar 1:1 --v 6.1
```

---

### 3.3 Генерація звукових ефектів (ElevenLabs SFX / AudioCraft)

Для сервісу **ElevenLabs Sound Effects** вставляти такі текстові описи:

1. **Відкриття шлюзу скриньки**:
   > `Heavy spaceship pneumatic airlock release, high-pressure gas hiss followed by heavy metallic latch unlocking and mechanical gears clicking, clean sci-fi interior sound`
2. **Дзвін рідкісного артефакту (Historic/Anomaly Drop)**:
   > `Massive cinematic brass swell, sub bass drop boom, magical shimmering crystal sparkle chime, triumphant revelation moment, holy relic found`
3. **Пульс таймера останніх секунд**:
   > `Muffled tense sonar heartbeat beep, echoing countdown ping inside an Apollo spacecraft cockpit, increasing tension`
4. **Помилка відповіді / Збій зв'язку**:
   > `Deep digital error thud, analog telemetry distortion static crackle, signal loss tone, muted failure buzz`

---

### 3.4 Генерація ембієнт-треку (Suno AI v3.5)

**Style of Music**: `Cinematic Ambient, Dark Space Drone, Analogue Synthesizer, Vangelis blade runner style, Sub Bass, NASA Radio Chatter, Lo-fi, 70 BPM`

**Prompt**:
```text
[Instrumental]
[Atmospheric low drone hum of space station life support systems]
[Gentle analog synth pads floating through the silent void of Mars]
[Distant crackling radio transmission of astronaut telemetry]
[Subtle rhythmic electronic pulse building anticipation]
[Fading out into deep cosmic silence]
```

---

## 4. Google OAuth 2.0: Наскрізна інструкція підключення

### 4.1 Налаштування Google Cloud Console

1. Перейти в [Google Cloud Console](https://console.cloud.google.com/).
2. Створити проект: `CosmoLost Portal`.
3. У розділі **APIs & Services** → **OAuth consent screen**:
   - User Type: **External**.
   - App name: `CosmoLost`.
   - User support email: вказати email адміністратора.
   - Scopes: додати `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `openid`.
4. У розділі **Credentials** → **Create Credentials** → **OAuth client ID**:
   - Application type: **Web application**.
   - Name: `CosmoLost Web & Game Auth`.
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (локальний Vite dev server).
     - `http://localhost:8000` (локальний Django).
     - `https://cosmolost.org` (продакшн).
   - **Authorized redirect URIs**:
     - `http://localhost:8000/auth/complete/google-oauth2/` (бек-колбек social-auth).
     - `http://localhost:5173/auth/callback` (клієнтський роут для отримання токена).
5. Скопіювати **Client ID** та **Client Secret** у файли `.env`.

---

### 4.2 Бекенд: Збереження та видача JWT (`social-auth-app-django`)

Додати функцію у `backend/game/pipeline.py`, яка викликається автоматично після успішної перевірки Google:

```python
# backend/game/pipeline.py
import uuid
from users.models import User
from game.models import UserGameProfile
from rest_framework_simplejwt.tokens import RefreshToken

def create_game_profile(strategy, details, user=None, *args, **kwargs):
    """
    Автоматично створює UserGameProfile при першій реєстрації через Google OAuth.
    Генерує унікальний космічний позивний (Callsign), якщо його немає.
    """
    if not user:
        return

    profile, created = UserGameProfile.objects.get_or_create(
        user=user,
        defaults={
            'callsign': details.get('username') or f"Explorer_{uuid.uuid4().hex[:6].upper()}",
            'avatar_url': details.get('picture') or '',
            'elo': 1000,
            'container_slots': 10,
        }
    )
    return {'game_profile': profile}
```

Контролер фіналізації входу з видачею JWT токенів клієнту:

```python
# backend/game/views/auth_views.py
from django.shortcuts import redirect
from rest_framework_simplejwt.tokens import RefreshToken

def google_oauth_redirect_to_frontend(request):
    """
    Після того, як social_django завершив валідацію,
    генеруємо пару JWT (access + refresh) і редіректимо юзера на фронтенд.
    """
    user = request.user
    if not user.is_authenticated:
        return redirect('http://localhost:5173/login?error=auth_failed')

    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    # Редірект на фронтенд з токенами в hash або query параметрах
    frontend_url = f"http://localhost:5173/auth/callback?access={access_token}&refresh={refresh_token}"
    return redirect(frontend_url)
```

---

### 4.3 Фронтенд: Обробка та збереження JWT

#### 1. Кнопка входу (`features/auth/ui/GoogleLoginButton.tsx`)
```tsx
import { Button } from '@chakra-ui/react';

export function GoogleLoginButton() {
  const handleLogin = () => {
    // Редірект на бекенд ендпоінт social-django
    window.location.href = 'http://localhost:8000/auth/login/google-oauth2/';
  };

  return (
    <Button 
      colorPalette="blue" 
      variant="surface" 
      onClick={handleLogin}
      size="lg"
      width="100%"
    >
      Увійти через Google
    </Button>
  );
}
```

#### 2. Обробник редіректу (`features/auth/ui/OAuthCallback.tsx`)
```tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/entities/user';
import { Center, Spinner, Text, VStack } from '@chakra-ui/react';

export function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, setRefreshToken } = useAuthStore();

  useEffect(() => {
    const access = params.get('access');
    const refresh = params.get('refresh');

    if (access && refresh) {
      setToken(access);
      setRefreshToken(refresh);
      // Успішно увійшли — переходимо в ангар/на головну
      navigate('/', { replace: true });
    } else {
      console.error('OAuth callback missing tokens');
      navigate('/login?error=invalid_token', { replace: true });
    }
  }, [params, navigate, setToken, setRefreshToken]);

  return (
    <Center h="100vh">
      <VStack gap={4}>
        <Spinner size="xl" color="blue.500" />
        <Text fontSize="lg">Авторизація через NASA / CosmoLost Gateway...</Text>
      </VStack>
    </Center>
  );
}
```

---

## 5. Чек-листи готовності перед здачею у реліз

### 5.1 Чек-лист Junior Backend
- [ ] Моделі `game` створенні без циклических імпортів з `core` чи `users`.
- [ ] Seed-скрипт заповнює поля рідкостей та класів для всіх 118 артефактів.
- [ ] Django Unfold відображає списки матчів, профілів та інвентарю з пошуком за callsign.
- [ ] Всі тести розрахунку ELO проходять (`pytest game/tests/test_elo.py`).

### 5.2 Чек-лист Middle Backend
- [ ] Google OAuth успішно видає JWT та створює `UserGameProfile`.
- [ ] `DuelConsumer` відхиляє невалідні токени при підключенні до WS.
- [ ] Координати артефакту в `AstroGuessr` не надсилаються в браузер до завершення раунду (Zero-Knowledge).
- [ ] Matchmaker коректно підключає бота через 8 секунд очікування в черзі.
- [ ] Pity-лічильник гарантує Historic артефакт після 61 відкриття без нього.

### 5.3 Чек-лист Middle Frontend
- [ ] FSD структура витримана: жодних імпортів між слайсами одного шару.
- [ ] Biome перевіряє проект без єдиного ворнінгу (`pnpm check`).
- [ ] Відлік 30 секунд у міні-грі плавний і не фрізить інтерфейс при відкритті тривимірної сцени.
- [ ] Контейнерні слоти відображають живий таймер очікування наступного ящика.
- [ ] 3D Тераріум коректно позиціонує артефакти за latitude / longitude на глобусі.
