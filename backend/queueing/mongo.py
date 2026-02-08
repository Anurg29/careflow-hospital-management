"""
MongoDB client singleton.
Provides a pymongo database handle connected to the Atlas cluster
configured in settings.MONGO_URI / settings.MONGO_DB_NAME.
"""
import logging

from django.conf import settings
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

logger = logging.getLogger(__name__)

_client = None
_db = None


def get_mongo_client():
    """Return (or create) the shared MongoClient."""
    global _client
    if _client is None:
        uri = getattr(settings, 'MONGO_URI', None)
        if not uri:
            raise RuntimeError('MONGO_URI is not configured in settings')
        _client = MongoClient(uri)
        # Quick connection test
        try:
            _client.admin.command('ping')
            logger.info('✅ Connected to MongoDB Atlas')
        except ConnectionFailure as exc:
            logger.error('❌ MongoDB connection failed: %s', exc)
            raise
    return _client


def get_mongo_db():
    """Return the default database handle."""
    global _db
    if _db is None:
        client = get_mongo_client()
        db_name = getattr(settings, 'MONGO_DB_NAME', 'careflow')
        _db = client[db_name]
    return _db
