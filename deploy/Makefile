.PHONY: up down stop createsuperuser logs migrate ingest

up:
	docker compose up --build -d

down:
	docker compose down

stop:
	docker compose down

createsuperuser:
	docker compose exec backend python3 manage.py createsuperuser

migrate:
	docker compose exec backend python3 manage.py migrate

ingest:
	docker compose exec backend python3 manage.py run_ingest --force

logs:
	docker compose logs -f
