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
| MVP games | AstroGuessr (2D NASA map), ForensicSol, MissionHangar; no unsupported-mode fallback |
| Scores | 0–100 per round, 0–300 per match; proposed chest threshold 150 is pending sign-off |
| Reveal | Shared answers/target/opponent score only after both lock; StatGuesser feedback is private to the player and never includes target mass |

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
# photo-sphere-viewer is optional and only needed if verified 360° panoramas are approved

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
     → Django створює профіль/сесію → frontend завершує auth через погоджений secure exchange
```

> **Блокер інтеграції**: спосіб видати frontend JWT ще треба погодити з BE/reviewer. Не передавати access/refresh JWT у query string або fragment; не логувати секрети.

### 2.2 Файли

**`entities/user/api/user-repository.ts`**
```ts
import { httpClient } from '@/shared/api/http-client';

export interface UserProfile {
  callsign: string;
  bio: string;
  avatar_frame: string;
  favorite_planet: 'mars' | 'moon';
  elo_rating: number;
  rank: string;
  curator_index: number;
  container_count: number;
  research_points: number;
  matches_played: number;
  matches_won: number;
  current_win_streak: number;
  is_public: boolean;
  inventory_count: number;
  win_rate: number;
}

export interface PublicGameProfile {
  callsign: string;
  avatar_frame: string;
  rank: string;
  collection_count: number;
  showcase: ShowcaseItem[];
}

export interface ShowcaseItem {
  equipment: {
    id: string;
    name: string;
    description: string;
    equipment_class: string;
    rarity: string;
    image_url: string | null;
  };
  artifact_location: { latitude: number; longitude: number } | null;
}

export const userRepository = {
  getMe: () => httpClient.get<UserProfile>('/api/game/profile/me/'),
  getProfile: (callsign: string) =>
    httpClient.get<PublicGameProfile>(`/api/game/profile/${callsign}/`),
};
```

**`entities/user/model/useAuthStore.ts`**
```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: { callsign: string; elo_rating: number } | null;
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

**`features/auth/ui/OAuthCallback.tsx`**: після sign-off викликає `authRepository.completeOAuth()`, зберігає отриманий access token і переводить користувача на головну сторінку. До погодження secure exchange/session contract не підставляти endpoint навмання; callback ніколи не читає access/refresh JWT із URL.

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
  connect(wsUrl: string) {
    if (socket?.readyState === WebSocket.OPEN) return;
    const url = new URL(wsUrl, window.location.href);
    url.protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Auth transport must match the backend-approved contract.
    // Never put an access/refresh JWT in the URL query string.
    socket = new WebSocket(url);
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data as string) as { event: string; [key: string]: unknown };
      listeners.get(msg.event)?.forEach((cb) => cb(msg));
    };
  },
  send(action: string, fields: Record<string, unknown> = {}) {
    socket?.send(JSON.stringify({ action, ...fields }));
  },
  on(event: string, cb: (data: unknown) => void) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event)!.add(cb);
    return () => listeners.get(event)!.delete(cb);
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
  round_index: number;
  round_type: string;        // 'ASTRO_GUESSR' | 'FORENSIC_SOL' | ...
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
// WS event → store action mapping; messages use FEAT-11's top-level `event`.
// game.matched          → setMatchData + setPhase('IN_MATCH')
// round.start           → setRound
// round.answer_accepted → acknowledge only this player's submission
// round.opponent_acted  → show generic activity only
// round.result          → updateScores + setPhase('ROUND_RESULT')
// stat_guesser.feedback → update only this player's private calibration state
// stat_guesser.ready    → allow editing the pile for the next attempt
// match.finish          → endMatch
// match.private_reward  → update this player's inventory/reward only
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
  container_type: string;
  filled_at: string;     // ISO timestamp
  seal_progress: 0 | 50; // прогрес прив'язаний до конкретного слота
  is_reserved: boolean;
}

interface ContainerSlotsResponse {
  slots: ContainerSlot[];
  next_fill_at: string | null;
}

interface ContainerState {
  slots: ContainerSlot[];
  next_fill_at: string | null;  // коли заповниться наступний слот
  fetchSlots: () => Promise<void>;
  startMatchWithSlot: (slot_index: number) => Promise<void>;
}

