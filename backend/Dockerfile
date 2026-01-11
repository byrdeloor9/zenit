FROM python:3.11-slim-bookworm

# Instalar uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Variables de entorno
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# ========== CACHE DE DEPENDENCIAS (RÁPIDO) ==========
# Solo se reconstruye si pyproject.toml o uv.lock cambian
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project

# ========== CÓDIGO (SIN CACHE) ==========
# ARG BUILD_DATE invalida esta capa en cada build
ARG BUILD_DATE=unknown
RUN echo "Build date: ${BUILD_DATE}"

COPY . .

# Recolectar estáticos
RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "2", "budget_project.wsgi:application"]