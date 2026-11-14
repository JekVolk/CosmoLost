#!/usr/bin/env python3
"""
generate_cosmolost_handbook.py
Повний інженерний PDF-довідник системи CosmoLost (Master Edition v0.5.7)
10 сторінок:
- Сторінка 1: Паспорт проєкту, розподіл ролей, 3 закони Zero-Budget & Local-First
- Сторінка 2: C4 Системна архітектура (PNG) + 7 контейнерів Docker Compose стеку
- Сторінка 3: Об'єктний підхід та UML Class Diagram (PNG) + 3 агрегати домену
- Сторінка 4: Класифікатор 10 типів обладнання NASA + Клієнтські JSON-контракти та десктоп-конфіг
- Сторінка 5: Фізична модель БД PostgreSQL 16 (ERD PNG) + 14 таблиць та GIN індекси
- Сторінка 6: Каталог покинутих артефактів NASA (Фотомонтаж) + Демо Pillow-box Safe Zones
- Сторінка 7: Use Cases Дизайнера (UC-DES-01..05)
- Сторінка 8: Use Cases Веб-розробника (UC-WEB-01..05)
- Сторінка 9: Use Cases Бекенд-інженера (UC-BACK-01..04 + Text Sync & Topic Engine)
- Сторінка 10: Use Cases Десктоп-інженера (UC-FAC-01..05 + Adaptive GPU Watchdog)
"""

import os
import sys
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable, Image as RLImage
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

# Реєстрація шрифтів Arial із підтримкою кирилиці
FONT_DIR = "C:/Windows/Fonts"
pdfmetrics.registerFont(TTFont("Arial", os.path.join(FONT_DIR, "arial.ttf")))
pdfmetrics.registerFont(TTFont("Arial-Bold", os.path.join(FONT_DIR, "arialbd.ttf")))
pdfmetrics.registerFont(TTFont("Arial-Italic", os.path.join(FONT_DIR, "ariali.ttf")))

