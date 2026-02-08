"""
Management command to create the hospital admin user
Username: anurag2908@gmail.com
Password: Anurag2908
"""
from django.core.management.base import BaseCommand
from queueing.models import User


class Command(BaseCommand):
    help = 'Create hospital admin user with predefined credentials'

    def handle(self, *args, **options):
        username = 'anurag2908@gmail.com'
        password = 'Anurag2908'
        email = 'anurag2908@gmail.com'
        
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
            self.stdout.write(self.style.SUCCESS(f'Password: {password}'))
