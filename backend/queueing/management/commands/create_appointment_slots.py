"""
Management command to create appointment slots for testing
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
from queueing.models import Hospital, Department, AppointmentSlot


class Command(BaseCommand):
    help = 'Create test appointment slots for hospitals and departments'

    def add_arguments(self, parser):
        parser.add_argument(
            '--hospital-id',
            type=int,
            help='Hospital ID to create slots for (defaults to all hospitals)',
        )
        parser.add_argument(
            '--days',
            type=int,
            default=7,
            help='Number of days to create slots for (default: 7)',
        )
        parser.add_argument(
            '--slots-per-day',
            type=int,
            default=10,
            help='Number of slots per day (default: 10)',
        )

    def handle(self, *args, **options):
        hospital_id = options.get('hospital_id')
        days = options.get('days')
        slots_per_day = options.get('slots_per_day')

        # Get hospitals
        if hospital_id:
            hospitals = Hospital.objects.filter(id=hospital_id)
            if not hospitals.exists():
                self.stdout.write(self.style.ERROR(f'Hospital with ID {hospital_id} not found'))
                return
        else:
            hospitals = Hospital.objects.all()

        if not hospitals.exists():
            self.stdout.write(self.style.ERROR('No hospitals found. Please create a hospital first.'))
            return

        total_created = 0
        today = timezone.now().date()

        for hospital in hospitals:
            self.stdout.write(f'\nCreating slots for {hospital.name}...')
            
            # Get departments for this hospital
            departments = hospital.departments.all()
            
            if not departments.exists():
                self.stdout.write(self.style.WARNING(f'  No departments found for {hospital.name}'))
                continue

            for dept in departments:
                dept_slots = 0
                
                # Create slots for next N days
                for day in range(days):
                    slot_date = today + timedelta(days=day)
                    
                    # Create slots from 9 AM to 6 PM
                    start_hour = 9
                    slot_duration_minutes = 30  # 30-minute slots
                    
                    for slot_index in range(slots_per_day):
                        # Calculate slot time
                        start_time_hour = start_hour + (slot_index * slot_duration_minutes // 60)
                        start_time_minute = (slot_index * slot_duration_minutes) % 60
                        
                        start_time = timezone.make_aware(
                            datetime.combine(slot_date, datetime.min.time().replace(
                                hour=start_time_hour,
                                minute=start_time_minute
                            ))
                        )
                        
                        end_time = start_time + timedelta(minutes=slot_duration_minutes)
                        
                        # Skip if slot is in the past
                        if start_time < timezone.now():
                            continue
                        
                        # Check if slot already exists
                        if not AppointmentSlot.objects.filter(
                            hospital=hospital,
                            department=dept,
                            start_time=start_time
                        ).exists():
                            AppointmentSlot.objects.create(
                                hospital=hospital,
                                department=dept,
                                start_time=start_time,
                                end_time=end_time,
                                is_booked=False
                            )
                            dept_slots += 1
                            total_created += 1
                
                if dept_slots > 0:
                    self.stdout.write(self.style.SUCCESS(
                        f'  ✓ Created {dept_slots} slots for {dept.name}'
                    ))

        self.stdout.write(self.style.SUCCESS(
            f'\n✅ Successfully created {total_created} appointment slots!'
        ))
        
        # Show summary
        self.stdout.write(f'\nSummary:')
        for hospital in hospitals:
            available_slots = AppointmentSlot.objects.filter(
                hospital=hospital,
                is_booked=False,
                start_time__gte=timezone.now()
            ).count()
            self.stdout.write(f'  {hospital.name}: {available_slots} available slots')
