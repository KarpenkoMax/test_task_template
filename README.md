# Пиксельное тестовое задание для интервью (React + Django REST + Postgres)

Этот репозиторий — стартовый шаблон для онлайн‑интервью из двух частей (~1 час):

- Часть 1 (без LLM): реализовать минимальный pixel‑скрипт + тесты
- Часть 2 (LLM разрешён): реализовать ingest‑эндпоинт + небольшие улучшения UI

## Запуск через Docker Compose

```bash
docker compose up --build
```

Откройте:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Health: http://localhost:8000/api/health/

При первом запуске БД заполняется несколькими событиями (`seed_pixel_events`), чтобы UI не был пустым.

## Задачи

- [task1](tasks/part1.md)
- [task2](tasks/part2.md)

## Разработка (без Docker)

Бэкенд:
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Фронтенд:
```bash
cd frontend
npm install
npm run dev
```
