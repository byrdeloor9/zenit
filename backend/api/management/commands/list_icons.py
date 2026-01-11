from django.core.management.base import BaseCommand
from api.models import Category

class Command(BaseCommand):
    help = 'Lists all current category icons (unique values only)'

    def handle(self, *args, **kwargs):
        # Get all unique icon values
        icons = Category.objects.values_list('icon', flat=True).distinct().order_by('icon')
        
        self.stdout.write(self.style.SUCCESS(f"Found {icons.count()} unique icons:\n"))
        
        for icon in icons:
            if icon:  # Skip null/empty values
                self.stdout.write(f"  {icon}")
            else:
                self.stdout.write(self.style.WARNING("  [NULL or EMPTY]"))
