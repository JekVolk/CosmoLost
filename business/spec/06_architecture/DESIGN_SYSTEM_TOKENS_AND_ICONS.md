# Дизайн-Система, Токени та Іконковий Пак CosmoLost (DESIGN_SYSTEM_TOKENS_AND_ICONS.md)

> **Статус**: `APPROVED`  
> **Для кого**: Дизайнерка (Віолетта), Frontend-розробник (Нікіта), команда розробки.  
> **Оригінал документа**: [`../../../design/DESIGN_SYSTEM_TOKENS_AND_ICONS.md`](../../../design/DESIGN_SYSTEM_TOKENS_AND_ICONS.md)  
> **Технічна реалізація**: **Chakra UI v3** + **Lucide Icons** + **Pencil MCP (.pen)**.  

---

## 🎨 РОЗДІЛ 1. Готовий Design Tokens & UI Kit (Chakra UI v3)

### 1.1. Жорстка 4px / 8px Сітка Відступів (Spacing Scale)
* `space.1`: **4 px** — мікро-відступи
* `space.2`: **8 px** — бейджі та чіпи
* `space.3`: **12 px** — інпути, прев'ю
* `space.4`: **16 px** — стандартний паддінг
* `space.6`: **24 px** — картки артефактів
* `space.8`: **32 px** — сітка блоків
* `space.12`: **48 px** — Hero-відступи

### 1.2. Неонові Sci-Fi Блюри та Світіння (Glow Effects)
* `glow.cyan`: `box-shadow: 0 0 20px rgba(0, 240, 255, 0.35)`
* `glow.amber`: `box-shadow: 0 0 25px rgba(255, 184, 0, 0.40)`
* `glow.mars`: `box-shadow: 0 0 20px rgba(226, 88, 62, 0.35)`
* `glass.card`: `background: rgba(18, 20, 29, 0.75); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08);`
* `glass.hud`: `background: rgba(10, 11, 16, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(0, 240, 255, 0.2);`

### 1.3. Радіуси Скруглень (Border Radius)
* `radii.card`: **12 px**
* `radii.input`: **8 px**
* `radii.pill`: **9999 px** (бейджики)
* `radii.modal`: **16 px**

---

## ✏️ РОЗДІЛ 2. Генерація .pen Макетів через Інструмент Pencil MCP

* **`design/web_portal.pen`**: Макет вебпорталу (Three.js сфера, фільтри, картка).
* **`design/editor_studio.pen`**: Макет десктопу (нодовий граф, 9:16 Safe Zones плеєр).
* Принцип: ШІ генерує каркас і компоненти, дизайнерка полірує візуал, кольори та асети без витрати часу на рутину.

---

## 🚀 РОЗДІЛ 3. Готовий Icon Pack для 10 Типів Обладнання NASA (Lucide)

1. **`ROVER`** $\to$ `<Bot />` / `<Truck />` (`#E2583E`, помаранчевий марсохід)
2. **`HELICOPTER`** $\to$ `<Fan />` / `<Navigation />` (`#00F0FF`, ціан Ingenuity)
3. **`LANDER`** $\to$ `<Radio />` / `<Satellite />` (`#3B82F6`, синій стаціонарний посадковий модуль)
4. **`DESCENT_STAGE`** $\to$ `<Anchor />` / `<Disc />` (`#D97706`, золотий посадковий ступінь Apollo)
5. **`IMPACT_STAGE`** $\to$ `<Flame />` / `<Crosshair />` (`#EF4444`, червоний сейсмічний ступінь)
6. **`INSTRUMENT`** $\to$ `<Activity />` / `<Gauge />` (`#8B5CF6`, фіолетовий науковий прилад)
7. **`RETRO_REFLECTOR`** $\to$ `<Sparkles />` / `<SunMedium />` (`#FFB800`, янтарний лазерний відбивач)
8. **`SAMPLE_TUBE`** $\to$ `<TestTube />` / `<Cylinder />` (`#10B981`, смарагдова трубка зразка)
9. **`ENTRY_DEBRIS`** $\to$ `<ShieldAlert />` / `<Wind />` (`#64748B`, сірі уламки посадки)
10. **`DEEP_SPACE_PROBE`** $\to$ `<Compass />` / `<Rocket />` (`#A855F7`, фіолетовий зонд далекого космосу)
