#!/bin/bash
# Azure App Service startup script

# Install dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --noinput

# Run migrations
python manage.py migrate

# Start Gunicorn
gunicorn hospital_queue.asgi:application -k uvicorn.workers.UvicornWorker --bind=0.0.0.0:8000 --timeout 600
