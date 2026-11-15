.PHONY: up down stop createsuperuser logs migrate backend-shell

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

logs:
	docker compose logs -f
