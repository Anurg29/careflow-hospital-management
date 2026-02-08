from django.contrib import admin

from .models import AppointmentSlot, Bed, Department, Hospital, QueueEntry

admin.site.register(Hospital)
admin.site.register(Department)
admin.site.register(Bed)
admin.site.register(QueueEntry)
admin.site.register(AppointmentSlot)