interface DailyClaimState {
  status: 'claimed' | 'pending_space' | 'already_claimed';
  expires_at: string | null; // UTC boundary
}
```

### 4.2 Repository

```ts
// entities/container/api/container-repository.ts
export const containerRepository = {
  getSlots: () => httpClient.get<ContainerSlotsResponse>('/api/game/containers/'),
  startMatchWithSlot: (slot_index: number) =>
    httpClient.post('/api/game/match/create/', { slot_index }),
  claimDaily: () => httpClient.post<DailyClaimState>('/api/game/containers/daily/', {}),
};
```

### 4.3 UI (`entities/container/ui/ContainerSlot.tsx`)

- Компонент: кнопка/карточка слоту
- Якщо `is_reserved`: disabled і показує матч у процесі
- Якщо `seal_progress === 50`: показує частково зняту пломбу
- Якщо контейнер доступний: активний, дія починає матч, а не відкриває loot напряму
- Якщо ще не наповнений: countdown до `next_fill_at`
- Props: `slot: ContainerSlot`, `onPlay: () => void`

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
  getInventory: () => httpClient.get<InventoryItem[]>('/api/game/inventory/'),
  getPublicShowcase: (callsign: string) =>
    httpClient.get<PublicGameProfile>(`/api/game/profile/${callsign}/`),
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
User click "PLAY" → POST /api/game/match/create/ with {slot_index}
                  → response: {match_id, ws_url, config}
                  → phase = 'SEARCHING'; connect to returned ws_url
                  → WS: game.matched (≤8s; is_bot=true after bot fallback)
                  → phase = 'IN_MATCH'
```

### 6.2 `MatchmakingModal.tsx`

- **Анімація**: пульсуючий круг (Framer Motion `animate={{ scale: [1, 1.2, 1] }}`)
- **Таймер**: відображає 0–8s очікування
- **Fallback**: обробити `game.matched` з `opponent.is_bot === true`; окремої події `bot.assigned` немає.
- **Cancel**: окремого cancel endpoint у BE-контракті поки немає; не надсилати вигаданий URL. Узгодити endpoint із BE до показу кнопки скасування.
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
> - Надсилають action із FEAT-11: AstroGuessr — `submit_guess {lat, lon}`, ForensicSol — `buzzer_click {selected_id}`, MissionHangar — `drag_drop {slot, item_id}`
> - НЕ знають правильної відповіді (Zero-Knowledge)
> - Мають `disabled` стан після відправки відповіді

---

### 7.1 AstroGuessr (Знайди координати на карті)

**Директорія**: `features/astro-guessr/`

**Завдання**: На інтерактивній 2D карті NASA гравець ставить пін і визначає місце апарата. Перевірене фото/панорама може бути необов'язковою підказкою, якщо asset доступний.

**Дані в `payload`**:
```json
{
  "map_url": "https://trek.nasa.gov/...",
  "media_url": "https://nasa.gov/... (optional verified asset)",
  "planet": "MOON | MARS",
  "hint": "Місія Curiosity, 2023"
}
```

**Компоненти**:

| Файл | Опис |
|------|------|
| `ui/AstroGuessr.tsx` | Головний контейнер |
| `ui/SurfaceMap.tsx` | Інтерактивний шар поверхні NASA з можливістю кліку для постановки піна |
| `ui/LocationHint.tsx` | Перевірене фото, якщо воно доступне |
| `model/useAstroGuessr.ts` | Стан `{pin: {lat,lon} | null}`, `submit()` |

**SurfaceMap**: показує карту та пін, конвертує вибір у координати. Не показує цільові координати або назву місця до завершення раунду.

**Submit payload**: `{ lat: number, lon: number }` — координати піна гравця.

**Scoring**: бекенд рахує Haversine-відстань і повертає 0–100 балів. Результат/ціль не розкриваються опоненту, доки обидва гравці не надіслали відповідь або не сплив таймер.

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
Match End (is_chest_unlocked) + private match.private_reward → ChestOpeningModal
                      → Reveal Animation → Показ артефакту + Rarity / duplicate RP
