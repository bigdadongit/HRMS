from werkzeug.security import generate_password_hash, check_password_hash
import re


def hash_password(password: str) -> str:
    """Hash a password"""
    return generate_password_hash(password, method='pbkdf2:sha256')


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its hash"""
    return check_password_hash(password_hash, password)


def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_password(password: str) -> tuple:
    """
    Validate password strength
    Returns: (is_valid, message)
    """
    if len(password) < 6:
        return False, 'Password must be at least 6 characters long'
    return True, 'Password is valid'
