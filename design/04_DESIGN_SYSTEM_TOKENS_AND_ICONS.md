# Дизайн-Система, Токени та Іконковий Пак CosmoLost (04_DESIGN_SYSTEM_TOKENS_AND_ICONS.md)

> **Для передачі**: Дизайнерці (Віолетта) та Frontend-розробнику (Нікіта).  
> **Ціль**: Точні значення токенів кольорів, сітки, скруглень, блюрів та офіційний іконковий пак 10 типів обладнання NASA.  
> **Дизайн-система**: **Chakra UI v3**.  

---

## 🎨 1. Токени Кольорів та Неонових Ефектів

| Токен | Значення / Код | Призначення |
|---|---|---|
| **`space.bg`** | `#0A0B10` | Глибокий чорний фон космосу |
| **`glass.card`** | `rgba(18, 20, 29, 0.75)`<br>+ `backdrop-filter: blur(12px)`<br>+ `border: 1px solid rgba(255, 255, 255, 0.08)` | Напівпрозоре скло поверх 3D карти |
| **`accent.cyan`** | `#00F0FF`<br>+ `box-shadow: 0 0 20px rgba(0, 240, 255, 0.35)` | Неонове сяйво приладів, телеметрія, координати |
| **`accent.amber`** | `#FFB800`<br>+ `box-shadow: 0 0 25px rgba(255, 184, 0, 0.40)` | Золоте сяйво обраних об'єктів Tier 1 |
| **`accent.mars`** | `#E2583E` | Марсіанський теракотовий колір |
| **`accent.moon`** | `#E0E6ED` | Місячний перлинно-білий колір |

---

## 📐 2. Жорстка 4px / 8px Сітка та Радіуси

* **Відступи (Spacing)**: `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`.
* **Радіуси (Border Radius)**:
  * `12px` — картки, контейнери
  * `8px` — інпути, кнопки меню
  * `9999px` — бейджики та чіпи фільтрів
  * `16px` — висувні панелі Drawer та модалки

---

## 🚀 3. Офіційний Icon Pack для 10 Типів Обладнання NASA (Lucide)

| № | Тип обладнання | Іконка Lucide | Колір бейджа | Приклад у NASA |
|---|---|---|---|---|
| 1 | **`ROVER`** | `<Bot />` або `<Truck />` | Помаранчевий (`#E2583E`) | Spirit, Opportunity, Apollo LRV |
| 2 | **`HELICOPTER`** | `<Fan />` або `<Navigation />` | Неоновий ціан (`#00F0FF`) | Ingenuity Mars Helicopter |
| 3 | **`LANDER`** | `<Radio />` або `<Satellite />` | Синій (`#3B82F6`) | Viking 1/2, InSight, Phoenix |
| 4 | **`DESCENT_STAGE`** | `<Anchor />` або `<Disc />` | Золотий (`#D97706`) | Apollo 11 LM Eagle |
| 5 | **`IMPACT_STAGE`** | `<Flame />` або `<Crosshair />` | Червоний (`#EF4444`) | Saturn V S-IVB |
| 6 | **`INSTRUMENT`** | `<Activity />` або `<Gauge />` | Фіолетовий (`#8B5CF6`) | Сейсмометри ALSEP, SEIS |
| 7 | **`RETRO_REFLECTOR`** | `<Sparkles />` | Янтарний (`#FFB800`) | Лазерні куточкові відбивачі Apollo LRRR |
| 8 | **`SAMPLE_TUBE`** | `<TestTube />` | Смарагдовий (`#10B981`) | Титанові трубки зразків Three Forks |
| 9 | **`ENTRY_DEBRIS`** | `<ShieldAlert />` | Сірий (`#64748B`) | Теплові щити, парашути, Backshell |
| 10| **`DEEP_SPACE_PROBE`**| `<Compass />` або `<Rocket />` | Ультрафіолет (`#A855F7`) | Voyager 1/2, Pioneer 10/11 |
