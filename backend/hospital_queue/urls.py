from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView

from queueing.auth_views import LoginView, LogoutView, ProfileView, RegisterView

urlpatterns = [
    path('admin/', admin.site.urls),

    # ─── Auth endpoints ───
    path('api/auth/register/', RegisterView.as_view(), name='auth-register'),
    path('api/auth/login/', LoginView.as_view(), name='auth-login'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('api/auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('api/auth/profile/', ProfileView.as_view(), name='auth-profile'),

    # ─── App API ───
    path('api/', include('queueing.urls')),
]

# Serve static files (for admin assets)
if not settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
