# TASK_FE — Frontend Developer: Ігровий модуль CosmoLost
**Версія**: 1.0.0 · **Дата**: 2026-11-15  
**Залежить від**: `TASK_BE_game_backend.md`, `FEAT-11_game_implementation_spec.md`  
**Гілка**: `feature/game-frontend`  
**Технології**: React 19 · Vite 6 · pnpm · FSD v2.1 · Chakra UI v3 · Zustand · TanStack Query v5 · Three.js r165 · Biome

---

## Загальні правила

| Правило | Значення |
|---------|----------|
| Архітектура | FSD v2.1 (app → pages → widgets → features → entities → shared) |
| Стилі | Chakra UI v3 виключно, NO Tailwind |
| Лінтер | Biome: `'` у JS/TS, `"` у JSX, крапка з комою, 2 пробіли |
| API calls | Тільки через Repository (`entities/<slice>/api/<slice>-repository.ts`) |
| State | Zustand для глобального, TanStack Query для серверних даних |
| WS | Єдиний клієнт `shared/api/ws-client.ts`, підключається один раз |
| Тести | Vitest + Testing Library, мінімум: кожен store + кожен міні-ігровий hook |

---

## FE-01 — Scaffolding: web-client

**Директорія**: `web-client/`

### 1.1 Ініціалізація

```bash
pnpm create vite@latest web-client --template react-ts
cd web-client
pnpm install
```

### 1.2 Залежності

```bash
# Core UI
pnpm add @chakra-ui/react @emotion/react

# State
pnpm add zustand @tanstack/react-query

# Routing
pnpm add react-router-dom

# 3D / Canvas
pnpm add three @types/three
pnpm add photo-sphere-viewer   # для AstroGuessr панорами

# DnD
pnpm add @dnd-kit/core @dnd-kit/sortable

# Charts (MissionForensicSol)
pnpm add recharts

# Анімації
pnpm add framer-motion

# Dev tools
pnpm add -D @biomejs/biome vite @vitejs/plugin-react vitest @testing-library/react @testing-library/jest-dom
```

### 1.3 FSD структура директорій

```
web-client/src/
├── app/
│   ├── providers/           # ChakraProvider, QueryClientProvider, RouterProvider
│   ├── router.tsx
│   └── main.tsx
├── pages/
│   ├── home/
│   ├── arena/
│   ├── profile/
│   └── leaderboards/
├── widgets/
│   ├── battle-arena/
│   ├── curator-showcase/
│   └── planetary-terrarium/
├── features/
│   ├── auth/
│   ├── matchmaking/
│   ├── astro-guessr/
│   ├── forensic-sol/
│   ├── mission-hangar/
│   ├── shadow-projector/
│   ├── scale-matcher/
│   ├── traverse-tracer/
│   ├── component-dissect/
│   ├── stat-guesser/
│   ├── mission-stack/
│   └── chest-opening/
├── entities/
│   ├── user/
│   ├── game/
│   ├── container/
│   └── inventory/
└── shared/
    ├── api/
    │   ├── http-client.ts
    │   └── ws-client.ts
    ├── config/
    │   └── env.ts
    ├── lib/
    │   ├── hooks/
    │   └── utils/
    └── ui/
        ├── RarityBadge.tsx
        ├── CountdownTimer.tsx
        └── LoadingSpinner.tsx
```

### 1.4 Конфіг

**`vite.config.ts`**:
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
      '/ws': { target: 'ws://localhost:8000', ws: true },
    },
  },
});
```

**`biome.json`** (корінь web-client):
```json
{
  "formatter": { "indentStyle": "space", "indentWidth": 2 },
  "javascript": {
    "formatter": { "quoteStyle": "single", "semicolons": "always" }
  },
  "linter": { "rules": { "correctness": { "noUnusedVariables": "error" } } }
}
```

---

## FE-02 — Google OAuth & Auth Flow

**Шар**: `features/auth/`, `entities/user/`

### 2.1 Флоу входу

```
User → GET /auth/login/google-oauth2/   (Django redirect)
     → Google consent screen
     → GET /auth/complete/google-oauth2/ (Django callback)
     → Django видає JWT → redirect до /auth/callback?token=<JWT>
     → React зберігає JWT → redirect до /
