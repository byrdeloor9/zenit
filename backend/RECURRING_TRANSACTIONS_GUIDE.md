# Guía: Transacciones Recurrentes y Rendimientos de Pólizas

Este documento explica cómo funciona el sistema de automatización de transacciones recurrentes y generación de rendimientos de pólizas de inversión.

## 📊 Sistemas Automatizados

### 1. Transacciones Recurrentes (Ingresos y Gastos)

**Modelo**: `RecurringTransaction`

**Descripción**: Genera automáticamente transacciones periódicas como salarios, rentas, suscripciones, etc.

**Frecuencias soportadas**:
- `monthly`: Mensual (en un día específico del mes)
- `biweekly`: Quincenal (dos veces al mes)
- `weekly`: Semanal (cada 7 días)

**Ejemplo**:
```python
RecurringTransaction.objects.create(
    user=user,
    name="Salario",
    transaction_type='Income',
    amount=5000,
    frequency='monthly',
    day_of_period=1,  # Día 1 de cada mes
    account=cuenta_banco,
    category=categoria_salario,
    start_date=date.today()
)
```

### 2. Rendimientos de Pólizas de Inversión

**Modelo**: `Investment` (tipo `insurance`)

**Descripción**: Genera automáticamente rendimientos mensuales para pólizas de inversión con interés compuesto.

**Características**:
- Rendimiento se calcula sobre el `current_amount` (interés compuesto)
- Se genera en el aniversario mensual de la póliza
- Si la póliza se contrató el 15, el rendimiento se genera el 15 de cada mes

**Ejemplo**:
```python
Investment.objects.create(
    user=user,
    investment_type='insurance',
    name="Póliza MetLife",
    initial_amount=10000,
    current_amount=10000,
    expected_return_rate=6.0,  # 6% anual
    maturity_term_months=24,  # 2 años
    start_date=date(2024, 1, 15),  # Rendimientos el 15 de cada mes
    account=cuenta,
    status='active'
)
```

**Cálculo del rendimiento**:
```python
monthly_rate = 6.0 / 100 / 12 = 0.005
monthly_return = current_amount * monthly_rate

# Mes 1: $10,000 × 0.005 = $50
# Mes 2: $10,050 × 0.005 = $50.25
# Mes 3: $10,100.25 × 0.005 = $50.50
```

---

## 🔄 Comandos de Management

### Generar Transacciones Recurrentes

```bash
# Ver qué se generaría sin crear nada
python manage.py generate_recurring_transactions --dry-run

# Generar solo ingresos
python manage.py generate_recurring_transactions --type Income

# Generar solo gastos
python manage.py generate_recurring_transactions --type Expense

# Generar todo
python manage.py generate_recurring_transactions
```

### Generar Rendimientos de Pólizas

```bash
# Ver qué se generaría sin crear nada
python manage.py generate_insurance_returns --dry-run

# Generar rendimientos reales
python manage.py generate_insurance_returns
```

### Script Combinado (RECOMENDADO)

```bash
# Ejecutar ambos comandos
./generate_all_recurring.sh
```

---

## ⏰ Automatización con Cron

### Linux/Mac

Editar crontab:
```bash
crontab -e
```

Agregar línea para ejecutar DIARIAMENTE a las 00:00:
```bash
0 0 * * * cd /path/to/backend && /path/to/backend/generate_all_recurring.sh >> /var/log/recurring_transactions.log 2>&1
```

O ejecutar comandos por separado:
```bash
0 0 * * * cd /path/to/backend && uv run python manage.py generate_recurring_transactions >> /var/log/recurring_tx.log 2>&1
0 0 * * * cd /path/to/backend && uv run python manage.py generate_insurance_returns >> /var/log/insurance_returns.log 2>&1
```

### Windows (Task Scheduler)

1. Abrir **Task Scheduler**
2. Crear tarea básica
3. Trigger: Diariamente a las 00:00
4. Acción: Ejecutar programa
   - Programa: `cmd.exe`
   - Argumentos: `/c cd C:\path\to\backend && uv run python manage.py generate_recurring_transactions && uv run python manage.py generate_insurance_returns`

### Fly.io (Platform as a Service)

En `fly.toml`:
```toml
[processes]
  app = "gunicorn config.wsgi:application"

[cron]
  schedule = "0 0 * * *"  # Diariamente a las 00:00
  command = "sh -c 'python manage.py generate_recurring_transactions && python manage.py generate_insurance_returns'"
```

---

## 🧪 Testing

### Test Manual en Django Shell

```bash
python manage.py shell
```

