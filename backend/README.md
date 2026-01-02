# Budget App Backend

Django REST Framework backend for Budget App with PostgreSQL.

## Setup

### Prerequisites
- Python 3.11+
- PostgreSQL
- uv (Python package manager)

### Installation

1. Install dependencies with uv:
```bash
uv pip install -e .
```

2. Create a `.env` file with your database credentials:
```bash
DATABASE_NAME=budget_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

3. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

4. Create a superuser (optional):
```bash
python manage.py createsuperuser
```

5. Run the development server:
```bash
python manage.py runserver
```

## API Endpoints

### Core Endpoints
- `GET /api/health/` - Health check
- `GET /api/dashboard/` - Dashboard statistics

### CRUD Endpoints
- `/api/users/` - User management
- `/api/accounts/` - Account management
- `/api/categories/` - Category management
- `/api/transactions/` - Transaction management
- `/api/budgets/` - Budget management
- `/api/goals/` - Goal management
- `/api/transfers/` - Transfer management

### Admin Panel
Access at `http://localhost:8000/admin/`

## Database Schema

The app uses the following models:
- **User** - Custom user model
- **Account** - Financial accounts (bank, cash, card)
- **Category** - Income/Expense categories
- **Transaction** - Income and expense records
- **Budget** - Spending limits per category
- **Goal** - Financial goals tracking
- **Transfer** - Inter-account transfers

## Development

### Type Safety
All code is fully typed with Python type hints for better IDE support and type checking.

### Tech Stack
- Django 5.0+
- Django REST Framework 3.14+
- PostgreSQL with psycopg2
- django-cors-headers for CORS support