```

> **Примітка для бекенду**: Redirect URL після OAuth має містити `?token=<access_jwt>&refresh=<refresh_jwt>` — уточнити з BE.

### 2.2 Файли

**`entities/user/api/user-repository.ts`**
```ts
import { httpClient } from '@/shared/api/http-client';

export interface UserProfile {
  id: number;
  callsign: string;
  avatar_url: string | null;
  elo: number;
  rp_balance: number;
  container_slots: number;
  win_streak: number;
}

export const userRepository = {
  getMe: () => httpClient.get<UserProfile>('/api/web/game/profile/me/'),
  getProfile: (callsign: string) =>
    httpClient.get<UserProfile>(`/api/web/game/profile/${callsign}/`),
};
```

**`entities/user/model/useAuthStore.ts`**
```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: { id: number; callsign: string; elo: number } | null;
  setToken: (token: string) => void;
  setUser: (user: AuthState['user']) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'cosmo-auth' },
  ),
);
```

**`features/auth/ui/OAuthCallback.tsx`**
```tsx
// Парсить ?token= з URL, зберігає в store, перенаправляє на /
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/entities/user';

export function OAuthCallback() {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setToken(token);
      navigate('/');
    } else {
      navigate('/login?error=oauth_failed');
    }
  }, [navigate, setToken]);

  return <p>Авторизація...</p>;
}
```

**`app/router.tsx`** — маршрути:
```tsx
<Route path="/auth/callback" element={<OAuthCallback />} />
<Route path="/login" element={<LoginPage />} />
<Route element={<RequireAuth />}>
  <Route path="/" element={<HomePage />} />
  <Route path="/arena" element={<ArenaPage />} />
  <Route path="/profile/:callsign" element={<ProfilePage />} />
  <Route path="/leaderboards" element={<LeaderboardsPage />} />
</Route>
```

**`shared/api/http-client.ts`**
```ts
import { useAuthStore } from '@/entities/user';

const BASE = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().token;
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export const httpClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
};
```

### 2.3 Public API (`entities/user/index.ts`)
```ts
export { useAuthStore } from './model/useAuthStore';
export { userRepository } from './api/user-repository';
export type { UserProfile } from './api/user-repository';
```

---

## FE-03 — entities/game: WS State Machine

**Шар**: `entities/game/`

### 3.1 WS клієнт (`shared/api/ws-client.ts`)

```ts
// Singleton WebSocket manager
let socket: WebSocket | null = null;
const listeners = new Map<string, Set<(data: unknown) => void>>();

export const wsClient = {
  connect(token: string) {
    if (socket?.readyState === WebSocket.OPEN) return;
    socket = new WebSocket(`ws://${location.host}/ws/game/?token=${token}`);
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data as string) as { type: string; payload: unknown };
      listeners.get(msg.type)?.forEach((cb) => cb(msg.payload));
    };
  },
  send(type: string, payload: unknown) {
    socket?.send(JSON.stringify({ type, payload }));
  },
  on(type: string, cb: (data: unknown) => void) {
    if (!listeners.has(type)) listeners.set(type, new Set());
    listeners.get(type)!.add(cb);
    return () => listeners.get(type)!.delete(cb);
  },
  disconnect() {
    socket?.close();
    socket = null;
  },
};
```

### 3.2 Match Store (`entities/game/model/useMatchStore.ts`)

```ts
import { create } from 'zustand';

export type MatchPhase =
  | 'IDLE'
  | 'SEARCHING'
  | 'IN_MATCH'
  | 'ROUND_ACTIVE'
  | 'ROUND_RESULT'
  | 'MATCH_END';

export interface RoundData {
  round_num: number;
  mini_game: string;        // 'astro_guessr' | 'forensic_sol' | ...
  artifact_id: number;
  artifact_name: string;
  time_limit_sec: number;
  payload: Record<string, unknown>; // дані міні-гри (без правильної відповіді!)
}

export interface MatchState {
  phase: MatchPhase;
  match_id: string | null;
  opponent: { callsign: string; elo: number; is_bot: boolean } | null;
  my_score: number;
  opponent_score: number;
  current_round: RoundData | null;
  round_timer_sec: number;
  chest_earned: boolean;

