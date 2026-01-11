from django.core.management.base import BaseCommand
from api.models import Category

class Command(BaseCommand):
    help = 'Migrates category icons from Emojis to MUI Icon names'

    def handle(self, *args, **kwargs):
        # Mapping of Emoji (or old name) -> New MUI Icon Name
        # Based on standard default categories
        EMOJI_TO_MUI = {
            # Food & Drink
            '☕': 'LocalCafe',
            '🍔': 'Fastfood',
            '🍕': 'LocalPizza',
            '🍻': 'LocalBar',
            '🍽️': 'Restaurant',
            '🛒': 'ShoppingCart',
            
            # Shopping
            '🛍️': 'ShoppingBag',
            '👗': 'Checkroom',
            '💊': 'LocalPharmacy',
            
            # Transport
            '🚗': 'DirectionsCar',
            '🚌': 'DirectionsBus',
            '✈️': 'Flight',
            '🚕': 'LocalTaxi',
            '⛽': 'LocalGasStation',
            
            # Home & Utilities
            '🏠': 'Home',
            '💡': 'Lightbulb',
            '💧': 'WaterDrop',
            '⚡': 'Bolt',
            '🌐': 'Router',
            '🔧': 'Build',
            
            # Entertainment
            '🎬': 'Movie',
            '🎮': 'SportsEsports',
            '⚽': 'SportsSoccer',
            '🏋️': 'FitnessCenter',
            
            # Health
            '🏥': 'LocalHospital',
            '🧘': 'SelfImprovement',
            
            # Work & Education
            '💼': 'Work',
            '🎓': 'School',
            '💰': 'AttachMoney',
            
            # Tech
            '📱': 'PhoneIphone',
            '💻': 'Laptop',
            
            # Others / Defaults (Add more if you know specific user emojis)
            '🐾': 'Pets',
            '🌲': 'Park',
            '⚙️': 'Settings',
        }

        updated_count = 0
        categories = Category.objects.all()

        self.stdout.write(f"Scanning {categories.count()} categories...")

        for category in categories:
            current_icon = category.icon
            
            # 1. Direct Emoji Match
            if current_icon in EMOJI_TO_MUI:
                category.icon = EMOJI_TO_MUI[current_icon]
                category.save()
                self.stdout.write(self.style.SUCCESS(f"Migrated '{category.name}': {current_icon} -> {category.icon}"))
                updated_count += 1
                continue

            # 2. Name-based Heuristic (Fallback if no icon set or unknown emoji)
            # This is optional, uncomment if you want to auto-assign based on name
            # name_lower = category.name.lower()
            # if 'comida' in name_lower or 'food' in name_lower:
            #     category.icon = 'Restaurant'
            #     ...
        
        self.stdout.write(self.style.SUCCESS(f"Successfully migrated {updated_count} categories."))
