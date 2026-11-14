# Головний Реєстр та Навігатор Специфікації (00_INDEX.md)

Цей документ є центральним навігаційним хабом модульної специфікації. Усі розділи структуровано за рівнями згідно з правилами [`.agents/rules/spec_rules.md`](../.agents/rules/spec_rules.md).

---

## 1. Карта Розділів Специфікації

| Розділ | Шлях | Опис | Статус |
| :--- | :--- | :--- | :--- |
| **00. Метадані та Аудит** | [`00_VERSION.md`](../00_VERSION.md) | Реєстр версій, статус релізів та журнал змін (SemVer 2.0.0) | `ACTIVE` |
| **01. Дослідження (Research)** | [`spec/research/RESEARCH_PLAN.md`](./research/RESEARCH_PLAN.md) | **План досліджень (теми, що шукаємо), конкуренти [COMP-*], ринок [MKT-*], кастдеви [CUST-*]** | `ACTIVE` |
| **02. Концепція та Ядро** | `spec/02_core/` | Паспорт продукту, цілі, ціннісна пропозиція (Value Prop), глосарій термінів `[TERM-*]` | `DRAFT` |
| **03. Аудиторія та Ролі** | `spec/03_users/` | Ролі системи `[ROLE-*]`, матриця прав доступу, персони користувачів | `PLANNED` |
| **04. Функціональні Модулі** | `spec/04_features/` | Сценарії використання, фічі `[FEAT-*]`, Jobs-To-Be-Done | `PLANNED` |
| **05. Доменна Модель** | `spec/05_domain/` | Сутності `[ENT-*]`, поля та валідації `[FIELD-*]`, атомарні операції `[OP-*]` | `PLANNED` |
| **06. Архітектура та Інтеграції**| `spec/06_architecture/`| C4 діаграми, ERD моделей даних, контракти API, хуки `[HOOK-*]` | `PLANNED` |
| **07. Якість та Ризики** | `spec/07_quality_and_risks/`| NFR вимоги, вектори шахрайства `[FRAUD-*]`, тест-кейси `[QA-*]` | `PLANNED` |

---

## 2. Розділ Досліджень (spec/research/)

Розділ досліджень є фундаментом для прийняття продуктових рішень:
* **План досліджень**: [`spec/research/RESEARCH_PLAN.md`](./research/RESEARCH_PLAN.md)
* **Дослідження зовнішніх інтеграцій**: [`spec/research/integrations/`](./research/integrations/)
* **Аналіз конкурентів та РЕСП**: [`spec/research/competitors/`](./research/competitors/)
* **Ринок та монетизація**: [`spec/research/market/`](./research/market/)
* **Інтерв'ю з користувачами**: [`spec/research/interviews/`](./research/interviews/)
* **UX/UI Бенчмарки**: [`spec/research/benchmarks/`](./research/benchmarks/)
* **Матеріали та скріншоти**: [`spec/research/materials/`](./research/materials/)
