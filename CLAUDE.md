# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Avanzatech Blog — a full-stack blog application with a Django REST Framework backend and React + TypeScript frontend, orchestrated via Docker Compose.

## Development Setup

All services run via Docker Compose:

```bash
docker-compose up          # Start postgres, django (port 8000), and react (port 5173)
```

### Frontend (react/)

```bash
npm run dev                # Vite dev server on port 5173
npm run build              # TypeScript compile + Vite build
```

### Backend (django/)

```bash
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

## Architecture

### Backend — `django/src/`

- **`config/`** — Django settings, root URL config, WSGI
- **`users/`** — Custom `User` model (extends `AbstractUser`) with `role` (admin/blogger) and `team` FK; token-based auth
- **`blog/`** — `Post`, `Like`, `Comment` models; custom pagination (10 posts, 20 likes, 10 comments per page)

**Access control** is the core domain complexity. Posts have four independent permission fields (`public_access`, `authenticated_access`, `team_access`, `owner_access`), each accepting `none`, `read`, or `read_write`. Admin users bypass all checks.

### Frontend — `react/src/`

- **`api.ts`** — Axios instance; attaches `Authorization: Token <token>` header via request interceptor
- **`context/`** — `AuthContext` provides user/token state and login/logout actions app-wide
- **`pages/`** — `Home`, `Login`, `Register`, `PostDetail`, `PostCreate`, `PostEdit`
- **`App.tsx`** — React Router v6 setup with navbar and protected route wrappers

### Environment

Configuration lives in `.env` at the repo root. Key vars:

```
VITE_API_URL=http://localhost:8000/api   # consumed by the React Vite build
DATABASE_URL=postgres://blog:blog@db:5432/blog
DJANGO_SECRET_KEY=...
```
