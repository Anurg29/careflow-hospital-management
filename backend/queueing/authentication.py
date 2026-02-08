"""
Custom authentication backend for MongoDB-based User model
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from .models import User


class CustomJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication that uses our MongoDB User model
    """
    
    def get_user(self, validated_token):
        """
        Attempts to find and return a user using the given validated token.
        """
        try:
            user_id = validated_token.get('user_id')
            if user_id is None:
                raise InvalidToken('Token contained no recognizable user identification')
            
            user = User.objects.get(id=user_id)
            
            if not user.is_active:
                raise InvalidToken('User is inactive')
                
            return user
        except User.DoesNotExist:
            raise InvalidToken('User not found')
