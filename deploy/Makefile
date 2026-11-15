.PHONY: up down stop createsuperuser logs migrate backend-shell ingest

up:
	docker compose up --build -d

down:
	docker compose down

stop:
	docker compose down

createsuperuser:
	docker compose exec backend uv run manage.py createsuperuser

migrate:
	docker compose exec backend uv run manage.py migrate

backend-shell:
	docker compose exec backend sh

ingest:
	docker compose exec backend uv run manage.py run_ingest --force

logs:
	docker compose logs -f
