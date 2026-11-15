---
name: gemini-notebook-sync
description: Управління блокнотами та синхронізація специфікацій бізнесу з Google Gemini Notebook API через MCP. Дозволяє створювати блокноти, додавати джерела, перевіряти статус обробки та готувати матеріали для презентації.
tools:
  - run_command
  - read_file
  - write_file
---

# Скіл: Синхронізація з Gemini Notebook API (`gemini-notebook-sync`)

Використовуйте цей скіл для взаємодії з віддаленим MCP-сервером Gemini Notebook (`https://notebook.googleapis.com/mcp`).

## 1. Команди менеджера

Всі операції виконуються локально через скрипт у папці плагіна:

### Список доступних блокнотів:
```bash
python .agents/plugins/gemini-notebook/scripts/notebook_manager.py list-notebooks
```

### Створення нового блокнота під презентацію:
```bash
python .agents/plugins/gemini-notebook/scripts/notebook_manager.py create-notebook "CosmoLost Pitch & Business Specs"
```

### Пакетна синхронізація всієї документації бізнесу:
```bash
python .agents/plugins/gemini-notebook/scripts/notebook_manager.py sync-specs --notebook "notebooks/ВАШ_NOTEBOOK_ID"
```

### Перегляд завантажених джерел:
```bash
python .agents/plugins/gemini-notebook/scripts/notebook_manager.py list-sources --notebook "notebooks/ВАШ_NOTEBOOK_ID"
```

## 2. Локальна конфігурація
Токен та ідентифікатор проєкту зберігаються виключно локально у файлі:
`business/.agents/gemini_notebook.env`
(Жодних глобальних змін у системі).
