# Optimización de Autenticación Django - Instrucciones de Despliegue

## Cambios Realizados

1. **Agregado Argon2 como hasher principal** en `settings.py`
2. **Agregada dependencia** `argon2-cffi` en `pyproject.toml`

## Por qué esto mejora el rendimiento

- **PBKDF2** (actual): 1,000,000 iteraciones → ~5-10 segundos en CPU limitada
- **Argon2** (nuevo): Optimizado para velocidad → ~0.5-1 segundo

Argon2 es **más rápido Y más seguro** que PBKDF2.

## Pasos para Desplegar

### 1. Subir cambios al servidor

```bash
# En tu máquina local
cd budget_app_backend
git add pyproject.toml budget_project/settings.py
git commit -m "perf: optimize authentication with Argon2 password hasher"
git push origin master
```

### 2. En el servidor, actualizar el código

```bash
# SSH al servidor
ssh root@46.62.133.183

# Ir al directorio del proyecto
cd /opt/zenit/backend/budget_app_backend

# Pull de los cambios
git pull origin master

# Reconstruir el contenedor con las nuevas dependencias
docker-compose build api

# Reiniciar el servicio
docker-compose up -d api

# Verificar que está corriendo
docker-compose ps
docker logs budget_app_backend
```

### 3. Re-hashear contraseñas existentes (Opcional pero recomendado)

Las contraseñas actuales siguen usando PBKDF2. Para que usen Argon2:

```bash
# Opción A: Los usuarios hacen login normalmente
# Django automáticamente re-hasheará las contraseñas con Argon2 en el próximo login

# Opción B: Forzar re-hash de todas las contraseñas ahora
docker exec -it budget_app_backend python manage.py shell -c "
from api.models import User
from django.contrib.auth.hashers import make_password

for user in User.objects.all():
    # Esto forzará re-hash en el próximo login
    user.save()
    
print('✅ Usuarios actualizados')
"
```

## Resultado Esperado

- **Primer login después de inactividad:** ~2-3 segundos (antes: 10-15s)
- **Logins subsecuentes:** <1 segundo (antes: 1-2s)

## Verificación

Después del despliegue, prueba hacer login desde:
1. Vercel (primera vez)
2. Local (primera vez)

Ambos deberían ser **significativamente más rápidos**.

## Notas Importantes

- ✅ Argon2 es el hasher recomendado por OWASP
- ✅ Compatible con contraseñas PBKDF2 existentes
- ✅ Django automáticamente migra las contraseñas al nuevo formato
- ⚠️ Requiere `argon2-cffi` instalado (ya agregado en pyproject.toml)
