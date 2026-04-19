"""
security.py – Password hashing and verification utilities using bcrypt.
Using passlib's CryptContext to abstract away bcrypt details.
"""

from passlib.context import CryptContext

# CryptContext handles algorithm upgrades automatically
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """
    Hashes a plain-text password using bcrypt.
    bcrypt automatically generates a salt and includes it in the hash.
    
    Args:
        plain_password: The user's plain-text password
        
    Returns:
        A bcrypt hash string that includes the salt
    """
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain-text password against a stored bcrypt hash.
    
    Args:
        plain_password: Password submitted by the user
        hashed_password: The stored bcrypt hash from MongoDB
        
    Returns:
        True if passwords match, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)
