"""
Management command to create the hospital admin user
Set credentials via environment variables:
- ADMIN_USERNAME
- ADMIN_PASSWORD
- ADMIN_EMAIL
"""
import os
from django.core.management.base import BaseCommand
from queueing.models import User


class Command(BaseCommand):
    help = 'Create hospital admin user. Provide credentials via environment variables or arguments.'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, help='Admin username')
        parser.add_argument('--password', type=str, help='Admin password')
        parser.add_argument('--email', type=str, help='Admin email')

    def handle(self, *args, **options):
        # Get credentials from arguments or environment variables
        username = options.get('username') or os.getenv('ADMIN_USERNAME', 'admin')
        password = options.get('password') or os.getenv('ADMIN_PASSWORD')
        email = options.get('email') or os.getenv('ADMIN_EMAIL', 'admin@careflow.com')
        
        if not password:
            self.stdout.write(self.style.ERROR(
                'Password is required. Provide via --password argument or ADMIN_PASSWORD environment variable'
            ))
            return
        
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f'Admin user "{username}" already exists'))
            # Update to ensure it's an admin
            user = User.objects.get(username=username)
            user.role = 'admin'
            user.is_staff = True
            user.is_superuser = True
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Updated user "{username}" to admin role'))
        else:
            # Create new admin user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                role='admin',
                is_staff=True,
                is_superuser=True
            )
            self.stdout.write(self.style.SUCCESS(f'Created admin user: {username}'))
            self.stdout.write(self.style.SUCCESS(f'Email: {email}'))
            self.stdout.write(self.style.WARNING('Password set (not shown for security)'))
