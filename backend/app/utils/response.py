from flask import jsonify


def success_response(data=None, message='Success', status_code=200):
    """Create a standard success response"""
    response = {
        'success': True,
        'message': message,
        'data': data
    }
    return jsonify(response), status_code


def error_response(message='Error', status_code=400, error_code=None):
    """Create a standard error response"""
    response = {
        'success': False,
        'message': message
    }
    if error_code:
        response['error_code'] = error_code
    return jsonify(response), status_code
