.PHONY: help up down build logs migrate test test-cov seed clean restart

help: ## Show this help message
	@echo "Enterprise Python & Docker Architecture Commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-16s\033[0m %s\n", $$1, $$2}'

up: ## Start all services with Docker Compose (PostgreSQL, Redis, Backend, Worker, Frontend)
	docker compose up -d

down: ## Stop all running services
	docker compose down

build: ## Rebuild all docker images
	docker compose build --no-cache

logs: ## Tail real-time logs from backend and services
	docker compose logs -f backend

migrate: ## Run Alembic database migrations
	docker compose exec backend alembic upgrade head

migration-gen: ## Generate a new Alembic migration (usage: make migration-gen m="description")
	docker compose exec backend alembic revision --autogenerate -m "$(m)"

seed: ## Seed initial superadmin and sample agent configurations
	docker compose exec backend python -m app.scripts.seed_db

test: ## Run backend unit & integration tests with pytest
	docker compose exec backend pytest -v

test-cov: ## Run tests with code coverage report
	docker compose exec backend pytest --cov=app --cov-report=term-missing

lint: ## Run code linter and formatting checks (ruff/black/flake8)
	docker compose exec backend ruff check .

clean: ## Remove containers, networks, and orphaned volumes
	docker compose down -v --remove-orphans

restart: down up ## Restart all services
