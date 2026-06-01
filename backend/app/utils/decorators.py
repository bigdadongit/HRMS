from functools import wraps
from flask import jsonify


def handle_exceptions(fn):
    """Decorator to handle exceptions and return proper error responses"""
    @wraps(fn)
    def decorated_function(*args, **kwargs):
        try:
            return fn(*args, **kwargs)
        except Exception as e:
            return jsonify({
                'message': 'An error occurred',
                'error': str(e)
            }), 500
    return decorated_function