  setPhase: (p: MatchPhase) => void;
  setMatchData: (match_id: string, opponent: MatchState['opponent']) => void;
  setRound: (round: RoundData, timer: number) => void;
  tickTimer: () => void;
  updateScores: (my: number, opp: number) => void;
  endMatch: (chest_earned: boolean) => void;
  reset: () => void;
}

export const useMatchStore = create<MatchState>((set) => ({
  phase: 'IDLE',
  match_id: null,
  opponent: null,
  my_score: 0,
  opponent_score: 0,
  current_round: null,
  round_timer_sec: 0,
  chest_earned: false,

  setPhase: (phase) => set({ phase }),
  setMatchData: (match_id, opponent) => set({ match_id, opponent }),
  setRound: (round, timer) =>
    set({ current_round: round, round_timer_sec: timer, phase: 'ROUND_ACTIVE' }),
  tickTimer: () =>
    set((s) => ({ round_timer_sec: Math.max(0, s.round_timer_sec - 1) })),
  updateScores: (my_score, opponent_score) => set({ my_score, opponent_score }),
  endMatch: (chest_earned) => set({ phase: 'MATCH_END', chest_earned }),
  reset: () =>
    set({
      phase: 'IDLE', match_id: null, opponent: null,
      my_score: 0, opponent_score: 0, current_round: null,
      round_timer_sec: 0, chest_earned: false,
    }),
}));
```

### 3.3 WS Event Mapper Hook (`entities/game/model/useGameEvents.ts`)

Підключає WS події до стору:

```ts
// WS event → store action mapping
// match.found     → setMatchData + setPhase('IN_MATCH')
// round.start     → setRound
// round.result    → updateScores + setPhase('ROUND_RESULT')
// match.end       → endMatch
```

### 3.4 Public API (`entities/game/index.ts`)
```ts
export { useMatchStore } from './model/useMatchStore';
export { useGameEvents } from './model/useGameEvents';
export type { MatchPhase, RoundData, MatchState } from './model/useMatchStore';
```

---

## FE-04 — entities/container: Слоти контейнерів

**Шар**: `entities/container/`

### 4.1 Модель

```ts
// entities/container/model/useContainerStore.ts
interface ContainerSlot {
  slot_index: number;    // 0–9
  filled_at: string;     // ISO timestamp
  is_opened: boolean;
}

interface ContainerState {
  slots: ContainerSlot[];
  next_fill_at: string | null;  // коли заповниться наступний слот
  fetchSlots: () => Promise<void>;
  openContainer: (slot_index: number) => Promise<LootResult>;
}
```

### 4.2 Repository

```ts
// entities/container/api/container-repository.ts
export const containerRepository = {
  getSlots: () => httpClient.get<ContainerSlot[]>('/api/web/game/containers/'),
  openSlot: (slot_index: number) =>
    httpClient.post<LootResult>('/api/web/game/containers/open/', { slot_index }),
  claimDaily: () => httpClient.post<{ ok: boolean }>('/api/web/game/containers/daily/', {}),
};
```

### 4.3 UI (`entities/container/ui/ContainerSlot.tsx`)

- Компонент: кнопка/карточка слоту
- Якщо `is_opened`: напівпрозора (сірий)
- Якщо `filled_at` ≤ now: активний (золотий glow)
- Якщо ще не наповнений: countdown до `next_fill_at`
- Props: `slot: ContainerSlot`, `onOpen: () => void`

### 4.4 Public API (`entities/container/index.ts`)
```ts
export { useContainerStore } from './model/useContainerStore';
export { ContainerSlot } from './ui/ContainerSlot';
export type { ContainerSlot as ContainerSlotData } from './model/useContainerStore';
```

---

## FE-05 — entities/inventory: Артефакти & Рідкості

**Шар**: `entities/inventory/`

### 5.1 Кольори рідкостей

| Rarity | Hex | Chakra token |
|--------|-----|--------------|
| SCRAP | `#718096` | `gray.500` |
| STANDARD | `#E2E8F0` | `gray.200` |
| SPECIALIZED | `#38A169` | `green.500` |
| PROTOTYPE | `#3182CE` | `blue.500` |
| AUTONOMOUS | `#805AD5` | `purple.500` |
| HISTORIC | `#D69E2E` | `yellow.500` |
| ANOMALY | `#E53E3E` | `red.500` |

### 5.2 Файли