```python
from api.models import Investment, RecurringTransaction
from datetime import date

# Test recurring transaction
rt = RecurringTransaction.objects.first()
print(f"Should generate today: {rt.should_generate_today()}")
if rt.should_generate_today():
    tx = rt.generate_transaction()
    print(f"Generated transaction ID: {tx.id}")

# Test insurance policy
policy = Investment.objects.filter(investment_type='insurance').first()
print(f"Should generate return today: {policy.should_generate_return_today()}")
if policy.should_generate_return_today():
    inv_tx = policy.generate_monthly_return()
    print(f"Generated return ID: {inv_tx.id}")
```

### Test con Dry-Run

```bash
# Ver qué se generaría HOY sin crear nada
python manage.py generate_recurring_transactions --dry-run
python manage.py generate_insurance_returns --dry-run
```

---

## 📊 Monitoreo

### Logs

Los comandos muestran resumen al final:

```
==================================================
Summary:
  Generated: 5
  Skipped: 12
  Errors: 0
✅ All processes completed successfully!
==================================================
```

### Verificar en Base de Datos

```sql
-- Última vez que se generaron rendimientos por póliza
SELECT 
    name, 
    current_amount, 
    last_return_date,
    DATEDIFF(CURDATE(), last_return_date) as days_since_last_return
FROM investments 
WHERE investment_type = 'insurance' 
  AND status = 'active'
ORDER BY last_return_date DESC;

-- Transacciones recurrentes activas
SELECT 
    name, 
    amount, 
    frequency,
    last_generated_date,
    DATEDIFF(CURDATE(), last_generated_date) as days_since_last
FROM recurring_transactions 
WHERE is_active = true
ORDER BY last_generated_date DESC;
```

---

## 🚨 Troubleshooting

### Error: "No account available"

**Causa**: La póliza/transacción no tiene cuenta vinculada.

**Solución**: 
```python
policy.account = Account.objects.filter(user=policy.user).first()
policy.save()
```

### Error: "Duplicate transaction generated"

**Causa**: El comando se ejecutó dos veces el mismo día.

**Prevención**: El sistema verifica `last_generated_date`/`last_return_date` automáticamente.

### Las transacciones no se generan

**Verificar**:
1. ¿El cron job está activo? `crontab -l`
2. ¿La fecha es correcta? Transacciones solo se generan en su día correspondiente
3. ¿El status es `active`? 
4. ¿La transacción recurrente tiene `end_date` pasada?

---

## 📈 Ejemplos de Uso

### Caso 1: Salario Quincenal

```python
RecurringTransaction.objects.create(
    user=user,
    name="Salario Quincenal",
    transaction_type='Income',
    amount=2500,
    frequency='biweekly',
    day_of_period=1,  # Día 1 y 16 de cada mes
    account=cuenta_banco,
    start_date=date(2024, 1, 1)
)
```

### Caso 2: Netflix Mensual

```python
RecurringTransaction.objects.create(
    user=user,
    name="Netflix",
    transaction_type='Expense',
    amount=15.99,
    frequency='monthly',
    day_of_period=10,  # Día 10 de cada mes
    account=cuenta_tarjeta,
    category=streaming_category,
    start_date=date(2024, 1, 10)
)
```

### Caso 3: Póliza de Inversión con 4.8% Anual

```python
Investment.objects.create(
    user=user,
    investment_type='insurance',
    name="Póliza Ahorro Banorte",
    policy_number="POL-2024-12345",
    institution_name="Banorte",
    initial_amount=15000,
    current_amount=15000,
    expected_return_rate=4.8,
    maturity_term_months=36,  # 3 años
    start_date=date(2024, 3, 1),  # Rendimientos el 1 de cada mes
    account=cuenta_inversion,
    status='active'
)
```

**Rendimientos generados automáticamente**:
- 1 de abril: $60.00 (15,000 × 4.8% / 12)
- 1 de mayo: $60.24 (15,060 × 4.8% / 12)
- 1 de junio: $60.48 (15,120.24 × 4.8% / 12)
- ...

---

## 🔐 Seguridad

- Todas las transacciones se generan con `@transaction.atomic` para garantizar integridad
- Los balances de cuentas se actualizan atómicamente
- Si falla la generación de una transacción, no afecta las demás
- Los errores se registran pero no detienen el proceso completo

---

## 📞 Soporte

Para issues o preguntas:
1. Revisar logs: `/var/log/recurring_transactions.log`
2. Ejecutar con `--dry-run` primero
3. Verificar en Django shell manualmente

