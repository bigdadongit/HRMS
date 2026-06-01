import os
from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt


def token_required(fn):
    """Decorator to require JWT token"""
    @wraps(fn)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
        except Exception as e:
            return jsonify({'message': 'Unauthorized: Invalid or missing token'}), 401
        return fn(*args, **kwargs)
    return decorated_function


def role_required(*roles):
    """Decorator to check user role"""
    def decorator(fn):
        @wraps(fn)
        def decorated_function(*args, **kwargs):
            try:
                verify_jwt_in_request()
                claims = get_jwt()
                user_role = claims.get('role')

                if user_role not in roles:
                    return jsonify({
                        'message': f'Forbidden: User role {user_role} does not have access'
                    }), 403

                return fn(*args, **kwargs)
            except Exception as e:
                return jsonify({'message': 'Unauthorized: Invalid or missing token'}), 401
        return decorated_function
    return decorator
