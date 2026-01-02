# 🚀 Guía Rápida de Migración de Base de Datos

Esta es una guía paso a paso para migrar tu base de datos después de perder acceso a Supabase.

## 📋 Pre-requisitos

- [x] PostgreSQL instalado (local o acceso a una instancia remota)
- [x] Python 3.8+ con Django instalado
- [x] Credenciales de tu nueva base de datos

## 🎯 Proceso Rápido (5 pasos)

### Paso 1: Configurar Credenciales

Copia el archivo de ejemplo y configura tus credenciales:

```bash
cp .env.example .env
```

Edita `.env` y configura tu `DATABASE_URL`:
```env
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/base_datos
```

### Paso 2: Crear el Schema

**Opción A - Usando el script automatizado (Recomendado):**

Windows:
```powershell
.\migrate_db.ps1
# Selecciona opción 1
```

Linux/Mac:
```bash
chmod +x migrate_db.sh
./migrate_db.sh
# Selecciona opción 1
```

**Opción B - Manual:**
```bash
psql $DATABASE_URL -f migrations/full_schema.sql
```

### Paso 3: Sincronizar Django

```bash
python manage.py migrate --fake
```

El flag `--fake` marca las migraciones como aplicadas sin ejecutarlas (porque ya creamos las tablas).

### Paso 4: Crear Superusuario

```bash
python manage.py createsuperuser
```

### Paso 5: Verificar la Migración

```bash
python migrations/verify_migration.py
```

Este script verifica que todas las tablas fueron creadas correctamente.

## ✅ ¡Listo!

Tu base de datos está lista. Ahora puedes:

1. **Iniciar el servidor:**
   ```bash
   python manage.py runserver
   ```

2. **Acceder al admin:**
   ```
   http://localhost:8000/admin
   ```

3. **Comenzar a usar tu API**

## 🔄 Restaurar Datos (Si tienes backup)

Si tienes un backup de tu base de datos anterior:

### Desde Supabase/PostgreSQL dump:

```bash
# Si tienes un archivo .sql
psql $DATABASE_URL -f tu_backup.sql

# Si tienes un archivo .dump
pg_restore -d $DATABASE_URL tu_backup.dump
```

### Desde Django fixture (JSON):

```bash
python manage.py loaddata tu_backup.json
```

### Crear backup de datos actuales:

```bash
python migrations/backup_restore.py backup
```

## 🆘 Solución de Problemas

### "psql: command not found"

Instala PostgreSQL client:
- Windows: `choco install postgresql` o descarga desde postgresql.org
- Mac: `brew install postgresql`
- Linux: `sudo apt-get install postgresql-client`

### Error de conexión a la base de datos

1. Verifica que PostgreSQL esté corriendo
2. Verifica `DATABASE_URL` en `.env`
3. Verifica que puedes conectarte manualmente:
   ```bash
   psql $DATABASE_URL
   ```

### "relation already exists"

Ya tienes tablas en la base de datos. Opciones:
1. Usar `migrate_db.ps1` opción 3 (drop y recrear)
2. Conectarte a una base de datos vacía

### Problemas con migraciones de Django

```bash
# Ver estado de migraciones
python manage.py showmigrations

# Resetear migraciones (cuidado: solo si es necesario)
python manage.py migrate --fake-initial
```

## 📚 Más Información

- Documentación completa: `migrations/README.md`
- Verificación de migración: `python migrations/verify_migration.py`
- Backup/Restore: `python migrations/backup_restore.py --help`

## 🎉 Próximos Pasos

1. Configura tus categorías predeterminadas
2. Crea tus primeras cuentas
3. Comienza a registrar transacciones
4. Configura presupuestos

---

**¿Necesitas ayuda?** Revisa la documentación completa en `migrations/README.md`
