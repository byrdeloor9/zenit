FROM python:3.11-slim-bookworm

# Instalar uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Variables de entorno
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    # uv settings
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    # Asegurar que el venv se use
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de definición de dependencias
COPY pyproject.toml uv.lock ./

# Instalar dependencias con uv
# --frozen asegura que usemos exactamente las versiones del lockfile
# --no-install-project salta la instalación del proyecto actual como paquete, solo dependencias
RUN uv sync --frozen --no-install-project

# Copiar el código del proyecto
COPY . .

# Recolectar estáticos
RUN python manage.py collectstatic --noinput

# Exponer puerto
EXPOSE 8000

# Comando de inicio usando el entorno virtual creado por uv
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "2", "budget_project.wsgi:application"]
