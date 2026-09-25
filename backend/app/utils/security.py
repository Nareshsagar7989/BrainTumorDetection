"""
security.py – Password hashing and verification utilities using standard bcrypt.
Directly uses bcrypt to avoid passlib version incompatibility issues in production.
"""

import bcrypt


def hash_password(plain_password: str) -> str:
    """
    Hashes a plain-text password using bcrypt.
    
    Args:
        plain_password: The user's plain-text password
        
    Returns:
        A bcrypt hash string
    """
    pwd_bytes = plain_password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain-text password against a stored bcrypt hash.
    
    Args:
        plain_password: Password submitted by the user
        hashed_password: The stored bcrypt hash from MongoDB
        
    Returns:
        True if passwords match, False otherwise
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False
