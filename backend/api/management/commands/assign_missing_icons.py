from django.core.management.base import BaseCommand
from api.models import Category

class Command(BaseCommand):
    help = 'Assign icons to categories without icons based on their names'

    def handle(self, *args, **kwargs):
        # Mapping of category names to icons
        NAME_TO_ICON = {
            # Exact matches
            'Alimentación': 'Restaurant',
            'Brasil': 'Flight',
            'Casa': 'Home',
            'Cuidado personal': 'Spa',
            'Deudas': 'CreditCard',
            'Intereses mensuales BG': 'AttachMoney',
            'Meta BG Personal': 'AttachMoney',
            'Movilización': 'DirectionsCar',
            'Recarga Xiaomi': 'PhoneIphone',
            'Recarga iPhone': 'PhoneIphone',
            'Servicios': 'Build',
            'Suscripciones': 'Redeem',
            'Vehículo': 'DirectionsCar',
            'salario': 'AttachMoney',
        }

        updated_count = 0
        categories = Category.objects.filter(icon__isnull=True) | Category.objects.filter(icon='')

        self.stdout.write(f"Encontradas {categories.count()} categorías sin icono...\n")

        for category in categories:
            icon = NAME_TO_ICON.get(category.name)
            
            if icon:
                category.icon = icon
                category.save()
                self.stdout.write(self.style.SUCCESS(f"✅ '{category.name}' → {icon}"))
                updated_count += 1
            else:
                self.stdout.write(self.style.WARNING(f"⚠️  '{category.name}' no encontrada en el mapeo"))

        self.stdout.write(self.style.SUCCESS(f"\n{'='*60}"))
        self.stdout.write(self.style.SUCCESS(f"Asignados {updated_count} iconos"))
        self.stdout.write(self.style.SUCCESS(f"{'='*60}"))
