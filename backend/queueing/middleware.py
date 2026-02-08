"""
Custom security middleware for CareFlow.

SecurityHeadersMiddleware  — adds defence-in-depth response headers.
RequestLoggingMiddleware   — logs every request (method, path, user, IP, status).
"""
import logging
import time

logger = logging.getLogger('careflow.security')


class SecurityHeadersMiddleware:
    """Add extra security response headers on every request."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Prevent MIME-type sniffing
        response['X-Content-Type-Options'] = 'nosniff'
        # Block pages from being framed (clickjacking)
        response['X-Frame-Options'] = 'DENY'
        # Enable browser XSS auditor
        response['X-XSS-Protection'] = '1; mode=block'
        # Restrict browser features
        response['Permissions-Policy'] = (
            'camera=(), microphone=(), geolocation=(), payment=()'
        )
        # Referrer policy
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        # Content Security Policy (relaxed for API-only backend)
        response['Content-Security-Policy'] = (
            "default-src 'self'; frame-ancestors 'none'"
        )

        return response


class RequestLoggingMiddleware:
    """Log each HTTP request for audit trail."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.time()
        response = self.get_response(request)
        duration_ms = (time.time() - start) * 1000

        user = getattr(request, 'user', None)
        user_label = (
            user.username if (user and user.is_authenticated) else 'anonymous'
        )

        # Get real client IP (handles proxied requests)
        ip = request.META.get(
            'HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', '?')
        )
        if ',' in ip:
            ip = ip.split(',')[0].strip()

        logger.info(
            '%s %s → %s | user=%s ip=%s %.0fms',
            request.method,
            request.get_full_path(),
            response.status_code,
            user_label,
            ip,
            duration_ms,
        )

        return response
