# Zenit - Budget App

Monorepo for the Zenit personal finance application.

## Structure

```
zenit/
├── backend/   # Django REST API
├── frontend/  # React + Vite SPA
└── docker-compose.yml
```

## Quick Start

### Backend (Local Development)
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py runserver
```

### Frontend (Local Development)
```bash
cd frontend
npm install
npm run dev
```

### Docker (Production-like)
```bash
docker-compose up --build
```

## Deployment

- **Frontend**: Deployed to Vercel (Root Directory: `frontend`)
- **Backend**: Deployed via Docker on Hetzner VPS
