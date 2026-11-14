# Головний Реєстр та Навігатор Специфікації CosmoLost (00_INDEX.md)

Цей документ є центральним навігаційним хабом модульної специфікації платформи **CosmoLost** (команда «Space Ліхтар» для NASA Space Apps Challenge 2026). Усі розділи структуровано за рівнями згідно з правилами [`.agents/rules/spec_rules.md`](../.agents/rules/spec_rules.md).

---

## 1. Карта Розділів Специфікації

| Розділ | Шлях | Опис | Статус |
| :--- | :--- | :--- | :---: |
| **00. Метадані та Аудит** | [`00_VERSION.md`](../00_VERSION.md) | Реєстр версій, статус релізів та журнал змін (SemVer 2.0.0) | `ACTIVE` |
| **01. Дослідження (Research)** | [`spec/research/RESEARCH_PLAN.md`](./research/RESEARCH_PLAN.md) | Операційний план досліджень (`RES-01` .. `RES-09`), шаблони інтеграцій та конкуренти | `ACTIVE` |
| **02. Концепція та Ядро** | [`spec/02_core/`](./02_core/) | [Паспорт продукту](./02_core/01_PASSPORT.md), візія, проблема, РЕСП та [Глосарій термінів](./02_core/02_GLOSSARY.md) `[TERM-*]` | `APPROVED` |
| **03. Аудиторія та Ролі** | [`spec/03_users/`](./03_users/) | [Ролі системи](./03_users/01_ROLES.md) `[ROLE-*]` та [Матриця прав доступу](./03_users/02_PERMISSIONS_MATRIX.md) | `APPROVED` |
| **04. Функціональні Модулі** | [`spec/04_features/`](./04_features/) | [Карта фіч та JTBD](./04_features/01_FEATURES_MAP.md), [Реєстр Use Cases](./04_features/02_USE_CASES.md), специфікації [3D-мапи](./04_features/FEAT-01_interactive_map.md), [картки артефакту](./04_features/FEAT-02_artifact_details.md), [«Фабрики контенту»](./04_features/FEAT-03_content_factory.md), [публікації](./04_features/FEAT-04_social_publishing.md), [FastMCP](./04_features/FEAT-05_mcp_rag_gateway.md) та [адмінки](./04_features/FEAT-06_admin_ingestion.md) | `APPROVED` |
| **05. Доменна Модель** | [`spec/05_domain/`](./05_domain/) | [Реєстр сутностей](./05_domain/01_ENTITIES.md) `[ENT-*]`, [валідації полів](./05_domain/02_FIELDS_AND_VALIDATIONS.md) `[FIELD-*]` та [атомарні операції](./05_domain/03_OPERATIONS.md) `[OP-*]` | `APPROVED` |
| **06. Архітектура та Інтеграції**| [`spec/06_architecture/`](./06_architecture/)| [C4 діаграми](./06_architecture/01_C4_SYSTEM_CONTEXT.md), [ERD моделі БД](./06_architecture/02_DATA_MODEL_ERD.md), [Portal OpenAPI MD](./06_architecture/OPENAPI_PORTAL_API.md), [Editor OpenAPI MD](./06_architecture/OPENAPI_EDITOR_API.md), [OpenAPI 3.1 YAML](./06_architecture/openapi.yaml), [діаграми послідовності](./06_architecture/04_SEQUENCES.md) | `APPROVED` |
| **07. Якість та Ризики** | [`spec/07_quality_and_risks/`](./07_quality_and_risks/)| [NFR вимоги](./07_quality_and_risks/01_NFR.md), [реєстр ризиків](./07_quality_and_risks/02_RISKS_AND_FRAUD.md) `[RISK-*]` та [приймальні тест-кейси](./07_quality_and_risks/03_QA_TEST_CASES.md) `[QA-*]` | `APPROVED` |

---

## 2. Оперативні посилання для розробників та команди

* **Бекенд-інженерам та Data Engineers**: Дивіться [Покроковий гайд для API (Portal + Editor)](./06_architecture/TASK_API_PORTAL_AND_EDITOR_GUIDE.md), [Покроковий гайд для NASA Data Loader & Ingest Worker](./06_architecture/TASK_NASA_INGEST_LOADER_GUIDE.md) (Clean Architecture, шари Client ➔ DTO ➔ Repository ➔ 8 таблиць Django, пул токенів з ротацією при 429, дельта-трекінг SHA-256 та погодинне автооновлення), [ERD діаграму](./06_architecture/02_DATA_MODEL_ERD.md), [Portal OpenAPI MD](./06_architecture/OPENAPI_PORTAL_API.md), [Editor OpenAPI MD](./06_architecture/OPENAPI_EDITOR_API.md), [OpenAPI 3.1 YAML](./06_architecture/openapi.yaml) та [Атомарні операції OP-*](./05_domain/03_OPERATIONS.md).
* **Дизайнерам та Фронтенд-розробникам**: Дивіться [Головний бриф передачі дизайнеру](../../design/00_DESIGNER_BRIEF_HANDOFF.md), [Дизайн-Хаб design/](../../design/README.md), [Дизайн Вебпорталу](../../design/01_TASK_DESIGN_PORTAL_WEB.md), [Дизайн Десктопу](../../design/02_TASK_DESIGN_EDITOR_DESKTOP.md), [Wireframe Сторінки Місії](../../design/03_PAGE_LAYOUTS_AND_MISSION_SPEC.md), [Дизайн-система та іконки](../../design/04_DESIGN_SYSTEM_TOKENS_AND_ICONS.md).
* **Десктоп-розробникам («Фабрика контенту»)**: Дивіться [Дизайн-завдання для Десктопного Редактора](./06_architecture/TASK_DESIGN_EDITOR_DESKTOP.md), [FEAT-03 Фабрика контенту](./04_features/FEAT-03_content_factory.md), [FEAT-04 Дистрибуція](./04_features/FEAT-04_social_publishing.md) та [Діаграму послідовності монтажу](./06_architecture/04_SEQUENCES.md).
* **ШІ-інтеграторам**: Дивіться [Покроковий гайд для MCP](./06_architecture/TASK_MCP_SERVER_AND_TOOLS_GUIDE.md), [FEAT-05 Шлюз FastMCP](./04_features/FEAT-05_mcp_rag_gateway.md) та схеми виклику тулзів.
* **DevOps та Системним Адміністраторам**: Дивіться автономне [Покрокове ТЗ для DevOps / Сисадміна](./06_architecture/TASK_DEVOPS_SYSADMIN_GUIDE.md) (стек із 8 контейнерів, готові маніфести docker-compose, Dockerfiles, Nginx, міграції, бекапи та перевірка 8 обов'язкових таблиць).
* **QA-інженерам**: Дивіться [Реєстр тест-кейсів QA-*](./07_quality_and_risks/03_QA_TEST_CASES.md).
* **Усій команді, журі та партнерам (Повний автономний PDF-довідник)**: Завантажуйте концентрований [CosmoLost_Engineering_Handbook.pdf](../CosmoLost_Engineering_Handbook.pdf) (v0.5.5 APPROVED) — містить вбудовані C4-архітектуру, об'єктну модель (UML Class Model), реляційну базу даних (ERD), фотоархів артефактів NASA з демонстрацією Pillow-box Safe Zones та рольові Use Cases для дизайнера, веба, бекенда і десктопа.