**`entities/inventory/api/inventory-repository.ts`**
```ts
export const inventoryRepository = {
  getInventory: () => httpClient.get<InventoryItem[]>('/api/web/game/inventory/'),
  getPublicInventory: (callsign: string) =>
    httpClient.get<InventoryItem[]>(`/api/web/game/inventory/${callsign}/`),
  scrapItem: (item_id: number) =>
    httpClient.post<{ rp_gained: number }>('/api/web/game/inventory/scrap/', { item_id }),
};
```

**`entities/inventory/ui/ItemCard.tsx`**
- Відображає артефакт з кольором рідкості
- Props: `item: InventoryItem`, `onClick?: () => void`
- Використовує `RarityBadge` із shared/ui

**`shared/ui/RarityBadge.tsx`**
```tsx
const RARITY_COLORS: Record<string, string> = {
  SCRAP: 'gray.500',
  STANDARD: 'gray.200',
  SPECIALIZED: 'green.500',
  PROTOTYPE: 'blue.500',
  AUTONOMOUS: 'purple.500',
  HISTORIC: 'yellow.500',
  ANOMALY: 'red.500',
};

export function RarityBadge({ rarity }: { rarity: string }) {
  return <Badge colorPalette={RARITY_COLORS[rarity] ?? 'gray'}>{rarity}</Badge>;
}
```

---

## FE-06 — features/matchmaking: Пошук матчу

**Шар**: `features/matchmaking/`

### 6.1 Флоу

```
User click "PLAY" → POST /api/web/game/matchmaking/join/
                  → phase = 'SEARCHING'
                  → WS: match.found (≤8s) OR bot.assigned (fallback)
                  → phase = 'IN_MATCH'
```

### 6.2 `MatchmakingModal.tsx`

- **Анімація**: пульсуючий круг (Framer Motion `animate={{ scale: [1, 1.2, 1] }}`)
- **Таймер**: відображає 0–8s очікування
- **Fallback**: якщо bot.assigned → "Суперник не знайдений. Підключаємо бота (ELO ~{botElo})"
- **Cancel**: кнопка `Скасувати` → DELETE `/api/web/game/matchmaking/leave/`
- Закривається автоматично при `phase === 'IN_MATCH'`

### 6.3 Public API (`features/matchmaking/index.ts`)
```ts
export { MatchmakingModal } from './ui/MatchmakingModal';
export { useMatchmaking } from './model/useMatchmaking';
```

---

## FE-07 — Міні-ігри (MVP: 3 шт.)

> Всі міні-ігри:
> - Отримують дані через `current_round.payload` зі стору
> - Надсилають відповідь через `wsClient.send('round.answer', { answer })`
> - НЕ знають правильної відповіді (Zero-Knowledge)
> - Мають `disabled` стан після відправки відповіді

---

### 7.1 AstroGuessr (Знайди координати)

**Директорія**: `features/astro-guessr/`

**Завдання**: По панорамній фото (або звичайній фото місцевості) гравець ставить пін на міні-карті — здогадується, де на планеті знаходиться артефакт.

**Дані в `payload`**:
```json
{
  "photo_url": "https://nasa.gov/...",
  "photo_type": "PANORAMA | SURFACE_PHOTO",
  "planet": "MOON | MARS",
  "hint": "Місія Curiosity, 2023"
}
```

**Компоненти**:

| Файл | Опис |
|------|------|
| `ui/AstroGuessr.tsx` | Головний контейнер |
| `ui/PanoViewer.tsx` | `<canvas>` через Photo-Sphere-Viewer (якщо PANORAMA) або `<img>` |
| `ui/MiniMap.tsx` | SVG карта (Moon / Mars) з можливістю кліку для постановки піна |
| `model/useAstroGuessr.ts` | Стан `{pin: {lat,lon} | null}`, `submit()` |

**MiniMap**: SVG зображення поверхні (Moon / Mars) масштабом екватор→полюс. Клік → конвертувати pixel coords → (lat, lon). Відображає пін та кнопку Submit.

**Submit payload**: `{ lat: number, lon: number }` — координати піна гравця.

**Scoring**: Бекенд отримує координати, рахує відстань до реального `artifact.latitude/longitude` (Haversine), повертає бали (0–1000) обернено пропорційно відстані.

---

### 7.2 ForensicSol (Детектив по даним)

