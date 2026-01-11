from django.core.management.base import BaseCommand
from api.models import Category

class Command(BaseCommand):
    help = 'Migrates category icons from Emojis to MUI Icon names'

    def handle(self, *args, **kwargs):
        # Mapping of Emoji (or old name) -> New MUI Icon Name
        # Based on standard default categories
        EMOJI_TO_MUI = {
        EMOJI_TO_MUI = {
            # --- Food & Drink ---
            '☕': 'LocalCafe', '🍵': 'LocalCafe', '🥤': 'LocalCafe',
            '🍔': 'Fastfood', '🍟': 'Fastfood', '🌭': 'Fastfood', '🥪': 'Fastfood', '🌮': 'Fastfood', '🌯': 'Fastfood',
            '🍕': 'LocalPizza',
            '🍻': 'LocalBar', '🍺': 'LocalBar', '🍷': 'Liquor', '🍸': 'Liquor', '🍹': 'Liquor', '🍾': 'Liquor',
            '🍽️': 'Restaurant', '🍴': 'Restaurant', '🥄': 'Restaurant',
            '🛒': 'ShoppingCart',
            '🍝': 'LocalPizza', '🍜': 'Kitchen', '🍲': 'Kitchen', '🥘': 'Kitchen',
            '🥐': 'BakeryDining', '🥨': 'BakeryDining', '🥯': 'BakeryDining', '🥞': 'BakeryDining',
            '🍦': 'Icecream', '🍧': 'Icecream', '🍨': 'Icecream', '🍩': 'Icecream', '🍪': 'Icecream', '🍰': 'Icecream', '🎂': 'Icecream',
            '🍱': 'SetMeal', '🥗': 'SetMeal',
            '🍳': 'BreakfastDining', '🍞': 'BreakfastDining', '🥓': 'BreakfastDining', '🥣': 'BreakfastDining',

            # --- Shopping ---
            '🛍️': 'ShoppingBag', '🎁': 'ShoppingBag',
            '👗': 'Checkroom', '👔': 'Checkroom', '👕': 'Checkroom', '👖': 'Checkroom', '👘': 'Checkroom', '👚': 'Checkroom', '👞': 'Checkroom', '👟': 'Checkroom', '👠': 'Checkroom', '👢': 'Checkroom',
            '💊': 'LocalPharmacy', '🩺': 'MedicalServices',
            '🏷️': 'LocalOffer', '🎫': 'LocalOffer',
            '🧾': 'Receipt',

            # --- Transport ---
            '🚗': 'DirectionsCar', '🚘': 'DirectionsCar', '🚙': 'DirectionsCar',
            '🚌': 'DirectionsBus', '🚍': 'DirectionsBus',
            '✈️': 'Flight', '🛫': 'Flight', '🛬': 'Flight',
            '🚕': 'LocalTaxi', '🚖': 'LocalTaxi',
            '⛽': 'LocalGasStation',
            '🚤': 'DirectionsBoat', '🛳️': 'DirectionsBoat', '⛴️': 'DirectionsBoat', '⛵': 'DirectionsBoat',
            '🏍️': 'TwoWheeler', '🛵': 'TwoWheeler',
            '🚇': 'DirectionsSubway', '🚆': 'Train', '🚄': 'Train', '🚂': 'Train', '🚋': 'DirectionsSubway',
            '🚲': 'TwoWheeler',

            # --- Home & Utilities ---
            '🏠': 'Home', '🏡': 'Home', '🏘️': 'Home',
            '💡': 'Lightbulb', '🔦': 'Lightbulb',
            '💧': 'WaterDrop', '🚿': 'WaterDrop', '🛁': 'WaterDrop',
            '⚡': 'Bolt',
            '🌐': 'Router', '📶': 'Router', '📡': 'Router',
            '🔧': 'Build', '🔨': 'Build', '🛠️': 'Build', '🪛': 'Build',
            '🏢': 'Apartment',
            '🛋️': 'Weekend', '🛏️': 'Weekend', '🚪': 'MeetingRoom',
            '❄️': 'Hvac', '🌡️': 'Hvac',
            '🧹': 'CleaningServices', '🧽': 'CleaningServices', '🧼': 'CleaningServices',
            '🏗️': 'Construction', '🧱': 'Construction',
            '🧺': 'LocalLaundryService',
            '📺': 'SmartScreen',

            # --- Entertainment ---
            '🎬': 'Movie', '🎥': 'Movie', '🎟️': 'Movie', '🍿': 'Movie',
            '🎮': 'SportsEsports', '🕹️': 'SportsEsports', '👾': 'SportsEsports',
            '⚽': 'SportsSoccer', '🏀': 'SportsSoccer', '🏈': 'SportsSoccer', '⚾': 'SportsSoccer',
            '🏋️': 'FitnessCenter', '💪': 'FitnessCenter', '🤸': 'FitnessCenter',
            '🏊': 'Pool',
            '⛳': 'GolfCourse',
            '🎾': 'SportsTennis', '🏸': 'SportsTennis', '🏓': 'SportsTennis',
            '🎵': 'QueueMusic', '🎶': 'QueueMusic', '🎧': 'QueueMusic', '🎼': 'QueueMusic', '🎹': 'QueueMusic', '🎸': 'QueueMusic',
            '🃏': 'Casino', '🎲': 'Casino', '🎰': 'Casino',
            '🎭': 'Theaters',
            '🌲': 'Park', '🌳': 'Park', '🌴': 'Park', '🌵': 'Park',

            # --- Health ---
            '🏥': 'LocalHospital', '🚑': 'LocalHospital',
            '🧘': 'SelfImprovement', '💆': 'Spa', '💇': 'ContentCut', '💅': 'Spa',
            '🩹': 'Healing',

            # --- Work & Education ---
            '💼': 'Work', '👔': 'Work',
            '🎓': 'School', '🏫': 'School', '📚': 'School', '📖': 'MenuBook',
            '💰': 'AttachMoney', '💵': 'AttachMoney', '💸': 'AttachMoney', '💳': 'CreditCard', '💴': 'AttachMoney', '💶': 'AttachMoney', '💷': 'AttachMoney',
            '📊': 'BusinessCenter', '📉': 'BusinessCenter', '📈': 'BusinessCenter',
            '🧮': 'Calculate',
            '🗣️': 'Language',
            '🔬': 'Science', '🧪': 'Science',

            # --- Tech ---
            '📱': 'PhoneIphone', '📲': 'PhoneIphone',
            '💻': 'Laptop', '🖥️': 'Laptop', '⌨️': 'Laptop', '🖱️': 'Laptop',
            '📷': 'CameraAlt', '📸': 'CameraAlt',
            '☁️': 'Cloud',
            '🔒': 'Lock', '🔐': 'Lock', '🔑': 'VpnKey', '🛡️': 'Security',

            # --- Others / Defaults ---
            '🐾': 'Pets', '🐕': 'Pets', '🐈': 'Pets',
            '⚙️': 'Settings', '🔧': 'Settings',
        }

        updated_count = 0
        categories = Category.objects.all()

        self.stdout.write(f"Scanning {categories.count()} categories...")

        for category in categories:
            current_icon = category.icon.strip() if category.icon else '' # Strip whitespace
            
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