Match End (seal_progress: 50) → показати збережений прогрес пломби; без loot-запиту
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
    httpClient.get<PublicGameProfile>(`/api/game/profile/${callsign}/`),
  updateShowcase: (slots: { inventory_item_id: number; slot: number }[]) =>
    httpClient.post('/api/game/showcase/update/', { slots }),
};
```

> **Залежність BE**: публічна вітрина входить у `GET /api/game/profile/{callsign}/`; оновлення власної — `POST /api/game/showcase/update/`. Scrap endpoint не входить до API-контракту MVP.

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
1. **Header**: public view — callsign, avatar, rank and aggregate collection progress; owner-only view may add ELO, win/loss and RP
2. **Planetary Terrarium**: `<PlanetaryTerrarium />` (3D планета)
3. **Curator Showcase**: `<CuratorShowcase />` (5 вибраних артефактів)
4. **Inventory Grid**: повний інвентар і фільтри — лише власнику; відвідувач бачить тільки showcase
5. **Stats**: `current_win_streak`, `matches_played`, `matches_won`, `research_points`, ELO — лише власнику; не очікувати `total_rp_earned`, бо такого поля немає в BE serializer.

> Якщо `callsign === me` → show edit controls для showcase. Інакше — read-only.

### 12.4 `pages/leaderboards/`

- Таблиця за полями BE: `rank`, `callsign`, `elo_rating`, `matches_won`; список — до 100 public профілів.
- Показувати по 20 рядків на сторінку клієнтською пагінацією; не показувати `win_streak`, рідкісний артефакт чи часові фільтри, яких немає в API.

---

## FE-13 — Міні-ігри (non-MVP: 6 шт.)

Ці шість режимів не входять до MVP. Повну реалізацію починати лише після MVP та підготовки перевірених payloads; не підміняти ними недоступний режим у матчах MVP.

| Slug | Назва | Суть |
|------|-------|------|
| `shadow_projector` | Shadow Projector | По тіні та куті сонця визначити час доби/сезон на планеті |
| `scale_matcher` | Scale Matcher | 3D порівняння розмірів об'єктів — більший/менший/рівний відомому об'єкту |
| `traverse_tracer` | Traverse Tracer | По `TraverseWaypoint` (sol, odometry, elevation) відтворити маршрут ровера на карті |
| `component_dissect` | Component Dissect | По зображенні деталі визначити її функцію (наука/зв'язок/живлення/мобільність) |
| `stat_guesser` | StatGuesser — АстроТерези | Перетягнути побутові предмети на шальку та спрогнозувати `<`, `=` або `>` відносно прихованої маси апарата |
| `mission_stack` | Mission Stack | Хронологічно впорядкувати події місії (DnD-сортування) |

### FE-13.1 — StatGuesser: АстроТерези (post-MVP)

**FSD slice**: `features/stat-guesser/` (`ui/`, `model/`, `index.ts`); зовнішній імпорт — лише через public API slice.

- Показати назву/зображення апарата та список серверних еталонних предметів із назвою й масою; не показувати масу апарата ні до, ні після `round.result`.
- Дозволити перетягувати предмети на шальку, прибирати їх і бачити поточну суму. Додати доступне клавіатурне керування як альтернативу drag-and-drop.
- Кожне натискання «Підтвердити» надсилає лише `object_ids` через `stat_guesser_check`; клієнт не надсилає масу чи оператор порівняння.
- Після відповіді приватно показати лише «апарат важчий (`<`)», «предмети важчі (`>`)» або «баланс (`=`)», без маси апарата/різниці. Якщо балансу немає — запитати «Продовжити?»: так — надіслати `stat_guesser_continue` і відновити редагування після `stat_guesser.ready`; ні — надіслати `stat_guesser_stop`.
- Після кожної спроби апарат залишається на другій шальці, терези оновлюють нахил. Точну масу апарата не показувати ні після окремої спроби, ні у фінальному результаті; стан суперника не показувати до завершення раунду.
- Баланс відповідає серверному допуску (початково до 1% маси апарата). Успіх дає 100 балів і приватний RP за кількість спроб; stop/timeout без балансу — 0 балів і RP.

**Готово, коли** поточна сума оновлюється при зміні набору, submit блокує повторне надсилання тієї самої спроби, після невдалого зважування можна продовжити/завершити, а UI ніколи не рендерить target mass.

---

## FE-14 — Тести

| Файл | Що тестувати |
|------|--------------|
| `entities/game/model/useMatchStore.test.ts` | State transitions: IDLE→SEARCHING→IN_MATCH→MATCH_END, tickTimer, reset |
| `entities/container/model/useContainerStore.test.ts` | fetchSlots, openContainer (mock HTTP), daily claim |
| `entities/user/model/useAuthStore.test.ts` | setToken, logout, persist |
| `features/astro-guessr/model/useAstroGuessr.test.ts` | pin placement, submit disables form |
| `features/stat-guesser/model/useStatGuesser.test.ts` | сума предметів, feedback-стани, continue/stop, спроби й приватний RP без показу маси апарата |
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
| **Total** | **~23 дні** | Не включає окремо оцінювані post-MVP мініігри |
| **Post-MVP** | Оцінити окремо | FE-13.1: StatGuesser — АстроТерези після підготовки reference-mass payload |

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