**Директорія**: `features/forensic-sol/`

**Завдання**: По графіку телеметрії (потужність, пил, нахил) і набору характеристик — ідентифікувати місію або sol події.

**Дані в `payload`**:
```json
{
  "telemetry": [
    { "sol": 1, "power_wh": 540, "dust_tau": 0.3, "tilt_deg": 2.1 },
    ...
  ],
  "question": "Яка місія залишила цей слід?",
  "options": ["Curiosity", "Opportunity", "Spirit", "Perseverance"]
}
```

**Компоненти**:

| Файл | Опис |
|------|------|
| `ui/ForensicSol.tsx` | Головний контейнер |
| `ui/TelemetryChart.tsx` | Recharts `LineChart` з 3 лініями (power_wh, dust_tau×100, tilt_deg×10) |
| `ui/AnswerOptions.tsx` | RadioGroup з 4 варіантами (Chakra UI) |
| `model/useForensicSol.ts` | Стан `{selected: string | null}`, `submit()` |

**Submit payload**: `{ answer: string }` — обраний варіант.

---

### 7.3 MissionHangar (Збери місію)

**Директорія**: `features/mission-hangar/`

**Завдання**: DnD — розподілити компоненти місії по 4 категоріях (наука, посадка, зв'язок, живлення).

**Дані в `payload`**:
```json
{
  "components": [
    { "id": "rtg", "name": "RTG", "icon": "⚛️" },
    { "id": "mast_cam", "name": "MastCam", "icon": "📷" },
    ...
  ],
  "categories": ["Science", "Propulsion", "Communication", "Power"]
}
```

**Компоненти**:

| Файл | Опис |
|------|------|
| `ui/MissionHangar.tsx` | Головний контейнер |
| `ui/ComponentCard.tsx` | Draggable картка компонента (@dnd-kit) |
| `ui/CategoryZone.tsx` | Droppable зона категорії |
| `model/useMissionHangar.ts` | Стан `{grouping: Record<string, string[]>}`, `submit()` |

**Submit payload**: `{ grouping: { "Science": ["mast_cam"], "Power": ["rtg"], ... } }`

---

## FE-08 — widgets/battle-arena: Арена

**Директорія**: `widgets/battle-arena/`

**BattleArena.tsx** — оркестратор матчу:

```
┌─────────────────────────────────────┐
│  Callsign (ELO)    VS   Bot/User    │  ← HUD з рахунком
│  Round 2/3    ⏱ 00:45              │  ← таймер + раунд
├─────────────────────────────────────┤
│                                     │
│       [Active Mini-Game]            │  ← динамічно рендериться
│                                     │
└─────────────────────────────────────┘
```

### 8.1 Компоненти

| Файл | Опис |
|------|------|
| `ui/BattleArena.tsx` | Головний layout |
| `ui/ScoreHUD.tsx` | Рахунок, ELO обох, раунд |
| `ui/RoundTimer.tsx` | `useEffect` → `setInterval(1s)` → `useMatchStore.tickTimer()` |
| `ui/MiniGameRenderer.tsx` | `switch(current_round.mini_game)` → рендерить відповідний feature |
| `ui/OpponentProgress.tsx` | Анімований прогрес-бар опонента (fake delay 1-3s від бекенду) |
| `ui/RoundResultOverlay.tsx` | Оверлей між раундами: правильна відповідь + бали + Delta ELO |

### 8.2 MiniGameRenderer mapping

```tsx
const MINI_GAME_MAP: Record<string, React.ComponentType> = {
  astro_guessr: AstroGuessr,
  forensic_sol: ForensicSol,
  mission_hangar: MissionHangar,
  shadow_projector: ShadowProjector,
  scale_matcher: ScaleMatcher,
  traverse_tracer: TraverseTracer,
  component_dissect: ComponentDissect,
  stat_guesser: StatGuesser,
  mission_stack: MissionStack,
};
```

### 8.3 Public API (`widgets/battle-arena/index.ts`)
```ts
export { BattleArena } from './ui/BattleArena';
```

---

## FE-09 — features/chest-opening: Відкриття контейнера

**Директорія**: `features/chest-opening/`

### 9.1 Флоу

```
Match End (chest_earned: true) → ChestOpeningModal з'являється
User натискає "Відкрити" → POST /api/web/game/containers/open/
                         → response: { item: InventoryItem, rp_gained: number }
                         → Reveal Animation → Показ артефакту + Rarity
```

### 9.2 Анімація

- Framer Motion: скриньку "трясе" (shake), потім "відчиняється" (scale + opacity)
- Reveal card з'являється знизу вгору з кольором рідкості (glow box-shadow)
- Toast повідомлення: `+{rp_gained} RP` (якщо дублікат)
- Кнопки: `До профілю` / `Грати ще`

### 9.3 Public API (`features/chest-opening/index.ts`)
```ts
export { ChestOpeningModal } from './ui/ChestOpeningModal';
```

---

## FE-10 — widgets/curator-showcase: Вітрина профілю

**Директорія**: `widgets/curator-showcase/`

### 10.1 Опис

5 слотів для вибраних артефактів гравця (публічно видимих всім). Порядок можна міняти drag-and-drop.

### 10.2 Компоненти

| Файл | Опис |
|------|------|
| `ui/CuratorShowcase.tsx` | DnD-сортований список 5 слотів |
| `ui/ShowcaseSlot.tsx` | Слот: ItemCard + при hover — 3D preview (micro Three.js canvas 80×80, GLTFLoader з `artifact.model_3d_url`) |
| `model/useCuratorShowcase.ts` | Стан `{slots: InventoryItem[]}`, `reorder()`, `save()` |

### 10.3 Repository

```ts
export const showcaseRepository = {
  getShowcase: (callsign: string) =>
    httpClient.get<InventoryItem[]>(`/api/web/game/showcase/${callsign}/`),
  updateShowcase: (item_ids: number[]) =>
    httpClient.post('/api/web/game/showcase/', { item_ids }),
};
```

> **Залежність BE**: endpoint `GET/POST /api/web/game/showcase/` має бути реалізований у BE-04.

---

## FE-11 — widgets/planetary-terrarium: 3D Планета

**Директорія**: `widgets/planetary-terrarium/`

### 11.1 Опис

Інтерактивна 3D сфера планети (Moon або Mars) з розміщеними на реальних координатах 3D моделями артефактів гравця. Клік на артефакт → камера "летить" до нього → модальне вікно з engineering card.

### 11.2 Технічний стек

- Three.js `SphereGeometry` + WMTS texture (тайли NASA/USGS)
- `OrbitControls` з `autoRotate: true` (повільно)
- `GLTFLoader` для кожного артефакту з `model_3d_url`
- `Raycaster` для click detection

### 11.3 Компоненти

| Файл | Опис |
|------|------|
| `ui/PlanetaryTerrarium.tsx` | Головний компонент, `<canvas>` |
| `ui/ArtifactMarker.tsx` | 3D маркер на планеті (якщо gltf не завантажений — fallback сфера 50px) |
| `ui/ArtifactCard.tsx` | Модальна engineering card: фото, дані, `first_person_monologue`, `cause_of_deactivation` |
| `model/usePlanetaryTerrarium.ts` | Стан `{selectedArtifact}`, `flyTo(lat, lon)` |

### 11.4 Lat/Lon → 3D координати

```ts
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}
```

### 11.5 Public API (`widgets/planetary-terrarium/index.ts`)
```ts
export { PlanetaryTerrarium } from './ui/PlanetaryTerrarium';
```

---

## FE-12 — Сторінки

### 12.1 `pages/home/`

- Відображає: контейнерні слоти (до 10), кнопку `ГРАТИ`, daily login claim
- Виводить: `useContainerStore`, `useAuthStore`

### 12.2 `pages/arena/`

Стан-машина:
```
phase === 'IDLE'           → кнопка "Знайти матч"
phase === 'SEARCHING'      → <MatchmakingModal />
phase === 'IN_MATCH' | ... → <BattleArena />
phase === 'MATCH_END'      → <ChestOpeningModal /> (якщо chest_earned)
                           → кнопки: "Грати ще" / "До профілю"
```

### 12.3 `pages/profile/:callsign`

Секції:
1. **Header**: аватар (Google photo), callsign, ELO, win/loss, RP balance
2. **Planetary Terrarium**: `<PlanetaryTerrarium />` (3D планета)
3. **Curator Showcase**: `<CuratorShowcase />` (5 вибраних артефактів)
4. **Inventory Grid**: всі артефакти гравця, фільтр по рідкості
5. **Stats**: win_streak, matches_played, total_rp_earned

> Якщо `callsign === me` → show edit controls для showcase. Інакше — read-only.

### 12.4 `pages/leaderboards/`

- Таблиця: rank, callsign, ELO, win_streak, рідкісний артефакт (найбільш рідкісний в showcase)
- Пагінація (20 на сторінку)
- Фільтр: `All Time` / `This Week`

---

## FE-13 — Міні-ігри (non-MVP: 6 шт.)

Реалізувати після MVP, тільки skeleton + TODO коментарі у Sprint 2+:

| Slug | Назва | Суть |
|------|-------|------|
| `shadow_projector` | Shadow Projector | По тіні та куті сонця визначити час доби/сезон на планеті |
| `scale_matcher` | Scale Matcher | 3D порівняння розмірів об'єктів — більший/менший/рівний відомому об'єкту |
| `traverse_tracer` | Traverse Tracer | По `TraverseWaypoint` (sol, odometry, elevation) відтворити маршрут ровера на карті |
| `component_dissect` | Component Dissect | По зображенні деталі визначити її функцію (наука/зв'язок/живлення/мобільність) |
| `stat_guesser` | Stat Guesser | Вгадати числову характеристику місії (маса, дальність, тривалість) ±N% |
| `mission_stack` | Mission Stack | Хронологічно впорядкувати події місії (DnD-сортування) |

---

## FE-14 — Тести

| Файл | Що тестувати |
|------|--------------|
| `entities/game/model/useMatchStore.test.ts` | State transitions: IDLE→SEARCHING→IN_MATCH→MATCH_END, tickTimer, reset |
| `entities/container/model/useContainerStore.test.ts` | fetchSlots, openContainer (mock HTTP), daily claim |
| `entities/user/model/useAuthStore.test.ts` | setToken, logout, persist |
| `features/astro-guessr/model/useAstroGuessr.test.ts` | pin placement, submit disables form |
| `widgets/battle-arena/ui/RoundTimer.test.ts` | interval ticks, calls tickTimer, clears on unmount |
| `shared/api/ws-client.test.ts` | connect singleton, event dispatch, disconnect |

**Запуск**:
```bash
pnpm vitest run
```

---

## FE-15 — Sprint Plan (Frontend)

| Sprint | Дні | Задачі |
|--------|-----|--------|
| **S-FE-1** | 3 | FE-01: Scaffold, Vite, Biome, FSD dirs, shared/api |
| **S-FE-2** | 2 | FE-02: Google OAuth callback, useAuthStore, RequireAuth |
| **S-FE-3** | 3 | FE-03: WS client, useMatchStore, useGameEvents |
| **S-FE-4** | 2 | FE-04 + FE-05: Container slots, Inventory, RarityBadge |
| **S-FE-5** | 3 | FE-06 + FE-07: Matchmaking modal + 3 MVP mini-games |
| **S-FE-6** | 3 | FE-08: BattleArena widget (HUD, timer, renderer, overlays) |
| **S-FE-7** | 2 | FE-09 + FE-12: ChestOpening animation + all 3 pages |
| **S-FE-8** | 3 | FE-10 + FE-11: Curator showcase + Planetary Terrarium (Three.js) |
| **S-FE-9** | 2 | FE-13 skeletons + FE-14 tests + Biome pass |
| **Total** | **~23 дні** | |

> ⚠️ **Не запускати арену (FE-08) до завершення S-BE-4** (WS consumer готовий на бекенді).

---

## Чек-лист здачі

- [ ] `pnpm install` без помилок
- [ ] `pnpm biome check src/` — 0 errors
- [ ] `pnpm vitest run` — всі тести зелені
- [ ] Google OAuth login → JWT зберігається → профіль завантажується
- [ ] Matchmaking: знайти людину ≤8s, fallback bot ≤10s
- [ ] 3 MVP mini-games відправляють WS `round.answer`
- [ ] BattleArena таймер тікає та зупиняється при `round_timer_sec === 0`
- [ ] ChestOpening анімація з'являється після `chest_earned: true`
- [ ] Profile сторінка: Terrarium, Showcase, Inventory Grid
- [ ] RarityBadge кольори відповідають таблиці FE-05
