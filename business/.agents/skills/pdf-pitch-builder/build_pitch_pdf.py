#!/usr/bin/env python3
"""
build_pitch_pdf.py
Генератор короткої концентрованої PDF-презентації / One-Pager без води на базі ReportLab.
"""

import sys
import os
import argparse
import json
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Канвас із двопрохідним додаванням номерів сторінок та колонтитулів."""
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
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Верхній колонтитул (якщо не 1 сторінка)
        if self._pageNumber > 1:
            self.drawString(40, 560, "CosmoLost — Executive Pitch Brief & Product Summary")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(40, 552, 802, 552)

        # Нижній колонтитул
        page_text = f"Сторінка {self._pageNumber} з {page_count}"
        self.drawRightString(802, 25, page_text)
        self.drawString(40, 25, "Конфіденційно • Тільки ключова вижимка бізнес-специфікації")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(40, 36, 802, 36)
        
        self.restoreState()


def create_pitch_pdf(output_path="pitch_presentation.pdf", data=None):
    if data is None:
        data = {
            "title": "CosmoLost: Бізнес-Концепція та Платформа",
            "subtitle": "Executive Summary & Pitch Deck • Тільки суть без води",
            "version": "v0.1.0",
            "problem": "Гравці та творці стикаються з хаосом у взаємодії, відсутністю прозорої економіки та складнощами координації ігрових активів.",
            "solution": "Єдина інтегрована екосистема для управління взаємодією, цифровими активами та внутрішньоігровими процесами з надійною економічною моделлю.",
            "target_audience": [
                ("Гравці та Спільноти", "Швидка координація, безпечний обмін, участь у командних подіях."),
                ("Творці Контенту", "Монетизація авторських активів, інтеграція з ком'юніті."),
                ("Бізнес та Партнери", "Інструменти залучення, спонсорські івенти, аналітика активності.")
            ],
            "key_features": [
                ("FEAT-1: Атомарний хаб взаємодії", "Централізований інтерфейс обміну та координації дій без посередників."),
                ("FEAT-2: Прозора внутрішня економіка", "Ідемпотентні транзакції, захист від шахрайства та дублювання дій."),
                ("FEAT-3: Аналітичний дашборд", "Миттєвий моніторинг показників залученості, балансу та транзакцій.")
            ],
            "monetization": [
                ("Транзакційна комісія", "Невеликий відсоток від успішних обмінів та операцій у системі."),
                ("Преміум-функціонал", "Розширені інструменти аналітики та пріоритетний саппорт для організаторів."),
                ("Партнерські кампанії", "Спонсорські інтеграції та спецпроєкти для брендів.")
            ],
            "roadmap": [
                ("Фаза 1 (Q1)", "Затвердження спеки, запуск ядра (Core MVP), перші 100 активних користувачів."),
                ("Фаза 2 (Q2)", "Масштабування економічного контуру, автоматизація білінгу, відкритий API."),
                ("Фаза 3 (Q3)", "Вихід на глобальний ринок, запуск партнерської програми.")
            ]
        }

    # Landscape A4: 841.89 x 595.27 pt
    doc = SimpleDocTemplate(
        output_path,
        pagesize=landscape(A4),
        leftMargin=40,
        rightMargin=40,
        topMargin=40,
        bottomMargin=45
    )

    styles = getSampleStyleSheet()

    # Стилі
    title_style = ParagraphStyle(
        'PitchTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#0F172A")
    )

    subtitle_style = ParagraphStyle(
        'PitchSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#475569")
    )

    section_heading = ParagraphStyle(
        'PitchHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#1E293B"),
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'PitchBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155")
    )

    bold_item = ParagraphStyle(
        'PitchBoldItem',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#0F172A")
    )

    story = []

    # --- СЛАЙД 1: ОГЛЯД, ПРОБЛЕМА, РІШЕННЯ ТА ЦА ---
    header_data = [
        [
            Paragraph(f"<b>{data.get('title', 'Pitch Presentation')}</b>", title_style),
            Paragraph(f"<font color='#0284C7'><b>ВЕРСІЯ: {data.get('version', 'v0.1.0')}</b></font>", ParagraphStyle('Ver', parent=body_style, alignment=2, fontSize=11, fontName='Helvetica-Bold'))
        ],
        [
            Paragraph(data.get('subtitle', ''), subtitle_style),
            Paragraph("<font color='#64748B'>Формат: Executive One-Pager Brief</font>", ParagraphStyle('SubR', parent=body_style, alignment=2))
        ]
    ]
    header_table = Table(header_data, colWidths=[560, 202])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0284C7"), spaceAfter=14))

    # Картки Проблема і Рішення (2 колонки)
    prob_p = Paragraph(f"<b>ГОСТРА БІЛЬ / ПРОБЛЕМА:</b><br/>{data.get('problem', '')}", body_style)
    sol_p = Paragraph(f"<b>НАШЕ РІШЕННЯ / VALUE PROPOSITION:</b><br/>{data.get('solution', '')}", body_style)

    prob_sol_table = Table([[prob_p, sol_p]], colWidths=[375, 375])
    prob_sol_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), colors.HexColor("#FEF2F2")), # Світло-червоний для проблеми
        ('BACKGROUND', (1, 0), (1, 0), colors.HexColor("#F0FDF4")), # Світло-зелений для рішення
        ('BOX', (0, 0), (0, 0), 1, colors.HexColor("#FCA5A5")),
        ('BOX', (1, 0), (1, 0), 1, colors.HexColor("#86EFAC")),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(prob_sol_table)
    story.append(Spacer(1, 16))

    # Цільова аудиторія
    story.append(Paragraph("Цільові Сегменти Аудиторії (Хто платить і використовує):", section_heading))
    ta_rows = []
    for seg, desc in data.get('target_audience', []):
        ta_rows.append([
            Paragraph(f"• <b>{seg}</b>", bold_item),
            Paragraph(desc, body_style)
        ])
    ta_table = Table(ta_rows, colWidths=[220, 530])
    ta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(ta_table)

    # --- СЛАЙД 2: ФІЧІ, МОНЕТИЗАЦІЯ ТА РОАДМАП ---
    story.append(PageBreak())

    story.append(Paragraph("Ключовий Функціонал, Економіка та Роадмап Розвитку", title_style))
    story.append(Paragraph("Концентрований опис можливостей та драйверів росту", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0284C7"), spaceAfter=14))

    # Блок Фіч та Монетизації (2 колонки)
    feat_content = [Paragraph("<b>Ключові Фічі (MVP Core):</b>", section_heading)]
    for f_name, f_desc in data.get('key_features', []):
        feat_content.append(Paragraph(f"<b>{f_name}</b>", bold_item))
        feat_content.append(Paragraph(f_desc, body_style))
        feat_content.append(Spacer(1, 4))

    monet_content = [Paragraph("<b>Модель Монетизації (Revenue):</b>", section_heading)]
    for m_name, m_desc in data.get('monetization', []):
        monet_content.append(Paragraph(f"<b>{m_name}</b>", bold_item))
        monet_content.append(Paragraph(m_desc, body_style))
        monet_content.append(Spacer(1, 4))

    two_col_table = Table([[feat_content, monet_content]], colWidths=[375, 375])
    two_col_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BACKGROUND', (0, 0), (0, 0), colors.HexColor("#F8FAFC")),
        ('BACKGROUND', (1, 0), (1, 0), colors.HexColor("#F8FAFC")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(two_col_table)
    story.append(Spacer(1, 16))

    # Роадмап
    story.append(Paragraph("Етапи Реалізації та Ключові Майлстоуни (Roadmap):", section_heading))
    road_rows = []
    for stage, r_desc in data.get('roadmap', []):
        road_rows.append([
            Paragraph(f"<b>{stage}</b>", ParagraphStyle('Stg', parent=bold_item, textColor=colors.HexColor("#0284C7"))),
            Paragraph(r_desc, body_style)
        ])
    road_table = Table(road_rows, colWidths=[150, 600])
    road_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(road_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[OK] Створено лаконічну PDF-презентацію: {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Білдер лаконічної PDF-презентації тільки з корисної інформації.")
    parser.add_argument("-o", "--output", default="pitch_summary.pdf", help="Шлях до результуючого PDF файлу")
    parser.add_argument("-j", "--json", help="Шлях до JSON файлу з даними пітчу (опціонально)")

    args = parser.parse_args()

    data = None
    if args.json and os.path.exists(args.json):
        with open(args.json, "r", encoding="utf-8") as f:
            data = json.load(f)

    create_pitch_pdf(args.output, data)


if __name__ == "__main__":
    main()
