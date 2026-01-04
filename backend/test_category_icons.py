"""
Quick test script to check if category icons are being returned by the API
Run this in the backend container:
docker exec -it zenit-backend python manage.py shell < test_category_icons.py
"""

from api.models import Category, Transaction
from api.serializers.transaction import TransactionSerializer

# Check categories
print("\n=== CATEGORIES IN DATABASE ===")
categories = Category.objects.all()[:10]
for cat in categories:
    print(f"ID: {cat.id} | Name: {cat.name} | Icon: {cat.icon} | Type: {cat.type}")

# Check a transaction with serializer
print("\n=== TRANSACTION SERIALIZATION TEST ===")
tx = Transaction.objects.select_related('category', 'account').first()
if tx:
    serializer = TransactionSerializer(tx)
    data = serializer.data
    print(f"Transaction ID: {data.get('id')}")
    print(f"Category Name: {data.get('category_name')}")
    print(f"Category Icon: {data.get('category_icon')}")
    print(f"Category ID: {data.get('category_id')}")
    print(f"\nFull serialized data:")
    import json
    print(json.dumps(data, indent=2, default=str))
else:
    print("No transactions found in database")
