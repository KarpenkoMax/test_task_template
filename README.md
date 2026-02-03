# Pixel assignment scaffold

Этот репозиторий — **шаблон интервью-задания** (умышленно неполный проект).

## Запуск

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000

## Тесты (без установки зависимостей на хост)

```bash
docker compose up -d --build

# Backend
docker compose exec backend pytest

# Frontend
docker compose exec frontend npm test
```

## Задания

- `tasks/part1.md` — Pixel JS (без LLM)
- `tasks/part2.md` — API ingest + UI (LLM разрешён)
