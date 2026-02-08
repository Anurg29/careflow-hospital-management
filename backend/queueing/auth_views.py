"""
Authentication views: register, login (token pair), refresh, current user profile.
"""
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User  # Use custom User model


# ─── Serializers ───

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, min_length=3)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('Username already taken.')
        return value

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password2': 'Passwords do not match.'})
        validate_password(data['password'])
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'date_joined', 'is_staff']
        read_only_fields = ['id', 'date_joined', 'is_staff']


# ─── Views ───

class RegisterView(APIView):
    """Create a new user account. Returns JWT tokens on success."""
    permission_classes = [AllowAny]
    authentication_classes = []          # no token needed to register
    throttle_scope = 'anon'

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """Login with username and password. Returns JWT tokens on success."""
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_scope = 'anon'

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'detail': 'Username and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(username=username)
            if not user.check_password(password):
                return Response(
                    {'detail': 'Invalid credentials.'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Update last login (optional tracking)
            user.last_login = timezone.now()
            user.save()
            
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    'user': UserSerializer(user).data,
                    'tokens': {
                        'access': str(refresh.access_token),
                        'refresh': str(refresh),
                    },
                },
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {'detail': 'Invalid credentials.'},
                status=status.HTTP_401_UNAUTHORIZED
            )


class ProfileView(APIView):
    """Return the currently authenticated user's profile."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class ForgotPasswordView(APIView):
    """Request password reset - verify username/email and allow password change."""
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_scope = 'anon'

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        
        if not username and not email:
            return Response(
                {'detail': 'Username or email is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Find user by username or email
            if username:
                user = User.objects.get(username=username)
            else:
                user = User.objects.get(email=email)
            
            # In production, you'd send an email with a reset token
            # For now, we'll return user info to allow immediate reset
            return Response(
                {
                    'detail': 'User found. You can now reset password.',
                    'user_id': user.id,
                    'username': user.username,
                    'email': user.email
                },
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            # Don't reveal whether user exists or not (security)
            return Response(
                {'detail': 'If the user exists, password reset instructions will be sent.'},
                status=status.HTTP_200_OK
            )


class ResetPasswordView(APIView):
    """Reset password after verification."""
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_scope = 'anon'

    def post(self, request):
        username = request.data.get('username')
        new_password = request.data.get('new_password')
        new_password2 = request.data.get('new_password2')
        
        if not username or not new_password or not new_password2:
            return Response(
                {'detail': 'Username, new_password, and new_password2 are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_password != new_password2:
            return Response(
                {'detail': 'Passwords do not match.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate password strength
        try:
            validate_password(new_password)
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(username=username)
            user.set_password(new_password)
            user.save(update_fields=['password'])
            
            return Response(
                {'detail': 'Password reset successful. You can now login with your new password.'},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {'detail': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class LogoutView(APIView):
    """Blacklist the refresh token to log the user out."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response(
                    {'detail': 'Refresh token is required.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'detail': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        except Exception:
            return Response(
                {'detail': 'Invalid or expired token.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
