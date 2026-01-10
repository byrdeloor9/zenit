from api.models import RecurringTransaction
from datetime import date

print("========================================")
print("🔄 FORCE GENERATION FOR MISSED TRANSACTIONS")
print("========================================")

today = date.today()
print(f"Fecha actual: {today}\n")

processed = 0

# Buscar transacciones mensuales activas
for rt in RecurringTransaction.objects.filter(is_active=True, frequency='monthly'):
    # Criterio: Si nunca se ha generado O se generó el mes pasado
    should_run = False
    
    if not rt.last_generated_date:
        should_run = True
        reason = "Nunca generada"
    elif rt.last_generated_date.month != today.month and today.day >= rt.day_of_period:
        should_run = True
        reason = f"Última vez: {rt.last_generated_date} (Mes anterior)"
        
    if should_run:
        print(f"▶️ Generando {rt.name}...")
        print(f"   Razón: {reason}")
        try:
            tx = rt.generate_transaction()
            print(f"   ✅ ÉXITO - ID: {tx.id}")
            processed += 1
        except Exception as e:
            print(f"   ❌ ERROR: {e}")
    else:
        print(f"⏭️ Saltando {rt.name} (Ya al día)")

print("\n" + "="*40)
print(f"TOTAL GENERADAS: {processed}")
print("========================================")
