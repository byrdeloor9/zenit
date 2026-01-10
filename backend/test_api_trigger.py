import requests
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

# Setup Django (if running standalone script it would need setup, but we'll run via shell)
# Actually, easier to use requests loopback if server is running, 
# OR use Django Test Client to simulate it without networking issues.

from api.models import User
from rest_framework.test import APIRequestFactory
from api.views import RecurringTransactionViewSet

print("🧪 TESTING API TRIGGER...")

try:
    # 1. Get a user
    user = User.objects.filter(is_superuser=True).first()
    if not user:
        user = User.objects.first()
    print(f"👤 Using user: {user.username}")

    # 2. Create Request
    factory = APIRequestFactory()
    request = factory.post('/api/recurring-transactions/generate_daily/')
    request.user = user

    # 3. Instantiate View
    view = RecurringTransactionViewSet.as_view({'post': 'generate_daily'})

    # 4. Execute
    response = view(request)
    
    print(f"📊 Status Code: {response.status_code}")
    print(f"📄 Response Data: {response.data}")

    if response.status_code == 200:
        print("✅ SUCCESS: The endpoint works!")
    else:
        print("❌ FAILED: Something went wrong.")

except Exception as e:
    print(f"❌ ERROR: {e}")
