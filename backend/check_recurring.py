from api.models import RecurringTransaction
from datetime import date

print(f"\n🗓️  Hoy: {date.today()} (día {date.today().day})\n")

for rt in RecurringTransaction.objects.filter(is_active=True):
    status = "✅ SÍ" if rt.should_generate_today() else "❌ NO"
    print(f"{status} | {rt.name:30} | Día: {rt.day_of_period:2} | Última: {rt.last_generated_date}")

print("\n" + "="*80 + "\n")
print("DETALLES:\n")

for rt in RecurringTransaction.objects.filter(is_active=True):
    print(f"\n📋 {rt.name}")
    print(f"   Tipo: {rt.transaction_type}")
    print(f"   Monto: ${rt.amount}")
    print(f"   Frecuencia: {rt.frequency}")
    print(f"   Día configurado: {rt.day_of_period}")
    print(f"   Última generación: {rt.last_generated_date}")
    print(f"   Fecha inicio: {rt.start_date}")
    print(f"   Fecha fin: {rt.end_date}")
    print(f"   ¿Debería generar hoy?: {rt.should_generate_today()}")
    
    # Explicar por qué no se genera
    if not rt.should_generate_today():
        today = date.today()
        if today < rt.start_date:
            print(f"   ❌ RAZÓN: Aún no ha llegado la fecha de inicio")
        elif rt.end_date and today > rt.end_date:
            print(f"   ❌ RAZÓN: Ya pasó la fecha de fin")
        elif rt.last_generated_date == today:
            print(f"   ❌ RAZÓN: Ya se generó hoy")
        elif rt.frequency == 'monthly' and today.day != rt.day_of_period:
            print(f"   ❌ RAZÓN: Hoy es día {today.day}, pero está configurada para el día {rt.day_of_period}")
        elif rt.frequency == 'biweekly':
            if today.day != rt.day_of_period and today.day != (rt.day_of_period + 15):
                print(f"   ❌ RAZÓN: Quincenal configurada para días {rt.day_of_period} y {rt.day_of_period + 15}, hoy es {today.day}")
