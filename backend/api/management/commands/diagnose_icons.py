from django.core.management.base import BaseCommand
from api.models import Category

class Command(BaseCommand):
    help = 'Diagnose category icon issues - shows categories with their icons'

    def handle(self, *args, **kwargs):
        categories = Category.objects.all().order_by('name')
        
        self.stdout.write(self.style.SUCCESS(f"\n{'='*60}"))
        self.stdout.write(self.style.SUCCESS(f"DIAGNOSTICO DE ICONOS - {categories.count()} categorías"))
        self.stdout.write(self.style.SUCCESS(f"{'='*60}\n"))
        
        # Group by icon
        icon_groups = {}
        null_categories = []
        
        for cat in categories:
            icon = cat.icon if cat.icon else '[NULL]'
            if icon == '[NULL]':
                null_categories.append(cat.name)
            else:
                if icon not in icon_groups:
                    icon_groups[icon] = []
                icon_groups[icon].append(cat.name)
        
        # Show grouped by icon
        for icon in sorted(icon_groups.keys()):
            self.stdout.write(self.style.WARNING(f"\n📌 Icono: {icon}"))
            for cat_name in icon_groups[icon]:
                self.stdout.write(f"   └─ {cat_name}")
        
        # Show NULL categories
        if null_categories:
            self.stdout.write(self.style.ERROR(f"\n❌ CATEGORÍAS SIN ICONO ({len(null_categories)}):"))
            for cat_name in null_categories:
                self.stdout.write(f"   └─ {cat_name}")
        
        # Summary
        self.stdout.write(self.style.SUCCESS(f"\n{'='*60}"))
        self.stdout.write(self.style.SUCCESS(f"RESUMEN:"))
        self.stdout.write(f"  ✅ Iconos únicos: {len(icon_groups)}")
        self.stdout.write(f"  ❌ Sin icono: {len(null_categories)}")
        self.stdout.write(self.style.SUCCESS(f"{'='*60}\n"))
