from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Hospital',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('address', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Department',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('hospital', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='departments', to='queueing.hospital')),
            ],
            options={
                'unique_together': {('hospital', 'name')},
            },
        ),
        migrations.CreateModel(
            name='AppointmentSlot',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_time', models.DateTimeField()),
                ('end_time', models.DateTimeField()),
                ('is_booked', models.BooleanField(default=False)),
                ('patient_name', models.CharField(blank=True, max_length=150)),
                ('department', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='appointment_slots', to='queueing.department')),
                ('hospital', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='appointment_slots', to='queueing.hospital')),
            ],
            options={
                'ordering': ['start_time'],
            },
        ),
        migrations.CreateModel(
            name='Bed',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('label', models.CharField(max_length=50)),
                ('status', models.CharField(choices=[('available', 'Available'), ('occupied', 'Occupied'), ('cleaning', 'Cleaning'), ('maintenance', 'Maintenance')], default='available', max_length=20)),
                ('patient_name', models.CharField(blank=True, max_length=150)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('department', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='beds', to='queueing.department')),
                ('hospital', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='beds', to='queueing.hospital')),
            ],
            options={
                'ordering': ['label'],
                'unique_together': {('hospital', 'label')},
            },
        ),
        migrations.CreateModel(
            name='QueueEntry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('patient_name', models.CharField(max_length=150)),
                ('symptoms', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('waiting', 'Waiting'), ('in_progress', 'In progress'), ('done', 'Done'), ('cancelled', 'Cancelled')], default='waiting', max_length=20)),
                ('arrival_time', models.DateTimeField(auto_now_add=True)),
                ('started_at', models.DateTimeField(blank=True, null=True)),
                ('finished_at', models.DateTimeField(blank=True, null=True)),
                ('expected_finish', models.DateTimeField(blank=True, null=True)),
                ('department', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='queue_entries', to='queueing.department')),
                ('hospital', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='queue_entries', to='queueing.hospital')),
            ],
            options={
                'ordering': ['arrival_time'],
            },
        ),
    ]