class NumberedCanvas(canvas.Canvas):
    """Двопрохідний канвас для динамічної нумерації сторінок та верхніх/нижніх колонтитулів."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_decorations(self, page_count):
        self.saveState()
        self.setFont("Arial", 8)
        self.setFillColor(colors.HexColor("#64748B"))

        # Верхній колонтитул (крім першої сторінки)
        if self._pageNumber > 1:
            self.drawString(36, 810, "CosmoLost • Інженерні Специфікації, Архітектура та Use Cases (v0.5.7 APPROVED)")
            self.drawRightString(559, 810, "NASA Space Apps Challenge 2026")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(36, 804, 559, 804)

        # Нижній колонтитул
        page_text = f"Сторінка {self._pageNumber} з {page_count}"
        self.drawRightString(559, 20, page_text)
        self.drawString(36, 20, "Команда «Space Ліхтар» • Local-First + Server Text Storage • Єдиний автономний Master-документ")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(36, 30, 559, 30)

        self.restoreState()

def build_pdf(filename="CosmoLost_Engineering_Handbook.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=46,
        bottomMargin=42
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "CoverTitle",
        fontName="Arial-Bold",
        fontSize=16.5,
        leading=20.5,
        textColor=colors.HexColor("#0F172A")
    )
    subtitle_style = ParagraphStyle(
        "CoverSubTitle",
        fontName="Arial",
        fontSize=8.8,
        leading=12,
        textColor=colors.HexColor("#2563EB")
    )
    h1_style = ParagraphStyle(
        "RoleHeading1",
        fontName="Arial-Bold",
        fontSize=11,
        leading=14.5,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=3,
        spaceAfter=2.5
    )
    body_style = ParagraphStyle(
        "BodyTextCustom",
        fontName="Arial",
        fontSize=6.9,
        leading=9.2,
        textColor=colors.HexColor("#334155")
    )
    body_bold = ParagraphStyle(
        "BodyBoldCustom",
        fontName="Arial-Bold",
        fontSize=6.9,
        leading=9.2,
        textColor=colors.HexColor("#0F172A")
    )
    section_desc = ParagraphStyle(
        "SectionDesc",
        fontName="Arial-Italic",
        fontSize=7.2,
        leading=9.8,
        textColor=colors.HexColor("#475569")
    )
    code_style = ParagraphStyle(
        "CodeSnippet",
        fontName="Arial",
        fontSize=6.3,
        leading=8.3,
        textColor=colors.HexColor("#0F172A")
    )

    story = []

    # =========================================================================
    # СТОРІНКА 1: ТИТУЛЬНИЙ БЛОК + КАРТА ВІДПОВІДАЛЬНОСТІ + БАЗОВІ ПРИНЦИПИ
    # =========================================================================
    story.append(Paragraph("CosmoLost: Повний Інженерний Довідник, Архітектура та Детальні Use Cases", title_style))
    story.append(Spacer(1, 2))
    story.append(Paragraph("Об'єктна модель, C4-архітектура, ERD, типи обладнання, фотоархів NASA, 7+1 таблиць БД та Community Publications • v0.5.8 (APPROVED)", subtitle_style))
    story.append(Spacer(1, 4))

    passport_data = [
        [
            Paragraph("<b>Челендж NASA:</b> Abandoned but not Forgotten (Moon & Mars)", body_style),
            Paragraph("<b>Команда:</b> «Space Ліхтар» (NASA Space Apps 2026)", body_style),
            Paragraph("<b>Бюджет медіа-хостингу:</b> $0/міс (NASA GitHub Raw CDN)", body_style)
        ],
        [
            Paragraph("<b>Основна мова даних:</b> English (en-US)", body_style),
            Paragraph("<b>Сервер:</b> Docker Compose (VPS) + Серверне сховище текстів", body_style),
            Paragraph("<b>Клієнт:</b> Local-First (Tauri v2 + Адаптивний GPU Watchdog)", body_style)
        ]
    ]
    t_pass = Table(passport_data, colWidths=[180, 170, 173])
    t_pass.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_pass)
    story.append(Spacer(1, 4))

    story.append(Paragraph("🗺️ Розподіл Відповідальності та Зони Компетенцій Команди", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0F172A"), spaceBefore=1, spaceAfter=3))

    arch_overview = [
        [
            Paragraph("<b>Роль / Спеціалізація</b>", body_bold),
            Paragraph("<b>Зона відповідальності у проєкті CosmoLost</b>", body_bold),
            Paragraph("<b>Ключові технології та інструменти</b>", body_bold)
        ],
        [
            Paragraph("<b>🎨 UI/UX та 3D Дизайнер<br/>(Віолетта)</b>", body_style),
            Paragraph("Проєктування мобільних Safe Zones (9:16), матриці емоцій PNGTuber-аватара (8 спрайтів), палітри CosmoDark, 4 станів UI та гайдлайну Blurred Pillow-box для архівних фото.", body_style),
            Paragraph("Figma, Photoshop/Krita, 512x512 Alpha PNG, Safe Zones Preset 1080x1920.", body_style)
        ],
        [
            Paragraph("<b>🌐 Фронтенд / Веб-розробник<br/>(Нікіта)</b>", body_style),
            Paragraph("Реалізація інтерактивного 3D-планетарію на Three.js (Місяць/Марс), нормалізація координат IAU 2000, кластеризація точок (&lt;500м) з анімацією spiderfying, оптимізація InstancedMesh (60 FPS), картка артефакту зі стрімінгом .glb з NASA CDN.", body_style),
            Paragraph("React, Three.js, OrbitControls, GLTFLoader, NASA Treks WMTS, Chakra UI, i18n.", body_style)
        ],
        [
            Paragraph("<b>⚙️ Бекенд / DevOps Інженер</b>", body_style),
            Paragraph("Оркестрація Docker Compose стеку на VPS, щогодинний парсер NASA з блокуваннями Redis Lock (TTL 1800s), повнотекстовий індекс SearchVector (en+simple) без RAG, FastMCP сервер (8 інструментів), централізоване збереження текстів проєктів та рушій підбору наступної теми.", body_style),
            Paragraph("Django 5, PostgreSQL 16, Redis, Celery, Nginx, FastMCP, Docker Compose.", body_style)
        ],
        [
            Paragraph("<b>💻 Десктоп-інженер<br/>(Фабрика контенту)</b>", body_style),
            Paragraph("Розробка Local-First додатка на Tauri v2, нодовий редактор таймлайну (React Flow, ~40с ролик), локальний кеш B-roll/3D, FFmpeg конвеєр з Pillow-box, адаптивний сторожовий таймер Rust Watchdog (налаштування під GPU 30–300с), конектори YouTube/Telegram.", body_style),
            Paragraph("Tauri v2 (Rust), @xyflow/react, Chakra UI, FFmpeg, Edge-TTS, tokio timeout.", body_style)
        ]
    ]
    t_arch = Table(arch_overview, colWidths=[120, 250, 153])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 4))

    story.append(Paragraph("<b>3 Непорушні Інженерні Закони Системи:</b><br/>"
                           "1. <b>Zero-Budget Hosting ($0/міс):</b> Жодних платних S3 сховищ. Усі важкі 3D-моделі (.glb) та Hi-Res фото NASA стрімляться браузером напряму з відкритих серверів NASA та JPL.<br/>"
                           "2. <b>Закон Local-First + Server Text Sync:</b> Важкий монтаж та синтез мови виконуються локально. Проте **весь текст** (сценарії, описи, коментарі, причини вибору) зберігається в базі даних сервера (займає лічені мегабайти, забезпечуючи бекап та синхронізацію).<br/>"
                           "3. <b>Адаптивність до слабких GPU:</b> Таймаут рендерингу не є жорстким, а регулюється користувачем у налаштуваннях (30–300с), що запобігає збоям та видаленню відео на повільних ПК.", section_desc))

    story.append(PageBreak())

    # =========================================================================
    # СТОРІНКА 2: ВБУДОВАНА C4-АРХІТЕКТУРА СИСТЕМИ (PNG)
    # =========================================================================
    story.append(Paragraph("🏛️ РОЗДІЛ 1. Системна Архітектура CosmoLost (C4 Context & Data Flow)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0284C7"), spaceBefore=1, spaceAfter=3))
    story.append(Paragraph("Схема взаємодії компонентів екосистеми: Веб-порталу, ШІ-шлюзу FastMCP, Локальної десктопної фабрики та відкритих серверів NASA.", section_desc))
    story.append(Spacer(1, 3))

    arch_img_path = r"inbox/arhitech.png"
    if os.path.exists(arch_img_path):
        story.append(RLImage(arch_img_path, width=515, height=364))
    story.append(Spacer(1, 4))

    c4_legend = [
        [
            Paragraph("<b>Вузол системи</b>", body_bold),
            Paragraph("<b>Технологічний стек</b>", body_bold),
            Paragraph("<b>Призначення, протоколи та потоки даних</b>", body_bold)
        ],
        [
            Paragraph("<b>Web 3D Portal</b>", body_style),
            Paragraph("Three.js, React, Chakra UI, OrbitControls", body_style),
            Paragraph("Інтерактивна 3D-сфера Місяця та Марса. Стрімить тайли з NASA Treks WMTS. Відкриває картки артефактів та стрімить .glb моделі з GitHub raw.", body_style)
        ],
        [
            Paragraph("<b>FastMCP Gateway</b>", body_style),
            Paragraph("FastMCP, SSE (порт 8001), Django ORM", body_style),
            Paragraph("Шлюз контексту для ШІ-агентів (Gemini, Claude Desktop). Надає 8 серверних інструментів реляційного пошуку з англомовними фактами.", body_style)
        ],
        [
            Paragraph("<b>Local Content Factory</b>", body_style),
            Paragraph("Tauri v2, Rust, FFmpeg, React Flow", body_style),
            Paragraph("Десктопний додаток монтування 9:16 роликів (~40с). 100% обчислень локально: Edge-TTS, Jump-cut, Pillow-box, синхронізація текстів з бекендом.", body_style)
        ],
        [
            Paragraph("<b>NASA Open Data</b>", body_style),
            Paragraph("NSSDCA, PDS Geosciences, NASA Treks", body_style),
            Paragraph("Відкриті першоджерела наукових даних. Періодичний щогодинний парсинг бекендом під захистом розподіленого блокування Redis Lock.", body_style)
        ]
    ]
    t_c4 = Table(c4_legend, colWidths=[110, 140, 273])
    t_c4.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_c4)

    story.append(PageBreak())

    # =========================================================================
    # СТОРІНКА 3: ОБ'ЄКТНИЙ ПІДХІД ТА UML CLASS DIAGRAM (PNG)
    # =========================================================================
    story.append(Paragraph("🧩 РОЗДІЛ 2. Об'єктний Підхід та UML Модель Доменних Сутностей", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#7C3AED"), spaceBefore=1, spaceAfter=3))
    story.append(Paragraph("Доменна архітектура спроєктована за канонами Domain-Driven Design (DDD): ізольовані агрегати, суворі інваріанти полів (FIELD-01..33), операції OP-* та скінченні автомати (FSM).", section_desc))
    story.append(Spacer(1, 2))

    class_img_path = r"spec/05_domain/images/class_diagram.png"
    if os.path.exists(class_img_path):
        story.append(RLImage(class_img_path, width=320, height=330))
    story.append(Spacer(1, 3))

    oop_data = [
        [
            Paragraph("<b>Агрегат / Сутність</b>", body_bold),
            Paragraph("<b>Зв'язки та Кардинальність</b>", body_bold),
            Paragraph("<b>Об'єктні інваріанти, FSM-стани та Доменні операції</b>", body_bold)
        ],
        [
            Paragraph("<b>Планетарне Ядро<br/>(Core Domain)</b>", body_style),
            Paragraph("• CelestialBody (1) &lt;-- (M) Artifact<br/>"
                      "• Mission (1) &lt;-- (M) Artifact<br/>"
                      "• Artifact (1) &lt;-- (M) Discovery<br/>"
                      "• Artifact (1) &lt;-- (M) Waypoint", body_style),
            Paragraph("• <b>FSM Артефакту:</b> <code>ACTIVE -&gt; SLEEPING -&gt; DEACTIVATED -&gt; DESTROYED</code>.<br/>"
                      "• <b>Інкапсульовані методи:</b> <code>normalize_coords()</code> (IAU 2000 для Марса 0..360 -&gt; -180..180), <code>calculate_cluster(threshold_m=500)</code>.<br/>"
                      "• <b>Валідації:</b> FIELD-01/02 (координати), FIELD-22 (маса &gt; 0), FIELD-30 (is_nasa_hardware).", body_style)
        ],
        [
            Paragraph("<b>Контентна Фабрика<br/>(Media Production)</b>", body_style),
            Paragraph("• ContentTemplate (1) &lt;-- (M) Project<br/>"
                      "• Artifact (1) &lt;-- (M) Project<br/>"
                      "• PNGTuberAvatar (1) &lt;-- (M) Project<br/>"
                      "• Project (1) &lt;-- (M) VideoScriptSlide", body_style),
            Paragraph("• <b>FSM Проєкту:</b> <code>DRAFT -&gt; GENERATING -&gt; READY_TO_PUBLISH -&gt; PUBLISHED / FAILED</code>.<br/>"
                      "• <b>Інкапсульовані методи:</b> <code>build_ffmpeg_filter()</code>, <code>detect_silence_jumpcut()</code>, <code>suggest_next_video_topic()</code>, <code>sync_project_text()</code>.<br/>"
                      "• <b>Поля:</b> <code>selection_reason</code> (FIELD-32), <code>target_duration_sec: 40</code> (FIELD-33), <code>render_timeout_sec: 30..300</code> (FIELD-29).", body_style)
        ],
        [
            Paragraph("<b>Дистрибуція та Шлюзи<br/>(Integration Gateways)</b>", body_style),
            Paragraph("• Project (1) &lt;-- (M) Dispatch<br/>"
                      "• PlatformConnector (1) &lt;-- (M) Dispatch<br/>"
                      "• PlatformConnector (1) &lt;-- (1) Credential", body_style),
            Paragraph("• <b>FSM Публікації:</b> <code>PENDING -&gt; UPLOADING -&gt; PINNING_COMMENT -&gt; SUCCESS / FAILED</code>.<br/>"
                      "• <b>Інкапсульовані методи:</b> <code>upload_resumable(chunk=5MB)</code>, <code>create_pin_comment()</code>, <code>open_native_folder_with_clipboard()</code>.<br/>"
                      "• <b>Валідації:</b> FIELD-24 (довжина заголовка &lt;= 50 симв), FIELD-25 (структура опису).", body_style)
        ]
    ]
    t_oop = Table(oop_data, colWidths=[110, 140, 273])
    t_oop.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_oop)

    story.append(PageBreak())

    # =========================================================================
    # СТОРІНКА 4: КЛАСИФІКАТОР 10 ТИПІВ ОБЛАДНАННЯ ТА КЛІЄНТСЬКІ КОНТРАКТИ
    # =========================================================================
    story.append(Paragraph("🛠️ РОЗДІЛ 3. Класифікатор 10 Типів Космічного Обладнання та Контракти Клієнтів", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#4F46E5"), spaceBefore=1, spaceAfter=3))
    story.append(Paragraph("Канонічний реєстр 10 інженерних категорій покинутого обладнання NASA (FIELD-05), типи даних для Веб-клієнта (Three.js), десктоп-конфіг та серверне збереження текстів.", section_desc))
    story.append(Spacer(1, 3))

    eq_types_data = [
        [
            Paragraph("<b>Тип (Enum)</b>", body_bold),
            Paragraph("<b>Назва українською</b>", body_bold),
            Paragraph("<b>Інженерний опис та призначення</b>", body_bold),
            Paragraph("<b>Реальні місії NASA</b>", body_bold)
        ],
        [
            Paragraph("<code>ROVER</code>", code_style),
            Paragraph("Планетохід / Марсохід / LRV", body_style),
            Paragraph("Самохідний колісний апарат з науковою лабораторією або пілотований місячний всюдихід.", body_style),
            Paragraph("Opportunity, Spirit, Sojourner, Apollo 15–17 LRV", body_style)
        ],
        [
            Paragraph("<code>HELICOPTER</code>", code_style),
            Paragraph("Планетарний дрон / Вертоліт", body_style),
            Paragraph("Аеростатичний літальний апарат для надрозрідженої марсіанської атмосфери.", body_style),
            Paragraph("Ingenuity (72 польоти, злам ротора на Sol 1035)", body_style)
        ],
        [
            Paragraph("<code>LANDER</code>", code_style),
            Paragraph("Посадковий модуль", body_style),
            Paragraph("Стаціонарна непорушна наукова станція на опорах (сейсморозвідка, клімат).", body_style),
            Paragraph("Viking 1, Viking 2, InSight, Phoenix", body_style)
        ],
        [
            Paragraph("<code>DESCENT_STAGE</code>", code_style),
            Paragraph("Спускний ступінь модуля", body_style),
            Paragraph("Нижня ракетна посадочна платформа Apollo LM, що слугувала стартовим столом для зльоту.", body_style),
            Paragraph("Apollo 11–17 LM Descent Stages («Eagle», «Falcon»)", body_style)
        ],
        [
            Paragraph("<code>IMPACT_STAGE</code>", code_style),
            Paragraph("Сейсмічний таран / Ступінь", body_style),
            Paragraph("Ступінь ракети, навмисно спрямований на таран поверхні для створення штучних сейсмохвиль.", body_style),
            Paragraph("Saturn V S-IVB ступені, LCROSS Centaur", body_style)
        ],
        [
            Paragraph("<code>INSTRUMENT</code>", code_style),
            Paragraph("Автономний науковий прилад", body_style),
            Paragraph("Окремо виставлений на ґрунт комплекс сенсорів (сейсмометри, магнітометри, бур HP3).", body_style),
            Paragraph("Сейсмометри ALSEP (Місяць), SEIS (Марс InSight)", body_style)
        ],
        [
            Paragraph("<code>RETRO_REFLECTOR</code>", code_style),
            Paragraph("Лазерний відбивач", body_style),
            Paragraph("Пасивна оптична кварцова мішень для вимірювання дистанції Земля-Місяць лазером (без електроніки).", body_style),
            Paragraph("Apollo 11/14/15 LRRR, Луноход-1/2 (каталог NASA)", body_style)
        ],
        [
            Paragraph("<code>SAMPLE_TUBE</code>", code_style),
            Paragraph("Титанова пробірка зі зразками", body_style),
            Paragraph("Герметичний надміцний контейнер із кернами порід для програми Mars Sample Return.", body_style),
            Paragraph("Three Forks Depot (10 пробірок Perseverance)", body_style)
        ],
        [
            Paragraph("<code>ENTRY_DEBRIS</code>", code_style),
            Paragraph("Скинуті елементи атмосфери", body_style),
            Paragraph("Аеродинамічні компоненти спуску: теплозахисний екран, посадочний кран Sky Crane, парашути.", body_style),
            Paragraph("Perseverance Sky Crane, Curiosity Heat Shield", body_style)
        ],
        [
            Paragraph("<code>DEEP_SPACE_PROBE</code>", code_style),
            Paragraph("Зонд далекого космосу", body_style),
            Paragraph("Апарати на гіперболічних траєкторіях виходу з Сонячної системи або в точках Лагранжа.", body_style),
            Paragraph("Pioneer 10/11, Voyager 1/2, New Horizons", body_style)
        ]
    ]
    t_eq = Table(eq_types_data, colWidths=[80, 115, 195, 133])
    t_eq.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#EEF2FF")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 1.2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.2),
        ('LEFTPADDING', (0,0), (-1,-1), 3),
        ('RIGHTPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_eq)
    story.append(Spacer(1, 3))

    # Таблиця клієнтських контрактів та налаштувань
    contracts_data = [
        [
            Paragraph("<b>Клієнтський рівень</b>", body_bold),
            Paragraph("<b>Шлях / Ендпоінт</b>", body_bold),
            Paragraph("<b>Схема даних (Data Contract) та інженерні параметри</b>", body_bold)
        ],
        [
            Paragraph("<b>Веб-клієнт<br/>(Three.js Portal)</b>", body_style),
            Paragraph("<code>GET /api/v1/portal/artifacts/</code><br/><i>(Полегшений масив)</i>", body_style),
            Paragraph("<code>[ { id: string, name: string, lat: float, lon: float, artifact_type: enum, status: enum, is_cluster: bool, cluster_count: int } ]</code>.<br/>"
                      "• <b>Ціль:</b> віддача 2000+ точок в 1 запиті (&lt;120 КБ), Draw Calls = 1 через <code>THREE.InstancedMesh</code>.", body_style)
        ],
        [
            Paragraph("<b>Серверна синхронізація текстів</b>", body_style),
            Paragraph("<code>POST /api/v1/editor/projects/sync/</code><br/><i>(Server Text Storage)</i>", body_style),
            Paragraph("Передає: <code>project_id</code>, <code>selection_reason</code>, <code>script_slides[]</code>, <code>caption_lines</code>, <code>pin_comment</code>.<br/>"
                      "• <b>Зберігається на сервері:</b> повний текст проєкту у PostgreSQL (бекап, аналітика, 0 байт медіафайлів).", body_style)
        ],
        [
            Paragraph("<b>Рекомендація наступної теми</b>", body_style),
            Paragraph("<code>POST /api/v1/editor/recommend-next-topic/</code><br/><i>(Smart Topic Engine)</i>", body_style),
            Paragraph("Запит: <code>current_artifact_id</code>, <code>rubric_id</code>, <code>selection_reason</code>.<br/>"
                      "Відповідь: <code>suggested_artifact_id</code>, <code>narrative_bridge</code>, <code>suggested_hook</code>, <code>recommended_pin_comment</code>.", body_style)
        ],
        [
            Paragraph("<b>Конфігурація Десктопа<br/>(Local Config)</b>", body_style),
            Paragraph("<code>%APPDATA%\\CosmoLost\\config.json</code><br/><i>(Адаптивний Watchdog)</i>", body_style),
            Paragraph("• <code>render_timeout_sec: 40</code> (налаштовується користувачем 30–300с під GPU, 90–120с для слабких відеокарт).<br/>"
                      "• <code>target_duration_sec: 40</code> (15..60с), <code>b_roll_cache_dir: 10GB</code>, <code>target_lufs: -16.0</code>, шифрування токенів AES-256.", body_style)
        ]
    ]
    t_con = Table(contracts_data, colWidths=[95, 140, 288])
    t_con.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 1.8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.8),
        ('LEFTPADDING', (0,0), (-1,-1), 3),
        ('RIGHTPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_con)

    story.append(PageBreak())

    # =========================================================================
    # СТОРІНКА 5: ФІЗИЧНА СХЕМА БАЗИ ДАНИХ (ERD POSTGRESQL 16)
    # =========================================================================
    story.append(Paragraph("🗄️ РОЗДІЛ 4. Фізична Модель Бази Даних (PostgreSQL 16 ERD)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#059669"), spaceBefore=1, spaceAfter=3))
    story.append(Paragraph("Фізична схема 7+1 таблиць реляційної бази даних (Zero-Media Server: відео на YouTube/клієнті, в БД тільки знання та лінки).", section_desc))
    story.append(Spacer(1, 2))

    erd_img_path = r"spec/06_architecture/images/erd.png"
    if os.path.exists(erd_img_path):
        story.append(RLImage(erd_img_path, width=515, height=381))
    story.append(Spacer(1, 3))

    erd_legend = [
        [
            Paragraph("<b>Таблиця</b>", body_bold),
            Paragraph("<b>Ключові колонки та типи</b>", body_bold),
            Paragraph("<b>Індекси, обмеження та призначення</b>", body_bold)
        ],
        [
            Paragraph("<b>ARTIFACTS</b>", body_style),
            Paragraph("<code>id (PK slug), mission_id (FK), celestial_body_id (FK), name, lat/lon, status, is_nasa_hardware, model_3d_url</code>", body_style),
            Paragraph("<b>GIN індекс:</b> <code>SearchVector('name', 'english') + SearchVector('simple')</code>. Швидкий пошук за &lt;50 мс без важкого RAG.", body_style)
        ],
        [
            Paragraph("<b>CELESTIAL_BODIES</b>", body_style),
            Paragraph("<code>id (PK: 'moon','mars'), radius_km, coordinate_system_type, wmts_tile_url</code>", body_style),
            Paragraph("Типи планетних координат: <code>SELENOGRAPHIC</code> (Місяць) та <code>PLANETOCENTRIC_360</code> (Марс за стандартом IAU 2000).", body_style)
        ],
        [
            Paragraph("<b>COMMUNITY_PUBLICATIONS</b>", body_style),
            Paragraph("<code>id (PK UUID), mission_id (FK), artifact_id (FK opt), title, video_url, platform_type, source_references, is_approved</code>", body_style),
            Paragraph("Зберігає посилання на відео (YouTube/TikTok) та першоджерела контенту (NASA PIA/PDS). Клієнтський UI — у плановому беклозі <code>[AI-DRAFT]</code>.", body_style)
        ],
        [
            Paragraph("<b>LOCAL-FIRST (TAURI CLIENT)</b>", body_style),
            Paragraph("<code>VideoScriptSlide, BatchQueueTask, local_mp4_path, platform_credentials</code>", body_style),
            Paragraph("Внутрішні сутності монтажу та секретні токени соцмереж зберігаються виключно на ПК креатора в <code>%APPDATA%/CosmoLost/</code>.", body_style)
        ]
    ]
    t_erd = Table(erd_legend, colWidths=[110, 160, 253])
    t_erd.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_erd)

    story.append(PageBreak())

    # =========================================================================
    # СТОРІНКА 6: КАТАЛОГ ПОКИНУТИХ АРТЕФАКТІВ NASA ТА ВІЗУАЛЬНИЙ РУШІЙ
    # =========================================================================
    story.append(Paragraph("🚀 РОЗДІЛ 5. Каталог Покинутого Обладнання NASA та Візуальний Рушій", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#D97706"), spaceBefore=1, spaceAfter=3))
    story.append(Paragraph("Реальні архівні фотографії покинутого обладнання NASA на Місяці й Марсі та демонстрація технології Blurred Background Pillow-box із Safe Zones.", section_desc))
    story.append(Spacer(1, 3))

    montage_path = r"assets/photos/nasa_artifacts_montage.jpg"
    pillowbox_path = r"assets/photos/pillowbox_safezone_demo.jpg"

    left_flow = []
    left_flow.append(Paragraph("<b>Архівні фотографії артефактів NASA:</b>", body_bold))
    left_flow.append(Spacer(1, 2))
    if os.path.exists(montage_path):
        left_flow.append(RLImage(montage_path, width=300, height=220))
    left_flow.append(Spacer(1, 3))

    photo_legend = [
        [
            Paragraph("<b>Артефакт</b>", body_bold),
            Paragraph("<b>Локація / Тіло</b>", body_bold),
            Paragraph("<b>Історичний статус та причина завершення</b>", body_bold)
        ],
        [
            Paragraph("<b>Apollo 11 Descent Stage</b>", body_style),
            Paragraph("Mare Tranquillitatis<br/>(Місяць, 1969)", body_style),
            Paragraph("Спускний ступінь модуля «Eagle». Перша посадка людей. Постійна історична пам'ятка на Місяці.", body_style)
        ],
        [
            Paragraph("<b>Surveyor 3 &amp; Apollo 12</b>", body_style),
            Paragraph("Oceanus Procellarum<br/>(Місяць, 1967/1969)", body_style),
            Paragraph("Єдиний апарат, який відвідали астронавти наступної місії та демонтували камеру для досліджень на Землі.", body_style)
        ],
        [
            Paragraph("<b>Opportunity (MER-B)</b>", body_style),
            Paragraph("Endeavour Crater<br/>(Марс, 2004–2018)", body_style),
            Paragraph("Пропрацював 5111 солів замість 90 запланованих. Загинув у глобальній пиловій бурі Perseverance Valley.", body_style)
        ],
        [
            Paragraph("<b>Curiosity (MSL)</b>", body_style),
            Paragraph("Gale / Mount Sharp<br/>(Марс, 2012–Active)", body_style),
            Paragraph("Ядерний марсохід на РІТЕГ-живленні. Скинутий щит, парашут та керни зафіксовані як постійні артефакти.", body_style)
        ]
    ]
    t_ph_leg = Table(photo_legend, colWidths=[85, 75, 140])
    t_ph_leg.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
        ('LEFTPADDING', (0,0), (-1,-1), 3),
        ('RIGHTPADDING', (0,0), (-1,-1), 3),
    ]))
    left_flow.append(t_ph_leg)

    right_flow = []
    right_flow.append(Paragraph("<b>FFmpeg Pillow-box &amp; Safe Zones (9:16):</b>", body_bold))
    right_flow.append(Spacer(1, 2))
    if os.path.exists(pillowbox_path):
        right_flow.append(RLImage(pillowbox_path, width=205, height=364))
    right_flow.append(Spacer(1, 2))
    right_flow.append(Paragraph("<b>Червоні зони:</b> перекриття UI TikTok / Shorts (верх 220px, низ 420px, право 150px).<br/>"
                                "<b>Зелене вікно:</b> безпечний текст (300–1400px).<br/>"
                                "<b>Аватар:</b> PNGTuber у точці Y=1500px над описом.", section_desc))

    page5_table = Table([[left_flow, right_flow]], colWidths=[305, 218])
    page5_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(page5_table)

    story.append(PageBreak())

    # =========================================================================
    # СТОРІНКА 7: ДЕТАЛЬНІ USE CASES ДЛЯ ДИЗАЙНЕРА (UI/UX & 3D)
    # =========================================================================
    story.append(Paragraph("🎨 РОЗДІЛ 6. Детальні Use Cases для UI/UX та 3D Дизайнера (Віолетта)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#7C3AED"), spaceBefore=1, spaceAfter=3))
    story.append(Paragraph("Цей розділ визначає всі призначені для користувача інтерфейси, візуальні стани, вимоги до композиції екранів та графічні обмеження, які проектує дизайнер.", section_desc))
    story.append(Spacer(1, 3))

    des_uc_data = [
        [
            Paragraph("<b>[ID] Сценарій дизайну</b>", body_bold),
            Paragraph("<b>Вхідні елементи та Стани (States)</b>", body_bold),
            Paragraph("<b>Покроковий візуальний потік (Flow) та Артефакти</b>", body_bold)
        ],
        [
            Paragraph("<b>[UC-DES-01]<br/>Головний екран 3D-мапи космосу</b>", body_style),
            Paragraph("• <b>Палітра:</b> CosmoDark (#0F172A).<br/>"
                      "• <b>HUD-елементи:</b> перемикач Місяць/Марс, слайдер років (1960–2026), панель фільтрів.<br/>"
                      "• <b>Стани:</b> Empty, Loading (скелетон), Success, Error.", body_style),
            Paragraph("1. Дизайнер компонує чисту 3D-сцену зоряного неба без візуального сміття.<br/>"
                      "2. Маркери об'єктів мають неонове світіння: Зелений (активний), Червоний/Помаранчевий (заснув), Сірий (розбитий ступінь).<br/>"
                      "3. <b>2D Hover Tooltip:</b> при наведенні спливає мікро-картка (назва, місія, фото, координати) над точкою.<br/>"
                      "4. <b>Вихід:</b> Figma макети десктопу (1920x1080) та мобільної версії (390x844).", body_style)
        ],
        [
            Paragraph("<b>[UC-DES-02]<br/>Кластеризація точок (Spiderfying)</b>", body_style),
            Paragraph("• <b>Вхід:</b> посадковий майданчик Аполлон-11 або Perseverance Three Forks (5–8 точок на 100 м).<br/>"
                      "• <b>Стан кластера:</b> згорнутий числовий бейдж (Circle Badge).", body_style),
            Paragraph("1. На глобальному масштабі відображається кругла плашка: наприклад, «Apollo 11 Site (5)».<br/>"
                      "2. При кліку або наближенні анімується плавний радіальний розліт ліній (Spiderfying Animation).<br/>"
                      "3. Кожна кінцева точка отримує власний значок приладу (ретрорефлектор, прапор, спускний ступінь Eagle).<br/>"
                      "4. <b>Вихід:</b> Стан розгорнутого мікро-кластера в UI.", body_style)
        ],
        [
            Paragraph("<b>[UC-DES-03]<br/>Картка артефакту /artifacts/:id/</b>", body_style),
            Paragraph("• <b>Блоки:</b> Заголовок, 3D Canvas в'ювер .glb, Монолог 1-ї особи, Наукова спадщина, Шлюзи NASA.<br/>"
                      "• <b>Шрифти:</b> Сучасний гротеск, висока контрастність WCAG AAA.", body_style),
            Paragraph("1. Верхній блок: назва, офіційний код NSSDCA, бейдж планети, статус.<br/>"
                      "2. Центральний 3D-в'ювер: кнопки обертання, зуму деталей та скидання камери.<br/>"
                      "3. <b>Pillow-box медіагалерея:</b> архівні фото 4:3 та 800x600 розміщуються на розмитому фоні з цього ж фото, усуваючи грубі чорні рамки.<br/>"
                      "4. Блок цитування: кнопка швидкого копіювання бібліографії для реферату.", body_style)
        ],
        [
            Paragraph("<b>[UC-DES-04]<br/>PNGTuber Аватар та Safe Zones</b>", body_style),
            Paragraph("• <b>Полотно:</b> 1080 × 1920 (вертикальне відео 9:16).<br/>"
                      "• <b>Спрайти:</b> 8 файлів 512x512 Alpha PNG від Віолетти.<br/>"
                      "• <b>Мертві зони соцмереж:</b> верх 220px, низ 420px, право 150px.", body_style),
            Paragraph("1. Дизайнер малює 4 вирази обличчя: Idle (спокійний), Expert (розповідає в окулярах), Shock (шок/трагедія останнього Сола), Hype (тріумф відкриття).<br/>"
                      "2. Для кожного виразу створюється 2 фази рота: рот закритий та рот відкритий.<br/>"
                      "3. Аватар позиціонується на рівні Y = 1500 px (строго над описом TikTok/Reels).<br/>"
                      "4. Текстові субтитри розміщуються у вікні безпеки між 300 px та 1400 px.", body_style)
        ],
        [
            Paragraph("<b>[UC-DES-05]<br/>Діалог публікації та нативна папка</b>", body_style),
            Paragraph("• <b>Компоненти:</b> модальне вікно дистрибуції, чекбокси соцмереж, прев'ю 3-рядкового опису.<br/>"
                      "• <b>Стилі:</b> Chakra UI Dark Mode.", body_style),
            Paragraph("1. Вибір цільових платформ: [x] YouTube Shorts, [x] Telegram, [x] Відкрити папку для TikTok.<br/>"
                      "2. Показ згенерованого SEO-опису з підсвічуванням байт-рядка, ключовиків та хештегів.<br/>"
                      "3. Окремий виділений блок для Pin Comment із кнопкою копіювання в 1 клік.<br/>"
                      "4. Тост-повідомлення: «📁 Папку відкрито, SEO-пакет у буфері обміну!».", body_style)
        ]
    ]
    t_des_uc = Table(des_uc_data, colWidths=[110, 150, 263])
    t_des_uc.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_des_uc)

    story.append(PageBreak())

    # =========================================================================
    # СТОРІНКА 8: ДЕТАЛЬНІ USE CASES ДЛЯ ВЕБ-РОЗРОБНИКА (THREE.JS & REACT)
    # =========================================================================
    story.append(Paragraph("🌐 РОЗДІЛ 7. Детальні Use Cases для Веб-розробника (Three.js & React)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2563EB"), spaceBefore=1, spaceAfter=3))
    story.append(Paragraph("Цей розділ містить покрокові алгоритми ініціалізації 3D-сцени, проекції координат за стандартами IAU 2000, стрімінгу .glb моделей та зв'язку з REST API.", section_desc))
    story.append(Spacer(1, 3))

    web_uc_data = [
        [
            Paragraph("<b>[ID] Сценарій коду</b>", body_bold),
            Paragraph("<b>Вхідні дані (Inputs) & Стан (State)</b>", body_bold),
            Paragraph("<b>Алгоритм виконання (Logic Flow) & Результат</b>", body_bold)
        ],
        [
            Paragraph("<b>[UC-WEB-01]<br/>Ініціалізація 3D-сфери та WMTS тайлів</b>", body_style),
            Paragraph("• <b>Параметри планет:</b> Moon (R=1737.4 км), Mars (R=3396.2 км).<br/>"
                      "• <b>Тайли NASA Treks:</b> LRO WAC Mosaic, Viking Color Mosaic.<br/>"
                      "• <b>Стек:</b> Three.js, WebGL2, OrbitControls.", body_style),
            Paragraph("1. <code>const geometry = new THREE.SphereGeometry(R, 64, 64);</code>.<br/>"
                      "2. <code>TextureLoader</code> асинхронно підтягує базову мозаїку NASA Treks без API-ключа.<br/>"
                      "3. Налаштовуються ліміти зуму OrbitControls: <code>minDistance = R * 1.15</code>, <code>maxDistance = R * 4.5</code>.<br/>"
                      "4. Перемикання тумблера Місяць/Марс плавно анімує камеру через Tween.js та підміняє текстуру без перерендеру Canvas.", body_style)
        ],
        [
            Paragraph("<b>[UC-WEB-02]<br/>Проекція координат (IAU 2000)</b>", body_style),
            Paragraph("• <b>Вхід:</b> latitude, longitude з Portal API.<br/>"
                      "• <b>Тип системи:</b> <code>SELENOGRAPHIC</code> (Місяць) або <code>PLANETOCENTRIC_360</code> (Марс).", body_style),
            Paragraph("1. Для Марса нормалізується східна довгота: <code>let lambda = (lon &gt; 180) ? lon - 360 : lon;</code>.<br/>"
                      "2. Переведення градусів у радіани: <code>phi = lat * (PI / 180)</code>, <code>theta = lambda * (PI / 180)</code>.<br/>"
                      "3. <b>Декартові координати на сфері:</b><br/>"
                      "   <code>x = R * Math.cos(phi) * Math.sin(theta);</code><br/>"
                      "   <code>y = R * Math.sin(phi);</code><br/>"
                      "   <code>z = R * Math.cos(phi) * Math.cos(theta);</code>.<br/>"
                      "4. Точка точно позиціонується на реальній супутниковій карті.", body_style)
        ],
        [
            Paragraph("<b>[UC-WEB-03]<br/>Кластеризація та Spiderfying</b>", body_style),
            Paragraph("• <b>Вхід:</b> масив артефактів з API.<br/>"
                      "• <b>Поріг відстані:</b> <code>distance_threshold_m &lt;= 500</code> м.<br/>"
                      "• <b>Стек:</b> просторовий індекс k-d tree.", body_style),
            Paragraph("1. Клієнтський скрипт групує маркери на дистанції &lt; 500 м в об'єкт <code>ArtifactCluster</code>.<br/>"
                      "2. Якщо зум камери низький — малюється круглий HTML/CSS бейдж із цифрою кількості апаратів.<br/>"
                      "3. При наближенні камери або кліку: генеруються радіальні вектори розльоту, маркери плавно розходяться по колу (павутина), малюються з'єднувальні лінії.<br/>"
                      "4. Користувач може клікнути на конкретний прилад у кластері.", body_style)
        ],
        [
            Paragraph("<b>[UC-WEB-04]<br/>Оптимізація маркерів через InstancedMesh</b>", body_style),
            Paragraph("• <b>Обсяг:</b> 2 000+ покинутих об'єктів NASA.<br/>"
                      "• <b>Ціль:</b> 60 FPS на мобільних пристроях.<br/>"
                      "• <b>Компонент:</b> THREE.InstancedMesh.", body_style),
            Paragraph("1. Замість 2 000 окремих Mesh створюється 1 <code>InstancedMesh(geom, mat, count)</code>.<br/>"
                      "2. Позиції точок записуються в єдиний матричний буфер <code>setMatrixAt(i, matrix)</code>.<br/>"
                      "3. Відсікання невидимих точок: якщо нормаль повернута від камери (<code>dotProduct &lt; 0</code>), маркер ховається.<br/>"
                      "4. Скорочує draw calls з 2 000 до 1, усуваючи тротлінг процесора.", body_style)
        ],
        [
            Paragraph("<b>[UC-WEB-05]<br/>Стрімінг 3D-моделі на сторінці артефакту</b>", body_style),
            Paragraph("• <b>Ендпоінт:</b> <code>GET /api/v1/portal/artifacts/{id}/</code>.<br/>"
                      "• <b>URL моделі:</b> пряме посилання на NASA GitHub raw CDN.<br/>"
                      "• <b>Формат:</b> .glb / .gltf.", body_style),
            Paragraph("1. При відкритті картки <code>GLTFLoader</code> починає потокове завантаження .glb моделі.<br/>"
                      "2. Показується легкий індикатор завантаження у відсотках.<br/>"
                      "3. Модель масштабується та центрується у сцені через <code>Box3().setFromObject()</code>.<br/>"
                      "4. Підключається м'яке світло <code>AmbientLight + DirectionalLight</code> для підкреслення текстур металу і сонячних батарей.", body_style)
        ]
    ]
    t_web_uc = Table(web_uc_data, colWidths=[110, 150, 263])
    t_web_uc.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_web_uc)

    story.append(PageBreak())

    # =========================================================================
    # СТОРІНКА 9: ДЕТАЛЬНІ USE CASES ДЛЯ БЕКЕНД-РОЗРОБНИКА (DJANGO & DEVOPS)
    # =========================================================================
    story.append(Paragraph("⚙️ РОЗДІЛ 8. Детальні Use Cases для Бекенд-інженера (Django, Postgres, DevOps)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#059669"), spaceBefore=1, spaceAfter=3))
    story.append(Paragraph("Цей розділ регламентує структуру Docker Compose стеку, механізм розподілених блокувань Redis Lock, централізоване збереження текстів та Smart Topic Engine.", section_desc))
    story.append(Spacer(1, 3))

    back_uc_data = [
        [
            Paragraph("<b>[ID] Сценарій бекенду</b>", body_bold),
            Paragraph("<b>Вхідні параметри та Контекст</b>", body_bold),
            Paragraph("<b>Послідовність операцій (Backend Logic) & Контракт</b>", body_bold)
        ],
        [
            Paragraph("<b>[UC-BACK-01]<br/>Розподілене завантаження з Redis Lock</b>", body_style),
            Paragraph("• <b>Тригер:</b> Celery Beat щогодини.<br/>"
                      "• <b>Джерела:</b> NSSDCA, NASA Treks, PDS, MMGIS.<br/>"
                      "• <b>Ключ локу:</b> <code>lock:ingestion:nasa</code>.<br/>"
                      "• <b>TTL:</b> 1800 секунд (30 хв).", body_style),
            Paragraph("1. Воркер викликає атомарну команду Redis: <code>redis.set(key, worker_id, nx=True, ex=1800)</code>.<br/>"
                      "2. Якщо ключ вже існує (попередня сесія ще працює) — запуск негайно пропускається з логом.<br/>"
                      "3. При отриманні блокування воркер виконує парсинг каталогів NASA, валідує координати через Pydantic та здійснює <code>bulk_create/update</code> без дублювання записів.<br/>"
                      "4. У блоці <code>finally</code> викликається безпечне зняття локу (перевірка worker_id через Lua-скрипт).", body_style)
        ],
        [
            Paragraph("<b>[UC-BACK-02]<br/>Комбінований повнотекстовий пошук</b>", body_style),
            Paragraph("• <b>Ендпоінт:</b> <code>GET /api/v1/portal/artifacts/?search=...</code>.<br/>"
                      "• <b>БД:</b> PostgreSQL 16.<br/>"
                      "• <b>Таблиця:</b> <code>ARTIFACTS</code>.<br/>"
                      "• <b>Без RAG / Без векторів</b>.", body_style),
            Paragraph("1. У моделі Django визначено комбінований SearchVector індекс:<br/>"
                      "   <code>vector = SearchVector('name', 'location_name', config='english', weight='A') + SearchVector('science_legacy', 'how_it_worked', config='simple', weight='B')</code>.<br/>"
                      "2. Запит користувача конвертується у <code>SearchQuery(query, search_type='websearch')</code>.<br/>"
                      "3. ORM виконує швидкий індексований запит за GIN-індексом із ранжуванням через <code>SearchRank</code>.<br/>"
                      "4. Відповідь віддається за &lt; 50 мс навіть при мільйонних записах.", body_style)
        ],
        [
            Paragraph("<b>[UC-BACK-03]<br/>Серверний FastMCP шлюз для ШІ-агентів</b>", body_style),
            Paragraph("• <b>Протокол:</b> Model Context Protocol (FastMCP).<br/>"
                      "• <b>Транспорт:</b> SSE (порт 8001) та stdio.<br/>"
                      "• <b>Мова відповідей:</b> English (en-US).<br/>"
                      "• <b>Клієнти:</b> Claude Desktop, Gemini.", body_style),
            Paragraph("1. Агент викликає інструмент, наприклад: <code>search_artifacts(query='Opportunity', body='mars')</code>.<br/>"
                      "2. FastMCP роутер валідує схему вхідних параметрів Pydantic.<br/>"
                      "3. Виконується пряма реляційна фільтрація через Django ORM (статус, планета, координати).<br/>"
                      "4. Повертається структурований JSON з офіційними кодами NSSDCA, науковими фактами та прямими посиланнями на першоджерела NASA без генеративних вигадок.", body_style)
        ],
        [
            Paragraph("<b>[UC-BACK-04]<br/>Синхронізація текстів та Smart Topic Engine</b>", body_style),
            Paragraph("• <b>Ендпоінти:</b><br/>"
                      "  <code>POST /api/v1/editor/projects/sync/</code><br/>"
                      "  <code>POST /api/v1/editor/recommend-next-topic/</code>.<br/>"
                      "• <b>Дані:</b> строго легкий JSON.", body_style),
            Paragraph("1. <b>Централізоване збереження текстів:</b> десктоп передає сценарій слайдів, опис, Pin Comment та причину <code>selection_reason</code>. Бекенд зберігає проєкт у PostgreSQL (0 байт медіа).<br/>"
                      "2. <b>Smart Next Topic Engine:</b> аналізує поточну рубрику та <code>selection_reason</code> автора, робить запит до бази даних і повертає рекомендований наступний артефакт, 3с хук та сюжетний міст (Narrative Bridge) для серійності.", body_style)
        ]
    ]
    t_back_uc = Table(back_uc_data, colWidths=[110, 150, 263])
    t_back_uc.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_back_uc)

    story.append(PageBreak())

    # =========================================================================
    # СТОРІНКА 10: ДЕТАЛЬНІ USE CASES ДЛЯ ДЕСКТОП-ІНЖЕНЕРА (TAURI, RUST, FFMPEG)
    # =========================================================================
    story.append(Paragraph("💻 РОЗДІЛ 9. Детальні Use Cases для Десктоп-інженера (Tauri, Rust, FFmpeg, SMM)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#EA580C"), spaceBefore=1, spaceAfter=3))
    story.append(Paragraph("Цей розділ регламентує Local-First архітектуру, роботу адаптивного сторожового таймера Rust Watchdog, ланцюжки фільтрів FFmpeg та конектори дистрибуції.", section_desc))
    story.append(Spacer(1, 3))

    desk_uc_data = [
        [
            Paragraph("<b>[ID] Сценарій монтажу</b>", body_bold),
            Paragraph("<b>Вхідні файли, Кеш та Параметри</b>", body_bold),
            Paragraph("<b>Локальний конвеєр (Local Pipeline) & Конектори</b>", body_bold)
        ],
        [
            Paragraph("<b>[UC-FAC-01]<br/>Синтез мови з Jump-cut обрізкою тиші</b>", body_style),
            Paragraph("• <b>Вхід:</b> тексти слайдів сценарію.<br/>"
                      "• <b>Голоси:</b> uk-UA-OstapNeural, en-US-GuyNeural.<br/>"
                      "• <b>Поріг тиші:</b> &lt; 0.15 секунди.<br/>"
                      "• <b>Прискорення:</b> 1.1x.", body_style),
            Paragraph("1. Додаток викликає <code>edge-tts</code> для генерації сирого аудіотреку.<br/>"
                      "2. Алгоритм виявлення пауз (Silence Detector) знаходить проміжки тиші &gt; 150 мс і безшовно зшиває фрагменти.<br/>"
                      "3. Розраховується масив середньоквадратичних амплітуд (RMS) для кожних 50 мс для подальшого ліпсингу аватара.<br/>"
                      "4. <b>Вихід:</b> локальний файл <code>voice_jumpcut.mp3</code> та JSON таймкодів амплітуд.", body_style)
        ],
        [
            Paragraph("<b>[UC-FAC-02]<br/>FFmpeg Рендеринг з Pillow-box та Safe Zones</b>", body_style),
            Paragraph("• <b>Вхід:</b> фотографії з локального кешу <code>%APPDATA%/CosmoLost/assets/</code>.<br/>"
                      "• <b>Формат відео:</b> 1080x1920 (вертикальне 9:16), 30 fps, H.264 / AAC.<br/>"
                      "• <b>Цільова тривалість:</b> ~40 секунд (Shorts).", body_style),
            Paragraph("1. Для кожного архівного фото нестандартного формату (4:3, 800x600) застосовується фільтр Blurred Pillow-box:<br/>"
                      "   <code>[in]split[bg][fg]; [bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:20[bgb]; [fg]scale=1080:1920:force_original_aspect_ratio=decrease[fgf]; [bgb][fgf]overlay=(W-w)/2:(H-h)/2[slide]</code>.<br/>"
                      "2. Застосовується Ken Burns плавний зум (zoompan), накладаються Safe Zones та реактивний PNGTuber у нижній кут.<br/>"
                      "3. Фонова музика приглушується до -24 dB, а голос вирівнюється за стандартом EBU R128 (-16 LUFS).<br/>"
                      "4. <b>Вихід:</b> фінальний файл <code>final_rendered.mp4</code> (&lt; 35 МБ).", body_style)
        ],
        [
            Paragraph("<b>[UC-FAC-03]<br/>Адаптивний Rust Watchdog під потужність GPU</b>", body_style),
            Paragraph("• <b>Контекст:</b> запуск <code>ffmpeg.exe</code> через <code>tauri-plugin-shell</code>.<br/>"
                      "• <b>Налаштування:</b> повзунок <code>render_timeout_sec</code> (30..300 с, дефолт 40 с).<br/>"
                      "• <b>Асинхронний потік:</b> Tokio runtime.", body_style),
            Paragraph("1. Rust-воркер зчитує встановлений користувачем таймаут і огортає процес у <code>tokio::time::timeout(Duration::from_secs(timeout_sec))</code>.<br/>"
                      "2. На слабких або інтегрованих відеокартах (Intel UHD/Iris, старі GPU) рендеринг продовжується без передчасного скидання чи видалення файлу.<br/>"
                      "3. Якщо ліміт перевищено при зависанні кодека: надсилається <code>child.kill()</code>, очищуються тимчасові чанки, статус стає <code>FAILED (ERR_RENDER_TIMEOUT)</code>.<br/>"
                      "4. <b>Захист черги:</b> пакетна генерація (Batch Queue) не блокується.", body_style)
        ],
        [
            Paragraph("<b>[UC-FAC-04]<br/>Публікація у YouTube Shorts та Pin Comment</b>", body_style),
            Paragraph("• <b>Авторизація:</b> Google OAuth2 PKCE (локальний порт 8089).<br/>"
                      "• <b>API:</b> YouTube Data API v3 <code>videos.insert</code>.<br/>"
                      "• <b>Заголовок:</b> до 50–60 символів + #Shorts.", body_style),
            Paragraph("1. Додаток надсилає Resumable Upload чанками по 5 МБ для стабільності на слабких каналах.<br/>"
                      "2. Передає 3-рядковий SEO опис: Байт на розкриття + факти з посиланням на сайт + 5 хештегів.<br/>"
                      "3. Отримує <code>youtube_video_id</code> та негайно робить виклик <code>commentThreads.insert</code> із дискусійним питанням.<br/>"
                      "4. Закріплює коментар у верхній позиції гілки обговорення для запуску суперечок глядачів.", body_style)
        ],
        [
            Paragraph("<b>[UC-FAC-05]<br/>Нативна дія «Відкрити папку з відео» (Fallback)</b>", body_style),
            Paragraph("• <b>Цільові соцмережі:</b> TikTok, Instagram Reels, Threads, Reddit.<br/>"
                      "• <b>Плагіни Tauri:</b> <code>tauri-plugin-opener</code>, <code>tauri-plugin-clipboard-manager</code>.", body_style),
            Paragraph("1. Користувач клікає «Відкрити папку з відео для TikTok».<br/>"
                      "2. Rust-команда відкриває провідник із позиціонуванням курсору на файлі:<br/>"
                      "   Windows: <code>explorer.exe /select,path</code> | macOS: <code>open -R path</code>.<br/>"
                      "3. Одночасно весь 3-рядковий SEO-текст автоматично записується у системний буфер обміну ОС.<br/>"
                      "4. Відображається модальне вікно з окремою кнопкою копіювання Pin Comment для зручної ручної вставки.", body_style)
        ]
    ]
    t_desk_uc = Table(desk_uc_data, colWidths=[110, 150, 263])
    t_desk_uc.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_desk_uc)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[+] Successfully generated: {filename}")

if __name__ == "__main__":
    output_pdf = sys.argv[1] if len(sys.argv) > 1 else "CosmoLost_Engineering_Handbook.pdf"
    build_pdf(output_pdf)
