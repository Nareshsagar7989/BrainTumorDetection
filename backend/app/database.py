"""
database.py – Motor async MongoDB client setup.
Motor is an async driver for MongoDB, perfect for FastAPI's async nature.
"""

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

# Fix for SRV DNS resolution on local ISPs / Windows
try:
    import dns.resolver
    dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
    dns.resolver.default_resolver.nameservers = ['8.8.8.8', '1.1.1.1', '8.8.4.4']
except Exception:
    pass

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "braintumor_db")

# Global client reference (initialized on app startup)
_client: AsyncIOMotorClient = None


async def connect_db():
    """Called on FastAPI startup – creates the Motor client."""
    global _client
    _client = AsyncIOMotorClient(MONGO_URI)
    # Verify connection
    await _client.admin.command("ping")
    print(f"✅ Connected to MongoDB at {MONGO_URI} | Database: {DB_NAME}")


async def close_db():
    """Called on FastAPI shutdown – closes the Motor client."""
    global _client
    if _client:
        _client.close()
        print("🔌 MongoDB connection closed.")


def get_database():
    """Returns the Motor database instance."""
    return _client[DB_NAME]


def get_users_collection():
    """Shortcut to the 'users' collection."""
    return get_database()["users"]


def get_predictions_collection():
    """Shortcut to the 'predictions' collection."""
    return get_database()["predictions"]
