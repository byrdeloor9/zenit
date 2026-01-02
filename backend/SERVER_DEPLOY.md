# 🚀 Guía de Despliegue en Servidor con Docker Existente

Esta guía te ayudará a desplegar el Backend de `Budget App` en tu servidor, conectándolo a tu contenedor de PostgreSQL existente y reseteando las migraciones conflictivas.

## 1. Limpieza de Migraciones (Local)

Antes de subir el código, hemos limpiado el historial de migraciones antiguas que causaban conflictos.
Debes crear la nueva migración inicial limpia:

```bash
# En tu entorno local
uv lock  # Asegura que tu uv.lock esté actualizado
python manage.py makemigrations
```
Esto creará un nuevo archivo `0001_initial.py` limpio. Sube estos cambios (incluyendo `uv.lock` y `pyproject.toml`) a tu repo.

## 2. Preparación de la Base de Datos (En el servidor)

Como vas a usar el MISMO contenedor de Postgres, necesitamos crear una nueva base de datos dentro de él.

1.  **Entra a tu servidor.**
2.  **Identifica tu contenedor de Postgres:**
    ```bash
    docker ps | grep postgres
    ```
    (Anota el `CONTAINER_ID` o `NOMBRE`).

3.  **Crea la base de datos `budget_app`:**
    ```bash
    # Usamos el usuario 'postgres' (superuser) para evitar errores de permisos
    # y asignamos el dueño a 'byron_ai'
    docker exec -it nombre_contenedor_postgres psql -U postgres -c "CREATE DATABASE budget_app OWNER byron_ai;"
    ```

4.  **Identifica la Red de Docker:**
    Necesitamos saber en qué red está corriendo tu Postgres para que el nuevo contenedor pueda verlo.
    ```bash
    docker network ls
    ```
    Busca la red asociada a tu otro proyecto (ej. `mi_otro_proyecto_default`).

5.  **Edita `docker-compose.yml`:**
    Abre el `docker-compose.yml` de este proyecto y actualiza la sección de redes al final:
    ```yaml
    networks:
      existing_postgres_network:
        external: true
        name: docker_default
    ```

    Y asegúrate de que la variable `DATABASE_URL` o `DB_HOST` en tu `.env` apunte al **nombre del contenedor** de postgres (no a localhost), ya que dentro de la red docker se llaman por nombre.

## 3. Despliegue Inicial

1.  **Copia el archivo `.env` en el servidor** con tus credenciales.
    
    Asegúrate de configurar las siguientes variables para tu dominio:
    ```env
    DATABASE_URL=postgresql://usuario:pass@nombre_contenedor_postgres:5432/budget_app
    
    # Configuración de Dominio
    ALLOWED_HOSTS=byron-ai.duckdns.org,localhost,127.0.0.1
    
    # URL de Frontend (Vercel) + URL de Backend (DuckDNS)
    CORS_ALLOWED_ORIGINS=https://zenit-budget.vercel.app,https://byron-ai.duckdns.org
    CSRF_TRUSTED_ORIGINS=https://zenit-budget.vercel.app,https://byron-ai.duckdns.org
    ```

3.  **Levanta el contenedor:**
    ```bash
    docker-compose up -d --build
    ```

3.  **Aplica el Schema SQL (¡Crucial!):**
    Como limpiamos las migraciones, necesitamos crear las tablas manualmente primero usando nuestro script limpio.
    
    ```bash
    # Copia el sql al contenedor
    docker cp migrations/full_schema.sql budget_app_backend:/app/full_schema.sql
    
    # Ejecútalo en la base de datos (usando el cliente psql instalado en TU imagen de app)
    # Nota: Usamos DATABASE_URL del entorno
    docker exec -it budget_app_backend sh -c "psql \$DATABASE_URL -f /app/full_schema.sql"
    ```

4.  **Falsifica la Migración Inicial:**
    Ahora le decimos a Django que "ya corrió" la migración inicial (porque acabamos de crear las tablas con SQL).
    
    ```bash
    docker exec -it budget_app_backend python manage.py migrate --fake
    ```
    
    *Nota: Si tienes otras migraciones nuevas después de la 0001, puedes correr `python manage.py migrate` (sin fake) después de esto para aplicarlas.*

5.  **Crea Superusuario y Estáticos:**
    ```bash
    docker exec -it budget_app_backend python manage.py collectstatic --noinput
    docker exec -it budget_app_backend python manage.py createsuperuser
    ```

## ✅ Resumen

- **Base de datos:** Compartida (mismo contenedor, nueva DB `budget_app`).
- **Conexión:** Vía red Docker interna.
- **Migraciones:** Historial reseteado. Usamos SQL para estructura base + `migrate --fake`.
