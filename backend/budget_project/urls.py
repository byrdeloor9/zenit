"""
URL configuration for budget_project project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Serve frontend - catch all route (must be last)
# Only catch routes that DON'T start with /api/ or /admin/
urlpatterns += [
    re_path(r'^(?!api/)(?!admin/).*$', TemplateView.as_view(template_name='index.html')),
]
