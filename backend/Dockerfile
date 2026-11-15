FROM ghcr.io/astral-sh/uv:python3.14-alpine

WORKDIR /app

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy
ENV PATH="/app/.venv/bin:$PATH"

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY . .
RUN uv sync --frozen --no-dev

EXPOSE 8000

# CMD ["uv", "run", "gunicorn", "myproject.wsgi:application", "--bind", "0.0.0.0:8000"]
CMD ["sh", "-c", "uv run manage.py migrate && uv run manage.py run_ingest && uv run manage.py runserver 0.0.0.0:8000"]
