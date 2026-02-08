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
        # Add timeouts to prevent hanging
        _client = MongoClient(
            uri,
            serverSelectionTimeoutMS=5000,  # 5 second timeout for server selection
            connectTimeoutMS=5000,  # 5 second timeout for connection
        )
        # Quick connection test
        try:
            _client.admin.command('ping')
            logger.info('✅ Connected to MongoDB Atlas')
        except ConnectionFailure as exc:
            logger.error('❌ MongoDB connection failed: %s', exc)
            raise
    return _client


def get_mongo_db():
    """Return the default database handle, or None if unavailable."""
    global _db
    if _db is None:
        try:
            client = get_mongo_client()
            db_name = getattr(settings, 'MONGO_DB_NAME', 'careflow')
            _db = client[db_name]
        except Exception as exc:
            logger.warning('MongoDB database not available: %s', exc)
            return None
    return _db
