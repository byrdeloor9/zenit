# Database Migration Guide

Este directorio contiene los archivos necesarios para migrar la base de datos de Supabase a una nueva instancia de PostgreSQL.

## 📁 Archivos Incluidos

- **`full_schema.sql`**: Schema completo de la base de datos con todas las tablas en el orden correcto de dependencias
- **`drop_all_tables.sql`**: Script para eliminar todas las tablas (¡PELIGRO! Elimina todos los datos)
- **`migrate_db.sh`**: Script bash para Linux/Mac con menú interactivo
- **`migrate_db.ps1`**: Script PowerShell para Windows con menú interactivo

## 🚀 Cómo Usar

### Opción 1: Usar el Script Automatizado (Recomendado)

#### En Windows (PowerShell):
```powershell
cd budget_app_backend
.\migrate_db.ps1
```

#### En Linux/Mac (Bash):
```bash
cd budget_app_backend
chmod +x migrate_db.sh
./migrate_db.sh
```

El script te presentará un menú con las siguientes opciones:
1. Crear schema nuevo (migración completa)
2. Eliminar todas las tablas
3. Eliminar y recrear (reset completo)
4. Ejecutar migraciones de Django
5. Salir

### Opción 2: Ejecución Manual

#### 1. Configurar Variables de Entorno

Asegúrate de que tu archivo `.env` tenga la variable `DATABASE_URL`:

```env
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/nombre_base_datos
```

#### 2. Crear el Schema

```bash
# Para PostgreSQL local o remoto
psql $DATABASE_URL -f migrations/full_schema.sql
```

O con credenciales específicas:
```bash
psql -h localhost -U usuario -d nombre_base_datos -f migrations/full_schema.sql
```

#### 3. Sincronizar Django

Después de crear el schema, debes sincronizar las migraciones de Django:

```bash
python manage.py migrate --fake
```

El flag `--fake` le dice a Django que marque todas las migraciones como aplicadas sin ejecutarlas realmente, ya que las tablas ya fueron creadas por el SQL.

#### 4. Crear Superusuario (Opcional)

Si es una instalación nueva:

```bash
python manage.py createsuperuser
```

## ⚠️ IMPORTANTE

### Antes de Migrar

1. **Haz un backup** de tus datos actuales si los tienes
2. **Verifica** que la nueva base de datos esté vacía o que estés de acuerdo en sobrescribir
3. **Confirma** que `DATABASE_URL` apunta a la base de datos correcta

### Orden de Ejecución Recomendado

Para una **nueva base de datos** (setup desde cero):
```bash
1. Ejecutar: migrations/full_schema.sql
2. Ejecutar: python manage.py migrate --fake
3. Ejecutar: python manage.py createsuperuser
```

Para **resetear una base de datos existente**:
```bash
1. (OPCIONAL) Hacer backup de datos
2. Ejecutar: migrations/drop_all_tables.sql
3. Ejecutar: migrations/full_schema.sql
4. Ejecutar: python manage.py migrate --fake
5. Restaurar datos del backup si es necesario
```

## 🔄 Restaurar Datos

Si tienes un backup de Supabase, puedes restaurarlo después de crear el schema:

```bash
# Si tienes un dump de PostgreSQL
pg_restore -h localhost -U usuario -d nombre_base_datos backup.dump

# O si tienes un archivo SQL
psql $DATABASE_URL -f backup.sql
```

## 📊 Estructura de la Base de Datos

La base de datos incluye las siguientes tablas principales:

### Core Django
- `django_content_type`
- `django_migrations`
- `django_session`
- `auth_group`, `auth_permission`, `auth_group_permissions`

### Usuarios
- `users`
- `users_groups`
- `users_user_permissions`
- `django_admin_log`

### Budget App
- `accounts` - Cuentas bancarias
- `categories` - Categorías de transacciones
- `transactions` - Transacciones individuales
- `budgets` - Presupuestos
- `budget_history` - Historial de cambios en presupuestos
- `goals` - Metas financieras
- `transfers` - Transferencias entre cuentas
- `debts` - Deudas
- `debt_payments` - Pagos de deudas
- `recurring_transactions` - Transacciones recurrentes
- `investments` - Inversiones
- `investment_transactions` - Transacciones de inversiones

## 🛠️ Solución de Problemas

### Error: "relation already exists"

Si ves este error, significa que algunas tablas ya existen. Opciones:
1. Eliminar las tablas existentes primero con `drop_all_tables.sql`
2. O conectarte a una base de datos vacía

### Error: "psql: command not found"

Necesitas instalar PostgreSQL client:
- **Windows**: Descarga desde postgresql.org o usa: `choco install postgresql`
- **Mac**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql-client`

### Error de autenticación

Verifica que `DATABASE_URL` esté correctamente formateado:
```
postgresql://username:password@host:port/database
```

## 📝 Notas Adicionales

- Todos los IDs usan `BIGSERIAL` (autoincrementales)
- Las fechas usan `TIMESTAMP WITH TIME ZONE` para compatibilidad global
- Todos los montos usan `NUMERIC(15, 2)` para precisión decimal
- Las relaciones tienen `ON DELETE CASCADE` o `SET NULL` según corresponda
- Todos los índices necesarios están incluidos para optimizar consultas

## 🆘 Soporte

Si encuentras problemas durante la migración, verifica:
1. Que PostgreSQL esté corriendo
2. Que las credenciales en `.env` sean correctas
3. Que tengas permisos para crear tablas en la base de datos
4. Que la versión de PostgreSQL sea >= 12
